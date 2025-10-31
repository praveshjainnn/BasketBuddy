"""
Database Layer for Basket Buddy 2.0 Admin Side
SQLite-based persistence with CRUD operations

Set Theory Foundation:
- Database represents the universal set U of all perishable items
- Operations maintain set integrity and consistency
"""

import sqlite3
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from contextlib import contextmanager
import os


class Database:
    """
    Database manager for perishable items using SQLite.
    Provides CRUD operations and transaction management.
    """
    
    def __init__(self, db_path: str = 'perishable_items.db'):
        """
        Initialize database connection.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.
        Ensures proper connection handling and cleanup.
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def init_database(self) -> None:
        """
        Initialize database schema.
        Creates perishable_items table if it doesn't exist.
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS perishable_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    base_price REAL NOT NULL,
                    cost_price REAL,
                    shelf_life INTEGER,
                    expiry_date DATE NOT NULL,
                    discounted_price REAL,
                    seller_name TEXT DEFAULT 'Admin',
                    is_active INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Add new columns if they don't exist (for existing databases)
            try:
                cursor.execute('ALTER TABLE perishable_items ADD COLUMN cost_price REAL')
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                cursor.execute('ALTER TABLE perishable_items ADD COLUMN shelf_life INTEGER')
            except sqlite3.OperationalError:
                pass
            
            try:
                cursor.execute('ALTER TABLE perishable_items ADD COLUMN seller_name TEXT DEFAULT "Admin"')
            except sqlite3.OperationalError:
                pass
            
            try:
                cursor.execute('ALTER TABLE perishable_items ADD COLUMN is_active INTEGER DEFAULT 1')
            except sqlite3.OperationalError:
                pass
            
            # Create index for faster queries
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_expiry_date 
                ON perishable_items(expiry_date)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_category 
                ON perishable_items(category)
            ''')
    
    def create_item(self, item_data: Dict[str, Any]) -> int:
        """
        Create a new perishable item.
        
        Args:
            item_data: Dictionary containing item fields
            
        Returns:
            ID of the created item
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO perishable_items 
                (item_name, category, quantity, base_price, expiry_date, discounted_price, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                item_data['item_name'],
                item_data['category'],
                item_data['quantity'],
                item_data['base_price'],
                item_data['expiry_date'],
                item_data.get('discounted_price'),
                datetime.now().isoformat()
            ))
            return cursor.lastrowid
    
    def get_item_by_id(self, item_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single item by ID.
        
        Args:
            item_id: ID of the item
            
        Returns:
            Dictionary containing item data or None if not found
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM perishable_items WHERE id = ?', (item_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def get_all_items(self) -> List[Dict[str, Any]]:
        """
        Retrieve all perishable items.
        
        Returns:
            List of dictionaries containing item data
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM perishable_items ORDER BY expiry_date ASC')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def update_item(self, item_id: int, item_data: Dict[str, Any]) -> bool:
        """
        Update an existing item.
        
        Args:
            item_id: ID of the item to update
            item_data: Dictionary containing updated fields
            
        Returns:
            True if update successful, False otherwise
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic UPDATE query based on provided fields
            fields = []
            values = []
            
            for key in ['item_name', 'category', 'quantity', 'base_price', 'expiry_date', 'discounted_price']:
                if key in item_data:
                    fields.append(f"{key} = ?")
                    values.append(item_data[key])
            
            if not fields:
                return False
            
            # Always update the updated_at timestamp
            fields.append("updated_at = ?")
            values.append(datetime.now().isoformat())
            values.append(item_id)
            
            query = f"UPDATE perishable_items SET {', '.join(fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            return cursor.rowcount > 0
    
    def delete_item(self, item_id: int) -> bool:
        """
        Delete an item by ID.
        
        Args:
            item_id: ID of the item to delete
            
        Returns:
            True if deletion successful, False otherwise
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM perishable_items WHERE id = ?', (item_id,))
            return cursor.rowcount > 0
    
    def get_items_by_category(self, category: str) -> List[Dict[str, Any]]:
        """
        Retrieve items by category.
        
        Args:
            category: Category name
            
        Returns:
            List of items in the specified category
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT * FROM perishable_items WHERE category = ? ORDER BY expiry_date ASC',
                (category,)
            )
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def get_expiring_items(self, days: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieve items expiring within specified days.
        
        Args:
            days: Number of days threshold
            
        Returns:
            List of items expiring soon
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            target_date = date.today()
            cursor.execute('''
                SELECT * FROM perishable_items 
                WHERE expiry_date <= date(?, '+' || ? || ' days')
                ORDER BY expiry_date ASC
            ''', (target_date.isoformat(), days))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def bulk_insert(self, items: List[Dict[str, Any]]) -> int:
        """
        Insert multiple items at once (for CSV import).
        
        Args:
            items: List of item dictionaries
            
        Returns:
            Number of items inserted
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            count = 0
            for item in items:
                cursor.execute('''
                    INSERT INTO perishable_items 
                    (item_name, category, quantity, base_price, expiry_date, discounted_price, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item['item_name'],
                    item['category'],
                    item['quantity'],
                    item['base_price'],
                    item['expiry_date'],
                    item.get('discounted_price'),
                    datetime.now().isoformat()
                ))
                count += 1
            return count
    
    def get_category_stats(self) -> List[Dict[str, Any]]:
        """
        Get statistics by category for visualization.
        
        Returns:
            List of category statistics
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    category,
                    COUNT(*) as item_count,
                    SUM(quantity) as total_quantity,
                    AVG(base_price) as avg_price
                FROM perishable_items
                GROUP BY category
                ORDER BY item_count DESC
            ''')
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    
    def clear_all_items(self) -> int:
        """
        Delete all items from database.
        Use with caution!
        
        Returns:
            Number of items deleted
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM perishable_items')
            return cursor.rowcount

"""
Perishable Item Model for Basket Buddy 2.0 Admin Side
Research-grade architecture for grocery management and optimization

Mathematical Foundation:
- Set Theory: Items form a set S = {i₁, i₂, ..., iₙ}
- Functional Mapping: f(x) = discount_percentage where x = days_to_expiry
- Domain: x ∈ [0, 4] (days)
- Range: f(x) ∈ [0, 100] (percentage)
"""

from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any
import json


class PerishableItem:
    """
    Model representing a perishable grocery item with dynamic discount logic.
    
    Attributes:
        id: Unique identifier (Primary Key)
        item_name: Name of the grocery item
        category: Product category (Dairy, Fruit, Vegetable, Meat, Bakery, etc.)
        quantity: Available stock count
        base_price: Original price before discount
        cost_price: Cost price for seller (optional)
        shelf_life: Shelf life in days (used to calculate expiry_date)
        expiry_date: Expiration date (auto-calculated or manual)
        discounted_price: Computed price after discount
        days_to_expiry: Computed field (expiry_date - current_date)
        discount_percentage: Computed field based on expiry proximity
        seller_name: Name of the seller (for seller admin)
        is_active: Whether item is available for public viewing
    """
    
    def __init__(
        self,
        id: int,
        item_name: str,
        category: str,
        quantity: int,
        base_price: float,
        expiry_date: date = None,
        discounted_price: Optional[float] = None,
        cost_price: Optional[float] = None,
        shelf_life: Optional[int] = None,
        seller_name: Optional[str] = None,
        is_active: bool = True,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ):
        self.id = id
        self.item_name = item_name
        self.category = category
        self.quantity = quantity
        self.base_price = base_price
        self.cost_price = cost_price or (base_price * 0.7)  # Default 30% markup
        self.shelf_life = shelf_life
        self.seller_name = seller_name or "Admin"
        self.is_active = is_active
        
        # Calculate expiry_date from shelf_life if not provided
        if expiry_date:
            self.expiry_date = expiry_date if isinstance(expiry_date, date) else datetime.strptime(expiry_date, '%Y-%m-%d').date()
        elif shelf_life:
            self.expiry_date = date.today() + timedelta(days=shelf_life)
        else:
            raise ValueError("Either expiry_date or shelf_life must be provided")
        
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        
        # Compute discount and discounted price
        self._discount_percentage = self._calculate_discount()
        self.discounted_price = discounted_price or self._calculate_discounted_price()
    
    @property
    def days_to_expiry(self) -> int:
        """
        Computed field: Days remaining until expiry.
        
        Mathematical representation:
        days_to_expiry = expiry_date - current_date
        
        Returns:
            Integer representing days to expiry (can be negative if expired)
        """
        delta = self.expiry_date - date.today()
        return delta.days
    
    @property
    def discount_percentage(self) -> float:
        """
        Computed field: Discount percentage based on expiry proximity.
        
        Returns:
            Float representing discount percentage [0, 100]
        """
        return self._discount_percentage
    
    def _calculate_discount(self) -> float:
        """
        Dynamic discount calculation based on expiry proximity.
        
        Mathematical Formula (Prototype Phase):
        f(x) = ((4 - x) / 4) * 100
        where x = days_to_expiry
        
        Constraints:
        - If x > 4: discount = 0% (fresh item)
        - If x ≤ 0: discount = 100% (expired, should be removed)
        - If 0 < x ≤ 4: linear discount function
        
        Future Enhancement:
        Will be replaced with ML model: f(x, q, d, s) where:
        - x: days_to_expiry
        - q: quantity (stock level)
        - d: historical demand
        - s: seasonal trends
        
        Returns:
            Float representing discount percentage
        """
        days = self.days_to_expiry
        
        # Expired items
        if days <= 0:
            return 100.0
        
        # Fresh items (more than 4 days)
        if days > 4:
            return 0.0
        
        # Linear discount function for items expiring in 1-4 days
        # f(x) = ((4 - x) / 4) * 100
        discount = ((4 - days) / 4) * 100
        
        return round(discount, 2)
    
    def _calculate_discounted_price(self) -> float:
        """
        Calculate the final discounted price.
        
        Formula:
        discounted_price = base_price * (1 - discount_percentage / 100)
        
        Returns:
            Float representing the discounted price
        """
        discount_multiplier = 1 - (self.discount_percentage / 100)
        return round(self.base_price * discount_multiplier, 2)
    
    def update_discount(self) -> None:
        """
        Recalculate discount and discounted price.
        Called daily by automated job or manually via API.
        """
        self._discount_percentage = self._calculate_discount()
        self.discounted_price = self._calculate_discounted_price()
        self.updated_at = datetime.now()
    
    def is_expired(self) -> bool:
        """Check if item is expired."""
        return self.days_to_expiry <= 0
    
    def is_near_expiry(self) -> bool:
        """Check if item is near expiry (1-2 days)."""
        return 0 < self.days_to_expiry <= 2
    
    def get_status_color(self) -> str:
        """
        Get color indicator for UI visualization.
        
        Returns:
            String representing color code:
            - 'red': Expired or near expiry (0-2 days)
            - 'yellow': Moderate freshness (3 days)
            - 'green': Fresh (4+ days)
        """
        days = self.days_to_expiry
        if days <= 2:
            return 'red'
        elif days == 3:
            return 'yellow'
        else:
            return 'green'
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary for JSON serialization.
        
        Returns:
            Dictionary representation of the item
        """
        return {
            'id': self.id,
            'item_name': self.item_name,
            'category': self.category,
            'quantity': self.quantity,
            'base_price': self.base_price,
            'cost_price': self.cost_price,
            'shelf_life': self.shelf_life,
            'expiry_date': self.expiry_date.isoformat(),
            'discounted_price': self.discounted_price,
            'days_to_expiry': self.days_to_expiry,
            'discount_percentage': self.discount_percentage,
            'seller_name': self.seller_name,
            'is_active': self.is_active,
            'status_color': self.get_status_color(),
            'is_expired': self.is_expired(),
            'is_near_expiry': self.is_near_expiry(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'PerishableItem':
        """
        Create PerishableItem instance from dictionary.
        
        Args:
            data: Dictionary containing item data
            
        Returns:
            PerishableItem instance
        """
        return cls(
            id=data['id'],
            item_name=data['item_name'],
            category=data['category'],
            quantity=data['quantity'],
            base_price=data['base_price'],
            expiry_date=data['expiry_date'],
            discounted_price=data.get('discounted_price'),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None
        )
    
    def __repr__(self) -> str:
        return f"<PerishableItem(id={self.id}, name='{self.item_name}', days_to_expiry={self.days_to_expiry}, discount={self.discount_percentage}%)>"

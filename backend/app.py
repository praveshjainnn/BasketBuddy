"""
Flask API Server for Basket Buddy 2.0 Admin Side
RESTful API endpoints for perishable item management

Research Paper Integration:
- Implements CRUD operations for grocery optimization
- Provides data endpoints for set operations module
- Supports dynamic discount calculations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
from typing import Dict, Any, List
import csv
import io

from models import PerishableItem
from database import Database

# Import route blueprints
try:
    from routes.seller_routes import seller_bp
    from routes.public_routes import public_bp
    ROUTES_AVAILABLE = True
except ImportError:
    ROUTES_AVAILABLE = False
    print("Warning: Route modules not found. Using legacy routes only.")


# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize database
db = Database('perishable_items.db')

# Register blueprints if available
if ROUTES_AVAILABLE:
    app.register_blueprint(seller_bp)
    app.register_blueprint(public_bp)


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def validate_item_data(data: Dict[str, Any], is_update: bool = False):
    """
    Validate item data for create/update operations.
    
    Args:
        data: Item data dictionary
        is_update: Whether this is an update operation
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['item_name', 'category', 'quantity', 'base_price', 'expiry_date']
    
    if not is_update:
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"
    
    # Validate data types and values
    if 'quantity' in data:
        try:
            quantity = int(data['quantity'])
            if quantity < 0:
                return False, "Quantity must be non-negative"
        except (ValueError, TypeError):
            return False, "Quantity must be an integer"
    
    if 'base_price' in data:
        try:
            price = float(data['base_price'])
            if price < 0:
                return False, "Base price must be non-negative"
        except (ValueError, TypeError):
            return False, "Base price must be a number"
    
    if 'expiry_date' in data:
        try:
            datetime.strptime(data['expiry_date'], '%Y-%m-%d')
        except ValueError:
            return False, "Expiry date must be in YYYY-MM-DD format"
    
    return True, ""


def create_perishable_item_from_db(db_item: Dict[str, Any]) -> PerishableItem:
    """
    Create PerishableItem instance from database record.
    
    Args:
        db_item: Database record dictionary
        
    Returns:
        PerishableItem instance
    """
    return PerishableItem(
        id=db_item['id'],
        item_name=db_item['item_name'],
        category=db_item['category'],
        quantity=db_item['quantity'],
        base_price=db_item['base_price'],
        expiry_date=db_item['expiry_date'],
        discounted_price=db_item.get('discounted_price'),
        created_at=datetime.fromisoformat(db_item['created_at']) if db_item.get('created_at') else None,
        updated_at=datetime.fromisoformat(db_item['updated_at']) if db_item.get('updated_at') else None
    )


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Basket Buddy 2.0 Admin API',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/perishables', methods=['GET'])
def get_all_perishables():
    """
    GET /api/perishables
    Retrieve all perishable items with computed discount data.
    
    Returns:
        JSON array of perishable items
    """
    try:
        db_items = db.get_all_items()
        items = []
        
        for db_item in db_items:
            item = create_perishable_item_from_db(db_item)
            items.append(item.to_dict())
        
        return jsonify({
            'success': True,
            'count': len(items),
            'data': items
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/<int:item_id>', methods=['GET'])
def get_perishable_by_id(item_id: int):
    """
    GET /api/perishables/<id>
    Retrieve a single perishable item by ID.
    
    Args:
        item_id: Item ID
        
    Returns:
        JSON object of the item
    """
    try:
        db_item = db.get_item_by_id(item_id)
        
        if not db_item:
            return jsonify({
                'success': False,
                'error': 'Item not found'
            }), 404
        
        item = create_perishable_item_from_db(db_item)
        
        return jsonify({
            'success': True,
            'data': item.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables', methods=['POST'])
def create_perishable():
    """
    POST /api/perishables
    Create a new perishable item.
    
    Request Body:
        {
            "item_name": "Milk",
            "category": "Dairy",
            "quantity": 10,
            "base_price": 5.99,
            "expiry_date": "2024-10-28"
        }
    
    Returns:
        JSON object of the created item
    """
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_msg = validate_item_data(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Create PerishableItem to compute discount
        temp_item = PerishableItem(
            id=0,  # Temporary ID
            item_name=data['item_name'],
            category=data['category'],
            quantity=int(data['quantity']),
            base_price=float(data['base_price']),
            expiry_date=data['expiry_date']
        )
        
        # Prepare data for database
        db_data = {
            'item_name': data['item_name'],
            'category': data['category'],
            'quantity': int(data['quantity']),
            'base_price': float(data['base_price']),
            'expiry_date': data['expiry_date'],
            'discounted_price': temp_item.discounted_price
        }
        
        # Insert into database
        item_id = db.create_item(db_data)
        
        # Retrieve the created item
        db_item = db.get_item_by_id(item_id)
        item = create_perishable_item_from_db(db_item)
        
        return jsonify({
            'success': True,
            'message': 'Item created successfully',
            'data': item.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/<int:item_id>', methods=['PUT'])
def update_perishable(item_id: int):
    """
    PUT /api/perishables/<id>
    Update an existing perishable item.
    
    Args:
        item_id: Item ID
        
    Request Body:
        {
            "item_name": "Updated Milk",
            "quantity": 15,
            ...
        }
    
    Returns:
        JSON object of the updated item
    """
    try:
        data = request.get_json()
        
        # Check if item exists
        existing_item = db.get_item_by_id(item_id)
        if not existing_item:
            return jsonify({
                'success': False,
                'error': 'Item not found'
            }), 404
        
        # Validate input
        is_valid, error_msg = validate_item_data(data, is_update=True)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_msg
            }), 400
        
        # Merge existing data with updates
        updated_data = existing_item.copy()
        updated_data.update(data)
        
        # Recalculate discount if price or expiry changed
        if 'base_price' in data or 'expiry_date' in data:
            temp_item = PerishableItem(
                id=item_id,
                item_name=updated_data['item_name'],
                category=updated_data['category'],
                quantity=int(updated_data['quantity']),
                base_price=float(updated_data['base_price']),
                expiry_date=updated_data['expiry_date']
            )
            updated_data['discounted_price'] = temp_item.discounted_price
        
        # Update in database
        success = db.update_item(item_id, updated_data)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Update failed'
            }), 500
        
        # Retrieve updated item
        db_item = db.get_item_by_id(item_id)
        item = create_perishable_item_from_db(db_item)
        
        return jsonify({
            'success': True,
            'message': 'Item updated successfully',
            'data': item.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/<int:item_id>', methods=['DELETE'])
def delete_perishable(item_id: int):
    """
    DELETE /api/perishables/<id>
    Delete a perishable item.
    
    Args:
        item_id: Item ID
        
    Returns:
        JSON success message
    """
    try:
        success = db.delete_item(item_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Item not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Item deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/update_discounts', methods=['PATCH'])
def update_all_discounts():
    """
    PATCH /api/perishables/update_discounts
    Recalculate discounts for all items.
    Should be called daily via cron job or scheduled task.
    
    Returns:
        JSON with update statistics
    """
    try:
        db_items = db.get_all_items()
        updated_count = 0
        
        for db_item in db_items:
            item = create_perishable_item_from_db(db_item)
            item.update_discount()
            
            # Update in database
            db.update_item(item.id, {
                'discounted_price': item.discounted_price
            })
            updated_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Updated discounts for {updated_count} items',
            'updated_count': updated_count
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/category/<category>', methods=['GET'])
def get_by_category(category: str):
    """
    GET /api/perishables/category/<category>
    Retrieve items by category.
    
    Args:
        category: Category name
        
    Returns:
        JSON array of items in the category
    """
    try:
        db_items = db.get_items_by_category(category)
        items = []
        
        for db_item in db_items:
            item = create_perishable_item_from_db(db_item)
            items.append(item.to_dict())
        
        return jsonify({
            'success': True,
            'category': category,
            'count': len(items),
            'data': items
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/perishables/expiring', methods=['GET'])
def get_expiring_items():
    """
    GET /api/perishables/expiring?days=2
    Retrieve items expiring within specified days.
    
    Query Parameters:
        days: Number of days threshold (default: 2)
        
    Returns:
        JSON array of expiring items
    """
    try:
        days = request.args.get('days', 2, type=int)
        db_items = db.get_expiring_items(days)
        items = []
        
        for db_item in db_items:
            item = create_perishable_item_from_db(db_item)
            items.append(item.to_dict())
        
        return jsonify({
            'success': True,
            'days_threshold': days,
            'count': len(items),
            'data': items
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/stats/categories', methods=['GET'])
def get_category_stats():
    """
    GET /api/stats/categories
    Get category-wise statistics for visualization.
    
    Returns:
        JSON array of category statistics
    """
    try:
        stats = db.get_category_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/import/csv', methods=['POST'])
def import_csv():
    """
    POST /api/import/csv
    Import items from CSV file.
    
    Request Body:
        Form data with 'file' field containing CSV
        
    CSV Format:
        item_name,category,quantity,base_price,expiry_date
        Milk,Dairy,10,5.99,2024-10-28
        
    Returns:
        JSON with import statistics
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        items_to_insert = []
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Validate row
                is_valid, error_msg = validate_item_data(row)
                if not is_valid:
                    errors.append(f"Row {row_num}: {error_msg}")
                    continue
                
                # Create temp item to calculate discount
                temp_item = PerishableItem(
                    id=0,
                    item_name=row['item_name'],
                    category=row['category'],
                    quantity=int(row['quantity']),
                    base_price=float(row['base_price']),
                    expiry_date=row['expiry_date']
                )
                
                items_to_insert.append({
                    'item_name': row['item_name'],
                    'category': row['category'],
                    'quantity': int(row['quantity']),
                    'base_price': float(row['base_price']),
                    'expiry_date': row['expiry_date'],
                    'discounted_price': temp_item.discounted_price
                })
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        # Bulk insert
        inserted_count = db.bulk_insert(items_to_insert) if items_to_insert else 0
        
        return jsonify({
            'success': True,
            'message': f'Imported {inserted_count} items',
            'inserted_count': inserted_count,
            'error_count': len(errors),
            'errors': errors
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    """
    GET /api/export/csv
    Export all items to CSV format.
    
    Returns:
        CSV file download
    """
    try:
        db_items = db.get_all_items()
        items = []
        
        for db_item in db_items:
            item = create_perishable_item_from_db(db_item)
            items.append(item.to_dict())
        
        # Create CSV
        output = io.StringIO()
        if items:
            fieldnames = ['id', 'item_name', 'category', 'quantity', 'base_price', 
                         'expiry_date', 'discounted_price', 'discount_percentage', 'days_to_expiry']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in items:
                writer.writerow({k: item[k] for k in fieldnames})
        
        # Return as downloadable file
        from flask import make_response
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=perishable_items.csv"
        response.headers["Content-Type"] = "text/csv"
        
        return response
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("Basket Buddy 2.0 - Admin API Server")
    print("Research-Grade Grocery Management System")
    print("=" * 60)
    print("\nAPI Endpoints:")
    print("  GET    /api/health")
    print("  GET    /api/perishables")
    print("  GET    /api/perishables/<id>")
    print("  POST   /api/perishables")
    print("  PUT    /api/perishables/<id>")
    print("  DELETE /api/perishables/<id>")
    print("  PATCH  /api/perishables/update_discounts")
    print("  GET    /api/perishables/category/<category>")
    print("  GET    /api/perishables/expiring")
    print("  GET    /api/stats/categories")
    print("  POST   /api/import/csv")
    print("  GET    /api/export/csv")
    print("\nServer running on http://localhost:5000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)

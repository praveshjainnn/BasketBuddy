"""
Seller Routes for Basket Buddy 2.0
Handles seller-specific operations for perishable item management
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, date
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import PerishableItem
from database import Database

seller_bp = Blueprint('seller', __name__, url_prefix='/api/seller')
db = Database('perishable_items.db')


@seller_bp.route('/items', methods=['GET'])
def get_seller_items():
    """
    Get all items for a specific seller.
    Query params: seller_name (optional)
    """
    seller_name = request.args.get('seller_name')
    
    try:
        all_items = db.get_all_items()
        
        # Filter by seller if specified
        if seller_name:
            items = [item for item in all_items if item.get('seller_name') == seller_name]
        else:
            items = all_items
        
        return jsonify({
            'success': True,
            'count': len(items),
            'data': items
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@seller_bp.route('/items', methods=['POST'])
def create_seller_item():
    """
    Create a new perishable item (seller-specific).
    Supports shelf_life auto-calculation of expiry_date.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['item_name', 'category', 'quantity', 'base_price', 'seller_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        # Validate that either shelf_life or expiry_date is provided
        if 'shelf_life' not in data and 'expiry_date' not in data:
            return jsonify({
                'success': False,
                'error': 'Either shelf_life or expiry_date must be provided'
            }), 400
        
        # Validate expiry_date is not in the past if provided
        if 'expiry_date' in data:
            expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            if expiry_date < date.today():
                return jsonify({
                    'success': False,
                    'error': 'Expiry date cannot be in the past'
                }), 400
        
        # Create temporary item to calculate discount
        temp_item = PerishableItem(
            id=0,  # Temporary ID
            item_name=data['item_name'],
            category=data['category'],
            quantity=int(data['quantity']),
            base_price=float(data['base_price']),
            cost_price=float(data.get('cost_price', data['base_price'] * 0.7)),
            shelf_life=int(data['shelf_life']) if 'shelf_life' in data else None,
            expiry_date=data.get('expiry_date'),
            seller_name=data['seller_name'],
            is_active=data.get('is_active', True)
        )
        
        # Prepare data for database insertion
        db_data = {
            'item_name': temp_item.item_name,
            'category': temp_item.category,
            'quantity': temp_item.quantity,
            'base_price': temp_item.base_price,
            'cost_price': temp_item.cost_price,
            'shelf_life': temp_item.shelf_life,
            'expiry_date': temp_item.expiry_date.isoformat(),
            'discounted_price': temp_item.discounted_price,
            'seller_name': temp_item.seller_name,
            'is_active': 1 if temp_item.is_active else 0
        }
        
        item_id = db.create_item(db_data)
        
        # Fetch the created item
        created_item_data = db.get_item_by_id(item_id)
        if created_item_data:
            from app import create_perishable_item_from_db
            created_item = create_perishable_item_from_db(created_item_data)
            
            return jsonify({
                'success': True,
                'message': 'Item created successfully',
                'data': created_item.to_dict()
            }), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to retrieve created item'}), 500
            
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@seller_bp.route('/items/<int:item_id>', methods=['PUT'])
def update_seller_item(item_id: int):
    """
    Update a seller's item.
    """
    try:
        data = request.get_json()
        
        # Validate expiry_date if provided
        if 'expiry_date' in data:
            expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            if expiry_date < date.today():
                return jsonify({
                    'success': False,
                    'error': 'Expiry date cannot be in the past'
                }), 400
        
        # Update the item
        success = db.update_item(item_id, data)
        
        if success:
            updated_item_data = db.get_item_by_id(item_id)
            if updated_item_data:
                from app import create_perishable_item_from_db
                updated_item = create_perishable_item_from_db(updated_item_data)
                
                return jsonify({
                    'success': True,
                    'message': 'Item updated successfully',
                    'data': updated_item.to_dict()
                })
        
        return jsonify({'success': False, 'error': 'Item not found'}), 404
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@seller_bp.route('/items/<int:item_id>', methods=['DELETE'])
def delete_seller_item(item_id: int):
    """
    Delete a seller's item.
    """
    try:
        success = db.delete_item(item_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Item deleted successfully'
            })
        
        return jsonify({'success': False, 'error': 'Item not found'}), 404
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@seller_bp.route('/items/<int:item_id>/toggle-active', methods=['PATCH'])
def toggle_item_active(item_id: int):
    """
    Toggle item active status (for public visibility).
    """
    try:
        item_data = db.get_item_by_id(item_id)
        if not item_data:
            return jsonify({'success': False, 'error': 'Item not found'}), 404
        
        current_status = bool(item_data.get('is_active', 1))
        new_status = not current_status
        
        success = db.update_item(item_id, {'is_active': 1 if new_status else 0})
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Item {"activated" if new_status else "deactivated"} successfully',
                'is_active': new_status
            })
        
        return jsonify({'success': False, 'error': 'Failed to update item'}), 500
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@seller_bp.route('/stats', methods=['GET'])
def get_seller_stats():
    """
    Get statistics for a specific seller.
    Query params: seller_name (required)
    """
    seller_name = request.args.get('seller_name')
    
    if not seller_name:
        return jsonify({'success': False, 'error': 'seller_name is required'}), 400
    
    try:
        all_items = db.get_all_items()
        seller_items = [item for item in all_items if item.get('seller_name') == seller_name]
        
        total_items = len(seller_items)
        active_items = len([item for item in seller_items if item.get('is_active', True)])
        near_expiry = len([item for item in seller_items if item.get('is_near_expiry', False)])
        expired = len([item for item in seller_items if item.get('is_expired', False)])
        
        avg_discount = 0
        if seller_items:
            avg_discount = sum(item.get('discount_percentage', 0) for item in seller_items) / total_items
        
        total_revenue = sum(
            item.get('discounted_price', 0) * item.get('quantity', 0)
            for item in seller_items if item.get('is_active', True)
        )
        
        total_cost = sum(
            item.get('cost_price', 0) * item.get('quantity', 0)
            for item in seller_items if item.get('is_active', True)
        )
        
        profit_margin = ((total_revenue - total_cost) / total_revenue * 100) if total_revenue > 0 else 0
        
        return jsonify({
            'success': True,
            'data': {
                'total_items': total_items,
                'active_items': active_items,
                'inactive_items': total_items - active_items,
                'near_expiry': near_expiry,
                'expired': expired,
                'avg_discount': round(avg_discount, 2),
                'total_revenue': round(total_revenue, 2),
                'total_cost': round(total_cost, 2),
                'profit_margin': round(profit_margin, 2)
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

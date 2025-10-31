"""
Public Routes for Basket Buddy 2.0
Provides public access to active perishable items for users
"""

from flask import Blueprint, request, jsonify
from datetime import date
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import PerishableItem
from database import Database

public_bp = Blueprint('public', __name__, url_prefix='/api/perishables')
db = Database('perishable_items.db')


@public_bp.route('/public', methods=['GET'])
def get_public_items():
    """
    Get all active, non-expired perishable items for public viewing.
    This endpoint is used by the User Side to browse seller items.
    
    Query params:
    - category: Filter by category (optional)
    - min_discount: Minimum discount percentage (optional)
    - max_price: Maximum discounted price (optional)
    - seller_name: Filter by seller (optional)
    """
    try:
        # Get all items
        all_items = db.get_all_items()
        
        # Filter for active, non-expired items
        public_items = [
            item for item in all_items
            if item.get('is_active', True) and not item.get('is_expired', False)
        ]
        
        # Apply filters from query params
        category = request.args.get('category')
        min_discount = request.args.get('min_discount', type=float)
        max_price = request.args.get('max_price', type=float)
        seller_name = request.args.get('seller_name')
        
        if category:
            public_items = [item for item in public_items if item.get('category') == category]
        
        if min_discount is not None:
            public_items = [
                item for item in public_items
                if item.get('discount_percentage', 0) >= min_discount
            ]
        
        if max_price is not None:
            public_items = [
                item for item in public_items
                if item.get('discounted_price', float('inf')) <= max_price
            ]
        
        if seller_name:
            public_items = [item for item in public_items if item.get('seller_name') == seller_name]
        
        # Sort by discount percentage (highest first) by default
        sort_by = request.args.get('sort_by', 'discount')
        if sort_by == 'discount':
            public_items.sort(key=lambda x: x.get('discount_percentage', 0), reverse=True)
        elif sort_by == 'price':
            public_items.sort(key=lambda x: x.get('discounted_price', 0))
        elif sort_by == 'expiry':
            public_items.sort(key=lambda x: x.get('days_to_expiry', 999))
        
        return jsonify({
            'success': True,
            'count': len(public_items),
            'data': public_items,
            'filters_applied': {
                'category': category,
                'min_discount': min_discount,
                'max_price': max_price,
                'seller_name': seller_name,
                'sort_by': sort_by
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@public_bp.route('/public/categories', methods=['GET'])
def get_public_categories():
    """
    Get all available categories with item counts (public items only).
    """
    try:
        all_items = db.get_all_items()
        
        # Filter for active, non-expired items
        public_items = [
            item for item in all_items
            if item.get('is_active', True) and not item.get('is_expired', False)
        ]
        
        # Count items by category
        categories = {}
        for item in public_items:
            category = item.get('category', 'Other')
            if category not in categories:
                categories[category] = {
                    'category': category,
                    'count': 0,
                    'avg_discount': 0,
                    'total_discount': 0
                }
            categories[category]['count'] += 1
            categories[category]['total_discount'] += item.get('discount_percentage', 0)
        
        # Calculate average discounts
        for category in categories.values():
            if category['count'] > 0:
                category['avg_discount'] = round(category['total_discount'] / category['count'], 2)
            del category['total_discount']
        
        return jsonify({
            'success': True,
            'data': list(categories.values())
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@public_bp.route('/public/sellers', methods=['GET'])
def get_public_sellers():
    """
    Get all sellers with their active item counts.
    """
    try:
        all_items = db.get_all_items()
        
        # Filter for active, non-expired items
        public_items = [
            item for item in all_items
            if item.get('is_active', True) and not item.get('is_expired', False)
        ]
        
        # Count items by seller
        sellers = {}
        for item in public_items:
            seller = item.get('seller_name', 'Unknown')
            if seller not in sellers:
                sellers[seller] = {
                    'seller_name': seller,
                    'active_items': 0,
                    'avg_discount': 0,
                    'total_discount': 0
                }
            sellers[seller]['active_items'] += 1
            sellers[seller]['total_discount'] += item.get('discount_percentage', 0)
        
        # Calculate average discounts
        for seller in sellers.values():
            if seller['active_items'] > 0:
                seller['avg_discount'] = round(seller['total_discount'] / seller['active_items'], 2)
            del seller['total_discount']
        
        return jsonify({
            'success': True,
            'data': list(sellers.values())
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@public_bp.route('/public/deals', methods=['GET'])
def get_best_deals():
    """
    Get items with the highest discounts (best deals).
    Query params:
    - limit: Number of items to return (default: 10)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        all_items = db.get_all_items()
        
        # Filter for active, non-expired items
        public_items = [
            item for item in all_items
            if item.get('is_active', True) and not item.get('is_expired', False)
        ]
        
        # Sort by discount percentage (highest first)
        public_items.sort(key=lambda x: x.get('discount_percentage', 0), reverse=True)
        
        # Limit results
        best_deals = public_items[:limit]
        
        return jsonify({
            'success': True,
            'count': len(best_deals),
            'data': best_deals
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

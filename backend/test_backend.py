"""
Quick test script to verify backend is working
"""

try:
    print("Testing imports...")
    from models import PerishableItem
    from database import Database
    from datetime import date
    
    print("✓ Imports successful")
    
    print("\nTesting PerishableItem model...")
    item = PerishableItem(
        id=1,
        item_name="Test Milk",
        category="Dairy",
        quantity=10,
        base_price=5.99,
        expiry_date=date(2024, 10, 27)
    )
    print(f"✓ Created item: {item.item_name}")
    print(f"  Days to expiry: {item.days_to_expiry}")
    print(f"  Discount: {item.discount_percentage}%")
    print(f"  Discounted price: ${item.discounted_price}")
    
    print("\nTesting Database...")
    db = Database('test_perishable_items.db')
    print("✓ Database initialized")
    
    print("\nAll tests passed! ✓")
    print("\nBackend is ready to run!")
    print("Start with: python app.py")
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nPlease check:")
    print("1. Flask is installed: pip install flask flask-cors")
    print("2. All files are in the backend folder")
    import traceback
    traceback.print_exc()

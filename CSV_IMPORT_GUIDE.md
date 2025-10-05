# 📊 CSV Import Guide - BasketBuddy

## ✅ CSV Import Feature Implemented

You can now import grocery lists from CSV files and use them for comparisons and operations!

---

## 🎯 How to Use CSV Import

### **Step 1: Prepare Your CSV File**

Your CSV file should have these columns (case-insensitive):
- `name` - Item name (required)
- `category` - Item category (optional, defaults to "Uncategorized")
- `quantity` - Item quantity (optional, defaults to 1)
- `unit` - Unit of measurement (optional, defaults to "piece")
- `price` - Item price (optional, defaults to 0)

**Example CSV Format**:
```csv
name,category,quantity,unit,price
Milk,Dairy,2,liters,3.99
Bread,Bakery,1,loaf,2.49
Apples,Produce,6,pieces,4.99
Chicken Breast,Meat,1,kg,8.99
```

### **Step 2: Import the CSV**

1. **Sign in** to your account
2. Go to **Lists** tab
3. Click **"Import CSV"** button (top right)
4. **Select your CSV file**
5. **Preview** the data
6. **Enter a list name** (e.g., "Weekly Groceries")
7. **Add description** (optional)
8. Click **"Import List"**
9. ✅ Done! Your list is now imported

### **Step 3: Use the Imported List**

Once imported, you can:
- ✅ **View** the list in the Lists tab
- ✅ **Edit** items in the list
- ✅ **Compare** with other lists
- ✅ **Perform operations** (Union, Intersection, Difference, etc.)
- ✅ **Visualize** in charts and graphs
- ✅ **Share** with family members

---

## 📝 Sample CSV File

A sample CSV file has been created for you:
**Location**: `sample-grocery-list.csv`

**Contents**:
```csv
name,category,quantity,unit,price
Milk,Dairy,2,liters,3.99
Bread,Bakery,1,loaf,2.49
Apples,Produce,6,pieces,4.99
Chicken Breast,Meat,1,kg,8.99
Rice,Grains,2,kg,5.99
Eggs,Dairy,12,pieces,3.49
Tomatoes,Produce,4,pieces,2.99
Cheese,Dairy,1,block,6.99
Pasta,Grains,2,boxes,3.99
Orange Juice,Beverages,1,liter,4.49
```

---

## 🔄 Comparing Imported Lists

### **Example Workflow**:

1. **Import List 1**: "Weekly Groceries" (from CSV)
2. **Import List 2**: "Party Supplies" (from CSV)
3. **Go to Compare tab**
4. **Select both lists**
5. **Choose operation**:
   - **Union** - All items from both lists
   - **Intersection** - Common items
   - **Difference** - Items in List 1 but not in List 2
   - **Symmetric Difference** - Items unique to each list
   - **Complement** - Items not in a specific list

### **Visual Comparison**:
- **Venn Diagram** - See overlapping items
- **Bar Charts** - Compare quantities and prices
- **Category Analysis** - Compare by category

---

## 📊 CSV Format Details

### **Supported Column Names** (case-insensitive):

| Column | Alternatives | Required | Default |
|--------|-------------|----------|---------|
| name | NAME, item, ITEM | ✅ Yes | - |
| category | CATEGORY | ❌ No | "Uncategorized" |
| quantity | QUANTITY | ❌ No | 1 |
| unit | UNIT | ❌ No | "piece" |
| price | PRICE | ❌ No | 0 |

### **Example Variations**:

**Minimal CSV** (only name column):
```csv
name
Milk
Bread
Apples
```

**Full CSV** (all columns):
```csv
name,category,quantity,unit,price
Milk,Dairy,2,liters,3.99
Bread,Bakery,1,loaf,2.49
```

**Mixed Case** (works fine):
```csv
NAME,CATEGORY,QUANTITY,UNIT,PRICE
Milk,Dairy,2,liters,3.99
```

---

## 🎨 UI Features

### **Import Dialog**:
- ✅ File upload with drag & drop
- ✅ Live preview of CSV data
- ✅ Shows number of items found
- ✅ List name and description fields
- ✅ Import and Clear buttons
- ✅ Success confirmation

### **After Import**:
- ✅ List appears in Lists tab
- ✅ Purple color badge (imported lists)
- ✅ All items with proper data
- ✅ Ready for comparison

---

## 🔍 Testing the Import

### **Quick Test**:

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Sign in** to your account

3. **Use the sample CSV**:
   - Click "Import CSV"
   - Select `sample-grocery-list.csv`
   - Name it "Sample List"
   - Click "Import List"

4. **Verify**:
   - List appears in Lists tab
   - 10 items imported
   - All data correct

5. **Test Comparison**:
   - Create or import another list
   - Go to Compare tab
   - Select both lists
   - Try different operations

---

## 🛠️ Creating Your Own CSV

### **Using Excel/Google Sheets**:

1. Create a spreadsheet with columns:
   - name | category | quantity | unit | price

2. Fill in your grocery items

3. **Save as CSV**:
   - Excel: File → Save As → CSV (Comma delimited)
   - Google Sheets: File → Download → CSV

4. Import into BasketBuddy!

### **Using Text Editor**:

1. Open Notepad or any text editor

2. Type your data:
   ```
   name,category,quantity,unit,price
   Item1,Category1,1,piece,5.99
   Item2,Category2,2,kg,10.99
   ```

3. Save as `.csv` file

4. Import into BasketBuddy!

---

## 💡 Use Cases

### **1. Weekly Shopping**:
- Import your regular weekly groceries
- Compare with previous weeks
- Track price changes

### **2. Party Planning**:
- Import party supplies list
- Compare with what you have
- Find missing items

### **3. Recipe Ingredients**:
- Import ingredients from recipes
- Compare with pantry inventory
- Generate shopping list

### **4. Bulk Shopping**:
- Import wholesale items
- Compare prices with retail
- Calculate savings

### **5. Family Collaboration**:
- Each family member imports their list
- Compare and merge lists
- Eliminate duplicates

---

## 🎯 Comparison Operations Explained

### **Union (A ∪ B)**:
- **Result**: All items from both lists
- **Use**: Combine shopping lists
- **Example**: List A (5 items) + List B (7 items) = 12 items (or less if duplicates)

### **Intersection (A ∩ B)**:
- **Result**: Only items in both lists
- **Use**: Find common items
- **Example**: What items appear in both lists?

### **Difference (A - B)**:
- **Result**: Items in A but not in B
- **Use**: Find unique items
- **Example**: What do I need that others don't?

### **Symmetric Difference (A Δ B)**:
- **Result**: Items in A or B, but not both
- **Use**: Find all unique items
- **Example**: What items are unique to each list?

### **Complement (A')**:
- **Result**: Items not in A
- **Use**: Find what's missing
- **Example**: What items are in other lists but not mine?

---

## ✅ Features

### **Import Features**:
- ✅ CSV file upload
- ✅ Automatic data parsing
- ✅ Column name detection (case-insensitive)
- ✅ Data preview before import
- ✅ Custom list name and description
- ✅ Validation and error handling
- ✅ Success confirmation

### **List Features**:
- ✅ View imported lists
- ✅ Edit items
- ✅ Delete items
- ✅ Add more items
- ✅ Share with family
- ✅ Export (coming soon)

### **Comparison Features**:
- ✅ Select multiple lists
- ✅ Visual Venn diagrams
- ✅ Set operations (Union, Intersection, etc.)
- ✅ Bar charts
- ✅ Category analysis
- ✅ Price comparison

---

## 🐛 Troubleshooting

### **CSV Not Parsing**:
- Check file format (must be .csv)
- Ensure comma-separated values
- Check for special characters
- Try opening in Excel and re-saving

### **Missing Data**:
- Verify column names match (name, category, quantity, unit, price)
- Check for empty rows
- Ensure no extra commas

### **Import Button Disabled**:
- Enter a list name
- Make sure CSV has data
- Sign in to your account

### **Items Not Showing**:
- Refresh the page
- Check Lists tab
- Verify import was successful

---

## 📚 Next Steps

1. ✅ **Import your first CSV**
2. ✅ **Create multiple lists**
3. ✅ **Try comparison operations**
4. ✅ **Visualize with charts**
5. ✅ **Share with family**

---

## 🎉 Summary

**CSV Import is now fully functional!**

You can:
- ✅ Import grocery lists from CSV files
- ✅ Preview data before importing
- ✅ Name and describe your lists
- ✅ Compare multiple imported lists
- ✅ Perform set operations
- ✅ Visualize comparisons

**Sample CSV file included**: `sample-grocery-list.csv`

**Ready to test!** 🚀

---

**Questions?** Check the other documentation files:
- `QUICK_START.md` - Quick setup guide
- `FIREBASE_AUTH_SETUP.md` - Authentication setup
- `TESTING_CHECKLIST.md` - Complete testing guide

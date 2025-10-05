# 🔥 Firestore Setup - Step by Step

## ⚠️ Lists Not Showing in Firebase?

Follow these steps to set up Firestore Database:

---

## 📋 Step 1: Create Firestore Database

### **Go to Firebase Console**:
https://console.firebase.google.com/project/basketbuddy-e05b9/firestore

### **Create Database**:

1. Click **"Create database"** button
2. **Select mode**:
   - Choose **"Start in test mode"** (for development)
   - Or **"Start in production mode"** (more secure)
3. **Select location**:
   - Choose closest to you (e.g., `us-central1`, `asia-south1`, etc.)
4. Click **"Enable"**

### **Wait for Creation**:
- Takes 1-2 minutes
- You'll see "Cloud Firestore" dashboard when ready

---

## 📋 Step 2: Set Security Rules

### **Go to Rules Tab**:
Firebase Console → Firestore Database → **Rules** tab

### **Paste These Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own grocery lists
    match /groceryLists/{listId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Allow authenticated users to read/write their own user data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### **Click "Publish"**

---

## 📋 Step 3: Test the Connection

### **In Your App**:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Sign in** to your account

4. **Create or import a list**

5. **Check console** for these messages:
   - ✅ "List added successfully"
   - ✅ "List saved to Firestore"
   - ❌ If you see errors, note them

### **In Firebase Console**:

1. Go to **Firestore Database** → **Data** tab
2. Look for **`groceryLists`** collection
3. You should see your lists as documents

---

## 🐛 Troubleshooting

### **Issue: "Permission denied" error**

**Solution**:
1. Make sure you're signed in
2. Check Firestore rules are published
3. Try these more permissive rules (TEST MODE ONLY):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **Issue: "Firestore is not initialized"**

**Solution**:
1. Make sure Firestore database is created
2. Refresh your app
3. Check browser console for errors

### **Issue: No collection appears**

**Solution**:
1. Create a list in your app first
2. Wait a few seconds
3. Refresh Firestore console
4. Check browser console for errors

### **Issue: "Failed to get document"**

**Solution**:
1. Check your internet connection
2. Verify Firestore is enabled
3. Check security rules allow reads

---

## ✅ Quick Test

### **Manual Test in Firestore Console**:

1. Go to Firestore Database → **Data** tab
2. Click **"Start collection"**
3. Collection ID: `test`
4. Document ID: `test-doc`
5. Add field:
   - Field: `message`
   - Type: `string`
   - Value: `Hello Firestore!`
6. Click **Save**

If this works, Firestore is set up correctly!

---

## 🔍 Check Browser Console

### **Open Console** (F12 → Console tab)

### **Look for these messages**:

**✅ Success messages**:
```
List added successfully
List saved to Firestore
Loaded X lists from Firestore
```

**❌ Error messages**:
```
Error saving to Firestore: [error details]
Permission denied
Firestore is not initialized
```

### **If you see errors**:
1. Copy the full error message
2. Check if Firestore is created
3. Check if rules are published
4. Make sure you're signed in

---

## 📊 Verify Data Structure

### **In Firestore Console**:

Your data should look like this:

```
groceryLists (collection)
  └── 1234567890-123 (document)
      ├── id: "1234567890-123"
      ├── name: "Weekly Groceries"
      ├── description: "..."
      ├── userId: "user-uid-here"
      ├── createdBy: "user-uid-here"
      ├── createdAt: "2025-10-05T..."
      ├── sharedWith: []
      ├── color: "bg-purple-100"
      └── items: [array]
          └── 0
              ├── id: "item-1"
              ├── name: "Milk"
              ├── category: "Dairy"
              ├── quantity: 2
              ├── unit: "liters"
              ├── price: 3.99
              ├── addedBy: "user-uid"
              └── addedAt: "2025-10-05T..."
```

---

## 🎯 Step-by-Step Verification

### **1. Is Firestore Created?**
- [ ] Go to Firebase Console
- [ ] Click "Firestore Database"
- [ ] See database dashboard (not "Create database" button)

### **2. Are Rules Published?**
- [ ] Go to Rules tab
- [ ] See rules (not default rules)
- [ ] "Last published" shows recent time

### **3. Are You Signed In?**
- [ ] Check header shows your name/email
- [ ] See "Sign Out" button
- [ ] Not seeing "Sign In / Sign Up" button

### **4. Did You Create a List?**
- [ ] Created or imported at least one list
- [ ] List appears in Lists tab
- [ ] No error messages in console

### **5. Is Data in Firestore?**
- [ ] Go to Firestore Console → Data tab
- [ ] See `groceryLists` collection
- [ ] See documents inside collection
- [ ] Documents have correct data

---

## 🚀 Quick Fix Commands

### **If nothing works, try this**:

1. **Clear browser cache**:
   - Press `Ctrl + Shift + Delete`
   - Clear cache and cookies
   - Reload page

2. **Sign out and sign in again**:
   - Click "Sign Out"
   - Sign in with your credentials
   - Try creating a list

3. **Check Network tab**:
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "firestore"
   - Create a list
   - Look for failed requests (red)

---

## 📞 Still Not Working?

### **Check These**:

1. **Firebase Project**:
   - Correct project: `basketbuddy-e05b9`
   - Firestore enabled
   - Billing enabled (if required)

2. **Browser Console**:
   - Any red errors?
   - Copy full error message
   - Check what it says

3. **Network**:
   - Internet connection working?
   - Firewall blocking Firebase?
   - VPN interfering?

4. **Code**:
   - App running without errors?
   - User is signed in?
   - `user` object exists?

---

## ✅ Success Checklist

When everything works, you should see:

- ✅ Firestore database created in Firebase Console
- ✅ Security rules published
- ✅ User signed in to app
- ✅ Lists created/imported in app
- ✅ `groceryLists` collection in Firestore
- ✅ Documents in collection with correct data
- ✅ Console logs: "List saved to Firestore"
- ✅ No errors in browser console

---

## 🎉 Next Steps

Once Firestore is working:

1. Create multiple lists
2. Import CSV files
3. Compare lists
4. Edit and update lists
5. Check they all sync to Firestore
6. Try on different devices

---

**Need Help?**
- Check browser console for errors
- Verify Firestore is created
- Ensure you're signed in
- Check security rules are published

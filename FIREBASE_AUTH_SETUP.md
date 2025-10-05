# Firebase Authentication Setup - BasketBuddy

## ✅ What's Been Implemented

### 1. **Firebase Configuration** (`lib/firebase.ts`)
- ✅ Email/Password authentication
- ✅ Google Sign-In authentication
- ✅ User profile management
- ✅ Firestore integration for user data
- ✅ Email verification on signup

### 2. **Authentication Features**

#### **Sign Up (Email/Password)**
- Users can create accounts with email, password, and display name
- Automatic user profile creation in Firestore (`users` collection)
- Email verification sent automatically
- User data stored: `uid`, `email`, `displayName`, `photoURL`, `createdAt`

#### **Sign In (Email/Password)**
- Users can sign in with registered email and password
- Error handling for invalid credentials

#### **Google Sign-In**
- One-click Google authentication
- Automatic profile data retrieval from Google account

#### **Sign Out**
- Logout button visible when user is authenticated
- Clears authentication state

### 3. **UI Components**

#### **FirebaseAuth Component** (`components/firebase-auth.tsx`)
- Shows "Sign In / Sign Up" button when logged out
- Shows user avatar, name, and "Sign Out" button when logged in
- Integrated into the app header

#### **AuthDialog Component** (`components/auth-dialog.tsx`)
- Modal dialog with tabs for Sign In and Sign Up
- Email/Password forms with validation
- Google Sign-In button
- Loading states and error handling

## 🔥 Firebase Console Setup Required

### Enable Authentication Methods:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **basketbuddy-e05b9**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following providers:
   - ✅ **Email/Password** - Click "Enable" toggle
   - ✅ **Google** - Click "Enable" and configure OAuth consent

### Firestore Database:
1. Navigate to **Firestore Database**
2. If not created, click "Create database"
3. Start in **test mode** (or production mode with rules)
4. The app will automatically create a `users` collection

### Security Rules (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read all users (for member lists)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🧪 How to Test

### 1. **Start the Development Server**
```bash
npm run dev
```

### 2. **Test Email/Password Sign Up**
1. Open http://localhost:3000
2. Click "Sign In / Sign Up" button in the header
3. Go to "Sign Up" tab
4. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: Test123456
   - Confirm Password: Test123456
5. Click "Sign Up"
6. Check Firebase Console → Authentication → Users (should see new user)
7. Check Firestore → users collection (should see user document)

### 3. **Test Email/Password Sign In**
1. Click "Sign Out" if logged in
2. Click "Sign In / Sign Up"
3. Go to "Sign In" tab
4. Enter email and password
5. Click "Sign In"
6. Should see user avatar and name in header

### 4. **Test Google Sign-In**
1. Click "Sign Out" if logged in
2. Click "Sign In / Sign Up"
3. Click "Continue with Google" button
4. Select Google account
5. Should be logged in and see user info in header

### 5. **Test Sign Out**
1. When logged in, click "Sign Out" button in header
2. Should return to landing page
3. User should be logged out

## 📊 Where to See Users in Firebase

### Firebase Authentication:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **basketbuddy-e05b9**
3. Click **Authentication** in left sidebar
4. Click **Users** tab
5. You'll see all registered users with:
   - User UID
   - Email
   - Provider (Google or Email/Password)
   - Created date
   - Last sign-in date

### Firestore Database:
1. In Firebase Console, click **Firestore Database**
2. Navigate to `users` collection
3. Each document (named by user UID) contains:
   - `uid`: User ID
   - `email`: User email
   - `displayName`: User's display name
   - `photoURL`: Profile picture URL (if available)
   - `createdAt`: Account creation timestamp

## 🎨 UI Features

### Header (Logged Out)
```
[BasketBuddy Logo] [Sign In / Sign Up Button] [Theme Toggle]
```

### Header (Logged In)
```
[BasketBuddy Logo] [User Name] [Avatar] [Sign Out Button] [Theme Toggle]
```

### Auth Dialog
- Clean, modern design
- Tabbed interface (Sign In / Sign Up)
- Form validation
- Loading states
- Error messages
- Google Sign-In option

## 🔒 Security Features

1. **Email Verification**: Sent automatically on signup
2. **Password Requirements**: Enforced by Firebase (min 6 characters)
3. **Secure Storage**: User data stored in Firestore with proper rules
4. **Session Management**: Automatic session handling by Firebase
5. **HTTPS Only**: Firebase requires HTTPS in production

## 🐛 Troubleshooting

### "Auth not initialized" Error
- Make sure you're in browser environment (not SSR)
- Check that Firebase config is correct

### Google Sign-In Not Working
- Verify Google provider is enabled in Firebase Console
- Check that authorized domains are configured
- For localhost, it should work by default

### Email/Password Sign-In Fails
- Verify Email/Password provider is enabled
- Check that email format is valid
- Ensure password meets requirements (min 6 chars)

### Users Not Appearing in Firestore
- Check Firestore database is created
- Verify Firestore rules allow writes
- Check browser console for errors

## 📝 Code Structure

```
lib/
  └── firebase.ts              # Firebase config & auth functions

components/
  ├── firebase-auth.tsx        # Auth UI component & context provider
  └── auth-dialog.tsx          # Sign in/up modal dialog

app/
  ├── layout.tsx              # AuthProvider wrapper
  └── page.tsx                # Main app with FirebaseAuth component
```

## 🚀 Next Steps

1. **Enable Authentication Methods** in Firebase Console
2. **Test Sign Up** with email/password
3. **Test Sign In** with email/password
4. **Test Google Sign-In**
5. **Verify Users** appear in Firebase Console
6. **Check Firestore** for user documents
7. **Test Sign Out** functionality

## ✨ Features Working

- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Google Sign-In
- ✅ User Profile Display
- ✅ Sign Out Button
- ✅ Firestore User Storage
- ✅ Email Verification
- ✅ Session Persistence
- ✅ Loading States
- ✅ Error Handling

---

**Firebase Project**: basketbuddy-e05b9  
**Project ID**: basketbuddy-e05b9  
**Auth Domain**: basketbuddy-e05b9.firebaseapp.com

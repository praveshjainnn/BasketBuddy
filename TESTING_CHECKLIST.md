# 🧪 Firebase Authentication Testing Checklist

## 📋 Pre-Testing Setup

### Step 1: Enable Firebase Authentication Methods
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select project: **basketbuddy-e05b9**
- [ ] Click **Authentication** in left sidebar
- [ ] Click **Sign-in method** tab
- [ ] Enable **Email/Password**:
  - [ ] Click on "Email/Password"
  - [ ] Toggle "Enable" switch
  - [ ] Click "Save"
- [ ] Enable **Google**:
  - [ ] Click on "Google"
  - [ ] Toggle "Enable" switch
  - [ ] Select support email
  - [ ] Click "Save"

### Step 2: Create Firestore Database (if not exists)
- [ ] In Firebase Console, click **Firestore Database**
- [ ] Click **Create database**
- [ ] Choose **Test mode** (or Production with rules)
- [ ] Select location (closest to you)
- [ ] Click **Enable**

### Step 3: Start Development Server
```bash
cd c:\Users\PRAVESH\Desktop\Dm\BasketBuddy
npm run dev
```
- [ ] Server starts successfully
- [ ] Open http://localhost:3000
- [ ] No console errors

---

## ✅ Test 1: Email/Password Sign Up

### Actions:
1. [ ] Open http://localhost:3000
2. [ ] Click **"Sign In / Sign Up"** button in header
3. [ ] Click **"Sign Up"** tab
4. [ ] Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
5. [ ] Click **"Sign Up"** button

### Expected Results:
- [ ] Loading state shows briefly
- [ ] Dialog closes automatically
- [ ] User is logged in
- [ ] Header shows:
  - [ ] User name: "Test User"
  - [ ] User avatar (with "T" initial)
  - [ ] "Sign Out" button
- [ ] No error messages

### Verify in Firebase Console:
- [ ] Go to **Authentication** → **Users**
- [ ] New user appears with:
  - [ ] Email: test@example.com
  - [ ] Provider: Email/Password
  - [ ] Created timestamp
- [ ] Go to **Firestore Database** → **users** collection
- [ ] Document with user UID exists containing:
  - [ ] `uid`: (user ID)
  - [ ] `email`: test@example.com
  - [ ] `displayName`: Test User
  - [ ] `createdAt`: (timestamp)

### Check Email:
- [ ] Check inbox for test@example.com
- [ ] Email verification message received
- [ ] Click verification link (optional)

---

## ✅ Test 2: Email/Password Sign In

### Actions:
1. [ ] Click **"Sign Out"** button in header
2. [ ] Verify returned to landing page
3. [ ] Click **"Sign In / Sign Up"** button
4. [ ] Click **"Sign In"** tab (should be default)
5. [ ] Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123456`
6. [ ] Click **"Sign In"** button

### Expected Results:
- [ ] Loading state shows briefly
- [ ] Dialog closes automatically
- [ ] User is logged in
- [ ] Header shows user info and "Sign Out" button
- [ ] No error messages

### Verify in Firebase Console:
- [ ] Go to **Authentication** → **Users**
- [ ] User's "Last sign-in" timestamp is updated

---

## ✅ Test 3: Google Sign-In

### Actions:
1. [ ] Click **"Sign Out"** button (if logged in)
2. [ ] Click **"Sign In / Sign Up"** button
3. [ ] Click **"Continue with Google"** button
4. [ ] Select Google account from popup
5. [ ] Grant permissions if prompted

### Expected Results:
- [ ] Google popup opens
- [ ] After selection, popup closes
- [ ] Dialog closes automatically
- [ ] User is logged in
- [ ] Header shows:
  - [ ] Google display name
  - [ ] Google profile picture
  - [ ] "Sign Out" button
- [ ] No error messages

### Verify in Firebase Console:
- [ ] Go to **Authentication** → **Users**
- [ ] New user appears with:
  - [ ] Email: (your Google email)
  - [ ] Provider: Google
  - [ ] Photo URL present
- [ ] Go to **Firestore Database** → **users** collection
- [ ] Document with user UID exists (created by Google sign-in)

---

## ✅ Test 4: Sign Out Functionality

### Actions:
1. [ ] Ensure user is logged in (any method)
2. [ ] Click **"Sign Out"** button in header

### Expected Results:
- [ ] User is logged out immediately
- [ ] Redirected to landing page (hero section)
- [ ] Header shows **"Sign In / Sign Up"** button again
- [ ] No user info visible
- [ ] No error messages

---

## ✅ Test 5: Session Persistence

### Actions:
1. [ ] Sign in with any method
2. [ ] Refresh the page (F5 or Ctrl+R)

### Expected Results:
- [ ] User remains logged in
- [ ] User info still visible in header
- [ ] No need to sign in again
- [ ] App state preserved

### Actions (Part 2):
1. [ ] Sign out
2. [ ] Refresh the page

### Expected Results:
- [ ] User remains logged out
- [ ] Landing page still visible
- [ ] "Sign In / Sign Up" button present

---

## ✅ Test 6: Error Handling - Wrong Password

### Actions:
1. [ ] Click **"Sign In / Sign Up"** button
2. [ ] Click **"Sign In"** tab
3. [ ] Enter:
   - Email: `test@example.com`
   - Password: `WrongPassword123`
4. [ ] Click **"Sign In"** button

### Expected Results:
- [ ] Error alert appears
- [ ] Message: "Login failed. Please check your email and password."
- [ ] User not logged in
- [ ] Dialog remains open
- [ ] Can try again

---

## ✅ Test 7: Error Handling - Duplicate Email

### Actions:
1. [ ] Click **"Sign In / Sign Up"** button
2. [ ] Click **"Sign Up"** tab
3. [ ] Enter existing email:
   - Name: `Another User`
   - Email: `test@example.com` (already registered)
   - Password: `Test123456`
   - Confirm Password: `Test123456`
4. [ ] Click **"Sign Up"** button

### Expected Results:
- [ ] Error alert appears
- [ ] Message: "Signup failed. Please try again."
- [ ] User not logged in
- [ ] Dialog remains open
- [ ] Can try different email

---

## ✅ Test 8: Password Mismatch Validation

### Actions:
1. [ ] Click **"Sign In / Sign Up"** button
2. [ ] Click **"Sign Up"** tab
3. [ ] Enter:
   - Name: `New User`
   - Email: `newuser@example.com`
   - Password: `Test123456`
   - Confirm Password: `Test123457` (different)
4. [ ] Click **"Sign Up"** button

### Expected Results:
- [ ] Alert appears: "Passwords don't match!"
- [ ] No signup attempt made
- [ ] Dialog remains open
- [ ] Can correct and try again

---

## ✅ Test 9: Multiple Users

### Actions:
1. [ ] Sign out if logged in
2. [ ] Sign up with different emails:
   - User 1: `user1@example.com`
   - User 2: `user2@example.com`
   - User 3: Sign in with Google

### Expected Results:
- [ ] All users created successfully
- [ ] Each user has unique UID

### Verify in Firebase Console:
- [ ] Go to **Authentication** → **Users**
- [ ] See all 3+ users listed
- [ ] Different providers shown
- [ ] Go to **Firestore Database** → **users**
- [ ] See 3+ user documents
- [ ] Each has unique data

---

## ✅ Test 10: UI/UX Verification

### Header (Logged Out):
- [ ] "Sign In / Sign Up" button visible
- [ ] Button has proper styling
- [ ] Hover effect works
- [ ] Click opens dialog

### Header (Logged In):
- [ ] User name displayed correctly
- [ ] Avatar shows:
  - [ ] Profile picture (Google users)
  - [ ] Initial letter (Email users)
- [ ] "Sign Out" button visible
- [ ] All elements properly aligned
- [ ] Responsive on mobile

### Auth Dialog:
- [ ] Opens smoothly
- [ ] Tabs work correctly
- [ ] Forms are properly styled
- [ ] Input fields have icons
- [ ] Loading states show
- [ ] Close button works
- [ ] Click outside closes dialog
- [ ] Responsive design

---

## 🐛 Common Issues & Solutions

### Issue: "Auth not initialized"
**Solution**: 
- Ensure you're testing in browser (not SSR)
- Check Firebase config in `lib/firebase.ts`
- Verify Firebase SDK is installed

### Issue: Google Sign-In popup blocked
**Solution**:
- Allow popups in browser settings
- Try different browser
- Check Firebase Console for authorized domains

### Issue: Email/Password provider not working
**Solution**:
- Verify Email/Password is enabled in Firebase Console
- Check Firebase Console → Authentication → Sign-in method
- Ensure toggle is ON

### Issue: Users not appearing in Firestore
**Solution**:
- Check Firestore database is created
- Verify Firestore rules allow writes
- Check browser console for errors
- Try signing up again

### Issue: Development server won't start
**Solution**:
```bash
# Kill any existing processes
taskkill /F /IM node.exe

# Clear cache and restart
npm run dev
```

---

## 📊 Success Criteria

### All Tests Pass:
- [ ] ✅ Email/Password Sign Up works
- [ ] ✅ Email/Password Sign In works
- [ ] ✅ Google Sign-In works
- [ ] ✅ Sign Out works
- [ ] ✅ Session persistence works
- [ ] ✅ Error handling works
- [ ] ✅ Users appear in Firebase Authentication
- [ ] ✅ Users appear in Firestore Database
- [ ] ✅ UI is responsive and polished
- [ ] ✅ No console errors

### Firebase Console Verification:
- [ ] ✅ Multiple users visible in Authentication
- [ ] ✅ User documents in Firestore `users` collection
- [ ] ✅ Timestamps are correct
- [ ] ✅ Provider information is accurate

---

## 🎉 Next Steps After Testing

1. **Configure Firestore Security Rules** (Production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

2. **Add Password Reset** (Optional):
   - Implement "Forgot Password" link
   - Use `sendPasswordResetEmail()` from Firebase Auth

3. **Add Email Verification Check** (Optional):
   - Check `user.emailVerified` status
   - Prompt users to verify email

4. **Add Profile Picture Upload** (Optional):
   - Use Firebase Storage
   - Update user profile with photo URL

5. **Add Social Providers** (Optional):
   - Facebook Login
   - Twitter Login
   - GitHub Login

---

## 📝 Testing Notes

**Date**: _____________  
**Tester**: _____________  
**Browser**: _____________  
**Issues Found**: _____________  
**Status**: ⬜ Pass | ⬜ Fail | ⬜ Needs Review

---

**Happy Testing! 🚀**

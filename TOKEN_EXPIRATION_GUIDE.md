# Token Expiration Auto-Logout Implementation

## Overview
This implementation automatically logs out users and redirects them to the home page when their authentication token expires (401 Unauthorized response).

## How It Works

### 1. Global Fetch Interceptor
The `TokenExpirationHandler` component intercepts **ALL** fetch requests globally by overriding `window.fetch`. When any API call returns a 401 status:
- A toast notification appears: "Session expired - Your session has expired. Please login again."
- User is automatically logged out
- User is redirected to the home page
- All user data is cleared from localStorage

### 2. Implementation Details

#### Files Created/Modified:

**New Files:**
1. `client/components/TokenExpirationHandler.tsx` - Global fetch interceptor component
2. `client/utils/fetchWithAuth.ts` - Utility for manual fetch with auth (optional usage)
3. `client/hooks/useAuthFetch.ts` - Custom hook for authenticated fetch (optional usage)

**Modified Files:**
1. `client/contexts/AuthContext.tsx` - Added `handleTokenExpiration()` method
2. `client/App.tsx` - Added `TokenExpirationHandler` component to app root

### 3. How Token Expiration is Detected

The system checks for:
- HTTP Status 401 (Unauthorized)
- Error messages containing keywords: "token", "expired", "unauthorized"

### 4. User Experience Flow

```
User makes API request → Token expired (401) → Toast notification shown → 
Auto logout (500ms delay) → Redirect to home page → User sees login button
```

### 5. Usage

#### Automatic (Recommended)
No changes needed! All existing `fetch()` calls are automatically intercepted.

```typescript
// Existing code works automatically
const response = await fetch(config.API_ENDPOINT, {
  headers: {
    'Authorization': `Bearer ${user?.token}`
  }
});
```

#### Manual (Optional)
You can also use the custom hook for more control:

```typescript
import { useAuthFetch } from '@/hooks/useAuthFetch';

function MyComponent() {
  const authFetch = useAuthFetch();
  
  const fetchData = async () => {
    const response = await authFetch(config.API_ENDPOINT);
    // Automatically handles token expiration
  };
}
```

## Features

✅ **Global Coverage** - Works for all fetch requests automatically  
✅ **User-Friendly** - Shows toast notification before logout  
✅ **Clean Logout** - Clears all user data and localStorage  
✅ **Automatic Redirect** - Takes user to home page  
✅ **No Code Changes Required** - Works with existing codebase  
✅ **Single Notification** - Prevents multiple toast spam  
✅ **Configurable Delay** - 500ms delay allows toast to be seen  

## Testing

To test token expiration:
1. Login to the application
2. Wait for token to expire (or manually expire it on backend)
3. Make any API request (browse products, view orders, etc.)
4. You should see:
   - Toast notification: "Session expired"
   - Automatic logout
   - Redirect to home page

## Configuration

To adjust the logout delay, modify `TokenExpirationHandler.tsx`:

```typescript
setTimeout(() => {
  handleTokenExpiration();
}, 500); // Change this value (in milliseconds)
```

To customize the toast message:

```typescript
toast.error('Session expired', {
  description: 'Your custom message here',
  duration: 3000, // Toast display duration
});
```

## Notes

- The interceptor is active only when a user is logged in
- Multiple 401 responses will only show one toast notification
- The original `fetch` function is restored when the app unmounts
- Compatible with all existing API calls without modification


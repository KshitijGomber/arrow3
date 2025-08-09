# Google OAuth Integration Setup

## Overview

The Arrow3 Aerospace Platform includes Google OAuth 2.0 authentication integration that allows users to sign in with their Google accounts. This document explains how to set up and use the Google OAuth functionality.

## Features Implemented

### Backend Features
- ✅ Google OAuth 2.0 strategy configuration with Passport.js
- ✅ OAuth callback handling with automatic user creation/linking
- ✅ JWT token generation for OAuth users
- ✅ Account linking for existing users
- ✅ Account unlinking with password validation
- ✅ Comprehensive error handling and security measures

### Frontend Features
- ✅ Google OAuth button component
- ✅ OAuth callback page with loading states
- ✅ Authentication context integration
- ✅ Automatic redirect after successful authentication
- ✅ Error handling and user feedback

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Configure authorized redirect URIs:
   - Development: `http://localhost:5001/api/auth/google/callback`
   - Production: `https://your-backend-domain.com/api/auth/google/callback`

### 2. Environment Variables

Add the following to your `server/.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id-from-console
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
CLIENT_URL=http://localhost:3000
```

For production, update `CLIENT_URL` to your production frontend URL.

### 3. Frontend Configuration

Add to your `client/.env` file:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-from-console
```

## API Endpoints

### OAuth Flow Endpoints

#### `GET /api/auth/google`
Initiates the Google OAuth flow by redirecting to Google's authorization server.

**Usage:**
```javascript
// Redirect user to Google OAuth
window.location.href = `${API_URL}/auth/google`;
```

#### `GET /api/auth/google/callback`
Handles the OAuth callback from Google and redirects to frontend with tokens.

**Response:** Redirects to frontend with URL parameters:
- `token`: JWT access token
- `refresh`: JWT refresh token  
- `user`: JSON-encoded user object

### Account Management Endpoints

#### `POST /api/auth/google/link`
Links a Google account to an existing authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "googleId": "google-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google account linked successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "googleId": "google-user-id",
      "isEmailVerified": true
    }
  }
}
```

#### `DELETE /api/auth/google/unlink`
Unlinks a Google account from the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Google account unlinked successfully",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
}
```

## Frontend Usage

### Using the Google OAuth Button

```jsx
import GoogleOAuthButton from '../components/GoogleOAuthButton';

function LoginPage() {
  return (
    <div>
      <GoogleOAuthButton 
        text="Sign in with Google"
        variant="outlined"
        fullWidth={true}
      />
    </div>
  );
}
```

### Handling OAuth Callback

The OAuth callback is automatically handled by the `OAuthCallback` component at `/auth/callback`. Make sure this route is configured in your React Router:

```jsx
import OAuthCallback from './pages/auth/OAuthCallback';

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<OAuthCallback />} />
      {/* other routes */}
    </Routes>
  );
}
```

### Using Authentication Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loginWithGoogle } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.firstName}!</div>;
  }

  return (
    <button onClick={loginWithGoogle}>
      Sign in with Google
    </button>
  );
}
```

## User Flow

### New User Registration via Google OAuth

1. User clicks "Sign in with Google" button
2. User is redirected to Google's authorization server
3. User grants permissions to the application
4. Google redirects back to `/api/auth/google/callback`
5. Backend creates new user account with Google profile data
6. Backend generates JWT tokens and redirects to frontend
7. Frontend processes tokens and updates authentication state
8. User is logged in and redirected to intended page

### Existing User Login via Google OAuth

1. Same flow as new user registration
2. Backend finds existing user by Google ID or email
3. If found by email, links Google ID to existing account
4. User is logged in with existing account data

### Account Linking

1. User logs in with email/password
2. User goes to account settings
3. User clicks "Link Google Account"
4. OAuth flow completes and links Google ID to current account
5. User can now sign in with either method

## Security Features

### Password Protection
- OAuth users get a secure random password generated automatically
- Users cannot unlink Google account if it's their only authentication method
- Password must be set before unlinking Google account

### Token Security
- JWT tokens include user ID and role
- Tokens have configurable expiration times
- Refresh tokens are separate from access tokens
- All tokens are signed with secure secrets

### Data Validation
- Email addresses are validated and normalized
- Google profile data is sanitized before storage
- Duplicate Google IDs are prevented
- Account linking prevents conflicts

## Error Handling

### Common Error Scenarios

1. **OAuth Denied**: User denies permissions
   - Redirects to login page with error message
   - User can try again

2. **Invalid Callback**: Missing or invalid callback parameters
   - Redirects to login page with error message
   - Logs error for debugging

3. **Account Conflicts**: Google account already linked to another user
   - Returns 409 Conflict status
   - Clear error message to user

4. **Database Errors**: User creation/update fails
   - Returns 500 Internal Server Error
   - Error logged for debugging
   - User sees generic error message

### Frontend Error Display

Errors are displayed using Material-UI Alert components:

```jsx
{error && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {decodeURIComponent(error)}
  </Alert>
)}
```

## Testing

### Running Tests

```bash
# Run all authentication tests
cd server
npm test -- --testPathPattern=auth

# Run OAuth-specific tests
npm test -- --testPathPattern=oauth-integration
```

### Test Coverage

- ✅ OAuth flow initiation
- ✅ New user creation via OAuth
- ✅ Existing user linking via OAuth
- ✅ Account linking/unlinking
- ✅ Error handling scenarios
- ✅ Security validations
- ✅ Token generation and validation

## Production Deployment

### Environment Variables

Ensure these are set in your production environment:

```env
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
CLIENT_URL=https://your-production-frontend-domain.com
JWT_SECRET=your-secure-production-jwt-secret
JWT_REFRESH_SECRET=your-secure-production-refresh-secret
```

### Google Cloud Console Configuration

1. Add production callback URL to authorized redirect URIs
2. Add production domain to authorized JavaScript origins
3. Verify OAuth consent screen is configured for production use

### Security Considerations

1. Use HTTPS in production for all OAuth flows
2. Set secure, random JWT secrets
3. Configure proper CORS settings
4. Monitor OAuth usage and errors
5. Implement rate limiting for OAuth endpoints

## Troubleshooting

### Common Issues

1. **"OAuth2Strategy requires a clientID option"**
   - Check that `GOOGLE_CLIENT_ID` is set in environment variables
   - Verify environment variables are loaded before Passport configuration

2. **"Redirect URI mismatch"**
   - Verify callback URL in Google Cloud Console matches your backend URL
   - Check for HTTP vs HTTPS mismatches

3. **"Access blocked: This app's request is invalid"**
   - Verify OAuth consent screen is properly configured
   - Check that all required scopes are requested

4. **Frontend not receiving tokens**
   - Check that `CLIENT_URL` environment variable is correct
   - Verify frontend callback route is properly configured
   - Check browser console for JavaScript errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will provide detailed error messages and OAuth flow information in the server logs.
# Auth Components

Components for the authentication feature.

## To Be Created

- `LoginForm.tsx` - Email/password login form
- `SignUpForm.tsx` - User registration form
- `ForgotPasswordForm.tsx` - Request password reset
- `ResetPasswordForm.tsx` - Set new password with token
- `OAuthButtons.tsx` - Social login buttons (Google, Microsoft)
- `AuthTabs.tsx` - Tab navigation between Login/SignUp
- `AuthCard.tsx` - Styled container for auth forms

## OAuth Configuration

To make social login work, you need to add the following **Authorized redirect URIs** in your Google/Microsoft Cloud Console:

- **Google:** `http://localhost:3000/auth/callback/google`
- **Microsoft:** `http://localhost:3000/auth/callback/microsoft`

If deploying to production, allow `https://your-domain.com/auth/callback/provider-id` as well.

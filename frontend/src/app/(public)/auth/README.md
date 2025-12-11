# Auth Feature

Authentication-related components and logic.

## Route: `/auth`

Tab-based interface with Login and Sign Up forms.
**Access**: Unauthenticated users only (redirect if logged in)

## Components To Build

- **LoginForm** - Email/password login with validation
- **SignUpForm** - Registration with email confirmation
- **ForgotPasswordForm** - Password reset request
- **ResetPasswordForm** - Password reset with token
- **OAuthButtons** - Google/Microsoft social login buttons
- **AuthTabs** - Tab switcher between Login and Sign Up

## Features

- Form validation with error messages
- OAuth provider integration (Google, Microsoft)
- Remember me functionality
- Password visibility toggle
- Loading states during API calls
- Redirect to dashboard on successful auth

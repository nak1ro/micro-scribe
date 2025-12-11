# Context Providers

React Context providers for global state management.

## Contains

- **AuthContext** - User authentication state, login/logout actions
- **ThemeContext** - Dark/light mode theme state
- **ToastContext** - Global toast notifications
- **ModalContext** - Global modal management

## Guidelines

1. Keep contexts focused on a single concern
2. Provide hooks for consuming context (e.g., `useAuth`)
3. Memoize context values to prevent unnecessary re-renders
4. Use reducers for complex state logic
5. Place provider at the appropriate level in the component tree

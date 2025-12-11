# Custom Hooks

Reusable React hooks for common patterns and shared logic.

## Contains

- **useAuth** - Authentication state and actions
- **useApi** - Generic API request handling with loading/error states
- **useLocalStorage** - Persist state to localStorage
- **useMediaQuery** - Responsive design breakpoint detection
- **useDebounce** - Debounced value updates
- **useClickOutside** - Detect clicks outside an element
- **useToast** - Toast notification management
- **usePagination** - Pagination state management

## Guidelines

- Hooks should be focused and composable
- Follow the `use` naming convention
- Include TypeScript type definitions
- Handle cleanup in useEffect properly

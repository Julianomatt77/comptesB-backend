JavaScript Best Practices

    Follow ESLint and Prettier configurations
    Use ES6+ features (arrow functions, destructuring, etc.)
    Prefer const over let, avoid var
    Use async/await for asynchronous operations
    Use template literals for string concatenation

Pages and Routing

    Use dynamic routes appropriately
    Implement nested routes when logical
    Use middleware for route guards
    Leverage route validation with definePageMeta
    Use route parameters for dynamic content

Components

    Create reusable components in the components directory
    Use TypeScript for props
    Use defineModel instead of a manual implementation of custom v-model
    Use script setup (with TS by default)
    Use props destructuring instead of withDefaults
    Implement proper component naming (PascalCase)
    Use slots for flexible component content
    Organize components in subdirectories by feature

Composables

    Place reusable logic in composables directory
    Follow the "use" prefix naming convention
    Keep composables focused on a single responsibility
    Properly type composables with TypeScript
    Use built-in composables when available

TypeScript

    Use TypeScript for better type safety
    Define interfaces and types for data structures
    Use generics when appropriate
    Leverage auto-imports for types
    Avoid using "any" type
    write erasableSyntaxOnly compliant code only (no enums, namespaces, and class parameter properties)

Performance

    Implement proper code-splitting
    Use lazy loading for components when appropriate
    Implement proper caching strategies
    Use server components for data-heavy operations

Testing

    Write unit tests for components and composables
    Implement end-to-end tests for critical user flows
    Test both positive and negative scenarios

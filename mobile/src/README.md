# Mobile App Source Structure

This directory contains the organized source code for the NutriAI mobile application.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── auth/           # Authentication-related components
│   ├── meals/          # Meal logging components
│   ├── tracking/       # Progress tracking components
│   └── profile/        # User profile components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── contexts/           # React context providers
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # App constants and configuration
├── config/             # Environment configuration
└── index.ts           # Central exports
```

## Import Aliases

TypeScript path mapping is configured for cleaner imports:

- `@/*` - src directory root
- `@/components/*` - components directory
- `@/screens/*` - screens directory
- `@/services/*` - services directory
- `@/hooks/*` - hooks directory
- `@/types/*` - types directory
- `@/utils/*` - utils directory
- `@/constants/*` - constants directory
- `@/config/*` - config directory
- `@/contexts/*` - contexts directory

## Development Guidelines

1. **Components**: Create reusable components in appropriate subdirectories
2. **Screens**: Each screen should be a single component with its own file
3. **Services**: API integration and business logic
4. **Hooks**: Custom React hooks for state management and side effects
5. **Types**: Comprehensive TypeScript definitions for all data structures
6. **Utils**: Pure functions for common operations
7. **Constants**: App-wide constants and enums

## Next Steps

This structure is ready for development. Key areas to implement next:

1. Authentication components and flows
2. Camera integration for meal logging
3. Supabase service integration
4. Core UI components
5. State management with React Context

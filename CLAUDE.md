# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

ALWAYS FOLLOW RULES.md AT ALL TIMES

## Project Overview

NutriAI is a React Native (Expo) mobile application for AI-powered nutrition tracking. The app enables users to log meals through photo capture, voice input, or barcode scanning, with AI-driven food recognition and macro tracking.

## Architecture

- **Mobile App**: React Native + Expo in `/mobile` directory
- **Backend**: Supabase (auth, database, storage)
- **AI Services**: OpenAI GPT-4 Vision (food recognition), Whisper (voice-to-text)
- **State Management**: React hooks and context (to be implemented)
- **Navigation**: React Navigation native-stack

## Development Commands

```bash
# Navigate to mobile app
cd mobile

# Start development server
npm start

# Platform-specific development
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web browser

# Task management (from root)
task-master next                                   # Get next task
task-master show <id>                              # View task details
task-master set-status --id=<id> --status=done    # Complete task
```

## Key Implementation Guidelines

### Task Management Integration
- Tasks are managed via Task Master AI (see existing CLAUDE.md for full commands)
- Use `task-master next` to find work items
- Update subtasks with implementation context: `task-master update-subtask --id=<id> --prompt="notes"`

### Code Standards (from RULES.md)
1. **Error Handling**: Always use try-catch blocks with structured error returns
2. **Documentation**: Comprehensive docstrings for all functions
3. **Security**: No hardcoded credentials, validate all inputs, use Supabase RLS
4. **Architecture**: Follow SOLID principles, KISS, and YAGNI

### AI Integration Patterns
```typescript
// Example food recognition flow
try {
  const imageBase64 = await captureAndEncode(photo);
  const analysis = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Analyze this meal and provide nutrition data" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
      ]
    }]
  });
  // Process and validate response
} catch (error) {
  // Structured error handling
}
```

### Supabase Integration
- Use `@supabase/supabase-js` client
- Implement Row Level Security (RLS) policies
- Store only anon key in client code
- Handle auth state changes properly

### Performance Requirements
- Log flow must complete in ≤5 seconds (95th percentile)
- Implement optimistic UI updates
- Cache recent meals for quick access
- Minimize bundle size with lazy loading

## Project Structure

```
mobile/
├── App.tsx                 # Entry point, auth provider setup
├── navigation/            
│   └── AppNavigator.tsx    # Main navigation stack
├── screens/               
│   ├── HomeScreen.tsx      # Daily tracking dashboard
│   ├── CameraScreen.tsx    # Photo capture interface
│   └── ProfileScreen.tsx   # User settings & history
├── services/              
│   ├── openai.ts          # AI integration service
│   ├── supabase.ts        # Database client & auth
│   └── nutrition.ts       # Nutrition calculations
├── components/            
│   ├── MacroRing.tsx      # Visual macro tracking
│   └── MealCard.tsx       # Meal display component
└── hooks/                 
    ├── useAuth.ts         # Authentication hook
    └── useNutrition.ts    # Nutrition data hook
```

## Current Implementation Status

- ✅ Basic project structure
- ✅ Navigation setup
- ✅ Dependencies installed
- ⏳ Supabase integration pending
- ⏳ AI services pending
- ⏳ Core screens pending

## Testing Approach

Currently no test framework is configured. When implementing tests:
1. Use Jest + React Native Testing Library
2. Focus on critical user flows (meal logging, macro calculations)
3. Mock external services (Supabase, OpenAI)
4. Test error states and edge cases

## Common Development Patterns

### Screen Implementation
```typescript
// Standard screen structure
export default function ScreenName() {
  // Hooks first
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Local state
  const [loading, setLoading] = useState(false);
  
  // Effects
  useEffect(() => {
    // Load data
  }, []);
  
  // Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      // Implementation
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  // Render
  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
    </SafeAreaView>
  );
}
```

### API Integration
- Always validate responses
- Implement retry logic for transient failures
- Show loading states during async operations
- Cache responses where appropriate

## Environment Setup

Required environment variables (create `.env` from `.env.example`):
- `OPENAI_API_KEY` - For GPT-4 Vision
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key
- Task Master AI keys (see Task Master section in existing CLAUDE.md)
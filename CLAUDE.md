# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

ALWAYS FOLLOW RULES.md AT ALL TIMES

# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** ❌

Run: `make fmt && make test && make lint`

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures.

### 🚨 CRITICAL: Hook Failures Are BLOCKING
**When hooks report ANY issues (exit code 2), you MUST:**
1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

This includes:
- Formatting issues (gofmt, black, prettier, etc.)
- Linting violations (golangci-lint, eslint, etc.)
- Forbidden patterns (time.Sleep, panic(), interface{})
- ALL other checks

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**
- When interrupted by a hook failure, maintain awareness of your original task
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Working Memory Management

### When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Go-Specific Rules

### FORBIDDEN - NEVER DO THESE:
- **NO interface{}** or **any{}** - use concrete types!
- **NO time.Sleep()** or busy waits - use channels for synchronization!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew)
- **NO** custom error struct hierarchies
- **NO** TODOs in final code

> **AUTOMATED ENFORCEMENT**: The smart-lint hook will BLOCK commits that violate these rules.  
> When you see `❌ FORBIDDEN PATTERN`, you MUST fix it immediately!

### Required Standards:
- **Delete** old code when replacing it
- **Meaningful names**: `userID` not `id`
- **Early returns** to reduce nesting
- **Concrete types** from constructors: `func NewServer() *Server`
- **Simple errors**: `return fmt.Errorf("context: %w", err)`
- **Table-driven tests** for complex logic
- **Channels for synchronization**: Use channels to signal readiness, not sleep
- **Select for timeouts**: Use `select` with timeout channels, not sleep loops

## Implementation Standards

### Our code is complete when:
- ? All linters pass with zero issues
- ? All tests pass  
- ? Feature works end-to-end
- ? Old code is deleted
- ? Godoc on all exported symbols

### Testing Strategy
- Complex business logic ? Write tests first
- Simple CRUD ? Write tests after
- Hot paths ? Add benchmarks
- Skip tests for main() and simple CLI parsing

### Project Structure
```
cmd/        # Application entrypoints
internal/   # Private code (the majority goes here)
pkg/        # Public libraries (only if truly reusable)
```

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:
- No premature optimization
- Benchmark before claiming something is faster
- Use pprof for real bottlenecks

### **Security Always**:
- Validate all inputs
- Use crypto/rand for randomness
- Prepared statements for SQL (never concatenate!)

## Communication Protocol

### Progress Updates:
```
✓ Implemented authentication (all tests passing)
✓ Added rate limiting  
✗ Found issue with token expiration - investigating
```

### Suggesting Improvements:
"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.

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
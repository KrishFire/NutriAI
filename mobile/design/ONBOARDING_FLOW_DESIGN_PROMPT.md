# Comprehensive Onboarding Flow Design Prompt for NutriAI

## Overview

Design a world-class onboarding experience for NutriAI that converts first-time users into engaged, active users. The onboarding should feel effortless, delightful, and personalized while gathering essential information for AI-powered nutrition tracking. Every screen should maintain the ultra-clean aesthetic inspired by Uber, Robinhood, and Apple's best practices.

## Design Principles for Onboarding

### Core Philosophy

- **Progressive Disclosure**: Don't overwhelm users upfront
- **Value-First**: Show benefits before asking for information
- **Personalization**: Make users feel the app is tailored for them
- **Frictionless**: Minimize taps and typing
- **Delightful**: Use subtle animations and encouraging copy
- **Trust Building**: Professional design that handles data respectfully

### Visual Consistency

- **Primary Color**: RGB(50, 13, 255) / #320DFF for CTAs and accents
- **Typography**: Inter font throughout
- **Spacing**: 4px grid system
- **Animations**: Smooth, purposeful, 60fps
- **Illustrations**: Modern, minimal, on-brand

## Complete Onboarding Flow Structure

### 0. App Launch Experience

#### Splash Screen (0-2 seconds)

```
Design Requirements:
- Background: Gradient using primary blue (#320DFF) to lighter shade
- Logo: Centered, animated entrance (scale + fade)
- App Name: "NutriAI" below logo, typography/heading/l
- Tagline: "Your AI Nutrition Companion" in typography/body/m
- Loading indicator: Subtle progress bar at bottom
- Smooth transition to next screen
```

### 1. Welcome & Value Proposition

#### Welcome Screen (First Launch Only)

```
Layout:
- Hero Illustration: 60% of screen height
  - Show diverse people enjoying meals
  - Include AI visualization elements
  - Bright, optimistic color palette

- Content:
  - Headline: "Welcome to NutriAI"
  - Subheadline: "Track nutrition effortlessly with AI"

- Actions:
  - Primary CTA: "Get Started" (full width, primary button)
  - Secondary: "I already have an account" (text button)

- Design Notes:
  - Status bar: Light content
  - Background: White (#FFFFFF)
  - Safe area padding: 24px horizontal
```

#### Value Proposition Carousel (3 Screens)

```
Screen 1: AI-Powered Recognition
- Illustration: Phone camera recognizing food
- Title: "Just Take a Photo"
- Description: "Our AI instantly identifies your meals and calculates nutrition"
- Progress dots: ●○○

Screen 2: Multiple Input Methods
- Illustration: Icons for camera, voice, barcode
- Title: "Log Your Way"
- Description: "Snap, speak, scan, or search - whatever works for you"
- Progress dots: ○●○

Screen 3: Personalized Insights
- Illustration: Progress charts and achievements
- Title: "Reach Your Goals"
- Description: "Get personalized insights and celebrate your progress"
- Progress dots: ○○●

Common Elements:
- Skip button: Top right (typography/body/m, text/secondary)
- Next button: Bottom right arrow
- Swipe gesture enabled
- Smooth page transitions
```

### 2. Authentication Screens

#### Create Account Screen

```
Header:
- Back button: Top left
- Progress indicator: 3 subtle dots showing step 1 of 3
- Title: "Create Your Account"
- Subtitle: "Start your nutrition journey"

Social Authentication Section:
- Apple Sign In button:
  - Black background, white Apple logo + text
  - Full width, height: 48px
  - "Continue with Apple"

- Google Sign In button:
  - White background, Google logo + text
  - Full width, height: 48px
  - 1px border (#E0E0E0)
  - "Continue with Google"

- Divider: "or" with horizontal lines

Email Authentication:
- Email input field:
  - Label: "Email"
  - Placeholder: "your@email.com"
  - Keyboard: Email type
  - Validation: Real-time

- Password input field:
  - Label: "Password"
  - Placeholder: "Create a password"
  - Show/hide toggle
  - Strength indicator below

- Password requirements:
  - Small text below field
  - "At least 8 characters"
  - Dynamic checkmarks as requirements met

Actions:
- Primary CTA: "Create Account"
- Legal text: "By continuing, you agree to our Terms and Privacy Policy"
- Links: Underlined, primary blue

States to Design:
- Empty state
- Typing state
- Validation error (red border, error message)
- Success state (green checkmark)
- Loading state (button shows spinner)
```

#### Sign In Screen

```
Header:
- Back button: Top left
- Title: "Welcome Back"
- Subtitle: "Sign in to continue"

Quick Sign In:
- Face ID/Touch ID option (if previously enabled)
- Icon + "Sign in with Face ID"

Social Authentication:
- Same as Create Account screen

Email Sign In:
- Email field (prefilled if returning)
- Password field with show/hide
- "Forgot Password?" link (right-aligned)

Actions:
- Primary CTA: "Sign In"
- Secondary: "Don't have an account? Sign Up"

Additional States:
- Remember me toggle
- Error state: "Incorrect email or password"
- Too many attempts: Lock out message
```

#### Forgot Password Flow

```
Screen 1: Email Entry
- Title: "Reset Password"
- Description: "Enter your email and we'll send reset instructions"
- Email input field
- CTA: "Send Reset Link"

Screen 2: Email Sent
- Success illustration
- Title: "Check Your Email"
- Description: "We sent instructions to [email]"
- CTA: "Open Email App"
- Secondary: "Resend Email" (disabled for 60s)

Screen 3: Create New Password
- Title: "Create New Password"
- Password field with requirements
- Confirm password field
- CTA: "Reset Password"
- Success → Auto navigate to sign in
```

### 3. Profile Setup (Post-Authentication)

#### Personal Information Screen

```
Header:
- Progress bar: 20% filled
- Skip button: Top right (but discouraged)
- Title: "Let's Get to Know You"
- Subtitle: "This helps us personalize your experience"

Form Fields:
- First Name (required)
  - Placeholder: "First name"

- Last Name (optional)
  - Placeholder: "Last name (optional)"

- Birthday (required)
  - Date picker modal
  - Helps calculate calorie needs

- Biological Sex (required)
  - Segmented control: Male / Female
  - Info icon explaining why needed

- Height (required)
  - Two inputs: Feet + Inches (or CM)
  - Toggle for metric/imperial

- Current Weight (required)
  - Number pad input
  - lbs/kg toggle

Design Elements:
- Smooth keyboard transitions
- Auto-advance on field completion
- Progress saves automatically
- Friendly error messages
```

#### Activity Level Screen

```
Header:
- Progress bar: 40% filled
- Title: "How Active Are You?"
- Subtitle: "This helps calculate your daily calorie needs"

Options (Radio List):
- Sedentary
  - "Little to no exercise"
  - Icon: Person sitting

- Lightly Active
  - "Exercise 1-3 days/week"
  - Icon: Person walking

- Moderately Active
  - "Exercise 3-5 days/week"
  - Icon: Person jogging

- Very Active
  - "Exercise 6-7 days/week"
  - Icon: Person running

- Extra Active
  - "Physical job or athlete"
  - Icon: Person with weights

CTA: "Continue"
Info: Small text about changing later
```

#### Goals Screen

```
Header:
- Progress bar: 60% filled
- Title: "What's Your Goal?"
- Subtitle: "We'll help you get there"

Goal Cards (Select One):
- Lose Weight
  - Icon: Downward trend
  - Description: "Create a calorie deficit"

- Maintain Weight
  - Icon: Balance scale
  - Description: "Stay at current weight"

- Gain Muscle
  - Icon: Flexed arm
  - Description: "Build lean mass"

Follow-up Questions (Dynamic):
If "Lose Weight":
- Target weight input
- Timeline selector (0.5-2 lbs/week)
- Estimated completion date

CTA: "Set My Goal"
```

#### Dietary Preferences Screen

```
Header:
- Progress bar: 80% filled
- Title: "Dietary Preferences"
- Subtitle: "We'll highlight compatible foods"

Multi-Select List:
- No Restrictions ✓
- Vegetarian 🥬
- Vegan 🌱
- Pescatarian 🐟
- Keto 🥑
- Paleo 🥩
- Gluten-Free 🌾
- Dairy-Free 🥛
- Low Carb
- Mediterranean

Allergies Section:
- "Any Allergies?" header
- Add button → Modal with searchable list
- Common: Nuts, Shellfish, Dairy, Eggs, Soy
- Added allergies show as chips

CTA: "Continue"
Note: "You can update these anytime"
```

#### Macro Targets Screen

```
Header:
- Progress bar: 90% filled
- Title: "Your Daily Targets"
- Subtitle: "Based on your goals"

Calorie Target:
- Large number display: "2,000"
- "calories per day"
- Adjust button (opens slider modal)

Macro Split:
- Visual pie chart
- Three sliders:
  - Carbs: 45% (225g)
  - Protein: 30% (150g)
  - Fat: 25% (56g)
- Auto-balance toggle
- Reset to recommended

Educational:
- "What are macros?" expandable section
- Simple explanation with icons

CTA: "Finalize My Plan"
```

### 4. Permissions & Setup

#### Notifications Permission

```
Custom UI (Before System Prompt):
- Illustration: Bell with sparkles
- Title: "Stay on Track"
- Benefits list:
  - ✓ Meal reminders at your preferred times
  - ✓ Celebrate streaks and achievements
  - ✓ Weekly progress summaries

- CTA: "Enable Notifications"
- Secondary: "Maybe Later"

System Permission:
- Standard iOS/Android prompt
- Handle acceptance/rejection gracefully
```

#### Camera & Photos Permission

```
When First Needed (Not in Onboarding):
- Custom explanation screen
- Show value before asking
- Handle rejection with alternatives
```

### 5. Onboarding Complete

#### Success Screen

```
Elements:
- Celebration animation (confetti)
- Title: "You're All Set!"
- Subtitle: "Let's log your first meal"
- Profile summary card:
  - Daily calorie target
  - Macro split visualization
  - First goal milestone

CTA: "Start Tracking"
Leads to: Home screen with tooltip tour
```

### 6. First-Use Tutorial

#### Interactive Tooltips (On Home Screen)

```
Step 1: Quick Log Button
- Spotlight effect on button
- Tooltip: "Tap here to log your meals"
- Next button

Step 2: Progress Rings
- Highlight macro rings
- Tooltip: "Track your daily progress here"
- Next button

Step 3: Streak Badge
- Point to streak area
- Tooltip: "Build healthy habits with streaks"
- Done button

Design:
- Dark overlay (80% opacity)
- White tooltips with arrow
- Smooth transitions between steps
- Skip option available
```

## Edge Cases & Error States

### Network Errors

```
Design Pattern:
- Inline error below form
- Red background banner
- Retry button
- Offline mode explanation
```

### Social Auth Failures

```
Apple Sign In Issues:
- "Apple Sign In unavailable"
- Fallback to email option
- Clear explanation

Google Sign In Issues:
- Similar pattern
- Alternative paths
```

### Validation Errors

```
Email Issues:
- "Email already exists" → Link to sign in
- "Invalid email format" → Example shown
- Real-time validation feedback

Password Issues:
- Strength requirements not met
- Passwords don't match
- Clear visual indicators
```

### Account Recovery

```
Existing Account Detection:
- "Looks like you have an account"
- Easy switch to sign in
- Preserve entered data
```

## Micro-interactions & Animations

### Button States

```
Default → Hover: Subtle scale (1.02)
Tap: Scale down (0.98) + darken
Loading: Spinner replaces text
Success: Checkmark animation
Disabled: 40% opacity
```

### Screen Transitions

```
Forward: Slide in from right (300ms)
Backward: Slide out to right (300ms)
Modal: Slide up from bottom (400ms)
All use ease-in-out curves
```

### Input Field Interactions

```
Focus: Border color change + label float
Typing: Real-time validation
Success: Green checkmark fade in
Error: Shake animation + red border
```

### Progress Indicators

```
Bar Fill: Animated width increase
Step Dots: Fade + scale on change
Circular Progress: Smooth rotation
```

## Copy Guidelines

### Voice & Tone

- **Friendly**: Like a knowledgeable friend
- **Encouraging**: Positive reinforcement
- **Clear**: No jargon or complex terms
- **Action-Oriented**: Clear next steps

### Examples

Instead of: "Enter your biological information"
Use: "Let's get to know you"

Instead of: "Authentication failed"
Use: "That didn't work. Let's try again"

Instead of: "Configure notification preferences"
Use: "When should we remind you to log meals?"

## Platform Considerations

### iOS Specific

- Apple Sign In: Black button style
- Face ID: Proper iconography
- Keyboard: Done button behavior
- Safe areas: Respect notch/dynamic island

### Android Specific

- Google Sign In: Material Design specs
- Back button: System navigation
- Keyboard: Different heights
- Status bar: Proper theming

## Accessibility Requirements

### Visual

- Color contrast: WCAG AA minimum
- Text sizing: Support dynamic type
- Icons: Always paired with labels
- Focus indicators: Visible

### Motor

- Touch targets: 44x44px minimum
- Tap spacing: Adequate padding
- Swipe alternatives: Buttons available
- Form navigation: Logical tab order

### Cognitive

- Clear progression: Always show progress
- Error recovery: Helpful messages
- Skip options: For experienced users
- Undo actions: Where applicable

## Success Metrics to Consider

The onboarding should optimize for:

1. **Completion Rate**: >80% finish onboarding
2. **Time to Value**: <3 minutes to first meal log
3. **Field Accuracy**: Minimal corrections needed
4. **Social Auth**: >60% use social sign in
5. **Permission Grants**: >70% enable notifications

## Technical Handoff Notes

### Assets Needed

- App icon (multiple sizes)
- Onboarding illustrations (SVG preferred)
- Lottie animations for celebrations
- Social auth button assets
- Progress indicator components

### State Management

- Save progress between sessions
- Handle app backgrounding
- Sync across devices
- Graceful offline handling

### Analytics Events

Track each screen view and action:

- Onboarding started
- Account created (method)
- Each screen completed
- Permissions granted/denied
- Onboarding completed
- First meal logged

## Final Implementation Notes

1. **A/B Testing Ready**: Design variants for:
   - Social auth button order
   - Number of value prop screens
   - Permission request timing
   - Progress indicator styles

2. **Personalization Hooks**: Design systems for:
   - Gender-neutral options
   - Cultural dietary preferences
   - Accessibility preferences
   - Language selection

3. **Future Enhancements**: Consider:
   - Import from other apps
   - Quick start templates
   - Video tutorials option
   - Coach selection (premium)

The onboarding experience sets the tone for the entire app relationship. Every interaction should feel purposeful, every screen should build trust, and the overall flow should leave users excited to start their nutrition journey with NutriAI.

Remember: Users don't care about creating an account—they care about achieving their health goals. The onboarding should feel like the first step toward those goals, not a barrier to using the app.

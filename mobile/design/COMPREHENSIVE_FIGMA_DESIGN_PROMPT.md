# Comprehensive Figma Design Prompt for NutriAI Mobile App

## Project Overview

You are tasked with designing a complete mobile application UI/UX in Figma for NutriAI, an AI-powered nutrition tracking app. This design must be production-ready, following industry best practices, and optimized for both iOS and Android platforms. The design should rival top-tier apps like Uber, Robinhood, MyFitnessPal, and Apple Health in terms of visual polish and user experience.

## Core Design Philosophy

### Aesthetic Direction

- **Primary Inspiration**: Ultra-clean minimalist design inspired by Uber and Robinhood
- **Secondary References**: Apple Health (data visualization), MyFitnessPal (nutrition tracking), Duolingo (gamification)
- **Key Principles**:
  - Minimize visual clutter
  - Focus on data visualization
  - Generous white space
  - Strong visual hierarchy
  - Consistent interaction patterns
  - Delightful micro-interactions

### Brand Identity

- **Primary Color**: RGB(50, 13, 255) / #320DFF - A vibrant blue that serves as the brand's hero color
- **Typography**: Inter font family (or SF Pro as alternative) - clean, modern, highly legible
- **Voice & Tone**: Encouraging, supportive, scientifically-informed but accessible

## Technical Requirements

### Platform Specifications

- **Primary Target**: iOS (iPhone 14 Pro as base frame)
- **Secondary Target**: Android (Pixel 7 Pro as base frame)
- **Minimum iOS Version**: iOS 15+
- **Minimum Android Version**: Android 12+
- **Orientation**: Portrait only (for MVP)
- **Accessibility**: WCAG AA compliance mandatory

### Design System Requirements

- **Grid System**: 4px baseline grid
- **Touch Targets**: Minimum 44x44px (Apple HIG)
- **Safe Areas**: Respect all platform safe areas
- **Dark Mode**: Every screen and component must have dark variants
- **Responsive**: Components must work across different screen sizes

## Comprehensive Feature Set

### 1. Authentication & Onboarding

#### Splash Screen

- App logo animation
- Loading progress indicator
- Seamless transition to next screen

#### Welcome Flow (First-Time Users)

1. **Welcome Screen**
   - Hero illustration showcasing app benefits
   - "Get Started" and "I have an account" buttons
2. **Key Benefits Screen** (3-slide carousel)
   - AI-powered food recognition
   - Effortless tracking methods
   - Personalized insights
3. **Account Creation**
   - Email/password or social login (Apple, Google)
   - Progressive form with inline validation
   - Password strength indicator
4. **Personal Information**
   - Name, age, gender, height, weight
   - Activity level selector (sedentary to very active)
   - These inform initial calorie calculations
5. **Goals Setting**
   - Primary goal (lose weight, maintain, gain muscle)
   - Target weight (optional)
   - Timeline preference
6. **Dietary Preferences & Restrictions**
   - Multi-select dietary types (Vegan, Keto, Paleo, etc.)
   - Allergy inputs with autocomplete
   - Food dislikes/avoidances
   - These create filter tags throughout the app
7. **Macro Targets**
   - Smart defaults based on goals
   - Manual adjustment sliders
   - Visual preview of macro split
8. **Notification Preferences**
   - Meal reminders
   - Streak notifications
   - Weekly summaries
   - Permission request with benefits explanation
9. **Quick Tutorial**
   - Interactive walkthrough of logging methods
   - Swipeable cards showing key features
   - "Skip" option for experienced users

#### Login Screen (Returning Users)

- Email/password fields with show/hide toggle
- Biometric login option (Face ID/Touch ID)
- "Forgot Password" flow
- Social login options
- Remember me checkbox

### 2. Core Navigation Structure

#### Bottom Tab Bar

- **Home** (house icon) - Daily dashboard
- **Log** (plus icon) - Quick access to logging
- **History** (calendar icon) - Past meals and trends
- **Insights** (chart icon) - Analytics and progress
- **Profile** (person icon) - Settings and account

### 3. Home Screen (Daily Dashboard)

#### Header Section

- Greeting with user's name
- Current date
- Streak badge (fire icon with number)
- Notification bell (with badge for unread)

#### Daily Progress Hero Card

- Large circular progress rings showing:
  - Calories (primary, uses brand blue)
  - Carbs (amber)
  - Protein (blue)
  - Fat (green)
- Percentage and absolute values
- Animated on data update
- "Quick Log" button prominently placed

#### Today's Meals Section

- Chronological list of logged meals
- Each meal card shows:
  - Meal type (Breakfast, Lunch, Dinner, Snack)
  - Time logged
  - Photo thumbnail (if available)
  - Calorie count
  - Quick macro breakdown bar
  - Tap for details, swipe for options

#### Quick Actions Bar

Instead of hidden FAB, prominent action buttons:

- **Camera** - "Snap a Photo"
- **Voice** - "Speak to Log"
- **Barcode** - "Scan Product"
- **Search** - "Search Foods"

#### Motivational Elements

- Daily tip or insight
- Progress milestone notifications
- Water intake tracker (8 glasses)

### 4. Logging Flows

#### Photo Capture Flow

1. **Camera Screen**
   - Full-screen camera view
   - Flash, flip camera, gallery access
   - Grid overlay option
   - Recent photos strip at bottom
2. **Processing Screen**
   - Show captured image
   - Animated AI analysis indicator
   - "Analyzing your meal..." message
3. **Results Screen**
   - Identified foods list with confidence scores
   - Portion size adjustment (visual + numeric)
   - Add missing items button
   - Meal type selector
   - Save or retake options

#### Voice Logging Flow

1. **Voice Input Screen**
   - Large microphone button
   - Real-time audio waveform
   - Transcription appears live
   - Examples: "I had a grande latte and a blueberry muffin"
2. **Confirmation Screen**
   - Parsed items from transcription
   - Edit quantities or items
   - Add to meal functionality

#### Barcode Scanner Flow

1. **Scanner Screen**
   - Camera view with guide overlay
   - Manual barcode entry option
   - Recent scans section
2. **Product Details**
   - Product image and name
   - Full nutrition label
   - Serving size selector
   - Add to meal button

#### Manual Search Flow

1. **Search Screen**
   - Search bar with recent searches
   - Categories (Branded, Generic, Recipes, My Foods)
   - Filters (dietary preferences highlighted)
2. **Results List**
   - Food items with calories prominent
   - Branded foods show logos
   - Quick add (+) buttons
   - Tap for nutrition details
3. **Food Details**
   - Complete macro and micro nutrients
   - Serving size customization
   - "Add to Favorites" option
   - Similar foods suggestion

### 5. Meal Management

#### Meal Details Screen

- Hero image of meal
- Individual food items list
- Each item shows:
  - Name and brand
  - Quantity (editable inline)
  - Calories and key macros
  - Remove button
- Total nutrition summary
- "Add More Foods" button
- Edit meal time/type
- AI Correction feature (prominent button)

#### Meal Correction Modal

- "Help AI improve" messaging
- Current analysis display
- Text input for corrections
- Suggested corrections chips
- Before/after preview

### 6. History & Tracking

#### History Screen

- Calendar view / List view toggle
- Calendar shows:
  - Color coding for goal achievement
  - Streak maintenance indicators
  - Tap date for details
- List view shows:
  - Daily summaries with photos
  - Calorie and macro totals
  - Goal achievement badges

#### Daily Summary Screen

- Date navigation (swipe or arrows)
- Comprehensive nutrition breakdown
- Meal timeline with photos
- Graphs showing macro distribution
- Notes section for the day
- Share functionality

### 7. Insights & Analytics

#### Insights Dashboard

- Weekly/Monthly/Yearly toggles
- Key metrics cards:
  - Average daily calories
  - Macro consistency score
  - Streak statistics
  - Weight trend (if tracking)
- Interactive charts:
  - Calorie trend line graph
  - Macro distribution pie chart
  - Meal timing heat map
  - Top foods frequency

#### Progress Tracking

- Before/after photo comparison
- Measurement tracking (weight, body measurements)
- Goal progress visualization
- Milestone achievements
- Export data functionality

### 8. Gamification & Engagement

#### Achievements Screen

- Trophy room layout
- Categories:
  - Streaks (7, 30, 100 days)
  - Logging (first meal, 1000 meals)
  - Accuracy (complete logging days)
  - Exploration (trying new foods)
  - Healthy habits (water, vegetables)
- Progress bars for locked achievements
- Share achievement cards

#### Streak System

- Daily streak counter
- Streak freeze tokens (earn or purchase)
- Milestone celebrations (7, 30, 50, 100 days)
- Recovery encouragement if broken
- Calendar heat map of activity

#### Challenges

- Weekly challenges (e.g., "Log 5 vegetables")
- Community challenges (optional)
- Personal best tracking
- Reward system (badges, themes)

### 9. User Profile & Settings

#### Profile Overview

- Avatar and name
- Stats summary (member since, total meals, current streak)
- Achievement showcase (top 3 badges)
- Quick settings access

#### Settings Categories

**Account Settings**

- Edit profile information
- Email and password
- Social account connections
- Privacy settings
- Data export/deletion

**Nutrition Settings**

- Daily calorie goal adjustment
- Macro targets (percentage or grams)
- Dietary preferences
- Allergies and restrictions
- Meal reminder times
- Fasting window settings

**App Preferences**

- Appearance (light/dark/auto)
- Notifications granular control
- Default meal names
- Quick add foods
- Home screen customization
- Language selection

**Tracking Preferences**

- Default serving sizes
- Frequently used foods
- Custom recipes management
- Barcode scan history
- Voice command shortcuts

**Premium Features** (if applicable)

- Subscription management
- Premium features list
- Upgrade prompts (non-intrusive)

**Health Integrations**

- Apple Health sync
- Google Fit sync
- Fitness tracker connections
- Export to other apps

**Support & About**

- Help center
- Contact support
- FAQs
- Terms and Privacy
- App version and updates
- Rate the app
- Social media links

### 10. Additional Crucial Screens

#### Empty States

- Design engaging empty states for:
  - No meals logged today
  - No history yet
  - No achievements earned
  - Search no results
  - Network offline

#### Error States

- Network connection errors
- AI processing failures
- Camera permissions denied
- Invalid inputs
- Server errors
- All with clear recovery actions

#### Loading States

- Skeleton screens for all lists
- Progress indicators for uploads
- Smooth transitions between states

#### Success States

- Meal logged successfully
- Goal achieved for the day
- New achievement unlocked
- Settings saved
- Profile updated

#### Permission Requests

- Camera access (with benefits)
- Photo library access
- Microphone access
- Notifications
- Health app integration
- Each with custom UI explaining value

#### Miscellaneous Screens

- Terms of Service
- Privacy Policy
- App walkthrough/tour
- What's New (after updates)
- Referral program
- Feedback submission
- Recipe builder
- Meal planner (future feature)
- Shopping list generator
- Restaurant menu assistant

## Design System Specifications

### Color System

#### Brand Colors

- Primary: RGB(50, 13, 255) / #320DFF
- Primary Pressed: RGB(40, 10, 204) / #280ACC
- Primary Disabled: #320DFF @ 40% opacity

#### Semantic Colors

- Success: #66BB6A
- Error: #F44336
- Warning: #FFA726
- Info: #42A5F5

#### Macro Visualization

- Calories: #320DFF (Primary)
- Carbohydrates: #FFA726
- Protein: #42A5F5
- Fat: #66BB6A

#### Neutral Palette (Light Mode)

- Background Primary: #FFFFFF
- Background Secondary: #F5F5F5
- Surface: #FFFFFF
- Surface Elevated: #FFFFFF + shadow
- Border Default: #E0E0E0
- Border Subtle: #F0F0F0
- Text Primary: #212121
- Text Secondary: #757575
- Text Tertiary: #9E9E9E

#### Neutral Palette (Dark Mode)

- Background Primary: #121212
- Background Secondary: #1E1E1E
- Surface: #1E1E1E
- Surface Elevated: #2C2C2C
- Border Default: #3A3A3A
- Border Subtle: #2A2A2A
- Text Primary: #FFFFFF
- Text Secondary: #B3B3B3
- Text Tertiary: #808080

### Typography Scale

Using Inter font family:

- Heading XL: 32px/40px, Bold
- Heading L: 24px/32px, Semibold
- Heading M: 20px/28px, Semibold
- Body L: 18px/28px, Regular
- Body M: 16px/24px, Regular
- Body S: 14px/20px, Regular
- Caption: 12px/16px, Regular
- Button: 16px/24px, Medium
- Label: 14px/20px, Medium

### Component Library

Build these components with all states and variants:

1. **Buttons**: Primary, Secondary, Text, Icon
2. **Inputs**: Text field, Search bar, Text area
3. **Selection**: Radio, Checkbox, Toggle, Segmented control
4. **Navigation**: Tab bar, Navigation bar, Back button
5. **Cards**: Basic, Meal card, Achievement card, Stat card
6. **Lists**: Basic item, Selectable item, Swipeable item
7. **Overlays**: Modal, Bottom sheet, Toast, Alert
8. **Progress**: Linear bar, Circular ring, Skeleton loader
9. **Data Viz**: Bar chart, Line graph, Pie chart
10. **Special**: FAB, Badge, Chip, Avatar

### Interaction Patterns

#### Gestures

- Tap: Primary action
- Long press: Secondary options
- Swipe left/right: Reveal actions
- Pull to refresh: Update data
- Pinch: Zoom images

#### Animations

- Micro-interactions: 200ms
- Page transitions: 300ms
- Data loading: 400ms
- Use spring physics for natural feel
- 60fps for all animations

#### Feedback

- Haptic feedback for important actions
- Sound effects (optional) for achievements
- Visual feedback for all interactions
- Progress indicators for async operations

## Accessibility Requirements

1. **Visual**
   - WCAG AA color contrast
   - Scalable text support
   - High contrast mode support
   - Reduced motion options

2. **Motor**
   - 44x44px minimum touch targets
   - Gesture alternatives
   - Adjustable touch sensitivity

3. **Cognitive**
   - Clear navigation patterns
   - Consistent layouts
   - Plain language
   - Error prevention

## Deliverables

### Figma File Structure

1. **📐 Design System**
   - Color styles (all tokens)
   - Typography styles
   - Effect styles (shadows)
   - Grid styles
   - Component library

2. **📱 Screens - Light Mode**
   - Complete app flows
   - All states included
   - Properly named and organized

3. **🌙 Screens - Dark Mode**
   - Complete dark variants
   - Same organization as light

4. **🎭 Prototypes**
   - Key user flows
   - Micro-interactions
   - Screen transitions

5. **📏 Specifications**
   - Spacing documentation
   - Animation timings
   - Gesture documentation

6. **🎨 Assets**
   - App icon variations
   - Custom illustrations
   - Empty state graphics
   - Achievement badges

### Design Requirements

1. **Organization**
   - Use clear naming conventions
   - Group related screens
   - Use Figma's section feature
   - Maintain component instances

2. **Documentation**
   - Annotate complex interactions
   - Document edge cases
   - Specify animation details
   - Note platform differences

3. **Handoff Ready**
   - All text as text layers
   - Proper image exports setup
   - Development mode enabled
   - Measurements visible

## Critical Considerations

1. **Performance Impact**
   - Avoid heavy shadows on lists
   - Optimize image sizes
   - Consider lazy loading patterns
   - Design for slow connections

2. **Real Data**
   - Use realistic food names
   - Actual nutrition values
   - Real photo examples
   - Diverse food types

3. **Edge Cases**
   - Very long food names
   - Multiple meals at once
   - Offline functionality
   - Sync conflicts

4. **Future Features**
   - Social sharing
   - Meal planning
   - Recipe import
   - Restaurant integration
   - Wearable sync

5. **Localization Ready**
   - Allow for text expansion
   - RTL layout consideration
   - Cultural food differences
   - Metric/Imperial units

## Success Criteria

The design will be considered complete when:

1. All screens are designed in both light and dark modes
2. Complete design system is documented
3. All components have necessary states
4. Prototypes demonstrate key flows
5. Accessibility standards are met
6. Design is development-ready
7. Edge cases are considered
8. Future scalability is built-in

## Final Notes

This is a nutrition tracking app that should feel:

- **Trustworthy**: Accurate, scientific, reliable
- **Effortless**: Minimal friction in logging
- **Motivating**: Celebrates progress, encourages consistency
- **Personal**: Adapts to user preferences
- **Modern**: Cutting-edge AI, beautiful interface

The design should make users WANT to track their nutrition, not feel like it's a chore. Every interaction should be delightful, every screen should be purposeful, and the overall experience should rival the best apps in the App Store.

Remember: This isn't just a utility app—it's a daily companion in someone's health journey. Design with empathy, precision, and joy.

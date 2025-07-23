# NutriAI Figma Design Guide

## Phase 1: Design System Foundation

### 1. Create Design System Page

In your Figma file:
1. Create a new page (right-click in pages panel → "Add page")
2. Name it "🎨 Design System"
3. Set canvas background to #F5F5F5 (light gray)

### 2. Color System Setup

#### Create Color Styles

**Primary & Brand Colors:**
- `color/interactive/default`: RGB(50, 13, 255) → #320DFF
- `color/interactive/pressed`: RGB(40, 10, 204) → #280ACC
- `color/interactive/disabled`: RGB(50, 13, 255) @ 40% opacity

**Semantic Colors:**
- `color/success`: #66BB6A (Green)
- `color/error`: #F44336 (Red) 
- `color/warning`: #FFA726 (Amber)

**Neutral Palette (Light Mode):**
- `color/background/primary`: #FFFFFF
- `color/background/secondary`: #F5F5F5
- `color/surface/default`: #FFFFFF
- `color/surface/elevated`: #FFFFFF (with shadow)
- `color/border/default`: #E0E0E0
- `color/border/subtle`: #F0F0F0
- `color/text/primary`: #212121
- `color/text/secondary`: #757575
- `color/text/tertiary`: #9E9E9E
- `color/text/inverse`: #FFFFFF

**Neutral Palette (Dark Mode):**
- `color/background/primary`: #121212
- `color/background/secondary`: #1E1E1E
- `color/surface/default`: #1E1E1E
- `color/surface/elevated`: #2C2C2C
- `color/border/default`: #3A3A3A
- `color/border/subtle`: #2A2A2A
- `color/text/primary`: #FFFFFF
- `color/text/secondary`: #B3B3B3
- `color/text/tertiary`: #808080
- `color/text/inverse`: #121212

**Data Visualization Colors:**
- `color/data/calories`: RGB(50, 13, 255) → #320DFF
- `color/data/carbs`: #FFA726 (Amber)
- `color/data/protein`: #42A5F5 (Blue)
- `color/data/fat`: #66BB6A (Green)

### 3. Typography System

Create text styles using Inter font:

**Headings:**
- `typography/heading/xl`: Inter Bold 32px, Line height 40px
- `typography/heading/l`: Inter Semibold 24px, Line height 32px
- `typography/heading/m`: Inter Semibold 20px, Line height 28px

**Body:**
- `typography/body/l`: Inter Regular 18px, Line height 28px
- `typography/body/m`: Inter Regular 16px, Line height 24px
- `typography/body/s`: Inter Regular 14px, Line height 20px

**Supporting:**
- `typography/caption`: Inter Regular 12px, Line height 16px
- `typography/button`: Inter Medium 16px, Line height 24px
- `typography/label`: Inter Medium 14px, Line height 20px

### 4. Spacing & Layout System

Create a frame showing the spacing scale:

```
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-5: 24px
space-6: 32px
space-7: 48px
space-8: 64px
```

### 5. Core Components

#### Button Component

Create a button with these specifications:
- Height: 48px (Apple HIG minimum touch target)
- Horizontal padding: 24px
- Border radius: 12px
- Use Auto Layout

**Variants:**
1. Primary (Blue background, white text)
2. Secondary (White background, blue text, blue border)
3. Text (No background, blue text)

**States for each variant:**
- Default
- Pressed (darker shade)
- Disabled (40% opacity)

#### Input Field Component

- Height: 48px
- Padding: 16px horizontal
- Border: 1px, color/border/default
- Border radius: 12px
- Background: color/surface/default

**States:**
- Default
- Focused (blue border)
- Error (red border)
- Disabled (reduced opacity)

#### Card Component

- Padding: 16px
- Border radius: 16px
- Background: color/surface/default
- Shadow: Light mode (0px 2px 4px rgba(0,0,0,0.08))
- Border: Dark mode only (1px, color/border/subtle)

### 6. Data Visualization Components

#### Progress Ring
- Size: 120x120px
- Stroke width: 12px
- Background stroke: color/border/subtle
- Progress stroke: Based on data type
- Center text: typography/heading/l

#### Mini Progress Bar
- Height: 8px
- Width: 100%
- Border radius: 4px
- Background: color/border/subtle
- Progress fill: Based on data type

### 7. Documentation Frame

Create a frame explaining usage:
- Color usage guidelines
- Spacing examples
- Component do's and don'ts
- Accessibility notes

## How to Create Color Styles in Figma:

1. Draw a rectangle
2. Fill it with the color
3. Click the fill color
4. Click the style icon (four dots)
5. Click "+" to create new style
6. Name it according to the system above
7. Press "Create Style"

## How to Create Text Styles:

1. Create a text layer
2. Set the font properties
3. In the text panel, click the style icon
4. Click "+" to create new style
5. Name it according to the system above
6. Press "Create Style"

## Next Steps

Once you've created all these elements:
1. Take a screenshot of your Design System page
2. I'll review it and provide feedback
3. We'll move on to Phase 2: App Structure & Navigation

Remember to:
- Use consistent naming conventions
- Apply Auto Layout to all components
- Test components in both light and dark modes
- Ensure all touch targets are at least 44x44px
# NutriAI Component Specifications

## Button Component Specs

### Primary Button

```
Container:
- Height: 48px
- Padding: 0px 24px
- Border Radius: 12px
- Background: color/interactive/default (#320DFF)

Text:
- Style: typography/button (Inter Medium 16px)
- Color: #FFFFFF
- Alignment: Center

States:
- Default: Background #320DFF
- Pressed: Background #280ACC
- Disabled: Background #320DFF @ 40% opacity
```

### Secondary Button

```
Container:
- Height: 48px
- Padding: 0px 24px
- Border Radius: 12px
- Border: 2px solid color/interactive/default
- Background: transparent

Text:
- Style: typography/button (Inter Medium 16px)
- Color: color/interactive/default
- Alignment: Center

States:
- Default: Border #320DFF
- Pressed: Background #320DFF @ 10%, Border #280ACC
- Disabled: Border #320DFF @ 40%, Text @ 40%
```

## Input Field Specs

```
Container:
- Height: 48px
- Padding: 0px 16px
- Border Radius: 12px
- Border: 1px solid color/border/default
- Background: color/surface/default

Placeholder Text:
- Style: typography/body/m (Inter Regular 16px)
- Color: color/text/tertiary

Input Text:
- Style: typography/body/m (Inter Regular 16px)
- Color: color/text/primary

States:
- Default: Border #E0E0E0
- Focused: Border #320DFF (2px)
- Error: Border #F44336 (2px)
- Disabled: Background #F5F5F5, Text @ 50%
```

## Card Component Specs

```
Container:
- Padding: 16px (all sides)
- Border Radius: 16px
- Background: color/surface/default

Light Mode:
- Shadow: 0px 2px 4px rgba(0,0,0,0.08)
- Border: none

Dark Mode:
- Shadow: none
- Border: 1px solid color/border/subtle
```

## Progress Ring Specs

```
Container:
- Size: 120x120px
- Background: transparent

Ring:
- Outer Radius: 60px
- Inner Radius: 48px (stroke width 12px)
- Start Angle: -90° (top)
- Direction: Clockwise

Background Ring:
- Color: color/border/subtle
- Opacity: 100%

Progress Ring:
- Color: Based on data type
- End Cap: Round

Center Text:
- Style: typography/heading/l
- Color: color/text/primary
- Alignment: Center
```

## Tab Bar Specs

```
Container:
- Height: 83px (49px bar + 34px safe area)
- Background: color/surface/default
- Top Border: 1px solid color/border/subtle

Tab Item:
- Width: Flexible (equal distribution)
- Height: 49px
- Padding: 8px top, 4px bottom

Icon:
- Size: 24x24px
- Color Default: color/text/secondary
- Color Active: color/interactive/default

Label:
- Style: typography/caption (Inter Regular 12px)
- Color Default: color/text/secondary
- Color Active: color/interactive/default
- Margin Top: 4px
```

## Floating Action Button (FAB) Specs

```
Container:
- Size: 56x56px
- Border Radius: 28px (circular)
- Background: color/interactive/default
- Shadow: 0px 4px 12px rgba(50,13,255,0.3)
- Position: Bottom right, 16px margins

Icon:
- Size: 24x24px
- Color: #FFFFFF
- Style: SF Symbols or custom

Expanded State:
- Width: Auto (based on content)
- Height: Auto
- Padding: 16px
- Border Radius: 28px
- Background: color/surface/default with blur
```

## List Item Specs

```
Container:
- Height: 64px (minimum)
- Padding: 16px horizontal, 12px vertical
- Background: transparent

Leading Icon (optional):
- Size: 24x24px
- Margin Right: 16px

Title:
- Style: typography/body/m
- Color: color/text/primary

Subtitle (optional):
- Style: typography/caption
- Color: color/text/secondary
- Margin Top: 2px

Trailing Element:
- Chevron: 16x16px, color/text/tertiary
- Value: typography/body/m, color/text/secondary

States:
- Default: Background transparent
- Pressed: Background color/interactive/default @ 8%
- Selected: Background color/interactive/default @ 12%
```

## Modal/Bottom Sheet Specs

```
Container:
- Border Radius: 24px top corners only
- Background: color/surface/default
- Padding: 24px

Handle:
- Width: 36px
- Height: 4px
- Border Radius: 2px
- Color: color/border/default
- Position: Center top, 8px from edge

Content Area:
- Padding: 24px
- Max Height: 90% of screen height
- Scrollable if needed
```

## Data Visualization Bar Specs

```
Container:
- Height: 8px
- Border Radius: 4px
- Background: color/border/subtle

Progress Fill:
- Height: 8px
- Border Radius: 4px
- Color: Based on macro type
- Animation: Ease-out 0.3s

Label (optional):
- Style: typography/caption
- Position: Above bar, 4px margin
- Color: color/text/secondary
```

## Spacing Guidelines

Use these consistently throughout:

- Component spacing: 16px
- Section spacing: 24px
- Screen edge padding: 16px
- Inline element spacing: 8px
- Micro spacing: 4px

## Animation Timings

- Micro interactions: 200ms
- Page transitions: 300ms
- Loading animations: 400ms
- All using ease-in-out curve

## Touch Targets

Following Apple HIG:

- Minimum: 44x44px
- Recommended: 48x48px
- Spacing between targets: 8px minimum

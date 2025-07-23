# Berry Mascot Assets

This directory should contain PNG images for the Berry mascot character in different variants.

## Required Berry Variants:

1. **berry-happy.png** - Default happy expression
2. **berry-excited.png** - Celebration/success state  
3. **berry-thinking.png** - Processing/loading state
4. **berry-sad.png** - Error/empty state
5. **berry-waving.png** - Welcome/greeting state
6. **berry-sleeping.png** - Inactive/rest state
7. **berry-eating.png** - Food logging state
8. **berry-trophy.png** - Achievement/milestone state

## Image Specifications:

- Format: PNG with transparent background
- Size: 200x200px (2x resolution)
- Also provide @2x (400x400px) and @3x (600x600px) versions for high DPI screens
- Naming convention: `berry-{variant}.png`, `berry-{variant}@2x.png`, `berry-{variant}@3x.png`

## Usage:

```tsx
import Berry from '../components/ui/Berry';

// In your component
<Berry variant="happy" />
<Berry variant="excited" />
```

## Placeholder:

Until actual Berry assets are provided, the Berry component will show colored placeholder circles.
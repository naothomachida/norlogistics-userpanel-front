# Component System Documentation

## Overview

This document outlines the comprehensive component system created for the Nor Logistics application, featuring standardized, reusable components inspired by Magic UI principles.

## Architecture

### 🏗️ Component Structure

```
src/components/
├── ui/                     # Base UI components
├── business/              # Business logic components
├── layout/               # Layout components
└── index.ts             # Main export file
```

### 🎨 Design System

The application now uses a consistent design system with:

- **Design Tokens**: Centralized colors, spacing, typography, and other design variables
- **Utility Functions**: Helper functions for styling, formatting, and state management
- **Text Constants**: Standardized text content across the application
- **Role-based Components**: Components that adapt based on user roles

## Components

### Base UI Components (`src/components/ui/`)

#### 🔘 Button
- Multiple variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`, `warning`
- Sizes: `default`, `sm`, `lg`, `icon`
- Built with class-variance-authority for consistent styling

#### 🃏 Card
- Structured card components: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Variants: `default`, `outlined`, `elevated`, `ghost`
- Configurable padding levels

#### 🏷️ Badge
- Role-specific variants: `gestor`, `solicitante`, `transportador`, `motorista`
- Status variants: `pending`, `approved`, `rejected`, `success`, `warning`, `info`
- Multiple sizes available

#### 👤 Avatar
- Auto-generating user avatars with initials
- Fallback system for missing profile images
- Size variants: `sm`, `default`, `lg`, `xl`

#### 📊 StatCard
- Specialized component for displaying statistics
- Icon support with color variants
- Trend indicators and descriptions

#### 🎯 ActionCard
- Quick action cards for dashboard
- Hover states and accessibility features
- Customizable icons and colors

### Business Components (`src/components/business/`)

#### 🧭 Navigation
- Role-based menu filtering
- Responsive design (horizontal/vertical)
- Active state management

#### 👤 UserDropdown
- User profile display
- Role badge integration
- Logout functionality

#### 🏢 Logo
- Configurable brand logo component
- Size variants and text options

#### 🏷️ RoleBadge
- Automatic role-to-variant mapping
- Consistent role color scheme

#### 📋 SolicitacaoCard
- Complex business card for requests
- Approval/rejection actions
- Rich data display with icons

### Layout Components (`src/components/layout/`)

#### 🏠 Header
- Unified navigation bar
- Mobile-responsive design
- User profile integration

#### 📄 Layout
- Page wrapper with consistent structure
- Optional title and description
- Flexible content areas

## 🎯 Key Features

### 1. **Standardization**
- All components follow consistent design patterns
- Unified color scheme and typography
- Standardized spacing and interactions

### 2. **Type Safety**
- Full TypeScript support
- Proper type definitions for all props
- IntelliSense support for better DX

### 3. **Accessibility**
- ARIA labels and proper semantic HTML
- Keyboard navigation support
- Focus management

### 4. **Responsiveness**
- Mobile-first design approach
- Flexible grid systems
- Responsive breakpoints

### 5. **Theming**
- CSS custom properties for theming
- Dark mode support structure
- Easy color customization

## 📝 Text Standardization

### APP_TEXT Constants
All text content is centralized in `src/lib/text-constants.ts`:

```typescript
APP_TEXT.ACTIONS.SAVE
APP_TEXT.DASHBOARD.TITLE
APP_TEXT.MESSAGES.SUCCESS.CREATED
APP_TEXT.STATUS.PENDING
```

### Formatting Utilities
- Currency formatting: `FORMAT_TEXT.currency()`
- Date formatting: `FORMAT_TEXT.date()`
- DateTime formatting: `FORMAT_TEXT.dateTime()`

## 🛠️ Usage Examples

### Basic Button
```tsx
import { Button } from '@/components/ui'

<Button variant="success" size="lg">
  Aprovar Solicitação
</Button>
```

### Dashboard Stats
```tsx
import { StatCard } from '@/components/ui'

<StatCard
  title="Pendentes de Aprovação"
  value={pendingCount}
  icon="⏳"
  iconColor="yellow"
/>
```

### Business Components
```tsx
import { SolicitacaoCard } from '@/components/business'

<SolicitacaoCard
  solicitacao={request}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

## 🔄 Migration Status

### ✅ Completed
- ✅ Base UI component library
- ✅ Business-specific components
- ✅ Layout system restructure
- ✅ Dashboard page migration
- ✅ Text standardization
- ✅ Design token system
- ✅ TypeScript type safety
- ✅ Build process validation

### 📋 Next Steps
- Migrate remaining pages to new component system
- Add unit tests for components
- Create Storybook documentation
- Implement component variants for additional use cases
- Add animation library integration

## 📦 Dependencies

### Core Dependencies
- `clsx` - Conditional class name utility
- `tailwind-merge` - Tailwind class merging
- `lucide-react` - Icon library
- `framer-motion` - Animation library
- `@radix-ui/react-slot` - Composition utilities
- `class-variance-authority` - Variant management

## 🎨 Design Tokens

### Colors
- Primary palette with 50-900 shades
- Role-specific colors (gestor, solicitante, etc.)
- Status colors (success, warning, error)
- Semantic colors (background, foreground, border)

### Typography
- Font families: Inter (sans), JetBrains Mono (mono)
- Scale: xs (12px) to 4xl (36px)
- Weights: normal, medium, semibold, bold

### Spacing
- Consistent spacing scale: xs (4px) to 3xl (64px)
- Border radius options
- Shadow definitions

## 🚀 Performance

### Bundle Size Optimization
- Tree-shaking enabled for all components
- Dynamic imports where appropriate
- Optimized build output

### Runtime Performance
- Memoized components where needed
- Efficient re-render patterns
- Minimal bundle impact

## 🔧 Development

### Component Creation Guidelines
1. Use TypeScript for all components
2. Implement proper prop interfaces
3. Use forwardRef for DOM components
4. Include display names for debugging
5. Follow consistent file naming
6. Export through index files

### Best Practices
- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper error boundaries
- Follow accessibility guidelines
- Write self-documenting code

This component system provides a solid foundation for scalable, maintainable, and consistent UI development across the entire application.
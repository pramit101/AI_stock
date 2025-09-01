# CSS System for Light/Dark Mode

This project now uses a centralized CSS system with CSS custom properties (CSS variables) to manage light and dark mode colors. This makes the code cleaner and easier to maintain.

## How It Works

The system uses CSS custom properties defined in `src/index.css` that automatically switch between light and dark mode values when the `dark` class is applied to the `<html>` element.

## Available CSS Classes

### Layout Classes
- `.sidebar` - Sidebar background and border colors
- `.sidebar-hover` - Sidebar hover state colors
- `.sidebar-active` - Sidebar active/selected state colors
- `.header` - Header background, border, and text colors
- `.header-hover` - Header hover state colors
- `.main` - Main content background and text colors
- `.card` - Card background, border, and shadow
- `.input` - Input field background, border, and text colors

### Usage Examples

#### Before (Old way - long classes):
```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow">
  Content
</div>
```

#### After (New way - clean classes):
```tsx
<div className="card rounded-lg">
  Content
</div>
```

#### Before (Old way - long classes):
```tsx
<button className="hover:bg-gray-100 dark:hover:bg-gray-800">
  Button
</button>
```

#### After (New way - clean classes):
```tsx
<button className="header-hover">
  Button
</button>
```

## Color Variables

### Light Mode Colors
- `--sidebar-bg: #013674` (The requested blue color)
- `--sidebar-hover: #012a5a`
- `--sidebar-active: #011f41`
- `--header-bg: #ffffff`
- `--main-bg: #f9fafb`
- `--card-bg: #ffffff`

### Dark Mode Colors
- `--sidebar-bg: #0f172a`
- `--sidebar-hover: #1e293b`
- `--sidebar-active: #334155`
- `--header-bg: #111827`
- `--main-bg: #111827`
- `--card-bg: #1f2937`

## Benefits

1. **Cleaner Code**: No more long `dark:` prefixed classes
2. **Easier Maintenance**: Change colors in one place
3. **Consistent Design**: All components use the same color system
4. **Better Performance**: CSS variables are more efficient than Tailwind's dark mode
5. **Smooth Transitions**: Automatic transitions between light/dark modes

## Adding New Colors

To add new colors, simply add them to the `:root` and `.dark` selectors in `src/index.css`:

```css
:root {
  --new-color: #your-light-color;
}

.dark {
  --new-color: #your-dark-color;
}
```

Then create a utility class:

```css
.new-color {
  background-color: var(--new-color);
}
```

## Migration Guide

When updating existing components:

1. Replace `bg-white dark:bg-gray-900` with `card`
2. Replace `border border-gray-200 dark:border-gray-800` with `card` (includes border)
3. Replace `text-gray-900 dark:text-gray-100` with `main` (for text color)
4. Replace hover states with appropriate utility classes

This system makes your React components much cleaner and easier to read while maintaining the same visual appearance and functionality.

# Tailwind & Shadcn Rules

These guidelines describe how TonIQ leverages Tailwind CSS and Shadcn UI components (built on Radix) for consistent, accessible UI.
IMPORTANT NOTE: `shadcn-ui@latest` is deprecated. Always use just `shadcn@latest` instead.

---

## 1. Tailwind: Utility-First Styling

• Avoid inline styles, relying on Tailwind classes instead.  
• Structure your styling from mobile-first breakpoints upward.  
• Use the official Tailwind plugin libraries (e.g., typography, forms) if beneficial.

---

## 2. Shadcn Components

• Shadcn’s Radix-based components come pre-built with accessibility features.  
• Extend or theme them as needed, but avoid rewriting them from scratch.  
• Keep custom variants or design tokens in a consistent place (e.g., tailwind.config.js or a separate theme config).

---

## 3. Glassmorphic/Theme Integration

• For dark-mode–first designs, centralize color tokens in tailwind.config.js.  
• Use partial transparency or backdrop-filter for glass effects (see theme-rules.md).  
• Keep an eye on performance for heavy blur backgrounds.

---

## 4. Reusability & Composition

• Create small, composable UI blocks.  
• For repeated patterns (e.g., user card, case summary), build mini Shadcn-based components in /components.  
• Document usage with short comments or Storybook-like references (if applicable).

---

## 5. Performance & Class Bloat

• Combine utility classes thoughtfully.  
• Use “@apply” in a .css/.scss file if a set of classes repeats extensively.  
• Practice caution with highly nested structures to maintain clarity.

---

## 6. Conclusion

Tailwind + Shadcn enable quick, accessible UI building. Keep your setup modular, adopt consistent theming, and rely on built-in patterns to ensure consistency.
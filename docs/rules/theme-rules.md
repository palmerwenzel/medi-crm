# Theme Rules

This document outlines the visual identity and theming guidelines for MediCRM, ensuring a cohesive look and feel across all user interactions. The goal is to provide a dark-mode–first design with glassmorphic elements, grayscale palettes, and purple accents that suit both patient and provider interfaces.

---

## 1. Color Palette

1. Primary Background (Dark Mode)  
   - A near-black or very dark gray (#121212 or #1a1a1a).  
   - Ensures sufficient contrast against lighter text.

2. Grayscale Spectrum  
   - Shades of gray for surfaces, backgrounds, and borders (e.g., #1f1f1f, #2b2b2b, #3a3a3a, #707070).  
   - Use these to differentiate panels, hover/active states, and subtle text sections.

3. Accent Purple  
   - Purple (#6f4ed8 or a variant) as the key highlight color throughout the app.  
   - Used for primary CTAs, link hovers, focus outlines, and brand highlights.

4. Glassmorphic Transparency  
   - Transparent layers (~30–40% opacity) over the dark background.  
   - Use radial or linear gradients behind elements for a glassy, frosted effect.

5. Supporting Colors  
   - Subtle greens or blues for success and notifications.  
   - Soft reds or oranges for errors or warnings.

---

## 2. Typography & Iconography

1. Font Family & Weights  
   - Use a clean, modern sans-serif font (e.g., Inter, Open Sans).  
   - Maintain a predictable scale (e.g., Tailwind’s text-sm, text-base, text-lg) for hierarchy.

2. Heading Styles  
   - H1, H2, H3 maintain consistent margins, boldness, and letter spacing.  
   - Lean on luminous or subtle purple tints for important headings.

3. Icon Consistency  
   - Prefer a consistent icon library (e.g., Lucide, Heroicons) for clarity.  
   - Ensure icons are sized proportionally to text (e.g., inline icons at 1em or 1.25em).

---

## 3. Glassmorphic Elements

1. Panels & Cards  
   - Give dashboards, modals, or side panels a translucent feel.  
   - Apply CSS “backdrop-filter” with a subtle blur (4–8px), ensuring text is still legible.

2. Borders & Shadows  
   - Use semi-transparent white or gray borders (1–2px) on frosted elements.  
   - Light box shadows if needed, but maintain a sleek, minimal vibe.  

3. Interaction Sensibility  
   - On hover/focus, slightly increase brightness or reduce opacity to accentuate the glass effect.  
   - Keep transitions fast (<300ms) to avoid lagging user interactions.

---

## 4. Dark-Mode–First Principles

1. Invert Logic for Light Mode (Optional)  
   - The default is dark mode with carefully chosen grayscale surfaces.  
   - If you provide a light theme, ensure the same consistent design tokens in reverse.  
   - Maintain color contrast to keep a polished experience across themes.

2. Contrast & Legibility  
   - Aim for text contrast ratios of at least 4.5:1 for body copy.  
   - For smaller or finer text, consider stronger contrast or highlight backgrounds.

3. Theming with Tailwind & Shadcn  
   - Define color tokens in your Tailwind config (e.g., --color-bg, --color-text, --color-accent).  
   - Shadcn UI supports customized tokens for consistent theming of Radix-based components.

---

## 5. Animated & Dynamic Feel

1. Subtle Motion  
   - Use transitions (ease-in-out) for accent color changes or glassmorphic morphs on hover.  
   - Avoid overly flashy animations that might distract from critical healthcare data.

2. Feedback Animations  
   - Key user actions (case submission, successful login) can trigger small “checkmark” animations or a brief highlight.  
   - Idle or passive states remain calm and unobtrusive.

3. Loading & Skeleton States  
   - Use pulse or shimmer effects for placeholders, respecting the glassmorphic style.  
   - Dark gray blocks with mild transparency to emulate underlying content.

---

## 6. Accessibility Considerations

1. Color Blindness Support  
   - Avoid relying solely on hue differences for success/error states—include icons or text labels.  
   - Purples should have enough contrast with backgrounds or accent states.

2. Transparent Overlays & Readability  
   - Glassmorphic elements must not reduce text clarity—adjust blur radius and opacity to maintain alignment with WCAG guidelines.

3. Focus & Active States  
   - Provide a visible outline (in purple or complementary bright color) around interactive controls.  
   - Verify keyboard users can navigate glass panels without confusion or hidden focus states.

---

## 7. Practical Implementation Notes

1. Define Theme Tokens  
   - Add theme tokens in your tailwind.config.js for primary background, accent, secondary grays, etc.  
   - Reference these tokens in both React components and Shadcn UI for alignment.

2. Sync with Backend  
   - Store user theme preferences (if you allow toggling) in Supabase or local storage.  
   - Provide consistent theming across sessions and devices (especially important for staff dashboards).

3. Collaboration with UX Design  
   - Any new components or complex interactions should be tested with real user flows (patient, staff, admin).  
   - Keep an iterative approach, refining the glassmorphic style while preserving readability.

---

## Conclusion

These theme rules ensure MediCRM retains a high-contrast, dark-mode–first experience with glassmorphic elements and purple highlights. By pairing clear typography and subtle animations with robust accessibility features, we create a modern, engaging interface that aligns with healthcare best practices and the distinct needs of both patient-facing and staff-facing workflows.
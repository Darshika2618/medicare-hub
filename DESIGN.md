# Design Brief

**Theme**: Light (calming, professional, trustworthy healthcare) | **Purpose**: Patient self-management of medications, reports, follow-ups with accessibility and safety as top priorities | **Aesthetic**: Human-centered minimalism; clarity over decoration

## Color Palette

| Token            | OKLCH           | Purpose                                                 |
|------------------|-----------------|---------------------------------------------------------|
| Primary (Teal)   | `0.62 0.14 200` | Trustworthy, medical-appropriate; headers, buttons      |
| Secondary (Sage) | `0.72 0.07 155` | Healing, natural; secondary actions, accents            |
| Accent (Amber)   | `0.70 0.17 75`  | Medicine reminders, dose alerts, important CTAs         |
| Success (Green)  | `0.65 0.18 145` | Dose confirmation, completed actions, healthy states   |
| Warning (Orange) | `0.68 0.16 50`  | Missed doses, upcoming follow-ups, non-critical alerts  |
| Destructive      | `0.58 0.20 25`  | Critical warnings, medication interactions              |
| Neutral          | `0.92 0.02 210` | Generous whitespace, visual rest, secondary backgrounds |

## Typography

| Layer   | Font           | Scale          | Use                                          |
|---------|----------------|----------------|----------------------------------------------|
| Display | General Sans   | 28–32px (M)    | Page titles, medicine time headers           |
| Body    | Figtree        | 16px (M) base  | Body text, form labels, descriptions         |
| Mono    | Geist Mono     | 14px           | Dosage schedules, times, medical numbers     |

## Structural Zones

| Zone              | Treatment                                        |
|-------------------|--------------------------------------------------|
| Header            | Soft shadow, white background, 44px+ touch area |
| Dashboard cards   | Large primary-tinted card for today's medicines |
| Content cards     | White bg, soft shadow, 12px rounded borders     |
| Forms & inputs    | Light grey bg, 12px padding, 8px radius         |
| Timeline          | Vertical axis with event nodes, minimal weight  |
| Bottom nav (CTA)  | Sticky, ambient background, elevated shadow     |

## Spacing & Constraints

- **Base unit**: 16px (mobile-first, 375–480px viewport)
- **Gutter**: 24px horizontal padding on mobile, 32px on tablet+
- **Touch targets**: All interactive elements ≥44×44px
- **Card density**: 16–24px vertical padding, breathing room between sections
- **Type scale**: 16px body (readable at arm's length), 20px+ headers
- **Contrast**: WCAG AA minimum everywhere; text uses semantic color tokens
- **Mobile UX**: Generous bottom padding (safe-area), tap-highlight removed, full-width inputs

## Component Patterns

- **Buttons**: Solid fills (primary/accent), outline (secondary), ghost (tertiary); 44px minimum height
- **Medicine cards**: Time badge (pill-shaped), dosage in mono font, status indicator (checkmark/pending/warning)
- **Follow-up alerts**: Accent color border, doctor name prominent, 7-day distance highlight
- **Health history**: Left-aligned timeline nodes, date + event label, minimal borders
- **Inputs**: Soft borders, light grey background, readable placeholder, focus ring on primary color

## Motion & Accessibility

- **Transitions**: Smooth 0.3s cubic-bezier on all interactive states (hover, focus, active)
- **Animations**: Fade-in (0.3s) for list items, slide-up (0.3s) for modals, pulse-subtle (2s loop) for dose reminders
- **A11y**: High contrast text, semantic HTML, ARIA labels on custom controls, status badges (not color-only), descriptive button text

## Signature Detail

**Dashboard**: Single large card displaying today's medicines organized by time-of-day (morning → afternoon → evening) with visual hierarchy. Each medicine shows dose, time, and status (taken/pending/missed) via icon + text. Medicine reminders use warm, contextual time language ("Time for your morning dose"). Health history renders as a clean, scannable timeline. All copy avoids technical jargon—"Mark as taken" not "toggle dosage state", "Your medicine reminders" not "scheduled medication alerts".


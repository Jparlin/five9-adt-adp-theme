# Prompt: Visual Theme Refinement for ADT-to-ADP Customization

## Context

You are helping refine the CSS theme for a Five9 ADT-to-ADP customization project. The project uses External CSS/JS injection into Five9's Agent Desktop Toolkit to match the visual style of Agent Desktop Plus.

**Current Status**: Phase 2 - CSS theme colors and basic styling are in place. Now we need to refine spacing, responsiveness, and polish the user experience.

**Project Repository**: Five9 ADT-to-ADP Theme (GitHub Pages hosted)
- CSS File: `css/five9-adt-theme.css`
- JavaScript Loader: `js/five9-adt-loader.js`
- Technical Reference: `DOM_MAPPING.md`

---

## ADT DOM Structure Overview

The ADT interface is a narrow (~200px default width) widget with these key sections:

```
┌─────────────────────────────┐
│  Agent Ready State Button    │  id="agent-readyState"
│  rgb(242,242,242) header     │  bg: --color-gray-100
├─────────────────────────────┤
│                             │
│  Home Panel                 │  id="home-panel"
│  ┌───┬───┐                 │  class="view-panel"
│  │ 1 │ 2 │  Action Tiles   │  ul.justify-wrapper.columns2
│  ├───┬───┤                 │  Each: .square-btn
│  │ 3 │ 4 │                 │
│  └───┴───┘                 │
│                             │
│  ┌─────────────────────────┤
│  │ • Missed Calls          │  .additional-btns
│  │ • Address Book          │  Vertical menu with fa-icons
│  │ • Queue Stats           │
│  │ • Settings              │
│  │ • Help                  │
│  └─────────────────────────┤
│                             │
├─────────────────────────────┤
│ Station ID | Time   [▼]     │  .footer
│                             │  .agent-station-status-bar
└─────────────────────────────┘
```

---

## ADP Color Palette

The following CSS custom properties are already defined in `five9-adt-theme.css`. Reference them in your refinements:

```css
/* Primary Colors */
--color-navy-dark: rgb(0, 59, 93);         /* Headings, emphasis */
--color-teal: rgb(35, 124, 169);           /* Active states, links */
--color-red-danger: rgb(196, 15, 60);      /* Not Ready, badges, alerts */
--color-green-success: rgb(80, 125, 44);   /* Make a Call button, success */

/* Grays (Light to Dark) */
--color-gray-50: rgb(250, 249, 245);       /* Very light bg */
--color-gray-100: rgb(242, 242, 242);      /* Sidebar/panel bg */
--color-gray-200: rgb(236, 237, 238);      /* Content bg */
--color-gray-300: rgb(232, 232, 232);      /* Light borders */
--color-gray-400: rgb(208, 211, 212);      /* Medium borders */

/* Text */
--color-text-primary: rgb(46, 52, 56);     /* Main text */
--color-text-secondary: rgb(91, 103, 112); /* Secondary/muted */
--color-text-disabled: rgb(146, 154, 160); /* Disabled state */

/* Fonts */
--font-family-primary: "Roboto", "Calibri", "Arial", sans-serif;
--font-size-base: 13px;
--font-size-sm: 12px;
--font-size-lg: 14px;
```

---

## Key ADT DOM Selectors to Inspect

When refining styles, inspect and update these selectors as needed:

| Element | Selector(s) | Current Styling | Notes |
|---------|-----------|-----------------|-------|
| Ready State Button | `#agent-readyState` | bg: --color-gray-100 | 200×30px; apply red/blue state colors |
| Button Tile Grid | `ul.justify-wrapper.columns2` | flex layout | 2-column grid; each tile ~90px |
| Single Tile Button | `.square-btn` | 90×90px approx | Font: 14px; Icon + label; apply color vars |
| Make a Call button | `.square-btn:nth-child(1)` | bg: --color-green-success | Inspect actual selector path |
| Voicemail button | `.square-btn:nth-child(2)` | bg: --color-teal | Inspect actual selector path |
| Additional Menu | `.additional-btns` | ul with li > a | Vertical list; hover: bg-gray-300 |
| Menu Link | `.additional-btns a` | color: --color-text-primary | Text, icon; hover state |
| Footer | `.footer` | Display flex | Station ID, time display, dropdown |
| Status Bar | `.agent-station-status-bar` | color: --color-text-secondary | Text: "Station 12345" |

---

## Refinement Tasks

### Task 1: Inspect Current Styling in ADT

1. Open ADT in your browser and open DevTools (F12)
2. Expand the ADT iframe (if in iframe) and navigate to the home panel
3. Inspect each selector above and note:
   - Current `background-color`, `color`, `font-size`, `padding`, `margin`
   - Current hover/active states
   - Any !important overrides or conflicts
4. Compare visual appearance to ADP screenshot or live ADP instance
5. Document discrepancies in your notes for step-by-step fixes

### Task 2: Refine Button Spacing & Sizing

The button tiles (Make a Call, Voicemail, etc.) should have:

**Visual Target**:
- Size: ~90×90px (current, good)
- Padding: 8px inside button
- Border-radius: 4px (ADP style, sharp corners)
- Font: 13px Roboto, white text
- Icon: 32×32px (Font Awesome 4.x)
- Hover: Slightly darker shade, subtle shadow

**CSS Example**:
```css
.square-btn {
  background-color: var(--color-green-success); /* Or specific color per button */
  color: var(--color-white);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.square-btn:hover {
  background-color: rgba(/* color darker version */);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.square-btn:active {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

**Steps**:
1. Update `.square-btn` base styles with padding, border-radius, transitions
2. Add per-button color selectors (`.square-btn:nth-child(1)` for Make a Call, etc.)
3. Ensure white text color and proper contrast
4. Add hover/active state transitions
5. Test responsiveness on narrow (200px) and wider (400px) panels

### Task 3: Refine Menu Styling

The `.additional-btns` vertical menu should have:

**Visual Target**:
- List items stacked vertically
- Each item: 32px height, 8px padding
- Icon + text, Font Awesome 4.x icons (12px)
- Text: 13px, rgb(46,52,56)
- Hover: bg rgb(232,232,232), text rgb(34,121,165)
- Separator lines between items: 1px rgb(208,211,212)

**CSS Example**:
```css
.additional-btns {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  border-top: 1px solid var(--color-gray-400);
}

.additional-btns li {
  height: 32px;
  border-bottom: 1px solid var(--color-gray-400);
}

.additional-btns a {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 100%;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  transition: background-color 0.2s, color 0.2s;
}

.additional-btns a:hover {
  background-color: var(--color-gray-300);
  color: rgb(34, 121, 165); /* ADT accent blue */
}

.additional-btns i {
  margin-right: 8px;
  font-size: 12px;
}
```

**Steps**:
1. Add flex layout and vertical alignment to menu items
2. Set proper padding and spacing
3. Add border separators
4. Implement hover state with subtle color change
5. Ensure icons are 12px and properly spaced from text

### Task 4: Refine Ready State Button Styling

The ready state button (`#agent-readyState`) should:

**Visual Target**:
- Height: 30px
- Font: 13px Roboto, white text (when colored)
- Padding: 0 8px
- Border-radius: 4px
- States:
  - Ready: bg rgb(80,125,44) green
  - Not Ready: bg rgb(196,15,60) red
  - DND: bg rgb(91,103,112) gray
- Hover: Slightly darker
- Dropdown arrow: fa-chevron-down (8px)

**CSS Example**:
```css
#agent-readyState {
  background-color: var(--color-green-success);
  color: var(--color-white);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 0 8px;
  height: 30px;
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#agent-readyState:hover {
  background-color: rgba(80, 125, 44, 0.85);
}

#agent-readyState.not-ready {
  background-color: var(--color-red-danger);
}

#agent-readyState.dnd {
  background-color: var(--color-text-secondary);
}
```

**Steps**:
1. Add button base styles (padding, border-radius, flex)
2. Add state class selectors (.ready, .not-ready, .dnd)
3. Apply correct background color to each state
4. Ensure white text contrast
5. Add smooth transitions between state changes

### Task 5: Refine Footer & Status Bar

The footer (`.footer` and `.agent-station-status-bar`) should display:

**Visual Target**:
- Height: ~32px total
- Left: Station ID text (13px, rgb(91,103,112))
- Center-right: Current time (13px, rgb(91,103,112))
- Right: Dropdown chevron (fa-chevron-down, 8px)
- Border-top: 1px rgb(208,211,212)
- Background: rgb(242,242,242)

**CSS Example**:
```css
.footer {
  border-top: 1px solid var(--color-gray-400);
  background-color: var(--color-gray-100);
  padding: 4px 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  font-family: var(--font-family-primary);
}

.agent-station-status-bar {
  flex: 1;
  text-align: left;
}

.footer .time-display {
  text-align: right;
  flex: 1;
}

.footer .dropdown-toggle {
  margin-left: auto;
  cursor: pointer;
}
```

**JavaScript addition** (in js/five9-adt-loader.js):
```javascript
// Update time every second
setInterval(function() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  document.querySelector('.footer .time-display').textContent =
    hours + ':' + minutes + ' ' + ampm;
}, 1000);
```

**Steps**:
1. Add flex layout and spacing to footer
2. Position station ID on left, time on right
3. Add border-top separator
4. Implement JavaScript time update loop
5. Ensure time format matches ADP (HH:MM AM/PM)

### Task 6: Test Responsiveness

Test the theme at different panel widths:
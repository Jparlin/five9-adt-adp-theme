# Five9 ADT → ADP Theme

Custom CSS and JavaScript to make Agent Desktop Toolkit (ADT) visually match Agent Desktop Plus (ADP).

## Project Overview

This theme customization project transforms the Five9 Agent Desktop Toolkit interface to match the look, feel, and functionality of Agent Desktop Plus. It uses Five9's External JS/CSS injection feature combined with the CustomComponentsApi to extend ADT's capabilities.

**Target Environment**: Five9 Agent Desktop Toolkit (ADT) 1.x
**Customization Method**: External JS/CSS via VCC Admin + CustomComponentsApi
**Hosting**: GitHub Pages (recommended)

---

## File Structure

```
five9-adt-adp-theme/
├── README.md                              # This file
├── DOM_MAPPING.md                         # Technical reference: ADP ↔ ADT DOM mapping
├── css/
│   └── five9-adt-theme.css               # Main stylesheet with ADP color palette
├── js/
│   └── five9-adt-loader.js               # AMD loader, hooks, CustomComponentsApi wiring
└── claude-code-prompts/
    ├── 01-visual-theme-refinement.md     # Refine CSS colors, spacing, responsiveness
    ├── 02-custom-components.md           # Add custom UI components (Address Book, etc.)
    ├── 03-stats-and-status-bar.md        # Enhance stats panel with ADP-style metrics
    └── 04-notification-system.md         # Build toast notifications with HookApi
```

---

## Setup Instructions

### 1. Host the Files (GitHub Pages)

Push this repository to GitHub and enable GitHub Pages:

```bash
git init
git add .
git commit -m "Initial Five9 ADT-to-ADP theme commit"
git push origin main
```

Enable GitHub Pages in your repository settings:
- **Source**: `main` branch
- **Folder**: `/ (root)`
- **Published URL**: `https://<username>.github.io/five9-adt-adp-theme/`

Files will be served at:
- CSS: `https://<username>.github.io/five9-adt-adp-theme/css/five9-adt-theme.css`
- JS: `https://<username>.github.io/five9-adt-adp-theme/js/five9-adt-loader.js`

### 2. Configure in VCC Admin

1. Log in to Five9 VCC (Virtual Contact Center) Administration
2. Navigate to **Agent Desktop > Customizations > External JS/CSS**
3. Enable the following:
   - **External CSS**: Enable ✓
   - **External JavaScript**: Enable ✓

4. Add CSS URL:
   - **Label**: `ADT-ADP Theme CSS`
   - **URL**: `https://<username>.github.io/five9-adt-adp-theme/css/five9-adt-theme.css`

5. Add JavaScript URL:
   - **Label**: `ADT-ADP Theme Loader`
   - **URL**: `https://<username>.github.io/five9-adt-adp-theme/js/five9-adt-loader.js`

6. Save and restart your ADT instance.

### 3. Verify Installation

After restart, you should see:
- ADT header background changes to light gray (ADP palette)
- Button colors update: Make a Call (green), Voicemail (blue), etc.
- Typography adjusts to Roboto font family
- Footer displays current time

---

## How the AMD Loader Works

The JavaScript loader (`js/five9-adt-loader.js`) follows Five9's AMD (Asynchronous Module Definition) pattern:

```javascript
// Wait for Five9 API to load
define(["five9"], function(Five9) {
  // Access to Five9.CrmSdk global
  // Initialize hooks, register components, etc.
});
```

**Key responsibilities of the loader:**

1. **Hook Registration**: Subscribe to agent events (callStarted, callFinished, etc.) via `Five9.CrmSdk.hookApi()`
2. **Custom Components**: Register UI components via `Five9.CrmSdk.registerCustomComponents()`
3. **REST API Integration**: Fetch agent/queue stats via Five9 REST API
4. **DOM Manipulation**: Enhance ADT panels with additional functionality

---

## Key ADT DOM Selectors (sfli- Classes)

ADT uses scoped CSS classes (`sfli-` prefix) to avoid conflicts with agent CRM data:

| Element | Selector | Purpose |
|---------|----------|---------|
| Agent container | `#agent-container` | Root container for entire ADT interface |
| Home panel | `#home-panel.view-panel` | Main home screen panel |
| Ready state button | `#agent-readyState` | Agent status button (Ready/Not Ready/DND) |
| Button tile grid | `ul.justify-wrapper.columns2` | Grid of action buttons (Make a Call, Voicemail, etc.) |
| Single action button | `.square-btn` | Individual action button tile |
| Additional menu | `.additional-btns` | Vertical menu (Missed Calls, Address Book, Settings) |
| Menu link | `.additional-btns a` | Individual menu item link |
| Footer | `.footer` | Bottom status bar area |
| Station status | `.agent-station-status-bar` | Station ID and connectivity info |
| Connectivity bar | `.connectivity-status-bar` | Network connectivity indicator |

---

## ADP Color Palette Reference

CSS custom properties defined in `five9-adt-theme.css`:

| Purpose | RGB Value | CSS Variable | Example Use |
|---------|-----------|--------------|------------|
| Primary Dark Navy | `rgb(0, 59, 93)` | `--color-navy-dark` | Headings, emphasis |
| Active/Tab Teal | `rgb(35, 124, 169)` | `--color-teal` | Active button state, links |
| Danger Red | `rgb(196, 15, 60)` | `--color-red-danger` | Not Ready state, badges |
| Success Green | `rgb(80, 125, 44)` | `--color-green-success` | Make a Call button |
| Light Gray (Sidebar) | `rgb(242, 242, 242)` | `--color-gray-100` | Panel backgrounds |
| Medium Gray (Content) | `rgb(236, 237, 238)` | `--color-gray-200` | Content area background |
| Text Primary | `rgb(46, 52, 56)` | `--color-text-primary` | Body text, labels |
| Text Secondary | `rgb(91, 103, 112)` | `--color-text-secondary` | Muted text, hints |

**Font**: Roboto 13px preferred (falls back to Arial, Calibri)

---

## Maintenance Notes

### After Five9 ADT Updates

Five9 periodically updates the ADT interface. After each update, you should:

1. **Re-inspect ADT DOM structure**
   - Open ADT in browser DevTools (F12)
   - Search for changes in button classes, IDs, panel structure
   - Update selectors in `css/five9-adt-theme.css` if needed

2. **Test key functionality**
   - Verify button colors display correctly
   - Check Ready state styling
   - Confirm footer and status bar appearance
   - Test any CustomComponents injections

3. **Update DOM_MAPPING.md**
   - Document any selector changes
   - Add new elements or removed ones
   - Update implementation strategy notes

4. **Re-deploy to GitHub Pages**
   - Update files locally
   - Commit and push changes
   - Allow 1-2 minutes for GitHub Pages CDN to update
   - Clear ADT browser cache or force refresh (Ctrl+Shift+R)

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Styles not applying | CSS URL misconfigured | Verify URL in VCC Admin matches GitHub Pages URL |
| JavaScript errors | Outdated API references | Check Five9 API docs; update HookApi calls |
| CustomComponents not showing | AMD loader not running | Check browser console for define/require errors |
| Styles override by ADT | CSS specificity too low | Increase specificity with `!important` (last resort) |
| Cache not clearing | Browser cache issue | Hard refresh (Ctrl+Shift+R) or clear cache manually |

---

## Phase Roadmap

This project is organized in phases for incremental development:

### Phase 1: CSS Theme (✓ Complete)
- Color palette implementation
- Typography adjustments
- Button and panel styling
- Footer branding

### Phase 2: Visual Refinement (📍 Next)
- Fine-tune spacing and padding
- Responsive behavior on narrow panels
- Hover states and transitions
- See: `claude-code-prompts/01-visual-theme-refinement.md`

### Phase 3: Custom Components (Planned)
- Address Book popup
- Search/Dial combobox
- Top toolbar injection
- See: `claude-code-prompts/02-custom-components.md`

### Phase 4: Stats & Status Enhancement (Planned)
- Real-time stats integration via REST API
- ACD status bar
- Queue metrics
- See: `claude-code-prompts/03-stats-and-status-bar.md`

### Phase 5: Notifications (Planned)
- Toast notification system
- Hook integration
- Event handling
- See: `claude-code-prompts/04-notification-system.md`

---

## References

- **Five9 CRM SDK Docs**: [Five9 Developer Portal](https://developer.five9.com)
- **DOM Mapping Reference**: See `DOM_MAPPING.md` in this repository
- **ADT Customization Guide**: See `../Five9_ADT_to_ADP_Customization_Guide.html`
- **REST API Endpoints**: Five9 REST API Reference (accessible via VCC Admin)

---

## Contributing

To contribute refinements or new features:

1. Clone this repository
2. Create a feature branch: `git checkout -b feature/component-name`
3. Make changes and test in ADT (via VCC Admin URLs)
4. Document changes in relevant `claude-code-prompts/*.md` files
5. Commit with clear messages
6. Push and open a pull request

---

## License

This theme customization is provided as-is for internal use by Five9 organizations. Modify freely for your needs.

**Last Updated**: 2026-03-31

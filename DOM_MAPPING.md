# Five9 ADT-to-ADP Theme: DOM Mapping Reference

**Project**: Five9 Agent Desktop Toolkit (ADT) visual theme matching Agent Desktop Plus (ADP)  
**Purpose**: Technical reference for mapping ADP interface elements to ADT equivalents  
**Last Updated**: 2026-03-31

---

## Overview

This document maps ADP's full-featured agent interface to ADT's narrower desktop widget interface. It identifies which elements can be restyled via CSS, which require JavaScript manipulation, and which need custom components via Five9's CustomComponentsApi.

---

## Layout & Structure Mapping

| ADP Component | ADT Equivalent | Implementation Method | Notes |
|---|---|---|---|
| Full-width flex layout | Narrow 200px panel (default) | CSS (width constraints) | ADT uses single-column. Can't match ADP's side-by-side layout without CustomComponentsApi. |
| Dark left nav bar (59px) | Not present in ADT | CustomComponentsApi slot | `#3rdPartyComp-home-panel-top` can hold nav buttons. Would need JS to inject tabbed navigation. |
| Sidebar (286px, agent info) | Agent info embedded in header | CSS + JS | ADT shows profile pic, name, station inline. Can expand via custom component. |
| Main content area | `#home-panel.view-panel` | CSS styling | Core agent actions here. Background color, spacing, typography match via CSS. |
| Top toolbar (50px) | Not present in ADT | CustomComponentsApi | Use `#3rdPartyComp-home-panel-top` to inject toolbar with logo, buttons. |
| Footer ACD bar (40px) | `.footer` element | CSS + REST API | Limited footer in ADT. Use Five9 REST API to populate real stats; style via CSS. |

---

## Navigation & Tabs

| ADP Element | ADP Selector | ADT Element | ADT Selector | Implementation | Notes |
|---|---|---|---|---|---|
| Tab list (11 tabs) | `.nav.navigation-panel ul.nav` | Home panel only | `#home-panel.view-panel` | JS injection | ADT shows views via hidden panels. Create toggle buttons via CustomComponentsApi. |
| Home tab | `li[href="#agent/home"]` | Home panel | `#home-panel` | CSS | Match styling, keep as default. |
| Call/Voice tab | `li[href="#agent/voice"]` | Not native | Custom component | CustomComponentsApi slot + JS | Inject via `#3rdPartyComp-home-panel-bottom` or popup modal. |
| Voicemail tab | `li[href="#agent/voicemail"]` | Not native | Custom component | CustomComponentsApi slot + JS | Similar to Call tab. |
| Chat tab | `li[href="#agent/chat"]` | Chat panel exists | Check `.view-panel` classes | CSS + minimal JS | Panels are hidden; show via custom toggle. |
| Email tab | `li[href="#agent/email"]` | Email panel exists | Check `.view-panel` classes | CSS + minimal JS | Similar to Chat. |
| CRM/Contacts tab | `li[href="#agent/crm"]` | Not native | CustomComponentsApi | Use `#3rdPartyComp-home-panel-bottom` | Address Book integration can go here. |
| Other tabs (Social, Activity, Messages, etc.) | Various `li[href]` | Not natively supported | CustomComponentsApi + REST API | Custom components or external popups | Messages & Reminders partially supported; extend with API calls. |

---

## Agent Ready State

| ADP Element | ADP Selector / Style | ADT Element | ADT Selector | CSS Mapping | Notes |
|---|---|---|---|---|---|
| Ready state pill | Red badge, top-left. Text: "Not Ready HH:MM". Font: 13px Roboto. Bg: rgb(196,15,60) when red. Dropdown. | Ready state button | `#agent-readyState` button | Apply bg rgb(196,15,60); border-radius: 4px; font: 13px Roboto. | ADT button is 200x30px. ADP pill is smaller. Keep ADT size but match colors. Dropdown shows states. |
| State dropdown menu | Not visible in baseline | Dropdown menu | `[role="listbox"]` or `.dropdown-menu` | bg: rgb(236,237,238); border: 1px rgb(208,211,212); box-shadow. | Use CustomComponentsApi to enhance dropdown with ADP styling. |
| Ready state (active) | Bg: rgb(35,124,169) (blue), text: white | Ready state | Button class: `.btn-blue` | Apply rgb(35,124,169) as bg when active. | Same for blue state. |

---

## Home Panel Buttons & Grid

| ADP Element | ADP Selector / Context | ADT Element | ADT Selector | CSS Mapping | Notes |
|---|---|---|---|---|---|
| Tile grid | ADP: 11 tab buttons in left nav, 58x62px each. | 2x2 tile grid | `ul.justify-wrapper.columns2` containing square-btn buttons | Buttons: Make a Call, Voicemail, Reminders, Messages. | ADT has only 4 main tiles. Can inject additional tiles via CustomComponentsApi. Match tile size & icon styling. |
| Make a Call button | Icon: fa-phone. Bg: rgb(80,125,44) (green). | Make a Call button | `.square-btn` with `fa-phone` | bg: rgb(80,125,44); color: white; font: 14px Arial; border-radius: 4px. | Match ADP's success green. |
| Voicemail button | Icon: fa-envelope. Bg: rgb(35,124,169) (blue). | Voicemail button | `.square-btn` with `fa-voicemail` | bg: rgb(35,124,169); color: white; similar sizing. | Match ADP's active tab blue. |
| Reminders button | Icon: fa-calendar. Bg: rgb(91,103,112) (muted text). | Reminders button | `.square-btn` with `fa-calendar` | bg: rgb(91,103,112); color: white. | Match ADP's muted tone. |
| Messages button | Icon: fa-comment. Bg: rgb(91,103,112). Badge for count. | Messages button | `.square-btn` with `fa-comment` | bg: rgb(91,103,112); color: white. Badge: position: absolute; bg: rgb(196,15,60); border-radius: 50%. | Add badge styling for message count. |
| Additional menu items | Vertical menu: Missed Calls, Address Book, Queue Stats, Add to DNC, Settings, Help. Icons: fa-*. | Vertical menu | `.additional-btns` | Buttons: list-style: none; each li with a-link. Hover: bg: rgb(232,232,232); color: rgb(34,121,165). | Icons from Font Awesome 4.x. Match text: rgb(46,52,56). |
| Missed Calls | Icon: fa-phone. | Missed Calls | Menu item with fa-phone | Matching styling. | Use Five9 REST API to fetch missed call count. |
| Address Book | Icon: fa-book. | Address Book | Menu item with fa-book | On click, trigger CustomComponentsApi to show address book popup. | Can use `#3rdPartyComp-home-panel-bottom` or modal. |
| Queue Stats | Icon: fa-bar-chart. | Queue Stats | Menu item with fa-bar-chart | On click, trigger modal or panel with REST API data. | Fetch via /stats/queue endpoint. |
| Settings | Icon: fa-cog. | Settings | Menu item with fa-cog | On click, open settings panel (native ADT). | No ADP equivalence needed; keep native ADT. |
| Help | Icon: fa-question-circle. | Help | Menu item with fa-question-circle | On click, open help (native ADT). | No ADP equivalence. |

---

## Search & Dial Component

| ADP Element | ADP Selector / Context | ADT Element | ADT Selector | Implementation | Notes |
|---|---|---|---|---|---|
| Search/Dial combobox | Combobox for name/number lookup. Placeholder: "Name or number". Font: 13px. | Not natively present | Custom component | CustomComponentsApi: `#3rdPartyComp-home-panel-top`. Inject combobox with autocomplete. | Use Five9 REST API to fetch contacts. |
| Campaign selector | Dropdown for active campaign. | Not natively present | Custom component | CustomComponentsApi or store in agent state. | Fetch via /campaigns endpoint. |
| Dial button | Green button, "Dial". Font: 13px. Bg: rgb(80,125,44). | Not natively present | Custom button | CustomComponentsApi or modal launcher. Trigger `make a call` action. | Use Five9 REST API to initiate call. |

---

## Toolbar & Icons

| ADP Element | ADP Selector / Context | ADT Element | ADT Selector | CSS/JS Approach | Notes |
|---|---|---|---|---|---|
| Top toolbar container | `div.agent-toolbar-container`. Bg: rgb(242,242,242). Height: 50px. Flex layout. Padding: 0 8px 0 20px. | Not present | Custom component | CustomComponentsApi: `#3rdPartyComp-home-panel-top`. Inject toolbar with buttons. | Five9 logo centered in ADP toolbar. |
| Address Book button | Icon: fa-book. Hover: highlight. | Menu item | Existing `.additional-btns` | Keep as is, or enhance with tooltip. | Can integrate with custom Address Book popup. |
| Messages button | Icon: fa-comment. Badge with count. | Messages button | Tile + `.additional-btns` item | Badge: position: absolute; top: -5px; right: -5px; bg: rgb(196,15,60); border-radius: 50%; color: white; font-size: 11px. | Fetch count via REST API. |
| Reminders button | Icon: fa-calendar. Badge optional. | Reminders button | Tile + `.additional-btns` item | Similar badge styling. | Fetch count via REST API. |
| Actions dropdown | Text: "Actions". Icon: fa-chevron-down. | Not natively present | Custom dropdown | CustomComponentsApi or native ADT dropdown enhancement. | Placeholder for extensibility. |
| Help dropdown | Text: "Help". Icon: fa-question-circle. | Help menu item | `.additional-btns` li | Keep native. | No ADP equivalence. |
| User menu | Avatar + name. Dropdown with Logout, etc. | Not present or minimal | Custom component | CustomComponentsApi: `#3rdPartyComp-home-panel-top` (right side). | Fetch user info via REST API. |
| Five9 logo | Centered in toolbar. | Footer logo | `.footer` | Reposition or inject via toolbar custom component. | Branding element. |

---

## Agent Info Sidebar

| ADP Element | ADP Selector / Context | ADT Element | ADT Selector | CSS Approach | Notes |
|---|---|---|---|---|---|
| Profile picture | 32x32px or similar. `img.agent-avatar`. | Profile pic | Header or custom component | Inject via CustomComponentsApi `#3rdPartyComp-home-panel-top`. | Fetch via REST API `/users/self`. |
| Agent name | Text, 13px Roboto. Color: rgb(46,52,56). | Agent name | Header or `.agent-station-status-bar` | Display via CSS or JS. Match font & color. | Fetch via REST API. |
| Domain | Small text, secondary color. | Not prominently shown | Custom component | Inject via `#3rdPartyComp-home-panel-top`. | Optional enhancement. |
| Email | Text, secondary color. | Not shown | Custom component | Tooltip or custom component. | Optional. |
| Station ID | Text, secondary color. | `.agent-station-status-bar` | Shown in footer area | Style via CSS. Color: rgb(91,103,112). Font: 13px. | Existing ADT element. Match ADP styling. |
| Skills list | List of skills, secondary color. | Not shown | Custom component | CustomComponentsApi or modal. | Can display in tooltip or expandable panel. |
| Banner header | 36px tall. Bg: rgb(242,242,242). | Header area | Top of `#agent-container` | CSS: height: 36px; bg: rgb(242,242,242); display: flex; align-items: center; padding: 0 8px. | Core layout element. |

---

## ACD Status & Footer

| ADP Element | ADP Selector / Context | ADT Element | ADT Selector | Implementation | Notes |
|---|---|---|---|---|---|
| ACD Status section | Text: "ACD Status: [status]". Font: 13px. Color: rgb(91,103,112). | Not present | Custom component + REST API | CustomComponentsApi: `#3rdPartyComp-home-panel-bottom`. Fetch `/agents/self/status`. | Shows Ready, Not Ready, DND, etc. |
| My Skills count | Text: "My Skills: N". | Not present | Custom component + REST API | CustomComponentsApi or `.additional-btns` item. Fetch `/agents/self/skills`. | Display count of assigned skills. |
| Calls count | Text: "Calls: N". | Not present | Custom component + REST API | CustomComponentsApi: `#3rdPartyComp-home-panel-bottom`. Fetch `/queues` stats. | Show active calls in queue. |
| Callbacks count | Text: "Callbacks: N". | Not present | Custom component + REST API | CustomComponentsApi. Fetch `/callbacks`. | Show pending callbacks. |
| Voicemails count | Text: "Voicemails: N". Badge on Voicemail tile. | Voicemail button | `.square-btn` with fa-voicemail | Badge: position: absolute; bg: rgb(196,15,60); border-radius: 50%; color: white; font-size: 11px. Right: -5px; Top: -5px. | Fetch count via REST API. |
| Longest Wait | Text: "Longest Wait: HH:MM". | Not present | Custom component + REST API | CustomComponentsApi: `#3rdPartyComp-home-panel-bottom`. Fetch `/queues/longest-wait`. | Optional KPI widget. |
| Details dropdown | Icon: fa-chevron-down. Expands/collapses ACD bar. | Not present | CustomComponentsApi | Inject expandable section. | Can hide non-critical KPIs. |
| Time display | HH:MM AM/PM. Right-aligned. | Footer element | `.footer` | JavaScript: `setInterval(() => { update time }, 1000)`. Style: text-align: right; color: rgb(91,103,112); font: 13px. | Live clock. |
| Audio controls | Volume, mute, speaker icon. | `.footer` | May be minimal | Inject via CustomComponentsApi if needed. Ensure agentReady state includes audio. | Hardware-dependent. |

---

## Colors & Typography Mapping

| Purpose | ADP Color | ADT Equivalent | CSS Value | Notes |
|---|---|---|---|---|
| Dark nav background | rgb(34,40,45) | N/A (not in ADT) | `background-color: rgb(34,40,45);` | Use for any custom sidebar injected. |
| Active tab / button | rgb(35,124,169) | Active state | `background-color: rgb(35,124,169);` | Buttons, links. |
| Primary navy | rgb(0,59,93) | Not used in ADT | `color: rgb(0,59,93);` | Accent for headings. |
| Danger red | rgb(196,15,60) | Badge, status indicator | `background-color: rgb(196,15,60);` | Not Ready state, badges, errors. |
| Success green | rgb(80,125,44) | Button highlight | `background-color: rgb(80,125,44);` | Make a Call, active states. |
| Sidebar bg | rgb(242,242,242) | Panel backgrounds | `background-color: rgb(242,242,242);` | Light gray. |
| Content bg | rgb(236,237,238) | Content area | `background-color: rgb(236,237,238);` | Slightly darker gray. |
| Text primary | rgb(46,52,56) | Default text | `color: rgb(46,52,56);` | Body text, labels. |
| Text secondary | rgb(91,103,112) | Muted text | `color: rgb(91,103,112);` | Hints, secondary info. |
| Text muted | rgb(146,154,160) | Disabled text | `color: rgb(146,154,160);` | Disabled buttons. |
| ADT accent blue | rgb(34,121,165) | Links, hover | `color: rgb(34,121,165);` | Different from ADP's rgb(35,124,169). Use for ADT-native elements. |
| ADT borders | rgb(208,211,212), rgb(232,232,232) | Panel dividers | `border-color: rgb(208,211,212);` | Subtle dividers. |
| Font family | Roboto, Calibri, Arial, sans-serif | Arial | `font-family: Arial, sans-serif;` | ADT uses Arial 14px; ADP uses Roboto 13px. Use Arial for consistency. |
| Font size | 13px (ADP) | 14px (ADT) | `font-size: 14px;` | Keep ADT's 14px for readability. |

---

## Implementation Summary

### CSS-Only Changes (Low Effort)
1. Button colors: Make a Call (green), Voicemail (blue), etc.
2. Typography: Font sizes, colors, weights.
3. Spacing & padding: Tile sizes, button dimensions.
4. Borders & shadows: Panel dividers, button states.
5. Footer styling: ACD bar layout, time display.

### CSS + Minimal JavaScript (Medium Effort)
1. Show/hide panels: Toggle Chat, Email, etc. via button clicks.
2. Badge counts: Update message/voicemail/reminder counts.
3. State indicators: Color change for Ready/Not Ready.
4. Dropdown menus: Enhance native ADT dropdowns.

### CustomComponentsApi Required (High Effort)
1. Top toolbar injection: Use `#3rdPartyComp-home-panel-top`.
2. Address Book popup: Use `#3rdPartyComp-home-panel-bottom` or modal.
3. Search/Dial combobox: Inject and wire to REST API.
4. ACD status widget: Use `#3rdPartyComp-home-panel-bottom` to display live stats.
5. Navigation tabs: Inject tabbed interface (optional; can use hidden panels).
6. User menu: Inject avatar + name + logout.

### REST API Calls Required
- `GET /users/self` – Agent info (name, avatar, domain, email, station).
- `GET /agents/self/status` – ACD status (Ready/Not Ready).
- `GET /agents/self/skills` – Skills list and count.
- `GET /queues` – Queue stats (calls, callbacks).
- `GET /queues/longest-wait` – Longest wait time.
- `GET /callbacks` – Pending callbacks.
- `GET /voicemails` – Voicemail count.
- `POST /agents/self/dial` – Initiate outbound call.
- `GET /contacts` – Address book (with search).
- `GET /campaigns` – Active campaign list.

---

## File Structure Reference

**ADT Files to Target:**
- Main layout: `#main-content` → `#mainComp` → `#agent-container`
- Home panel: `#home-panel.view-panel` → `.panel-wrapper`
- Buttons: `ul.justify-wrapper.columns2` → `.square-btn`
- Menu: `.additional-btns` → `li` → `a`
- Footer: `.footer`
- Ready state: `#agent-readyState`
- Status bar: `.agent-station-status-bar`
- Connectivity: `.connectivity-status-bar`

**CSS Injection Point:** `<style>` tag in `index.html` or external `styles.css` linked in the page header.

**JavaScript Injection Point:** `<script>` tag in `index.html` or external `loader.js` that initializes after DOM ready.

**CustomComponentsApi Slots:**
- `#3rdPartyComp-home-panel-top` – Toolbar, user menu, search bar.
- `#3rdPartyComp-home-panel-bottom` – ACD status, queue stats, extended menu.
- Similar slots may exist for Call, Chat, Email panels (check Five9 docs).

---

## Next Steps

1. **Phase 1 (CSS)**: Apply color, typography, and spacing changes to match ADP.
2. **Phase 2 (JS + Minimal API)**: Show/hide panels, update badges, enhance dropdowns.
3. **Phase 3 (CustomComponentsApi)**: Inject toolbar, address book, search, ACD widget.
4. **Phase 4 (Testing & Refinement)**: Compare with live ADP, iterate on feedback.

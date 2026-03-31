# Prompt: Custom Components for ADT-to-ADP Customization

## Context

You are extending the Five9 ADT-to-ADP theme with custom UI components using Five9's CustomComponentsApi. This phase adds ADP-like features that cannot be achieved through CSS alone.

**Current Status**: Phase 3 - Visual theme is complete. Now we inject custom UI components into predefined slots.

**Project Files**:
- JavaScript Loader: `js/five9-adt-loader.js` (main integration file)
- CSS Theme: `css/five9-adt-theme.css` (styling for new components)
- DOM Reference: `DOM_MAPPING.md`

---

## CustomComponentsApi Overview

Five9's CustomComponentsApi allows you to register custom UI components at predefined injection points within ADT. Components are defined as XML templates with JavaScript callbacks.

### How It Works

1. **Register via CRM SDK**: Call `Five9.CrmSdk.registerCustomComponents()`
2. **Define Component XML**: Template with element types (adt-component, adt-button, adt-input, etc.)
3. **Wire Callbacks**: Map element IDs to JavaScript click/input handlers
4. **Render to Slot**: Component displays in predefined container (e.g., `#3rdPartyComp-home-panel-top`)
### Component Structure

```javascript
const componentDef = {
  id: "address-book-component",
  locations: ["home-panel"],  // or ["call-tab"], ["email-tab"], etc.
  template: `
    <adt-component>
      <adt-btn-group layout="vertical">
        <adt-button id="addr-book-btn" label="Address Book" icon="fa-book" />
        <adt-button id="messages-btn" label="Messages" icon="fa-comment" />
      </adt-btn-group>
    </adt-component>
  `,
  callbacks: {
    "addr-book-btn": function(e) {
      // Handle Address Book button click
      openAddressBookPopup();
    },
    "messages-btn": function(e) {
      // Handle Messages button click
      openMessagesWindow();
    }
  }
};

Five9.CrmSdk.registerCustomComponents([componentDef]);
```

---

## Available Component Locations

ADT supports injection into predefined slots on various panels. These slots correspond to `#3rdPartyComp-*` container IDs:
| Location | Container ID | Purpose | Panel | Recommended Use |
|----------|--------------|---------|-------|-----------------|
| `home-tab` | `#3rdPartyComp-home-panel-top` | Top toolbar area | Home | Logo, search bar, user menu |
| `home-tab` | `#3rdPartyComp-home-panel-bottom` | Below main menu | Home | ACD stats, extended actions |
| `call-tab` | `#3rdPartyComp-call-panel-top` | Top of call panel | Call/Voice | Call-related actions |
| `call-tab` | `#3rdPartyComp-call-details-top` | Call details header | Call | Call info, quick actions |
| `call-tab` | `#3rdPartyComp-call-details-bottom` | Call details footer | Call | Notes, disposition |
| `email-tab` | `#3rdPartyComp-email-panel-top` | Top of email panel | Email | Email actions |
| `chat-tab` | `#3rdPartyComp-chat-panel-top` | Top of chat panel | Chat | Chat actions |
| `call-top` | `#3rdPartyComp-call-top` | Above call info | Call | Call toolbar |
| `call-middle` | `#3rdPartyComp-call-middle` | Middle of call panel | Call | Mid-panel actions |
| `call-bottom` | `#3rdPartyComp-call-bottom` | Below call panel | Call | Additional call options |

**For this phase**: We'll focus on `home-tab` slots to add ADP-like features to the home panel.

---

## ADT Component Types

Five9 provides these built-in component tags:
| Tag | Purpose | Attributes | Example |
|-----|---------|-----------|---------|
| `<adt-component>` | Container for a custom component | `id`, `layout` | `<adt-component id="my-comp" layout="vertical">` |
| `<adt-button>` | Clickable button | `id`, `label`, `icon`, `onclick` | `<adt-button id="btn1" label="Click Me" icon="fa-phone" />` |
| `<adt-input>` | Text input field | `id`, `placeholder`, `type` | `<adt-input id="search" placeholder="Search..." type="text" />` |
| `<adt-btn-group>` | Group of buttons | `layout` ("horizontal" or "vertical") | `<adt-btn-group layout="vertical">` |
| `<adt-label>` | Static text label | `id`, `text` | `<adt-label id="lbl1" text="Station: 12345" />` |
| `<adt-divider>` | Visual separator | `id` | `<adt-divider id="sep1" />` |
| `<adt-dropdown>` | Dropdown selector | `id`, `label`, `options` | `<adt-dropdown id="campaign" label="Campaign" options="[]" />` |

---

## Task: Add ADP-Like Buttons to Home Panel

### Objective

Add three new custom component buttons that match ADP's functionality:

1. **Address Book**: Opens popup with contact directory
2. **Messages**: Shortcut to message/SMS functionality
3. **Activity**: Link to activity/history panel

These buttons should:
- Display as part of the vertical menu in `home-panel-bottom`
- Use ADP colors and Font Awesome icons
- Match the styling of existing menu items
- Be clickable and functional
### Implementation Steps

#### Step 1: Update JavaScript Loader

In `js/five9-adt-loader.js`, add the component registration and callback handlers:

```javascript
define(["five9"], function(Five9) {
  // Wait for Five9.CrmSdk to be ready
  var sdk = Five9.CrmSdk;

  if (!sdk || !sdk.registerCustomComponents) {
    console.error("Five9 CRM SDK not available");
    return;
  }

  // ===== CUSTOM COMPONENTS =====

  // 1. Address Book Component
  var addressBookComponent = {
    id: "adt-address-book-component",
    locations: ["home-tab"],
    template: `
      <adt-component id="address-book-comp" layout="vertical">
        <adt-button
          id="address-book-btn"
          label="Address Book"
          icon="fa-book"
        />
      </adt-component>
    `,
    callbacks: {
      "address-book-btn": function(e) {
        openAddressBook();
      }
    }
  };
  // 2. Messages Component
  var messagesComponent = {
    id: "adt-messages-component",
    locations: ["home-tab"],
    template: `
      <adt-component id="messages-comp" layout="vertical">
        <adt-button
          id="messages-btn"
          label="Messages"
          icon="fa-comment"
        />
      </adt-component>
    `,
    callbacks: {
      "messages-btn": function(e) {
        openMessages();
      }
    }
  };

  // 3. Activity Component
  var activityComponent = {
    id: "adt-activity-component",
    locations: ["home-tab"],
    template: `
      <adt-component id="activity-comp" layout="vertical">
        <adt-button
          id="activity-btn"
          label="Activity"
          icon="fa-history"
        />
      </adt-component>
    `,
    callbacks: {
      "activity-btn": function(e) {
        openActivity();
      }
    }
  };
  // Register all components
  try {
    sdk.registerCustomComponents([
      addressBookComponent,
      messagesComponent,
      activityComponent
    ]);
    console.log("Custom components registered successfully");
  } catch (err) {
    console.error("Error registering custom components:", err);
  }

  // ===== COMPONENT HANDLERS =====

  /**
   * Open Address Book in a popup window
   * Fetches contact list via Five9 REST API
   */
  function openAddressBook() {
    console.log("Opening Address Book...");

    // Fetch contacts from Five9 REST API
    fetchContacts()
      .then(function(contacts) {
        var html = buildAddressBookHTML(contacts);
        openPopupWindow(html, "Address Book", 500, 600);
      })
      .catch(function(err) {
        console.error("Error fetching contacts:", err);
        showNotification("Failed to load address book", "error");
      });
  }
  /**
   * Open Messages window
   * Displays SMS/message history
   */
  function openMessages() {
    console.log("Opening Messages...");

    // Placeholder: navigate to Messages panel or open popup
    // Could integrate with ADT's native chat/message panel
    showNotification("Messages feature coming soon", "info");

    // Optionally: open external Messages CRM interface
    // window.open("https://your-crm/messages", "_blank", "width=800,height=600");
  }

  /**
   * Open Activity panel
   * Shows call history, notes, interactions
   */
  function openActivity() {
    console.log("Opening Activity...");

    // Similar to Address Book: fetch activity data and display
    fetchActivity()
      .then(function(activity) {
        var html = buildActivityHTML(activity);
        openPopupWindow(html, "Activity", 600, 700);
      })
      .catch(function(err) {
        console.error("Error fetching activity:", err);
        showNotification("Failed to load activity", "error");
      });
  }
  // ===== REST API INTEGRATION =====

  /**
   * Fetch contacts from Five9 REST API
   * @returns Promise resolving to contacts array
   */
  function fetchContacts() {
    return new Promise(function(resolve, reject) {
      // GET /contacts endpoint - returns list of contacts
      // This would typically use Five9's REST API client
      var apiUrl = "/api/contacts"; // Example endpoint

      var xhr = new XMLHttpRequest();
      xhr.open("GET", apiUrl, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var contacts = JSON.parse(xhr.responseText);
          resolve(contacts);
        } else {
          reject(new Error("Failed to fetch contacts: " + xhr.status));
        }
      };
      xhr.onerror = function() {
        reject(new Error("Network error"));
      };
      xhr.send();
    });
  }

  /**
   * Fetch activity data (call history, notes, etc.)
   * @returns Promise resolving to activity array
   */
  function fetchActivity() {
    return new Promise(function(resolve, reject) {
      var apiUrl = "/api/activity"; // Example endpoint

      var xhr = new XMLHttpRequest();
      xhr.open("GET", apiUrl, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var activity = JSON.parse(xhr.responseText);
          resolve(activity);
        } else {
          reject(new Error("Failed to fetch activity: " + xhr.status));
        }
      };
      xhr.onerror = function() {
        reject(new Error("Network error"));
      };
      xhr.send();
    });
  }
  // ===== UI BUILDERS =====

  /**
   * Build HTML for Address Book popup
   * @param {Array} contacts - List of contact objects
   * @returns {string} HTML string
   */
  function buildAddressBookHTML(contacts) {
    var html = `
      <div style="padding: 16px; font-family: Arial, sans-serif; font-size: 13px;">
        <h2 style="margin: 0 0 16px 0; color: rgb(46, 52, 56);">Address Book</h2>
        <input
          type="text"
          id="contact-search"
          placeholder="Search by name or number..."
          style="width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid rgb(208, 211, 212); border-radius: 4px;"
        />
        <div id="contacts-list" style="max-height: 400px; overflow-y: auto;">
    `;

    if (contacts && contacts.length > 0) {
      contacts.forEach(function(contact) {
        html += `
          <div style="padding: 8px; border-bottom: 1px solid rgb(232, 232, 232); cursor: pointer;" class="contact-item" data-phone="${contact.phone || ''}">
            <div style="font-weight: bold; color: rgb(35, 124, 169);">${contact.name || 'Unknown'}</div>
            <div style="color: rgb(91, 103, 112);">${contact.phone || 'No number'}</div>
          </div>
        `;
      });
    } else {
      html += `<p style="color: rgb(91, 103, 112);">No contacts found</p>`;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }
  /**
   * Build HTML for Activity popup
   * @param {Array} activity - List of activity records
   * @returns {string} HTML string
   */
  function buildActivityHTML(activity) {
    var html = `
      <div style="padding: 16px; font-family: Arial, sans-serif; font-size: 13px;">
        <h2 style="margin: 0 0 16px 0; color: rgb(46, 52, 56);">Activity History</h2>
        <div id="activity-list" style="max-height: 500px; overflow-y: auto;">
    `;

    if (activity && activity.length > 0) {
      activity.forEach(function(item) {
        html += `
          <div style="padding: 8px; border-bottom: 1px solid rgb(232, 232, 232);">
            <div style="font-weight: bold; color: rgb(35, 124, 169);">${item.type || 'Call'}</div>
            <div style="color: rgb(91, 103, 112); font-size: 12px;">${item.date || 'N/A'}</div>
            <div style="color: rgb(46, 52, 56); margin-top: 4px;">${item.description || 'No details'}</div>
          </div>
        `;
      });
    } else {
      html += `<p style="color: rgb(91, 103, 112);">No activity found</p>`;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Open a popup window with custom HTML content
   * @param {string} html - HTML content to display
   * @param {string} title - Window title
   * @param {number} width - Window width in pixels
   * @param {number} height - Window height in pixels
   */
  function openPopupWindow(html, title, width, height) {
    var popup = window.open("", title,
      "width=" + width + ",height=" + height + ",resizable=yes,scrollbars=yes");

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `);
      popup.document.close();
    }
  }
  /**
   * Display a notification toast
   * @param {string} message - Notification message
   * @param {string} type - 'info', 'success', 'error', 'warning'
   */
  function showNotification(message, type) {
    // Simple toast notification (requires separate notification CSS)
    var bgColor = {
      'info': 'rgb(35, 124, 169)',
      'success': 'rgb(80, 125, 44)',
      'error': 'rgb(196, 15, 60)',
      'warning': 'rgb(242, 142, 44)'
    }[type] || 'rgb(91, 103, 112)';

    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      background-color: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 13px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 3000);
  }
});
```

#### Step 2: Add CSS for Custom Components

In `css/five9-adt-theme.css`, add styling for the new buttons to match the existing menu:
```css
/* ============================================================================
   CUSTOM COMPONENTS - Address Book, Messages, Activity
   ============================================================================ */

/* Component container */
#address-book-comp,
#messages-comp,
#activity-comp {
  padding: 0;
  margin: 0;
}

/* Custom component buttons */
[id*="-btn"] {
  display: flex;
  align-items: center;
  padding: 0 8px;
  height: 32px;
  background-color: transparent;
  color: var(--color-text-primary);
  border: none;
  border-bottom: 1px solid var(--color-gray-400);
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

[id*="-btn"]:hover {
  background-color: var(--color-gray-300);
  color: rgb(34, 121, 165);
}

[id*="-btn"] i {
  margin-right: 8px;
  font-size: 12px;
}
/* Address Book button */
#address-book-btn::before {
  content: "\f02d"; /* fa-book */
  font-family: FontAwesome;
  margin-right: 8px;
}

/* Messages button */
#messages-btn::before {
  content: "\f075"; /* fa-comment */
  font-family: FontAwesome;
  margin-right: 8px;
}

/* Activity button */
#activity-btn::before {
  content: "\f1da"; /* fa-history */
  font-family: FontAwesome;
  margin-right: 8px;
}
```

#### Step 3: Verify Component Registration

1. Deploy updated `js/five9-adt-loader.js` to GitHub Pages
2. Reload ADT and open browser DevTools (F12)
3. Check Console for message: "Custom components registered successfully"
4. Inspect the DOM and verify buttons appear in `#3rdPartyComp-home-panel-bottom`
5. Click each button to verify callbacks fire

---

## Five9 REST API Reference

When building popups and fetching data, use Five9's REST API. Common endpoints:
| Endpoint | Method | Purpose | Example Response |
|----------|--------|---------|------------------|
| `/contacts` | GET | Fetch contact directory | `[{id: 123, name: "John Doe", phone: "555-1234"}]` |
| `/campaigns` | GET | List available campaigns | `[{id: 1, name: "Sales"}]` |
| `/queues` | GET | Queue statistics | `[{id: 1, name: "Sales Queue", calls: 5}]` |
| `/agents/self/status` | GET | Current agent status | `{status: "Ready", skills: ["Sales", "Support"]}` |
| `/agents/self/skills` | GET | Agent skills list | `[{name: "Sales"}, {name: "Support"}]` |
| `/voicemails` | GET | Voicemail list | `[{id: 1, from: "555-1234", date: "2026-03-31"}]` |
| `/calls` | GET | Active calls | `[{id: 1, duration: 120, ani: "555-1234"}]` |

**Note**: Actual endpoints and authentication may differ. Consult your Five9 REST API documentation for exact paths and auth headers.

---

## CRM SDK Reference

Key methods available via `Five9.CrmSdk`:

```javascript
// Component Registration
Five9.CrmSdk.registerCustomComponents(componentDefinitions);

// Hook Registration (for events)
Five9.CrmSdk.hookApi().registerHook("callStarted", callback);
Five9.CrmSdk.hookApi().registerHook("callFinished", callback);

// Data Access
Five9.CrmSdk.getAgentStatus()        // Get current agent status
Five9.CrmSdk.getAgentInfo()          // Get agent details
Five9.CrmSdk.getActiveCall()         // Get current call info
Five9.CrmSdk.getAgentSkills()        // Get agent skills

// State Management
Five9.CrmSdk.setAgentState(state)    // Change agent status
```

---

## Deliverables

After completing custom component implementation:

1. **Updated `js/five9-adt-loader.js`**
   - Component definitions with templates
   - Callback functions
   - REST API integration
   - Popup windows

2. **Updated `css/five9-adt-theme.css`**
   - Styling for custom buttons
   - Icon display (Font Awesome)
   - Hover and active states

3. **Test Report**
   - Screenshot showing new buttons in ADT
   - Click test results (do buttons open popups?)
   - Console message verification
   - Any API integration issues

---

## Testing Checklist

Before considering Phase 3 complete:

- [ ] Address Book button appears in home panel
- [ ] Messages button appears in home panel
- [ ] Activity button appears in home panel
- [ ] All buttons use correct Font Awesome icons
- [ ] All buttons have proper hover styling
- [ ] Click on each button triggers callback
- [ ] Popups open with correct title and size
- [ ] No JavaScript errors in console
- [ ] Custom components styled to match menu items
- [ ] Icons align properly with button text

---

## Notes for Next Phase

Once custom components are working, Phase 4 will enhance the stats panel:
- Real-time stats via REST API
- ACD status bar with queue metrics
- Live stat updates

See `03-stats-and-status-bar.md` for next steps.
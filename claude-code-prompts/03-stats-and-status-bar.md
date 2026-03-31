# Prompt: Stats and Status Bar Enhancement for ADT-to-ADP Customization

## Context

You are enhancing the Five9 ADT statistics panel and footer to match ADP's comprehensive ACD (Automatic Call Distribution) status bar. This phase adds real-time queue metrics and agent statistics.

**Current Status**: Phase 4 - Custom components are in place. Now we populate stats with live data from Five9 REST API.

**Project Files**:
- JavaScript Loader: `js/five9-adt-loader.js` (add stats updates here)
- CSS Theme: `css/five9-adt-theme.css` (styling for stats)
- DOM Reference: `DOM_MAPPING.md`

---

## ADT Stats Structure Overview

ADT has a footer area with existing stats that we'll enhance:

```
┌─────────────────────────────┐
│ Current ADT Footer:         │
├─────────────────────────────┤
│ Station: 12345 | 2:45 PM ▼  │  .agent-station-status-bar
└─────────────────────────────┘

Target ADP ACD Status Bar:
┌───────────────────────────────────────┐
│ My Skills: 3  Calls: 5  Callbacks: 2  │
│ Voicemails: 1  Longest Wait: 3:45     │
│ [Details ▼] Station: 12345 | 2:45 PM  │
└───────────────────────────────────────┘
```
**Current ADT CSS Classes**:
- `.footer` - Footer container
- `.agent-station-status-bar` - Station ID and status display
- `.connectivity-status-bar` - Network connectivity indicator
- `.agent-stats-cell` - Individual stat element (if exists)
- `.agent-stat-value` - Stat numeric value
- `.agent-stat-title` - Stat label/title

---

## ADP ACD Status Bar Content

ADP's status bar displays these metrics (left to right):

| Metric | Source | Update Frequency | Example |
|--------|--------|------------------|---------|
| **My Skills** | `/agents/self/skills` endpoint | On load, every 60s | "My Skills: 3" |
| **Calls** | `/queues` endpoint | Every 5-10s (real-time) | "Calls: 5" |
| **Callbacks** | `/callbacks` endpoint | Every 30s | "Callbacks: 2" |
| **Voicemails** | `/voicemails` endpoint | Every 30s | "Voicemails: 1" |
| **Longest Wait** | `/queues/longest-wait` endpoint | Every 5-10s | "Longest Wait: 3:45" |
| **[Details ▼]** | Toggle button | N/A | Expands/collapses bar |
| **Station ID** | `.agent-station-status-bar` (existing) | Static | "Station: 12345" |
| **Time** | JavaScript timer | Every 1s | "2:45 PM" |

---

## Five9 REST API Endpoints

### Agent Skills

**Endpoint**: `GET /agents/self/skills`

**Response**:
```json
{
  "skills": [
    {"id": 1, "name": "Sales"},
    {"id": 2, "name": "Support"},
    {"id": 3, "name": "Billing"}
  ]
}
```

**Update Strategy**: Fetch on initialization, update every 60 seconds (skills rarely change).
### Queue Statistics

**Endpoint**: `GET /queues`

**Response**:
```json
{
  "queues": [
    {
      "id": 1,
      "name": "Sales Queue",
      "activeCalls": 5,
      "queuedCalls": 3,
      "longestWaitTime": 180,
      "callbacksWaiting": 2
    }
  ]
}
```

**Update Strategy**: Fetch every 5-10 seconds (real-time metrics).

### Voicemail Count

**Endpoint**: `GET /voicemails`

**Response**:
```json
{
  "voicemails": [
    {"id": 1, "from": "555-1234", "date": "2026-03-31T10:30:00Z"},
    {"id": 2, "from": "555-5678", "date": "2026-03-31T11:15:00Z"}
  ],
  "count": 2
}
```

**Update Strategy**: Fetch every 30 seconds.
### Callbacks Waiting

**Endpoint**: `GET /callbacks`

**Response**:
```json
{
  "callbacks": [
    {"id": 1, "contactNumber": "555-1234", "scheduledTime": "2026-03-31T14:00:00Z"},
    {"id": 2, "contactNumber": "555-5678", "scheduledTime": "2026-03-31T15:30:00Z"}
  ],
  "count": 2
}
```

**Update Strategy**: Fetch every 30 seconds.

---

## HTML Structure for Enhanced Status Bar

```html
<!-- Enhanced footer with stats -->
<div class="footer">
  <!-- Stats section (collapsible) -->
  <div id="acd-stats-section" class="acd-stats-section">
    <div id="acd-stats-content" class="acd-stats-content">
      <!-- Stats items will be inserted here -->
      <span class="stat-item">
        <span class="stat-title">My Skills:</span>
        <span class="stat-value" id="stat-skills">3</span>
      </span>
      <span class="stat-separator">|</span>
      <span class="stat-item">
        <span class="stat-title">Calls:</span>
        <span class="stat-value" id="stat-calls">5</span>
      </span>
      <!-- More stats... -->
    </div>
    <button id="stats-toggle-btn" class="stats-toggle" title="Toggle stats">
      <i class="fa fa-chevron-down"></i>
    </button>
  </div>

  <!-- Existing station/time section -->
  <div class="agent-station-status-bar">
    <span id="station-display">Station: 12345</span>
  </div>
  <div class="time-display" id="time-display">2:45 PM</div>
</div>
```---

## CSS for Enhanced Status Bar

Add to `css/five9-adt-theme.css`:

```css
/* ============================================================================
   ACD STATS SECTION - Status Bar Enhancement
   ============================================================================ */

.acd-stats-section {
  display: flex;
  align-items: center;
  padding: 0 8px;
  background-color: var(--color-gray-100);
  border-right: 1px solid var(--color-gray-400);
  flex: 1;
  height: 100%;
}

.acd-stats-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-family: var(--font-family-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

.acd-stats-content.collapsed {
  display: none;
}
.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.stat-title {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: bold;
  color: var(--color-text-primary);
}

.stat-separator {
  color: var(--color-gray-400);
  margin: 0 4px;
}

.stats-toggle {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0 4px;
  font-size: var(--font-size-base);
  transition: color 0.2s;
}

.stats-toggle:hover {
  color: var(--color-teal);
}

.stats-toggle.expanded i {
  transform: rotate(180deg);
  transition: transform 0.2s;
}
/* Footer layout adjustment for stats */
.footer {
  display: flex;
  align-items: center;
  height: 32px;
  background-color: var(--color-gray-100);
  border-top: 1px solid var(--color-gray-400);
  padding: 0;
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  color: var(--color-text-secondary);
}

.footer .agent-station-status-bar {
  flex: 0 0 auto;
  padding: 0 8px;
  border-left: 1px solid var(--color-gray-400);
  height: 100%;
  display: flex;
  align-items: center;
}

.footer .time-display {
  flex: 0 0 auto;
  padding: 0 8px;
  text-align: right;
  height: 100%;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--color-gray-400);
}
```---

## JavaScript Implementation for Stats

Add to `js/five9-adt-loader.js`:

```javascript
define(["five9"], function(Five9) {
  var sdk = Five9.CrmSdk;

  // ===== STATS AND STATUS BAR =====

  /**
   * Initialize stats section in footer
   * Call this after DOM is ready
   */
  function initializeStatsBar() {
    console.log("Initializing ACD stats bar...");

    // Create stats section in footer
    var footer = document.querySelector(".footer");
    if (!footer) {
      console.warn("Footer not found");
      return;
    }

    // Insert stats section before existing station/time
    var statsSection = document.createElement("div");
    statsSection.id = "acd-stats-section";
    statsSection.className = "acd-stats-section";
    statsSection.innerHTML = `
      <div id="acd-stats-content" class="acd-stats-content">
        <span class="stat-item">
          <span class="stat-title">My Skills:</span>
          <span class="stat-value" id="stat-skills">-</span>
        </span>        <span class="stat-separator">|</span>
        <span class="stat-item">
          <span class="stat-title">Calls:</span>
          <span class="stat-value" id="stat-calls">-</span>
        </span>
        <span class="stat-separator">|</span>
        <span class="stat-item">
          <span class="stat-title">Callbacks:</span>
          <span class="stat-value" id="stat-callbacks">-</span>
        </span>
        <span class="stat-separator">|</span>
        <span class="stat-item">
          <span class="stat-title">Voicemails:</span>
          <span class="stat-value" id="stat-voicemails">-</span>
        </span>
        <span class="stat-separator">|</span>
        <span class="stat-item">
          <span class="stat-title">Longest Wait:</span>
          <span class="stat-value" id="stat-longest-wait">-</span>
        </span>
      </div>
      <button id="stats-toggle-btn" class="stats-toggle" title="Toggle stats">
        <i class="fa fa-chevron-down"></i>
      </button>
    `;

    // Insert before station status bar
    var stationBar = footer.querySelector(".agent-station-status-bar");
    if (stationBar) {
      footer.insertBefore(statsSection, stationBar);
    } else {
      footer.appendChild(statsSection);
    }

    // Wire up toggle button
    var toggleBtn = document.getElementById("stats-toggle-btn");
    var statsContent = document.getElementById("acd-stats-content");

    if (toggleBtn && statsContent) {
      toggleBtn.addEventListener("click", function() {
        statsContent.classList.toggle("collapsed");
        toggleBtn.classList.toggle("expanded");
      });
    }

    // Start periodic updates
    updateStatsBar();
    setInterval(updateStatsBar, 5000); // Update every 5 seconds
  }
  /**
   * Fetch and update all stats in the status bar
   */
  function updateStatsBar() {
    console.log("Updating stats bar...");

    // Fetch all stats in parallel
    Promise.all([
      fetchAgentSkills(),
      fetchQueueStats(),
      fetchCallbacks(),
      fetchVoicemails()
    ])
      .then(function(results) {
        var skills = results[0];
        var queueStats = results[1];
        var callbacks = results[2];
        var voicemails = results[3];

        // Update DOM with stats
        if (skills !== null) {
          var skillCount = skills.skills ? skills.skills.length : 0;
          document.getElementById("stat-skills").textContent = skillCount;
        }

        if (queueStats && queueStats.queues && queueStats.queues.length > 0) {
          var totalCalls = queueStats.queues.reduce(function(sum, q) {
            return sum + (q.activeCalls || 0);
          }, 0);
          document.getElementById("stat-calls").textContent = totalCalls;

          var longestWait = queueStats.queues.reduce(function(max, q) {
            return Math.max(max, q.longestWaitTime || 0);
          }, 0);
          document.getElementById("stat-longest-wait").textContent =
            formatSeconds(longestWait);
        }

        if (callbacks !== null) {
          var callbackCount = callbacks.callbacks ? callbacks.callbacks.length : 0;
          document.getElementById("stat-callbacks").textContent = callbackCount;
        }

        if (voicemails !== null) {
          var vmCount = voicemails.voicemails ? voicemails.voicemails.length : 0;
          document.getElementById("stat-voicemails").textContent = vmCount;
        }
      })
      .catch(function(err) {
        console.error("Error updating stats:", err);
      });
  }
  /**
   * Fetch agent skills via REST API
   * @returns Promise<Object> Skills data
   */
  function fetchAgentSkills() {
    return fetch("/api/agents/self/skills", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch skills: " + response.status);
      })
      .catch(function(err) {
        console.warn("Error fetching skills:", err);
        return null;
      });
  }

  /**
   * Fetch queue statistics via REST API
   * @returns Promise<Object> Queue stats data
   */
  function fetchQueueStats() {
    return fetch("/api/queues", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch queue stats: " + response.status);
      })
      .catch(function(err) {
        console.warn("Error fetching queue stats:", err);
        return null;
      });
  }

  /**
   * Fetch pending callbacks via REST API
   * @returns Promise<Object> Callbacks data
   */
  function fetchCallbacks() {
    return fetch("/api/callbacks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch callbacks: " + response.status);
      })
      .catch(function(err) {
        console.warn("Error fetching callbacks:", err);
        return null;
      });
  }
  /**
   * Fetch voicemail count via REST API
   * @returns Promise<Object> Voicemails data
   */
  function fetchVoicemails() {
    return fetch("/api/voicemails", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Failed to fetch voicemails: " + response.status);
      })
      .catch(function(err) {
        console.warn("Error fetching voicemails:", err);
        return null;
      });
  }

  /**
   * Convert seconds to HH:MM format
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time string
   */
  function formatSeconds(seconds) {
    if (!seconds || seconds < 0) return "0:00";
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;

    if (hours > 0) {
      return hours + ":" + String(minutes).padStart(2, "0") + ":" +
             String(secs).padStart(2, "0");
    } else {
      return minutes + ":" + String(secs).padStart(2, "0");
    }
  }
  /**
   * Update time display in footer
   * Call this in a setInterval every 1 second
   */
  function updateTimeDisplay() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = String(now.getMinutes()).padStart(2, "0");
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;

    var timeDisplay = document.getElementById("time-display");
    if (timeDisplay) {
      timeDisplay.textContent = hours + ":" + minutes + " " + ampm;
    }
  }

  // ===== INITIALIZATION =====

  // Initialize stats bar when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initializeStatsBar();
    });
  } else {
    // DOM already loaded
    initializeStatsBar();
  }

  // Update time display every second
  setInterval(updateTimeDisplay, 1000);
});
```---

## Enhanced Status Bar Layout

After implementation, the footer will look like:

```
┌─────────────────────────────────────────────────────────┐
│ My Skills: 3 │ Calls: 5 │ Callbacks: 2 │ Voicemails: 1 │  [▼]
│ Longest Wait: 3:45 │ Station: 12345 │ 2:45 PM           │
└─────────────────────────────────────────────────────────┘
```

When the toggle button [▼] is clicked, the stats section collapses:

```
┌──────────────────────────────────────┐
│ [▲] │ Station: 12345 │ 2:45 PM       │
└──────────────────────────────────────┘
```

---

## API Integration Considerations

### Authentication

Five9 REST API requires authentication (typically OAuth 2.0 or Bearer token). Ensure:

1. Requests include proper `Authorization` header
2. Token is refreshed before expiry
3. Error handling for 401 (Unauthorized) responses

**Example with Authorization**:
```javascript
fetch("/api/agents/self/skills", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_ACCESS_TOKEN"
  }
})
```
### CORS Considerations

If Five9 API is on a different domain, ensure CORS headers allow requests from ADT iframe. Check:

1. `Access-Control-Allow-Origin` header includes ADT domain
2. `Access-Control-Allow-Methods` includes "GET"
3. Proxy or Same-Origin Policy allows the request

### Error Handling

Implement graceful degradation if APIs are unavailable:

```javascript
.catch(function(err) {
  console.warn("Error fetching stats:", err);
  // Set stat to "-" or "N/A"
  document.getElementById("stat-skills").textContent = "-";
})
```

---

## Testing Checklist

Before considering Phase 4 complete:

- [ ] Stats section appears in footer
- [ ] "My Skills" count displays and updates
- [ ] "Calls" count displays and updates
- [ ] "Callbacks" count displays and updates
- [ ] "Voicemails" count displays and updates
- [ ] "Longest Wait" displays in HH:MM format
- [ ] Time display updates every second
- [ ] Toggle button [▼] collapses/expands stats
- [ ] No API errors in browser console
- [ ] Stats update every 5 seconds (check network tab)
- [ ] Station ID displays correctly
- [ ] Footer layout is balanced and readable
---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Stats show "-" or "N/A" | API endpoints return 404 | Verify endpoint paths match your Five9 instance |
| No updates | Interval not running | Check setInterval is called and not blocked |
| Time not updating | Timer conflict | Ensure only one timer for time display |
| CORS error | Cross-origin request blocked | Add proxy or check CORS headers on API |
| Authentication error | Missing or invalid token | Verify Bearer token in Authorization header |

---

## Notes for Next Phase

Once stats are displaying correctly, Phase 5 will add event notifications:
- Hook into callStarted, callFinished, chatStarted events
- Display toast notifications
- Play audio alerts

See `04-notification-system.md` for next steps.
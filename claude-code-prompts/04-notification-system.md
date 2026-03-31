# Prompt: Notification System for ADT-to-ADP Customization

## Context

You are building a real-time notification system for the Five9 ADT-to-ADP theme that mimics ADP's toast notifications and event alerts. This phase uses Five9's HookApi to subscribe to agent and call events.

**Current Status**: Phase 5 - Stats are displaying. Now we add event-driven notifications.

**Project Files**:
- JavaScript Loader: `js/five9-adt-loader.js` (add notification hooks here)
- CSS Theme: `css/five9-adt-theme.css` (notification styles)
- DOM Reference: `DOM_MAPPING.md`

---

## ADT HookApi Overview

Five9's HookApi allows you to subscribe to agent, call, and system events. When an event fires, your callback function is invoked with event data.

### Hook Registration Pattern

```javascript
// Via Five9.CrmSdk
var hookApi = Five9.CrmSdk.hookApi();

hookApi.registerHook("eventName", function(eventData) {
  console.log("Event fired:", eventData);
  // Handle the event
});
```

### Available Events

| Event | Trigger | Event Data | Use Case |
|-------|---------|-----------|----------|
| `callStarted` | New inbound/outbound call begins | `{callId, ani, dnis, skill}` | Show incoming call notification |
| `callFinished` | Call ends or is transferred | `{callId, duration, disposition}` | Show call ended notification |
| `callOnHold` | Call placed on hold | `{callId}` | Notify user of hold state |
| `callResumed` | Call resumed from hold | `{callId}` | Clear hold notification || `chatStarted` | New chat message received | `{chatId, from, message}` | Show chat notification |
| `chatEnded` | Chat conversation ends | `{chatId}` | Show chat ended notification |
| `voicemailReceived` | New voicemail arrives | `{voicemailId, from, timestamp}` | Show voicemail badge |
| `callbackScheduled` | Callback created | `{callbackId, number, scheduledTime}` | Confirm callback scheduled |
| `agentNotReady` | Agent status changes to Not Ready | `{reason, duration}` | Show not ready notification |
| `agentReady` | Agent status changes to Ready | `{}` | Show ready notification |
| `agentOffHook` | Agent goes off-hook (available for calls) | `{}` | Update availability state |
| `agentOnHook` | Agent goes on-hook (unavailable) | `{}` | Update availability state |

---

## Notification Types & Styling

ADP displays notifications as toast messages at the bottom-right of the screen. There are 4 types:

### 1. Incoming Call Notification

**Trigger**: `callStarted` event

**Appearance**:
```
┌────────────────────────────┐
│ 📞 Incoming Call           │
│ From: 555-1234             │
│ Skill: Sales               │
│ [Answer] [Reject]          │
└────────────────────────────┘
```

**Duration**: 10 seconds or until user action

### 2. Call Ended Notification

**Trigger**: `callFinished` event

**Appearance**:
```
┌────────────────────────────┐
│ ✓ Call Ended               │
│ Duration: 2:45             │
│ Disposition: Completed     │
└────────────────────────────┘
```

**Duration**: 3 seconds

### 3. New Message Notification

**Trigger**: `chatStarted` event

**Appearance**:
```
┌────────────────────────────┐
│ 💬 New Message             │
│ From: John Doe             │
│ "Hello, I have a question" │
│ [View]                     │
└────────────────────────────┘
```

**Duration**: 5 seconds or click to dismiss

### 4. Voicemail Notification

**Trigger**: `voicemailReceived` event

**Appearance**:
```
┌────────────────────────────┐
│ 📧 New Voicemail           │
│ From: 555-9876             │
│ [Listen]                   │
└────────────────────────────┘
```

**Duration**: 5 seconds### 5. Error/Alert Notification

**Trigger**: API error or system alert

**Appearance**:
```
┌────────────────────────────┐
│ ⚠️  Error                   │
│ Failed to fetch contacts   │
│ Please try again           │
└────────────────────────────┘
```

**Duration**: 5 seconds

---

## HTML Structure for Notifications

```html
<!-- Notification container (fixed position) -->
<div id="notification-container" class="notification-container">
  <!-- Notifications inserted here dynamically -->
  <div class="notification" id="notif-1234" data-type="incoming-call">
    <div class="notification-icon">
      <i class="fa fa-phone"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">Incoming Call</div>
      <div class="notification-message">From: 555-1234 | Sales</div>
    </div>
    <div class="notification-actions">
      <button class="notif-btn notif-btn-primary" data-action="answer">
        Answer
      </button>
      <button class="notif-btn notif-btn-secondary" data-action="reject">
        Reject
      </button>
    </div>
    <button class="notification-close">×</button>
  </div>
</div>
```

---

## CSS for Notification System

Add to `css/five9-adt-theme.css`:

```css
/* ============================================================================
   NOTIFICATION SYSTEM - Toast Notifications
   ============================================================================ */

.notification-container {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 10000;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none; /* Allow clicks to pass through container */
}.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-400);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  pointer-events: auto; /* Re-enable clicks on notification */
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.notification.removing {
  animation: slideOut 0.3s ease-out;
}

/* Notification icon */
.notification-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
}

/* Type-specific icon colors */
.notification[data-type="incoming-call"] .notification-icon {
  background-color: rgb(35, 124, 169); /* Teal */
  color: white;
}.notification[data-type="call-ended"] .notification-icon {
  background-color: rgb(80, 125, 44); /* Green */
  color: white;
}

.notification[data-type="new-message"] .notification-icon {
  background-color: rgb(35, 124, 169); /* Teal */
  color: white;
}

.notification[data-type="voicemail"] .notification-icon {
  background-color: rgb(91, 103, 112); /* Gray */
  color: white;
}

.notification[data-type="error"] .notification-icon {
  background-color: rgb(196, 15, 60); /* Red */
  color: white;
}

.notification[data-type="warning"] .notification-icon {
  background-color: rgb(242, 142, 44); /* Orange */
  color: white;
}

.notification[data-type="success"] .notification-icon {
  background-color: rgb(80, 125, 44); /* Green */
  color: white;
}

/* Notification content */
.notification-content {
  flex: 1;
  min-width: 0; /* Allow text truncation */
}

.notification-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.notification-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Notification actions */
.notification-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.notif-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 3px;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 500;
  flex: 1;
  min-width: 60px;
}.notif-btn-primary {
  background-color: var(--color-teal);
  color: white;
}

.notif-btn-primary:hover {
  background-color: rgb(30, 110, 150);
}

.notif-btn-secondary {
  background-color: var(--color-gray-300);
  color: var(--color-text-primary);
}

.notif-btn-secondary:hover {
  background-color: var(--color-gray-400);
}

/* Close button */
.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notification-close:hover {
  color: var(--color-text-primary);
}

/* Badge for notification count */
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-red-danger);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

---

## JavaScript Implementation for Notifications

Add to `js/five9-adt-loader.js`:

```javascript
define(["five9"], function(Five9) {
  var sdk = Five9.CrmSdk;
  var hookApi = sdk.hookApi ? sdk.hookApi() : null;  // ===== NOTIFICATION SYSTEM =====

  /**
   * Initialize notification container and hook handlers
   */
  function initializeNotifications() {
    console.log("Initializing notification system...");

    // Create notification container if it doesn't exist
    if (!document.getElementById("notification-container")) {
      var container = document.createElement("div");
      container.id = "notification-container";
      container.className = "notification-container";
      document.body.appendChild(container);
    }

    // Register all hooks
    if (hookApi) {
      registerHooks();
    } else {
      console.warn("HookApi not available");
    }
  }

  /**
   * Register event hooks with HookApi
   */
  function registerHooks() {
    console.log("Registering event hooks...");

    // Call events
    if (hookApi.registerHook) {
      hookApi.registerHook("callStarted", onCallStarted);
      hookApi.registerHook("callFinished", onCallFinished);
      hookApi.registerHook("callOnHold", onCallOnHold);
      hookApi.registerHook("callResumed", onCallResumed);      // Chat events
      hookApi.registerHook("chatStarted", onChatStarted);
      hookApi.registerHook("chatEnded", onChatEnded);

      // Voicemail events
      hookApi.registerHook("voicemailReceived", onVoicemailReceived);

      // Callback events
      hookApi.registerHook("callbackScheduled", onCallbackScheduled);

      // Agent status events
      hookApi.registerHook("agentNotReady", onAgentNotReady);
      hookApi.registerHook("agentReady", onAgentReady);

      console.log("Hooks registered successfully");
    }
  }

  // ===== EVENT HANDLERS =====

  /**
   * Handle incoming call
   */
  function onCallStarted(eventData) {
    console.log("callStarted event:", eventData);

    var ani = eventData.ani || "Unknown";
    var skill = eventData.skill || "General";
    var callId = eventData.callId;

    showNotification({
      type: "incoming-call",
      icon: "fa-phone",
      title: "Incoming Call",
      message: "From: " + ani + " | " + skill,
      duration: 10000, // 10 seconds
      actions: [        {
          label: "Answer",
          action: "answer",
          primary: true,
          onClick: function() {
            console.log("Answered call:", callId);
            // Trigger answer action via CRM SDK
            if (sdk.answerCall) {
              sdk.answerCall(callId);
            }
          }
        },
        {
          label: "Reject",
          action: "reject",
          primary: false,
          onClick: function() {
            console.log("Rejected call:", callId);
            // Trigger reject action
            if (sdk.rejectCall) {
              sdk.rejectCall(callId);
            }
          }
        }
      ]
    });

    // Optional: Play audio alert
    playAudioAlert("call");
  }

  /**
   * Handle call finished
   */
  function onCallFinished(eventData) {
    console.log("callFinished event:", eventData);

    var duration = eventData.duration || 0;
    var disposition = eventData.disposition || "No disposition";

    showNotification({
      type: "call-ended",
      icon: "fa-check-circle",
      title: "Call Ended",
      message: "Duration: " + formatSeconds(duration) + " | " + disposition,
      duration: 3000 // 3 seconds
    });
  }  /**
   * Handle call on hold
   */
  function onCallOnHold(eventData) {
    console.log("callOnHold event:", eventData);

    showNotification({
      type: "info",
      icon: "fa-pause-circle",
      title: "Call On Hold",
      message: "Caller is on hold",
      duration: 2000
    });
  }

  /**
   * Handle call resumed
   */
  function onCallResumed(eventData) {
    console.log("callResumed event:", eventData);

    showNotification({
      type: "success",
      icon: "fa-play-circle",
      title: "Call Resumed",
      message: "You are back on the call",
      duration: 2000
    });
  }

  /**
   * Handle new chat message
   */
  function onChatStarted(eventData) {
    console.log("chatStarted event:", eventData);

    var from = eventData.from || "Unknown";
    var message = eventData.message || "(No message)";

    showNotification({
      type: "new-message",
      icon: "fa-comment",
      title: "New Message",
      message: "From: " + from + " | " + message,
      duration: 5000,
      actions: [        {
          label: "View",
          action: "view",
          primary: true,
          onClick: function() {
            console.log("Viewing chat from:", from);
            // Navigate to chat panel
            if (sdk.navigateToChat) {
              sdk.navigateToChat(eventData.chatId);
            }
          }
        }
      ]
    });

    playAudioAlert("message");
  }

  /**
   * Handle chat ended
   */
  function onChatEnded(eventData) {
    console.log("chatEnded event:", eventData);

    showNotification({
      type: "info",
      icon: "fa-comment-o",
      title: "Chat Ended",
      message: "Chat conversation closed",
      duration: 2000
    });
  }

  /**
   * Handle new voicemail
   */
  function onVoicemailReceived(eventData) {
    console.log("voicemailReceived event:", eventData);

    var from = eventData.from || "Unknown";

    showNotification({
      type: "voicemail",
      icon: "fa-envelope",
      title: "New Voicemail",
      message: "From: " + from,
      duration: 5000,
      actions: [        {
          label: "Listen",
          action: "listen",
          primary: true,
          onClick: function() {
            console.log("Playing voicemail from:", from);
            // Trigger voicemail playback
            if (sdk.playVoicemail) {
              sdk.playVoicemail(eventData.voicemailId);
            }
          }
        }
      ]
    });

    playAudioAlert("voicemail");
  }

  /**
   * Handle callback scheduled
   */
  function onCallbackScheduled(eventData) {
    console.log("callbackScheduled event:", eventData);

    var number = eventData.number || "Unknown";
    var time = eventData.scheduledTime || "Later";

    showNotification({
      type: "success",
      icon: "fa-calendar",
      title: "Callback Scheduled",
      message: "Number: " + number + " | Time: " + time,
      duration: 3000
    });
  }

  /**
   * Handle agent not ready
   */
  function onAgentNotReady(eventData) {
    console.log("agentNotReady event:", eventData);

    var reason = eventData.reason || "User";

    showNotification({
      type: "warning",
      icon: "fa-clock-o",
      title: "Not Ready",
      message: "Reason: " + reason,
      duration: 3000
    });
  }  /**
   * Handle agent ready
   */
  function onAgentReady(eventData) {
    console.log("agentReady event:", eventData);

    showNotification({
      type: "success",
      icon: "fa-check",
      title: "Ready",
      message: "You are now ready to receive calls",
      duration: 2000
    });
  }

  // ===== NOTIFICATION DISPLAY =====

  /**
   * Display a toast notification
   * @param {Object} options - Notification options
   *   - type: notification type (incoming-call, call-ended, new-message, voicemail, error, warning, success, info)
   *   - icon: Font Awesome icon class
   *   - title: Notification title
   *   - message: Notification message
   *   - duration: Auto-hide duration in ms (0 = manual)
   *   - actions: Array of action buttons
   */
  function showNotification(options) {
    var container = document.getElementById("notification-container");
    if (!container) {
      console.warn("Notification container not found");
      return;
    }

    var notificationId = "notif-" + Date.now();

    // Build notification HTML
    var html = `
      <div class="notification" id="${notificationId}" data-type="${options.type}">
        <div class="notification-icon">
          <i class="fa ${options.icon}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">${escapeHtml(options.title)}</div>
          <div class="notification-message">${escapeHtml(options.message)}</div>
    `;

    // Add action buttons if provided
    if (options.actions && options.actions.length > 0) {
      html += '<div class="notification-actions">';
      options.actions.forEach(function(action) {
        var btnClass = action.primary ? "notif-btn-primary" : "notif-btn-secondary";
        html += `
          <button class="notif-btn ${btnClass}" data-action="${action.action}">
            ${escapeHtml(action.label)}
          </button>
        `;
      });
      html += '</div>';
    }    html += `
        </div>
        <button class="notification-close">×</button>
      </div>
    `;

    // Insert notification into container
    container.insertAdjacentHTML("beforeend", html);
    var notificationEl = document.getElementById(notificationId);

    // Wire up action buttons
    if (options.actions) {
      options.actions.forEach(function(action) {
        var btn = notificationEl.querySelector(`[data-action="${action.action}"]`);
        if (btn) {
          btn.addEventListener("click", function() {
            if (action.onClick) {
              action.onClick();
            }
            removeNotification(notificationId);
          });
        }
      });
    }

    // Wire up close button
    var closeBtn = notificationEl.querySelector(".notification-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function() {
        removeNotification(notificationId);
      });
    }

    // Auto-remove after duration
    if (options.duration && options.duration > 0) {
      setTimeout(function() {
        removeNotification(notificationId);
      }, options.duration);
    }
  }

  /**
   * Remove a notification with animation
   * @param {string} notificationId - ID of notification to remove
   */
  function removeNotification(notificationId) {
    var notificationEl = document.getElementById(notificationId);
    if (!notificationEl) return;

    notificationEl.classList.add("removing");
    setTimeout(function() {
      notificationEl.remove();
    }, 300); // Match slideOut animation duration
  }  /**
   * Play audio alert for notification
   * @param {string} type - Alert type (call, message, voicemail, etc.)
   */
  function playAudioAlert(type) {
    // Use Web Audio API or preloaded audio files
    // This is a placeholder - implement based on your audio assets

    console.log("Playing audio alert:", type);

    // Example: Use HTMLAudioElement with preloaded audio
    var audioUrl = "/audio/notifications/" + type + "-alert.mp3";

    try {
      var audio = new Audio(audioUrl);
      audio.volume = 0.5;
      audio.play().catch(function(err) {
        console.warn("Failed to play audio alert:", err);
      });
    } catch (err) {
      console.warn("Error playing audio:", err);
    }
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  /**
   * Format seconds to HH:MM:SS
   * @param {number} seconds - Total seconds
   * @returns {string} Formatted time
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
  }  // ===== INITIALIZATION =====

  // Initialize notifications when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      initializeNotifications();
    });
  } else {
    initializeNotifications();
  }
});
```

---

## Audio Files for Alerts

To enable audio alerts, create MP3 files in your hosting:

```
/audio/notifications/
├── call-alert.mp3        (incoming call sound)
├── message-alert.mp3     (new message sound)
├── voicemail-alert.mp3   (new voicemail sound)
└── error-alert.mp3       (error sound)
```

**Note**: Ensure audio files are short (1-2 seconds) and appropriately volume-normalized.

---

## Testing Notifications

### Test callStarted Hook

1. Manually trigger the hook in browser console:
```javascript
var hookApi = Five9.CrmSdk.hookApi();
hookApi.triggerHook("callStarted", {
  callId: "call-123",
  ani: "555-1234",
  skill: "Sales"
});
```

2. Verify notification appears at bottom-right
3. Click "Answer" button and verify callback fires
4. Click "Reject" button and verify callback fires

### Test Other Hooks

Similarly, test:
- `callFinished`: Verify green success notification
- `chatStarted`: Verify message notification
- `voicemailReceived`: Verify voicemail notification
- `agentReady`: Verify ready notification

---

## Testing Checklist

Before considering Phase 5 complete:

- [ ] Notification container renders at bottom-right
- [ ] Incoming call notification shows with title, message, actions
- [ ] Answer/Reject buttons trigger callbacks
- [ ] Call ended notification shows with duration
- [ ] New message notification shows with View button
- [ ] Voicemail notification shows with Listen button
- [ ] All notifications animate in/out smoothly
- [ ] Close button dismisses notifications
- [ ] Notifications auto-dismiss after appropriate duration
- [ ] No JavaScript errors in console
- [ ] Icons display correctly (Font Awesome)
- [ ] Colors match ADP palette
- [ ] Audio alerts play (if audio files configured)
- [ ] Multiple notifications stack properly---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Notifications don't appear | Container not created | Verify initializeNotifications() runs on load |
| Hooks don't fire | HookApi not available | Check Five9 SDK loaded; verify hook names |
| Audio doesn't play | Audio files not found | Verify file paths; check audio MIME type |
| Actions don't work | Callback undefined | Verify sdk methods exist (e.g., sdk.answerCall) |
| Notifications don't auto-dismiss | Duration not set | Ensure duration option is provided in showNotification() |

---

## Enhancement Ideas

After basic notification system works, consider:

1. **Notification History**: Keep log of past notifications
2. **Notification Preferences**: Let agents choose which notifications to see
3. **Sound Preferences**: Custom volume levels or mute by type
4. **Desktop Notifications**: Use Web Notifications API for system-level alerts
5. **Notification Actions**: More sophisticated actions (transfer, voicemail-to-email, etc.)
6. **Snooze**: Allow agent to snooze notifications temporarily

---

## Notes

This completes the Five9 ADT-to-ADP theme project with all 5 phases:

1. ✓ Phase 1: CSS Theme (colors, typography, layout)
2. ✓ Phase 2: Visual Refinement (spacing, responsiveness, polish)
3. ✓ Phase 3: Custom Components (Address Book, Messages, Activity)
4. ✓ Phase 4: Stats & Status Bar (live metrics via REST API)
5. ✓ Phase 5: Notification System (event-driven toast notifications)

The customized ADT interface now closely matches ADP's appearance and functionality while maintaining ADT's lightweight, embedded-widget design.
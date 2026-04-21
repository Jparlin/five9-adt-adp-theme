/**
 * Five9 ADT to ADP Theme Loader (NEW ADT VERSION)
 *
 * Self-executing module for Five9's NEW Agent Desktop Toolkit (ADT)
 * Loads custom styling, DOM enhancements, and ADP-like custom buttons.
 *
 * Phase 2: CSS injection + theme markers
 * Phase 3: Custom buttons via DOM injection + Five9.vent navigation
 * Phase 4: Interaction history viewer (daily calls + contact search)
 *
 * NOTE: Uses IIFE pattern (not AMD define()) because Five9 loads External JS
 * via a <script> tag. Using anonymous define() conflicts with Five9's internal
 * RequireJS, causing "Mismatched anonymous define() module" errors.
 *
 * Version: 4.0.0 (Phase 4 - Interaction History)
 */

(function() {
  'use strict';

  // ============================================================================
  // Configuration & Constants
  // ============================================================================

  var CONFIG = {
    cssUrl: 'https://jparlin.github.io/five9-adt-adp-theme/css/five9-adt-theme.css',
    logPrefix: '[ADT-ADP Theme]',
    observerConfig: {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false,
      attributeOldValue: true
    },
    delayMs: {
      initialCheck: 500,
      retryDomElements: 1000,
      mutationObserver: 100
    }
  };

  var SELECTORS = {
    agentContainer: '.sfli-agent-container.sfli-flex-container',
    panelHeader: 'nav.sfli-panel-header',
    mainContainer: '.sfli-panel-main-container',
    mainPanel: '[role="main"], main',
    statsPanel: '[role="tablist"]',
    readyStatesContainer: '.sfli-ready-states',
    readyStateButton: '.sfli-ready-states .btn',
    contentInfo: '[role="contentinfo"]',
    stationButtons: '.sfli-station-buttons',
    connectivityBar: '.connectivity-status-bar',
    agentName: '.agentName',
    agentUser: '.agentUser',
    agentExtension: '.agentExtension',
    agentAvatar: '.avatar',
    homeMainButtons: '#sfli-home-main-buttons'
  };

  var CSS_CLASSES = {
    themeRoot: 'adp-theme',
    headerMarker: 'adp-header',
    mainMarker: 'adp-main',
    statsMarker: 'adp-stats',
    footerMarker: 'adp-footer',
    stateBadgeMarker: 'adp-state-badge',
    readyState: 'adp-agent-ready',
    notReadyState: 'adp-agent-not-ready',
    unknownState: 'adp-agent-unknown-state'
  };

  var state = {
    cssInjected: false,
    initialized: false,
    observers: [],
    currentAgentState: null,
    customButtonsInjected: false
  };

  // ============================================================================
  // Custom buttons to inject — wired to Five9.vent navigation events
  // ============================================================================

  var CUSTOM_BUTTONS = [
    {
      id: 'adp-address-book-btn',
      label: 'Address Book',
      icon: 'fa-book',
      event: 'navigation:dialog:openaddressbook',
      title: 'Open Address Book'
    },
    {
      id: 'adp-internal-chat-btn',
      label: 'Internal Chat',
      icon: 'fa-comments',
      event: 'navigation:dialog:open_internal_chat',
      title: 'Open Internal Chat'
    },
    {
      id: 'adp-scripts-btn',
      label: 'Scripts',
      icon: 'fa-file-text-o',
      event: 'navigation:dialog:open_script',
      title: 'Open Agent Scripts'
    },
    {
      id: 'adp-worksheet-btn',
      label: 'Worksheet',
      icon: 'fa-pencil-square-o',
      event: 'navigation:dialog:open_worksheet',
      title: 'Open Worksheet'
    },
    {
      id: 'adp-todays-calls-btn',
      label: "Today's Calls",
      icon: 'fa-clock-o',
      event: '__custom:todays_calls',
      title: "View today's interaction history"
    },
    {
      id: 'adp-contact-history-btn',
      label: 'Contact History',
      icon: 'fa-search',
      event: '__custom:contact_history',
      title: 'Search interaction history by contact'
    }
  ];

  // ============================================================================
  // Logging Utilities
  // ============================================================================

  var Logger = {
    log: function(message, data) {
      console.log(CONFIG.logPrefix + ' ' + message, data || '');
    },
    warn: function(message, data) {
      console.warn(CONFIG.logPrefix + ' ' + message, data || '');
    },
    error: function(message, error) {
      console.error(CONFIG.logPrefix + ' ' + message, error || '');
    }
  };

  // ============================================================================
  // Toast Notification System
  // ============================================================================

  function showToast(message, type, durationMs) {
    type = type || 'info';
    durationMs = durationMs || 3000;

    var colors = {
      info: 'rgb(35, 124, 169)',
      success: 'rgb(80, 125, 44)',
      error: 'rgb(196, 15, 60)',
      warning: 'rgb(242, 142, 44)'
    };

    var toast = document.createElement('div');
    toast.className = 'adp-toast adp-toast-' + type;
    toast.textContent = message;
    toast.style.cssText =
      'position:fixed;bottom:60px;right:16px;' +
      'background-color:' + (colors[type] || colors.info) + ';' +
      'color:#fff;padding:10px 16px;border-radius:4px;' +
      'z-index:99999;font-size:13px;font-family:Roboto,Arial,sans-serif;' +
      'box-shadow:0 2px 8px rgba(0,0,0,0.25);' +
      'opacity:0;transition:opacity 0.3s ease;pointer-events:none;';

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(function() {
      toast.style.opacity = '1';
    });

    // Fade out and remove
    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); }, 300);
    }, durationMs);
  }

  // ============================================================================
  // CSS Injection
  // ============================================================================

  function injectCustomCSS() {
    try {
      var existingLink = document.querySelector('link[href*="five9-adt-theme"]');
      if (existingLink) {
        Logger.log('Custom CSS already injected, skipping...');
        state.cssInjected = true;
        return true;
      }

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = CONFIG.cssUrl;
      link.id = 'five9-adt-theme-css';

      link.onerror = function() {
        Logger.warn('Failed to load CSS from ' + CONFIG.cssUrl);
      };
      link.onload = function() {
        Logger.log('Custom CSS loaded successfully');
        state.cssInjected = true;
      };

      document.head.appendChild(link);
      return true;
    } catch (error) {
      Logger.error('Failed to inject custom CSS', error);
      return false;
    }
  }

  // ============================================================================
  // Theme Marker Classes
  // ============================================================================

  function applyThemeMarkerClasses() {
    var count = 0;
    try {
      if (document.body) {
        document.body.classList.add(CSS_CLASSES.themeRoot);
        count++;
      }
      var header = document.querySelector(SELECTORS.panelHeader);
      if (header) { header.classList.add(CSS_CLASSES.headerMarker); count++; }

      var mainPanel = document.querySelector(SELECTORS.mainPanel);
      if (mainPanel) { mainPanel.classList.add(CSS_CLASSES.mainMarker); count++; }

      var footer = document.querySelector(SELECTORS.contentInfo);
      if (footer) { footer.classList.add(CSS_CLASSES.footerMarker); count++; }

      Logger.log('Theme markers applied: ' + count + ' elements');
      return count > 0;
    } catch (error) {
      Logger.error('Error applying theme markers', error);
      return false;
    }
  }

  // ============================================================================
  // Ready State Monitoring
  // ============================================================================

  function setupReadyStateMonitoring() {
    try {
      var container = document.querySelector(SELECTORS.readyStatesContainer);
      if (!container) return false;

      container.classList.add(CSS_CLASSES.stateBadgeMarker);
      var btn = container.querySelector(SELECTORS.readyStateButton) ||
                container.querySelector('.btn');
      if (!btn) return false;

      updateStateMarkers(btn);

      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            updateStateMarkers(btn);
          }
        });
      });
      observer.observe(btn, CONFIG.observerConfig);
      state.observers.push(observer);
      Logger.log('Ready state monitoring active');
      return true;
    } catch (error) {
      Logger.error('Failed to set up ready state monitoring', error);
      return false;
    }
  }

  function updateStateMarkers(button) {
    try {
      var className = button.className || '';
      var newState = 'unknown';
      button.classList.remove(CSS_CLASSES.readyState, CSS_CLASSES.notReadyState, CSS_CLASSES.unknownState);

      if (className.indexOf('btn-danger') !== -1) {
        newState = 'not-ready';
        button.classList.add(CSS_CLASSES.notReadyState);
      } else if (className.indexOf('btn-primary') !== -1) {
        newState = 'ready';
        button.classList.add(CSS_CLASSES.readyState);
      } else {
        button.classList.add(CSS_CLASSES.unknownState);
      }

      if (newState !== state.currentAgentState) {
        state.currentAgentState = newState;
        Logger.log('Agent state: ' + newState);
      }
    } catch (error) {
      Logger.warn('Error updating state markers', error);
    }
  }

  // ============================================================================
  // Custom Button Injection (Phase 3)
  // Uses Five9.vent.trigger() to fire native navigation events
  // ============================================================================

  function injectCustomButtons() {
    if (state.customButtonsInjected) return true;

    try {
      var buttonsContainer = document.querySelector(SELECTORS.homeMainButtons);
      if (!buttonsContainer) {
        Logger.warn('Home buttons container not found');
        return false;
      }

      // Check if Five9.vent is available for navigation triggers
      var hasVent = (typeof Five9 !== 'undefined' && Five9.vent && typeof Five9.vent.trigger === 'function');
      if (!hasVent) {
        Logger.warn('Five9.vent not available — buttons will show but navigation disabled');
      }

      // Don't re-inject if already present
      if (document.getElementById('adp-custom-buttons')) {
        state.customButtonsInjected = true;
        return true;
      }

      // Create button group container matching ADT's existing pattern
      var btnGroup = document.createElement('div');
      btnGroup.id = 'adp-custom-buttons';
      btnGroup.className = 'btn-group-vertical btn-block';

      // Build each button
      CUSTOM_BUTTONS.forEach(function(btnDef) {
        var button = document.createElement('button');
        button.id = btnDef.id;
        button.className = 'btn btn-default adp-custom-btn';
        button.type = 'button';
        button.title = btnDef.title || btnDef.label;

        // Inner structure matching ADT's button pattern
        var innerDiv = document.createElement('div');
        var iconSpan = document.createElement('i');
        iconSpan.className = 'fa ' + btnDef.icon;
        var labelSpan = document.createElement('span');
        labelSpan.className = 'button-content f9-nowrap-ellipsis';
        labelSpan.textContent = btnDef.label;

        innerDiv.appendChild(iconSpan);
        innerDiv.appendChild(labelSpan);
        button.appendChild(innerDiv);

        // Wire click — custom events go to our handler, others to Five9.vent
        button.addEventListener('click', function(e) {
          e.preventDefault();
          if (btnDef.event.indexOf('__custom:') === 0) {
            handleCustomEvent(btnDef.event);
          } else if (hasVent) {
            Logger.log('Triggering: ' + btnDef.event);
            Five9.vent.trigger(btnDef.event);
          } else {
            showToast(btnDef.label + ' — Five9 navigation not available', 'warning');
          }
        });

        btnGroup.appendChild(button);
      });

      // Insert after the first btn-group-vertical (Missed Calls group)
      var firstBtnGroup = buttonsContainer.querySelector('.btn-group-vertical');
      if (firstBtnGroup && firstBtnGroup.nextSibling) {
        buttonsContainer.insertBefore(btnGroup, firstBtnGroup.nextSibling);
      } else {
        buttonsContainer.appendChild(btnGroup);
      }

      state.customButtonsInjected = true;
      Logger.log('Custom buttons injected: ' + CUSTOM_BUTTONS.length + ' buttons');
      showToast('ADP features loaded', 'success', 2000);
      return true;
    } catch (error) {
      Logger.error('Failed to inject custom buttons', error);
      return false;
    }
  }

  // ============================================================================
  // Dynamic Panel Monitor — re-inject buttons when home panel reloads
  // ============================================================================

  function setupDynamicPanelMonitor() {
    try {
      var mainContainer = document.querySelector(SELECTORS.mainContainer) ||
                         document.querySelector(SELECTORS.agentContainer) ||
                         document.body;
      if (!mainContainer) return false;

      var dynamicObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Re-apply markers to dynamically loaded panels
                if (node.matches && node.matches(SELECTORS.mainPanel)) {
                  node.classList.add(CSS_CLASSES.mainMarker);
                }
                if (node.querySelectorAll) {
                  var mainChild = node.querySelector(SELECTORS.mainPanel);
                  if (mainChild) mainChild.classList.add(CSS_CLASSES.mainMarker);
                }
                // Re-inject custom buttons if home panel reloaded
                if (node.id === 'sfli-home-panel' || node.querySelector && node.querySelector('#sfli-home-main-buttons')) {
                  state.customButtonsInjected = false;
                  setTimeout(function() { injectCustomButtons(); }, 200);
                }
              }
            });
          }
        });
      });

      dynamicObserver.observe(mainContainer, {
        childList: true,
        subtree: true,
        attributes: false
      });

      state.observers.push(dynamicObserver);
      Logger.log('Dynamic panel monitor active');
      return true;
    } catch (error) {
      Logger.error('Failed to set up dynamic panel monitor', error);
      return false;
    }
  }

  // ============================================================================
  // Custom Event Router
  // ============================================================================

  function handleCustomEvent(eventName) {
    switch (eventName) {
      case '__custom:todays_calls':
        InteractionHistory.showTodaysCalls();
        break;
      case '__custom:contact_history':
        InteractionHistory.showContactSearch();
        break;
      default:
        Logger.warn('Unknown custom event: ' + eventName);
    }
  }

  // ============================================================================
  // Phase 4: Interaction History Module
  //
  // Strategy for fetching data (cascading fallback):
  //   1. Five9.DataAdapter.API.xhr() — internal XHR that handles auth + CORS
  //   2. Five9.CloudRoot.InteractionsSvc — instantiate the service
  //   3. Vent event listener — accumulate calls seen this session in memory
  //
  // For contact search:
  //   1. Five9.DataAdapter.API for contact/CRM search
  //   2. Backbone collection search via Five9's internal models
  // ============================================================================

  var InteractionHistory = (function() {

    // In-session call log — populated by vent listener as fallback
    var sessionCalls = [];
    var ventListenerActive = false;

    // ------- Modal / Overlay UI -------

    function getOrCreateModal() {
      var modal = document.getElementById('adp-history-modal');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'adp-history-modal';
      modal.className = 'adp-history-modal';
      modal.innerHTML =
        '<div class="adp-history-backdrop"></div>' +
        '<div class="adp-history-panel">' +
          '<div class="adp-history-header">' +
            '<span class="adp-history-title"></span>' +
            '<button class="adp-history-close" title="Close">&times;</button>' +
          '</div>' +
          '<div class="adp-history-toolbar"></div>' +
          '<div class="adp-history-body">' +
            '<div class="adp-history-loading">Loading…</div>' +
          '</div>' +
          '<div class="adp-history-footer"></div>' +
        '</div>';

      document.body.appendChild(modal);

      // Close handlers
      modal.querySelector('.adp-history-close').addEventListener('click', closeModal);
      modal.querySelector('.adp-history-backdrop').addEventListener('click', closeModal);

      return modal;
    }

    function openModal(title) {
      var modal = getOrCreateModal();
      modal.querySelector('.adp-history-title').textContent = title;
      modal.querySelector('.adp-history-toolbar').innerHTML = '';
      modal.querySelector('.adp-history-body').innerHTML =
        '<div class="adp-history-loading"><i class="fa fa-spinner fa-spin"></i> Loading…</div>';
      modal.querySelector('.adp-history-footer').innerHTML = '';
      modal.style.display = 'flex';
      // Animate in
      requestAnimationFrame(function() { modal.classList.add('adp-history-visible'); });
      return modal;
    }

    function closeModal() {
      var modal = document.getElementById('adp-history-modal');
      if (!modal) return;
      modal.classList.remove('adp-history-visible');
      setTimeout(function() { modal.style.display = 'none'; }, 250);
    }

    function setModalBody(html) {
      var modal = document.getElementById('adp-history-modal');
      if (modal) modal.querySelector('.adp-history-body').innerHTML = html;
    }

    function setModalToolbar(html) {
      var modal = document.getElementById('adp-history-modal');
      if (modal) modal.querySelector('.adp-history-toolbar').innerHTML = html;
    }

    function setModalFooter(html) {
      var modal = document.getElementById('adp-history-modal');
      if (modal) modal.querySelector('.adp-history-footer').innerHTML = html;
    }

    // ------- Date helpers -------

    function todayStart() {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }

    function formatTime(ts) {
      if (!ts) return '—';
      var d = (ts instanceof Date) ? ts : new Date(ts);
      if (isNaN(d.getTime())) return '—';
      var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s + ' ' + ampm;
    }

    function formatDuration(seconds) {
      if (!seconds && seconds !== 0) return '—';
      seconds = Math.round(Number(seconds));
      var m = Math.floor(seconds / 60);
      var s = seconds % 60;
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function formatPhone(num) {
      if (!num) return '—';
      var cleaned = String(num).replace(/\D/g, '');
      if (cleaned.length === 11 && cleaned[0] === '1') cleaned = cleaned.slice(1);
      if (cleaned.length === 10) {
        return '(' + cleaned.slice(0,3) + ') ' + cleaned.slice(3,6) + '-' + cleaned.slice(6);
      }
      return String(num);
    }

    // ------- Data fetching (multi-strategy) -------

    /**
     * Strategy 1: Use Five9.DataAdapter.API.xhr() to call REST endpoints.
     * Five9's API base is at Five9.DataAdapter.API.urlRoot() — typically
     * https://app-scl.five9.com:443/appsvcs/rs/svc
     *
     * Known endpoints (from source inspection):
     *   /agents/{agentId}/interactions
     *   /agents/{agentId}/call_log
     *   /orgs/{orgId}/interactions
     *   /orgs/{orgId}/contacts?search=...
     */
    function fetchViaDataAdapter(endpoint, callback) {
      try {
        if (typeof Five9 === 'undefined' || !Five9.DataAdapter || !Five9.DataAdapter.API) {
          return callback('DataAdapter not available', null);
        }

        var api = Five9.DataAdapter.API;
        var baseUrl = (typeof api.urlRoot === 'function') ? api.urlRoot() : '';
        if (!baseUrl) return callback('No API base URL', null);

        var url = baseUrl + endpoint;
        Logger.log('Fetching: ' + url);

        // Five9's xhr() method handles auth cookies/tokens + CORS
        if (typeof api.xhr === 'function') {
          api.xhr({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
              callback(null, data);
            },
            error: function(xhr, status, err) {
              Logger.warn('API xhr error: ' + status + ' ' + err);
              callback(err || status || 'Request failed', null);
            }
          });
        } else {
          callback('xhr method not available', null);
        }
      } catch (e) {
        Logger.error('fetchViaDataAdapter error', e);
        callback(e.message, null);
      }
    }

    /**
     * Strategy 2: Use Five9.DataAdapter.API.performAction() for known actions.
     */
    function fetchViaPerformAction(action, params, callback) {
      try {
        if (typeof Five9 === 'undefined' || !Five9.DataAdapter || !Five9.DataAdapter.API) {
          return callback('DataAdapter not available', null);
        }
        var api = Five9.DataAdapter.API;
        if (typeof api.performAction !== 'function') {
          return callback('performAction not available', null);
        }

        Logger.log('performAction: ' + action);
        api.performAction(action, params, {
          success: function(data) { callback(null, data); },
          error: function(xhr, status, err) {
            Logger.warn('performAction error: ' + action + ' — ' + (err || status));
            callback(err || status || 'Action failed', null);
          }
        });
      } catch (e) {
        callback(e.message, null);
      }
    }

    /**
     * Strategy 3: Try to use the Backbone collections that Five9 keeps in memory.
     * Look for Five9 internal model collections (recent calls, interactions).
     */
    function fetchFromBackboneCollections() {
      try {
        var results = [];

        // Try to find the recent calls collection via Five9's internal models
        if (typeof Five9 !== 'undefined' && Five9.app) {
          // Five9.app often has references to active model collections
          var app = Five9.app;

          // Check for recentCalls, callLog, interactions collections
          var collectionNames = [
            'recentCalls', 'callLog', 'interactions', 'calls',
            'missedCalls', 'recentInteractions', 'callHistory'
          ];

          for (var i = 0; i < collectionNames.length; i++) {
            var coll = app[collectionNames[i]];
            if (coll && typeof coll.toJSON === 'function') {
              Logger.log('Found Backbone collection: ' + collectionNames[i]);
              var data = coll.toJSON();
              if (Array.isArray(data) && data.length > 0) {
                return data;
              }
            }
          }
        }

        // Also check if there's a global calls store
        if (typeof Five9 !== 'undefined' && Five9.CloudRoot) {
          var svcNames = Object.keys(Five9.CloudRoot);
          for (var j = 0; j < svcNames.length; j++) {
            if (svcNames[j].toLowerCase().indexOf('interaction') !== -1 ||
                svcNames[j].toLowerCase().indexOf('call') !== -1) {
              Logger.log('Found CloudRoot service: ' + svcNames[j]);
            }
          }
        }

        return null;
      } catch (e) {
        Logger.warn('Backbone collection search error', e);
        return null;
      }
    }

    /**
     * Strategy 4 (fallback): Listen to Five9.vent events for calls and
     * accumulate them in sessionCalls[] for the current session.
     */
    function setupVentCallListener() {
      if (ventListenerActive) return;
      try {
        if (typeof Five9 === 'undefined' || !Five9.vent || !Five9.vent.on) return;

        var callEvents = [
          'pres:model:new:recent:call',
          'call:completed',
          'call:ended',
          'interaction:completed',
          'interaction:ended',
          'pres:model:change:call',
          'navigate:agent:active_calls:show'
        ];

        callEvents.forEach(function(evt) {
          Five9.vent.on(evt, function(data) {
            Logger.log('Call event captured: ' + evt, data);
            if (data) {
              var entry = normalizeCallData(data, evt);
              if (entry) sessionCalls.push(entry);
            }
          });
        });

        ventListenerActive = true;
        Logger.log('Vent call listener active — tracking session calls');
      } catch (e) {
        Logger.warn('Failed to setup vent call listener', e);
      }
    }

    function normalizeCallData(data, eventName) {
      try {
        // Handle both Backbone model and plain object
        var obj = (typeof data.toJSON === 'function') ? data.toJSON() : data;
        if (typeof obj !== 'object') return null;

        return {
          id: obj.id || obj.callId || obj.interactionId || ('evt-' + Date.now()),
          timestamp: obj.timestamp || obj.startTime || obj.created || new Date().toISOString(),
          type: obj.type || obj.callType || obj.mediaType || eventName,
          direction: obj.direction || obj.callDirection || '—',
          number: obj.number || obj.ani || obj.dnis || obj.callerNumber || obj.calledNumber || '—',
          contactName: obj.contactName || obj.callerName || obj.customerName || '',
          campaign: obj.campaign || obj.campaignName || obj.skillName || '',
          disposition: obj.disposition || obj.dispositionName || '',
          duration: obj.duration || obj.talkTime || obj.handleTime || 0,
          status: obj.status || obj.callStatus || 'completed',
          raw: obj
        };
      } catch (e) {
        return null;
      }
    }

    // ------- Rendering helpers -------

    function renderCallTable(calls, showContact) {
      if (!calls || calls.length === 0) {
        return '<div class="adp-history-empty">' +
          '<i class="fa fa-phone fa-2x"></i>' +
          '<p>No interactions found</p>' +
        '</div>';
      }

      var html = '<table class="adp-history-table">' +
        '<thead><tr>' +
          '<th>Time</th>' +
          '<th>Direction</th>' +
          (showContact ? '<th>Contact</th>' : '') +
          '<th>Number</th>' +
          '<th>Campaign / Skill</th>' +
          '<th>Duration</th>' +
          '<th>Disposition</th>' +
        '</tr></thead><tbody>';

      calls.forEach(function(call) {
        var dirIcon = '';
        var dirClass = '';
        var dir = String(call.direction || '').toLowerCase();
        if (dir.indexOf('in') !== -1 || dir === 'inbound') {
          dirIcon = '<i class="fa fa-arrow-down"></i> ';
          dirClass = 'adp-dir-inbound';
        } else if (dir.indexOf('out') !== -1 || dir === 'outbound') {
          dirIcon = '<i class="fa fa-arrow-up"></i> ';
          dirClass = 'adp-dir-outbound';
        } else if (dir.indexOf('internal') !== -1) {
          dirIcon = '<i class="fa fa-exchange"></i> ';
          dirClass = 'adp-dir-internal';
        }

        html += '<tr>' +
          '<td>' + formatTime(call.timestamp) + '</td>' +
          '<td class="' + dirClass + '">' + dirIcon + escapeHtml(String(call.direction || '—')) + '</td>' +
          (showContact ? '<td>' + escapeHtml(call.contactName || '—') + '</td>' : '') +
          '<td>' + formatPhone(call.number) + '</td>' +
          '<td>' + escapeHtml(call.campaign || '—') + '</td>' +
          '<td>' + formatDuration(call.duration) + '</td>' +
          '<td>' + escapeHtml(call.disposition || '—') + '</td>' +
        '</tr>';
      });

      html += '</tbody></table>';
      return html;
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    // ------- Public methods -------

    function showTodaysCalls() {
      Logger.log('Opening Today\'s Calls');
      var modal = openModal("Today's Interactions");

      // Add date filter toolbar
      setModalToolbar(
        '<div class="adp-history-filters">' +
          '<button class="adp-filter-btn adp-filter-active" data-range="today">Today</button>' +
          '<button class="adp-filter-btn" data-range="session">This Session</button>' +
          '<button class="adp-filter-btn" data-range="yesterday">Yesterday</button>' +
          '<button class="adp-filter-btn" data-range="week">Last 7 Days</button>' +
        '</div>'
      );

      // Wire up filter buttons
      var toolbar = modal.querySelector('.adp-history-toolbar');
      toolbar.addEventListener('click', function(e) {
        var btn = e.target.closest('.adp-filter-btn');
        if (!btn) return;
        toolbar.querySelectorAll('.adp-filter-btn').forEach(function(b) {
          b.classList.remove('adp-filter-active');
        });
        btn.classList.add('adp-filter-active');
        loadCallsForRange(btn.getAttribute('data-range'));
      });

      loadCallsForRange('today');
    }

    function loadCallsForRange(range) {
      setModalBody('<div class="adp-history-loading"><i class="fa fa-spinner fa-spin"></i> Loading…</div>');

      // Try Strategy 1: REST API via DataAdapter
      // Common Five9 endpoints for call logs
      var endpoints = [
        '/agents/me/interactions',
        '/agents/me/call_log',
        '/agents/me/recent_calls'
      ];

      var tried = 0;
      var succeeded = false;

      function tryNextEndpoint() {
        if (tried >= endpoints.length || succeeded) {
          if (!succeeded) tryBackboneAndSession(range);
          return;
        }
        var ep = endpoints[tried++];
        fetchViaDataAdapter(ep, function(err, data) {
          if (!err && data) {
            succeeded = true;
            var calls = Array.isArray(data) ? data : (data.interactions || data.calls || data.records || []);
            var normalized = calls.map(function(c) { return normalizeCallData(c, 'api'); }).filter(Boolean);
            var filtered = filterByRange(normalized, range);
            renderResults(filtered, range);
          } else {
            tryNextEndpoint();
          }
        });
      }

      tryNextEndpoint();
    }

    function tryBackboneAndSession(range) {
      // Strategy 2: Backbone collections
      var bbData = fetchFromBackboneCollections();
      if (bbData && bbData.length > 0) {
        var normalized = bbData.map(function(c) { return normalizeCallData(c, 'backbone'); }).filter(Boolean);
        var filtered = filterByRange(normalized, range);
        renderResults(filtered, range);
        return;
      }

      // Strategy 3: Try Five9's internal missed calls panel navigation
      // (triggers the native UI — not ideal but functional)

      // Strategy 4: Use session-captured calls
      if (sessionCalls.length > 0) {
        var filtered = filterByRange(sessionCalls, range);
        renderResults(filtered, range);
        setModalFooter('<span class="adp-history-note"><i class="fa fa-info-circle"></i> Showing calls captured this session only. For full history, use Five9 Supervisor reports.</span>');
        return;
      }

      // Strategy 5: Try performAction with various action names
      var actions = ['getCallLog', 'getRecentCalls', 'getInteractions', 'getCallHistory'];
      var actionTried = 0;

      function tryNextAction() {
        if (actionTried >= actions.length) {
          showFallbackUI(range);
          return;
        }
        var action = actions[actionTried++];
        fetchViaPerformAction(action, { range: range }, function(err, data) {
          if (!err && data) {
            var calls = Array.isArray(data) ? data : (data.interactions || data.calls || data.records || []);
            var normalized = calls.map(function(c) { return normalizeCallData(c, action); }).filter(Boolean);
            var filtered = filterByRange(normalized, range);
            renderResults(filtered, range);
          } else {
            tryNextAction();
          }
        });
      }
      tryNextAction();
    }

    function filterByRange(calls, range) {
      var now = new Date();
      var start;

      switch (range) {
        case 'today':
          start = todayStart();
          break;
        case 'yesterday':
          start = new Date(todayStart());
          start.setDate(start.getDate() - 1);
          var end = todayStart();
          return calls.filter(function(c) {
            var t = new Date(c.timestamp);
            return t >= start && t < end;
          });
        case 'week':
          start = new Date(todayStart());
          start.setDate(start.getDate() - 7);
          break;
        case 'session':
          return sessionCalls.slice(); // Just session calls, unfiltered
        default:
          start = todayStart();
      }

      return calls.filter(function(c) {
        return new Date(c.timestamp) >= start;
      });
    }

    function renderResults(calls, range) {
      // Sort newest first
      calls.sort(function(a, b) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setModalBody(renderCallTable(calls, true));
      setModalFooter(
        '<span class="adp-history-count">' + calls.length + ' interaction' +
        (calls.length !== 1 ? 's' : '') + '</span>'
      );
    }

    function showFallbackUI(range) {
      // All strategies failed — show helpful fallback with option to open native panels
      var html =
        '<div class="adp-history-empty">' +
          '<i class="fa fa-info-circle fa-2x"></i>' +
          '<p>Interaction history data is not available through the API in this session.</p>' +
          '<p class="adp-history-hint">You can view call activity using the native Five9 panels:</p>' +
          '<div class="adp-history-fallback-buttons">' +
            '<button class="btn btn-default adp-fallback-btn" data-action="missed">' +
              '<i class="fa fa-phone-square"></i> Missed Calls' +
            '</button>' +
            '<button class="btn btn-default adp-fallback-btn" data-action="active">' +
              '<i class="fa fa-phone"></i> Active Calls' +
            '</button>' +
            '<button class="btn btn-default adp-fallback-btn" data-action="messages">' +
              '<i class="fa fa-envelope"></i> Message History' +
            '</button>' +
          '</div>' +
          '<p class="adp-history-hint" style="margin-top:12px">' +
            '<i class="fa fa-lightbulb-o"></i> Calls made during this session will be tracked automatically.' +
          '</p>' +
        '</div>';

      setModalBody(html);
      setModalFooter('');

      // Wire fallback buttons
      var modal = document.getElementById('adp-history-modal');
      if (modal) {
        modal.querySelector('.adp-history-body').addEventListener('click', function(e) {
          var btn = e.target.closest('.adp-fallback-btn');
          if (!btn) return;
          var action = btn.getAttribute('data-action');
          closeModal();
          if (typeof Five9 !== 'undefined' && Five9.vent && Five9.vent.trigger) {
            switch (action) {
              case 'missed':
                Five9.vent.trigger('navigation:missed_calls:show');
                break;
              case 'active':
                Five9.vent.trigger('navigate:agent:active_calls:show');
                break;
              case 'messages':
                Five9.vent.trigger('navigation:agent:internal_messages_history');
                break;
            }
          }
        });
      }
    }

    // ------- Contact History -------

    function showContactSearch() {
      Logger.log('Opening Contact History search');
      var modal = openModal('Contact History');

      setModalToolbar(
        '<div class="adp-history-search">' +
          '<div class="adp-search-input-wrap">' +
            '<i class="fa fa-search"></i>' +
            '<input type="text" id="adp-contact-search-input" ' +
              'placeholder="Search by name, number, or email…" autocomplete="off" />' +
          '</div>' +
          '<button class="btn btn-default adp-search-btn" id="adp-contact-search-go">' +
            '<i class="fa fa-arrow-right"></i> Search' +
          '</button>' +
        '</div>'
      );

      setModalBody(
        '<div class="adp-history-empty">' +
          '<i class="fa fa-search fa-2x"></i>' +
          '<p>Enter a contact name, phone number, or email to search interaction history.</p>' +
        '</div>'
      );

      var input = document.getElementById('adp-contact-search-input');
      var goBtn = document.getElementById('adp-contact-search-go');

      if (input) {
        input.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') doContactSearch(input.value.trim());
        });
        setTimeout(function() { input.focus(); }, 200);
      }
      if (goBtn) {
        goBtn.addEventListener('click', function() {
          if (input) doContactSearch(input.value.trim());
        });
      }
    }

    function doContactSearch(query) {
      if (!query) {
        showToast('Please enter a search term', 'warning');
        return;
      }

      Logger.log('Contact search: ' + query);
      setModalBody('<div class="adp-history-loading"><i class="fa fa-spinner fa-spin"></i> Searching…</div>');

      // Try REST API contact search
      var encodedQuery = encodeURIComponent(query);
      var endpoints = [
        '/contacts?search=' + encodedQuery,
        '/contacts?q=' + encodedQuery,
        '/contacts/search?query=' + encodedQuery
      ];

      var tried = 0;
      var succeeded = false;

      function tryNextContactEndpoint() {
        if (tried >= endpoints.length || succeeded) {
          if (!succeeded) searchSessionCalls(query);
          return;
        }
        var ep = endpoints[tried++];
        fetchViaDataAdapter(ep, function(err, data) {
          if (!err && data) {
            succeeded = true;
            var contacts = Array.isArray(data) ? data : (data.contacts || data.records || data.results || []);
            renderContactResults(contacts, query);
          } else {
            tryNextContactEndpoint();
          }
        });
      }

      tryNextContactEndpoint();
    }

    function searchSessionCalls(query) {
      var lower = query.toLowerCase();
      var matches = sessionCalls.filter(function(call) {
        return (
          (call.contactName && call.contactName.toLowerCase().indexOf(lower) !== -1) ||
          (call.number && String(call.number).indexOf(query) !== -1) ||
          (call.campaign && call.campaign.toLowerCase().indexOf(lower) !== -1)
        );
      });

      if (matches.length > 0) {
        setModalBody(renderCallTable(matches, true));
        setModalFooter(
          '<span class="adp-history-count">' + matches.length + ' match' +
          (matches.length !== 1 ? 'es' : '') + ' in session</span>' +
          '<span class="adp-history-note"><i class="fa fa-info-circle"></i> Showing session calls only</span>'
        );
      } else {
        // Try opening the address book search as fallback
        setModalBody(
          '<div class="adp-history-empty">' +
            '<i class="fa fa-search fa-2x"></i>' +
            '<p>No matching contacts found in current session data.</p>' +
            '<p class="adp-history-hint">Try searching in the Five9 Address Book for full contact records:</p>' +
            '<button class="btn btn-default adp-fallback-btn" id="adp-open-address-book">' +
              '<i class="fa fa-book"></i> Open Address Book' +
            '</button>' +
          '</div>'
        );
        var abBtn = document.getElementById('adp-open-address-book');
        if (abBtn) {
          abBtn.addEventListener('click', function() {
            closeModal();
            if (typeof Five9 !== 'undefined' && Five9.vent && Five9.vent.trigger) {
              Five9.vent.trigger('navigation:dialog:openaddressbook');
            }
          });
        }
      }
    }

    function renderContactResults(contacts, query) {
      if (!contacts || contacts.length === 0) {
        searchSessionCalls(query);
        return;
      }

      var html = '<table class="adp-history-table">' +
        '<thead><tr>' +
          '<th>Name</th>' +
          '<th>Number</th>' +
          '<th>Email</th>' +
          '<th>Actions</th>' +
        '</tr></thead><tbody>';

      contacts.forEach(function(contact) {
        var name = contact.name || contact.contactName ||
          ((contact.firstName || '') + ' ' + (contact.lastName || '')).trim() || '—';
        var number = contact.number || contact.phone || contact.phoneNumber || '—';
        var email = contact.email || contact.emailAddress || '—';
        var contactId = contact.id || contact.contactId || '';

        html += '<tr>' +
          '<td>' + escapeHtml(name) + '</td>' +
          '<td>' + formatPhone(number) + '</td>' +
          '<td>' + escapeHtml(email) + '</td>' +
          '<td>' +
            '<button class="adp-action-btn" data-contact-id="' + escapeHtml(contactId) + '" ' +
              'data-number="' + escapeHtml(String(number)) + '" title="View history">' +
              '<i class="fa fa-history"></i>' +
            '</button>' +
          '</td>' +
        '</tr>';
      });

      html += '</tbody></table>';
      setModalBody(html);
      setModalFooter('<span class="adp-history-count">' + contacts.length + ' contact' +
        (contacts.length !== 1 ? 's' : '') + ' found</span>');
    }

    // Expose public methods
    return {
      showTodaysCalls: showTodaysCalls,
      showContactSearch: showContactSearch,
      getSessionCalls: function() { return sessionCalls.slice(); },
      setupListener: setupVentCallListener,
      closeModal: closeModal
    };

  })(); // end InteractionHistory module

  // ============================================================================
  // Cleanup
  // ============================================================================

  function disconnectObservers() {
    try {
      state.observers.forEach(function(observer) { observer.disconnect(); });
      state.observers = [];
    } catch (error) {
      Logger.warn('Error disconnecting observers', error);
    }
  }

  // ============================================================================
  // Retry Helper
  // ============================================================================

  function executeWithRetry(initFn, maxRetries, delayMs, fnName) {
    maxRetries = maxRetries || 3;
    delayMs = delayMs || CONFIG.delayMs.retryDomElements;
    fnName = fnName || 'operation';

    function attempt(left) {
      try {
        if (initFn()) {
          Logger.log(fnName + ' succeeded');
          return;
        }
        if (left > 0) setTimeout(function() { attempt(left - 1); }, delayMs);
        else Logger.warn(fnName + ' failed after ' + maxRetries + ' attempts');
      } catch (error) {
        Logger.error(fnName + ' error', error);
        if (left > 0) setTimeout(function() { attempt(left - 1); }, delayMs);
      }
    }
    attempt(maxRetries);
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  function initialize() {
    if (state.initialized) {
      Logger.warn('Already initialized');
      return;
    }

    Logger.log('Initializing v4.0 (Phase 4 - Interaction History)...');

    // Step 1: Inject CSS
    if (!injectCustomCSS()) {
      Logger.error('CSS injection failed');
    }

    // Step 2: Apply theme markers
    applyThemeMarkerClasses();

    // Step 3: Ready state monitoring (with retry)
    executeWithRetry(setupReadyStateMonitoring, 3, CONFIG.delayMs.retryDomElements, 'Ready state monitoring');

    // Step 4: Inject custom buttons (with retry for DOM readiness)
    executeWithRetry(injectCustomButtons, 5, CONFIG.delayMs.retryDomElements, 'Custom button injection');

    // Step 5: Dynamic panel monitor (delayed for DOM)
    setTimeout(function() {
      setupDynamicPanelMonitor();
    }, CONFIG.delayMs.initialCheck);

    // Step 5b: Start vent call listener for interaction history tracking
    setTimeout(function() {
      InteractionHistory.setupListener();
    }, CONFIG.delayMs.retryDomElements);

    // Step 6: Re-apply markers for late-loading elements
    setTimeout(function() {
      applyThemeMarkerClasses();
    }, CONFIG.delayMs.retryDomElements);

    state.initialized = true;
    Logger.log('Initialization complete');
  }

  // ============================================================================
  // Public API (window.AdtAdpTheme)
  // ============================================================================

  window.AdtAdpTheme = {
    reinitialize: function() {
      Logger.log('Manual re-initialization');
      disconnectObservers();
      state.initialized = false;
      state.customButtonsInjected = false;
      initialize();
    },
    isActive: function() {
      return document.body.classList.contains(CSS_CLASSES.themeRoot);
    },
    getConfig: function() { return CONFIG; },
    getState: function() { return state; },
    showToast: showToast,
    triggerNav: function(eventName) {
      if (Five9 && Five9.vent && Five9.vent.trigger) {
        Five9.vent.trigger(eventName);
      }
    },
    // Phase 4: Interaction History
    showTodaysCalls: function() { InteractionHistory.showTodaysCalls(); },
    showContactHistory: function() { InteractionHistory.showContactSearch(); },
    getSessionCalls: function() { return InteractionHistory.getSessionCalls(); },
    closeHistoryModal: function() { InteractionHistory.closeModal(); },
    destroy: function() {
      try {
        disconnectObservers();
        InteractionHistory.closeModal();
        var historyModal = document.getElementById('adp-history-modal');
        if (historyModal) historyModal.remove();
        var customBtns = document.getElementById('adp-custom-buttons');
        if (customBtns) customBtns.remove();
        state.initialized = false;
        state.customButtonsInjected = false;
        state.currentAgentState = null;
        Logger.log('Theme loader destroyed');
      } catch (error) {
        Logger.error('Error during destroy', error);
      }
    }
  };

  // ============================================================================
  // Auto-initialize
  // ============================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    setTimeout(initialize, CONFIG.delayMs.initialCheck);
  }

})();

/**
 * Five9 ADT to ADP Theme Loader (NEW ADT VERSION)
 *
 * Self-executing module for Five9's NEW Agent Desktop Toolkit (ADT)
 * Loads custom styling, DOM enhancements, and ADP-like custom buttons.
 *
 * Phase 2: CSS injection + theme markers
 * Phase 3: Custom buttons via DOM injection + Five9.vent navigation
 *
 * NOTE: Uses IIFE pattern (not AMD define()) because Five9 loads External JS
 * via a <script> tag. Using anonymous define() conflicts with Five9's internal
 * RequireJS, causing "Mismatched anonymous define() module" errors.
 *
 * Version: 3.0.0 (Phase 3 - Custom Components)
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

        // Wire click to Five9.vent.trigger
        button.addEventListener('click', function(e) {
          e.preventDefault();
          if (hasVent) {
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

    Logger.log('Initializing v3.0 (Phase 3 - Custom Components)...');

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
    destroy: function() {
      try {
        disconnectObservers();
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

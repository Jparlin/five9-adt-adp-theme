/**
 * Five9 ADT to ADP Theme Loader (NEW ADT VERSION)
 *
 * Self-executing module for Five9's NEW Agent Desktop Toolkit (ADT)
 * Loads custom styling and DOM enhancements for modern flex-based layout
 * with sfli- prefixed classes.
 *
 * This script is loaded at ADT startup via the External JS feature.
 * It handles CSS injection, DOM enhancement, dynamic observers, and state tracking.
 *
 * NOTE: Uses IIFE pattern (not AMD define()) because Five9 loads External JS
 * via a <script> tag. Using anonymous define() conflicts with Five9's internal
 * RequireJS, causing "Mismatched anonymous define() module" errors.
 *
 * Version: 2.1.0 (NEW ADT - IIFE pattern)
 * Compatible with: ADT 2.x+ (sfli- prefix layout)
 */

(function() {
  'use strict';

  // ============================================================================
  // Configuration & Constants
  // ============================================================================

  var CONFIG = {
    // GitHub Pages hosted CSS URL - update this to your actual GitHub Pages URL
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

  // DOM selectors for NEW ADT elements (sfli- prefixed)
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
    customPlaceholders: '.custom-component-placeholder',
    agentName: '.agentName',
    agentUser: '.agentUser',
    agentExtension: '.agentExtension',
    agentAvatar: '.avatar'
  };

  // CSS marker classes for reliable targeting
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

  // State tracking
  var state = {
    cssInjected: false,
    initialized: false,
    observers: [],
    currentAgentState: null
  };

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
        Logger.log('Custom CSS loaded successfully from ' + CONFIG.cssUrl);
        state.cssInjected = true;
      };

      document.head.appendChild(link);
      Logger.log('Custom CSS injected: ' + CONFIG.cssUrl);
      return true;
    } catch (error) {
      Logger.error('Failed to inject custom CSS', error);
      return false;
    }
  }

  // ============================================================================
  // DOM Enhancement - Theme Marker Classes
  // ============================================================================

  function applyThemeMarkerClasses() {
    var applyCount = { success: 0, failed: 0, notFound: 0 };

    try {
      var body = document.body;
      if (body) {
        body.classList.add(CSS_CLASSES.themeRoot);
        applyCount.success++;
      }

      var header = document.querySelector(SELECTORS.panelHeader);
      if (header) {
        header.classList.add(CSS_CLASSES.headerMarker);
        applyCount.success++;
      } else {
        applyCount.notFound++;
      }

      var mainPanel = document.querySelector(SELECTORS.mainPanel);
      if (mainPanel) {
        mainPanel.classList.add(CSS_CLASSES.mainMarker);
        applyCount.success++;
      } else {
        applyCount.notFound++;
      }

      var statsPanel = document.querySelector(SELECTORS.statsPanel);
      if (statsPanel && statsPanel !== mainPanel) {
        statsPanel.classList.add(CSS_CLASSES.statsMarker);
        applyCount.success++;
      } else {
        applyCount.notFound++;
      }

      var footer = document.querySelector(SELECTORS.contentInfo);
      if (footer) {
        footer.classList.add(CSS_CLASSES.footerMarker);
        applyCount.success++;
      } else {
        applyCount.notFound++;
      }

      Logger.log('Theme markers applied. Success: ' + applyCount.success +
        ', Not Found: ' + applyCount.notFound);
      return applyCount.success > 0;
    } catch (error) {
      Logger.error('Error applying theme marker classes', error);
      return false;
    }
  }

  // ============================================================================
  // Ready State Monitoring
  // ============================================================================

  function setupReadyStateMonitoring() {
    try {
      var readyStatesContainer = document.querySelector(SELECTORS.readyStatesContainer);
      if (!readyStatesContainer) {
        return false;
      }

      readyStatesContainer.classList.add(CSS_CLASSES.stateBadgeMarker);

      var stateButton = readyStatesContainer.querySelector(SELECTORS.readyStateButton) ||
                       readyStatesContainer.querySelector('.btn');
      if (!stateButton) {
        return false;
      }

      updateStateMarkers(stateButton);

      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            updateStateMarkers(stateButton);
          }
        });
      });

      observer.observe(stateButton, CONFIG.observerConfig);
      state.observers.push(observer);
      Logger.log('MutationObserver attached to ready state button');
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
        Logger.log('Agent state changed to: ' + newState);
      }
    } catch (error) {
      Logger.warn('Error updating state markers', error);
    }
  }

  // ============================================================================
  // Dynamic Panel Loading Monitor
  // ============================================================================

  function setupDynamicPanelMonitor() {
    try {
      var mainContainer = document.querySelector(SELECTORS.mainContainer) ||
                         document.querySelector(SELECTORS.agentContainer) ||
                         document.body;

      if (!mainContainer) {
        return false;
      }

      var dynamicObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches && node.matches(SELECTORS.mainPanel)) {
                  node.classList.add(CSS_CLASSES.mainMarker);
                }
                if (node.matches && node.matches(SELECTORS.statsPanel)) {
                  node.classList.add(CSS_CLASSES.statsMarker);
                }
                if (node.querySelectorAll) {
                  var mainChild = node.querySelector(SELECTORS.mainPanel);
                  if (mainChild) mainChild.classList.add(CSS_CLASSES.mainMarker);
                  var statsChild = node.querySelector(SELECTORS.statsPanel);
                  if (statsChild) statsChild.classList.add(CSS_CLASSES.statsMarker);
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
      Logger.log('Dynamic panel monitor set up');
      return true;
    } catch (error) {
      Logger.error('Failed to set up dynamic panel monitor', error);
      return false;
    }
  }

  // ============================================================================
  // Optional DOM Enhancements
  // ============================================================================

  function enhanceConnectivityDisplay() {
    try {
      var connectivityBar = document.querySelector(SELECTORS.connectivityBar);
      if (!connectivityBar) return false;
      connectivityBar.classList.add('adp-connectivity-enhanced');
      return true;
    } catch (error) {
      return false;
    }
  }

  function enhanceStationButtons() {
    try {
      var stationButtons = document.querySelector(SELECTORS.stationButtons);
      if (!stationButtons) return false;
      stationButtons.classList.add('adp-station-buttons-enhanced');
      return true;
    } catch (error) {
      return false;
    }
  }

  function enhanceAgentInfoDisplay() {
    try {
      var agentName = document.querySelector(SELECTORS.agentName);
      var agentUser = document.querySelector(SELECTORS.agentUser);
      var agentExt = document.querySelector(SELECTORS.agentExtension);
      var agentAvatar = document.querySelector(SELECTORS.agentAvatar);
      var enhancedCount = 0;
      if (agentName) { agentName.classList.add('adp-agent-name'); enhancedCount++; }
      if (agentUser) { agentUser.classList.add('adp-agent-user'); enhancedCount++; }
      if (agentExt) { agentExt.classList.add('adp-agent-extension'); enhancedCount++; }
      if (agentAvatar) { agentAvatar.classList.add('adp-agent-avatar'); enhancedCount++; }

      if (enhancedCount > 0) {
        Logger.log('Agent info display enhanced (' + enhancedCount + ' elements)');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // Cleanup Utilities
  // ============================================================================

  function disconnectObservers() {
    try {
      state.observers.forEach(function(observer) {
        observer.disconnect();
      });
      state.observers = [];
    } catch (error) {
      Logger.warn('Error disconnecting observers', error);
    }
  }

  // ============================================================================
  // Initialization with Retry Logic
  // ============================================================================

  function executeWithRetry(initFn, maxRetries, delayMs, functionName) {
    maxRetries = maxRetries || 3;
    delayMs = delayMs || CONFIG.delayMs.retryDomElements;
    functionName = functionName || 'operation';

    function attempt(retriesLeft) {
      try {
        var success = initFn();
        if (success) {
          Logger.log(functionName + ' succeeded');
          return;
        }
        if (retriesLeft > 0) {
          setTimeout(function() { attempt(retriesLeft - 1); }, delayMs);
        } else {
          Logger.warn(functionName + ' failed after ' + maxRetries + ' attempts');
        }
      } catch (error) {
        Logger.error(functionName + ' threw error on attempt', error);
        if (retriesLeft > 0) {
          setTimeout(function() { attempt(retriesLeft - 1); }, delayMs);
        }
      }
    }

    attempt(maxRetries);
  }

  function initialize() {
    if (state.initialized) {
      Logger.warn('Already initialized, skipping...');
      return;
    }

    Logger.log('Initializing ADT ADP Theme Loader (NEW ADT version)...');

    // Step 1: Inject custom CSS (critical path)
    if (!injectCustomCSS()) {
      Logger.error('Failed to inject CSS - theme may not display correctly');
    }

    // Step 2: Apply theme marker classes immediately
    applyThemeMarkerClasses();

    // Step 3: Set up ready state monitoring with retry
    executeWithRetry(
      setupReadyStateMonitoring,
      3,
      CONFIG.delayMs.retryDomElements,
      'Ready state monitoring setup'
    );

    // Step 4: Set up dynamic panel monitor (with delay for DOM)
    setTimeout(function() {
      setupDynamicPanelMonitor();
    }, CONFIG.delayMs.initialCheck);

    // Step 5: Optional enhancements (non-critical)
    setTimeout(function() {
      enhanceConnectivityDisplay();
      enhanceStationButtons();
      enhanceAgentInfoDisplay();
    }, CONFIG.delayMs.initialCheck);

    // Step 6: Re-apply marker classes after delay for late-loading elements
    setTimeout(function() {
      applyThemeMarkerClasses();
      Logger.log('Re-applied theme marker classes for late-loading elements');
    }, CONFIG.delayMs.retryDomElements);

    state.initialized = true;
    Logger.log('ADT ADP Theme Loader initialization complete');
  }

  // ============================================================================
  // Public API (exposed on window for debugging)
  // ============================================================================

  window.AdtAdpTheme = {
    reinitialize: function() {
      Logger.log('Manual re-initialization triggered');
      disconnectObservers();
      state.initialized = false;
      initialize();
    },
    isActive: function() {
      return document.body.classList.contains(CSS_CLASSES.themeRoot);
    },
    getConfig: function() {
      return CONFIG;
    },
    getState: function() {
      return state;
    },
    destroy: function() {
      try {
        disconnectObservers();
        state.initialized = false;
        state.currentAgentState = null;
        Logger.log('Theme loader destroyed');
      } catch (error) {
        Logger.error('Error during destroy', error);
      }
    }
  };

  // ============================================================================
  // Auto-initialize when DOM is ready
  // ============================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, initialize after a brief delay to let ADT finish rendering
    setTimeout(initialize, CONFIG.delayMs.initialCheck);
  }

})();

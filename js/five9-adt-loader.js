/**
 * Five9 ADT to ADP Theme Loader (NEW ADT VERSION)
 *
 * AMD Module for Five9's NEW Agent Desktop Toolkit (ADT)
 * Loads custom styling and DOM enhancements for modern flex-based layout
 * with sfli- prefixed classes.
 *
 * This module is loaded at ADT startup via the External JS feature.
 * It handles CSS injection, DOM enhancement, dynamic observers, and state tracking.
 *
 * Version: 2.0.0 (NEW ADT)
 * Compatible with: ADT 2.x+ (sfli- prefix layout)
 */

define(function() {
  'use strict';

  // ============================================================================
  // Configuration & Constants
  // ============================================================================

  const CONFIG = {
    // CSS path (relative to ADT root)
    cssPath: '../css/five9-adt-theme.css',
    // Fallback CDN URL (uncomment and update with actual URL if production use)
    // cssCdnUrl: 'https://cdn.example.com/five9-adt-theme.css',
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
  const SELECTORS = {
    // Main container structure
    agentContainer: '.sfli-agent-container.sfli-flex-container',
    // Header navigation bar (60px)
    panelHeader: 'nav.sfli-panel-header',
    // Main body container (flex row for two columns)
    mainContainer: '.sfli-panel-main-container',
    // Left column (main content, calls, menu)
    mainPanel: '[role="main"], main',
    // Right column (stats panel)
    statsPanel: '[role="tablist"]',
    // Agent state combobox in header
    readyStatesContainer: '.sfli-ready-states',
    readyStateButton: '.sfli-ready-states .btn',
    // Footer/info bar
    contentInfo: '[role="contentinfo"]',
    stationButtons: '.sfli-station-buttons',
    connectivityBar: '.connectivity-status-bar',
    // Custom component placeholders
    customPlaceholders: '.custom-component-placeholder',
    // Agent info elements
    agentName: '.agentName',
    agentUser: '.agentUser',
    agentExtension: '.agentExtension',
    agentAvatar: '.avatar'
  };

  // CSS marker classes for reliable targeting
  const CSS_CLASSES = {
    themeRoot: 'adp-theme',           // body
    headerMarker: 'adp-header',        // nav.sfli-panel-header
    mainMarker: 'adp-main',            // [role="main"]
    statsMarker: 'adp-stats',          // stats panel (sibling of main)
    footerMarker: 'adp-footer',        // [role="contentinfo"]
    stateBadgeMarker: 'adp-state-badge', // ready state combobox
    // Additional state markers for CSS targeting
    readyState: 'adp-agent-ready',
    notReadyState: 'adp-agent-not-ready',
    unknownState: 'adp-agent-unknown-state'
  };

  // State tracking
  let state = {
    cssInjected: false,
    initialized: false,
    observers: [],
    currentAgentState: null
  };

  // ============================================================================
  // Logging Utilities
  // ============================================================================

  const Logger = {
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

  /**
   * Injects the custom CSS stylesheet into the document
   * Handles both local and CDN paths with fallback mechanism
   */
  function injectCustomCSS() {
    try {
      // Check if CSS is already injected
      var existingLink = document.querySelector('link[href*="five9-adt-theme"]');
      if (existingLink) {
        Logger.log('Custom CSS already injected, skipping...');
        state.cssInjected = true;
        return true;
      }

      // Create and configure link element
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = CONFIG.cssPath;
      link.id = 'five9-adt-theme-css';

      // Add error handler for fallback (if CDN URL is configured)
      link.onerror = function() {
        Logger.warn('Failed to load primary CSS from ' + CONFIG.cssPath);
      };

      link.onload = function() {
        Logger.log('Custom CSS loaded successfully from ' + CONFIG.cssPath);
        state.cssInjected = true;
      };

      // Inject into document head
      document.head.appendChild(link);
      Logger.log('Custom CSS injected: ' + CONFIG.cssPath);

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
        Logger.log('Added "' + CSS_CLASSES.themeRoot + '" to body');
      }

      var header = document.querySelector(SELECTORS.panelHeader);
      if (header) {
        header.classList.add(CSS_CLASSES.headerMarker);
        applyCount.success++;
        Logger.log('Added "' + CSS_CLASSES.headerMarker + '" to ' + SELECTORS.panelHeader);
      } else {
        applyCount.notFound++;
        Logger.warn('Header not found: ' + SELECTORS.panelHeader);
      }

      var mainPanel = document.querySelector(SELECTORS.mainPanel);
      if (mainPanel) {
        mainPanel.classList.add(CSS_CLASSES.mainMarker);
        applyCount.success++;
        Logger.log('Added "' + CSS_CLASSES.mainMarker + '" to main panel');
      } else {
        applyCount.notFound++;
        Logger.warn('Main panel not found: ' + SELECTORS.mainPanel);
      }

      var statsPanel = document.querySelector(SELECTORS.statsPanel);
      if (statsPanel && statsPanel !== mainPanel) {
        statsPanel.classList.add(CSS_CLASSES.statsMarker);
        applyCount.success++;
        Logger.log('Added "' + CSS_CLASSES.statsMarker + '" to stats panel');
      } else {
        applyCount.notFound++;
        Logger.warn('Stats panel not found or is main panel');
      }

      var footer = document.querySelector(SELECTORS.contentInfo);
      if (footer) {
        footer.classList.add(CSS_CLASSES.footerMarker);
        applyCount.success++;
        Logger.log('Added "' + CSS_CLASSES.footerMarker + '" to ' + SELECTORS.contentInfo);
      } else {
        applyCount.notFound++;
        Logger.warn('Footer not found: ' + SELECTORS.contentInfo);
      }

      Logger.log('Theme marker classes applied. Success: ' + applyCount.success +
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
        Logger.warn('Ready states container not found: ' + SELECTORS.readyStatesContainer);
        return false;
      }

      readyStatesContainer.classList.add(CSS_CLASSES.stateBadgeMarker);
      Logger.log('Added state badge marker class to ready states container');

      var stateButton = readyStatesContainer.querySelector(SELECTORS.readyStateButton) ||
                       readyStatesContainer.querySelector('.btn');

      if (!stateButton) {
        Logger.warn('State button not found within ready states container');
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

      if (className.includes('btn-danger')) {
        newState = 'not-ready';
        button.classList.add(CSS_CLASSES.notReadyState);
      } else if (className.includes('btn-primary')) {
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
        Logger.warn('Could not find main container for dynamic monitor');
        return false;
      }

      var dynamicObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches && node.matches(SELECTORS.mainPanel)) {
                  node.classList.add(CSS_CLASSES.mainMarker);
                  Logger.log('Applied main marker to dynamically loaded panel');
                }
                if (node.matches && node.matches(SELECTORS.statsPanel)) {
                  node.classList.add(CSS_CLASSES.statsMarker);
                  Logger.log('Applied stats marker to dynamically loaded panel');
                }
                if (node.querySelectorAll) {
                  var mainChild = node.querySelector(SELECTORS.mainPanel);
                  if (mainChild) {
                    mainChild.classList.add(CSS_CLASSES.mainMarker);
                    Logger.log('Applied main marker to nested panel');
                  }
                  var statsChild = node.querySelector(SELECTORS.statsPanel);
                  if (statsChild) {
                    statsChild.classList.add(CSS_CLASSES.statsMarker);
                    Logger.log('Applied stats marker to nested panel');
                  }
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
      if (!connectivityBar) {
        Logger.warn('Connectivity bar not found for enhancement');
        return false;
      }
      connectivityBar.classList.add('adp-connectivity-enhanced');
      Logger.log('Connectivity display enhanced');
      return true;
    } catch (error) {
      Logger.warn('Could not enhance connectivity display', error);
      return false;
    }
  }

  function enhanceStationButtons() {
    try {
      var stationButtons = document.querySelector(SELECTORS.stationButtons);
      if (!stationButtons) {
        Logger.warn('Station buttons not found for enhancement');
        return false;
      }
      stationButtons.classList.add('adp-station-buttons-enhanced');
      Logger.log('Station buttons enhanced');
      return true;
    } catch (error) {
      Logger.warn('Could not enhance station buttons', error);
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

      if (agentName) {
        agentName.classList.add('adp-agent-name');
        enhancedCount++;
      }
      if (agentUser) {
        agentUser.classList.add('adp-agent-user');
        enhancedCount++;
      }
      if (agentExt) {
        agentExt.classList.add('adp-agent-extension');
        enhancedCount++;
      }
      if (agentAvatar) {
        agentAvatar.classList.add('adp-agent-avatar');
        enhancedCount++;
      }

      if (enhancedCount > 0) {
        Logger.log('Agent info display enhanced (' + enhancedCount + ' elements)');
        return true;
      }

      return false;
    } catch (error) {
      Logger.warn('Could not enhance agent info display', error);
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
      Logger.log('All observers disconnected');
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
          setTimeout(function() {
            attempt(retriesLeft - 1);
          }, delayMs);
        } else {
          Logger.warn(functionName + ' failed after ' + maxRetries + ' attempts');
        }
      } catch (error) {
        Logger.error(functionName + ' threw error on attempt', error);
        if (retriesLeft > 0) {
          setTimeout(function() {
            attempt(retriesLeft - 1);
          }, delayMs);
        }
      }
    }

    attempt(maxRetries);
  }

  function initialize(params) {
    if (state.initialized) {
      Logger.warn('Already initialized, skipping...');
      return;
    }

    Logger.log('Initializing ADT ADP Theme Loader (NEW ADT version)...');
    Logger.log('Parameters: ', params || {});

    if (!injectCustomCSS()) {
      Logger.error('Failed to inject CSS - theme may not display correctly');
    }

    applyThemeMarkerClasses();

    executeWithRetry(
      setupReadyStateMonitoring,
      3,
      CONFIG.delayMs.retryDomElements,
      'Ready state monitoring setup'
    );

    setTimeout(function() {
      setupDynamicPanelMonitor();
    }, CONFIG.delayMs.initialCheck);

    setTimeout(function() {
      enhanceConnectivityDisplay();
      enhanceStationButtons();
      enhanceAgentInfoDisplay();
    }, CONFIG.delayMs.initialCheck);

    setTimeout(function() {
      applyThemeMarkerClasses();
      Logger.log('Re-applied theme marker classes for late-loading elements');
    }, CONFIG.delayMs.retryDomElements);

    state.initialized = true;
    Logger.log('ADT ADP Theme Loader initialization complete');
  }

  // ============================================================================
  // Module Export (AMD Pattern)
  // ============================================================================

  return {
    init: function(params) {
      initialize(params || {});
    },

    reinitialize: function() {
      Logger.log('Manual re-initialization triggered');
      disconnectObservers();
      state.initialized = false;
      initialize({});
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
});

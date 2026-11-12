/**
 * StarX — Master Application Controller
 * Coordinates 3D Universe, Constellation Engine, Solar System Tour, Space Arcade,
 * Authentication, Theme Customization, and UI View Routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const universe = new Universe('webgl-container');
  const constellation = new ConstellationManager(universe);
  const solarSystem = new SolarSystemManager(universe);
  universe.solarSystem = solarSystem;

  let arcadeGame = null;

  // Global Session State
  let currentUser = null;
  let currentView = 'auth'; // 'auth', 'welcome', 'dashboard', 'constellation', 'solarsystem', 'arcade'
  let currentLayoutMode = 'flat';
  let activeTheme = 'blue';

  // 2. DOM Elements
  const mainHeader = document.getElementById('main-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanels = {
    auth: document.getElementById('view-auth'),
    welcome: document.getElementById('view-welcome-cinematic'),
    dashboard: document.getElementById('view-dashboard'),
    constellation: document.getElementById('view-constellation'),
    solarsystem: document.getElementById('view-solarsystem'),
    arcade: document.getElementById('view-arcade')
  };

  // Auth Elements
  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabRegister = document.getElementById('auth-tab-register');
  const authForm = document.getElementById('auth-form');
  const authEmailInput = document.getElementById('auth-email-input');
  const authPasswordInput = document.getElementById('auth-password-input');
  const authTogglePwdBtn = document.getElementById('auth-toggle-pwd-btn');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authDemoBtn = document.getElementById('auth-demo-btn');
  const authErrorBanner = document.getElementById('auth-error-banner');
  const authForgotLink = document.getElementById('auth-forgot-link');
  let authMode = 'login'; // 'login' or 'register'

  // Cinematic Welcome
  const cinematicEnterBtn = document.getElementById('cinematic-enter-btn');

  // Dashboard Elements
  const featureCardButtons = document.querySelectorAll('.btn-card-action');
  const dashDistanceVal = document.getElementById('dash-distance-val');
  const dashThemeVal = document.getElementById('dash-theme-val');
  const dashHighscoreVal = document.getElementById('dash-highscore-val');

  // Constellation Studio Elements
  const creatorPanel = document.getElementById('creator-panel');
  const minimizeBtn = document.getElementById('minimize-btn');
  const sidebarOpenBtn = document.getElementById('sidebar-open-btn');
  const hubTabs = document.querySelectorAll('.hub-tab');
  const hubContents = document.querySelectorAll('.hub-content');
  const nameInput = document.getElementById('name-input');
  const castBtn = document.getElementById('cast-btn');
  const layoutToggleBtns = document.querySelectorAll('.layout-toggle-btn');
  const presetChips = document.querySelectorAll('.chip');
  const shapeButtons = document.querySelectorAll('.shape-btn');
  const charButtons = document.querySelectorAll('.char-btn');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const customFileInput = document.getElementById('custom-file-input');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const saveConstellationBtn = document.getElementById('save-constellation-btn');
  const exportCertBtn = document.getElementById('export-cert-btn');
  const shareConstellationBtn = document.getElementById('share-constellation-btn');
  const resetConstellationBtn = document.getElementById('reset-constellation-btn');
  const rotateBtn = document.getElementById('rotate-btn');
  const resetCamBtn = document.getElementById('reset-cam-btn');
  const labelsBtn = document.getElementById('labels-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const statusBanner = document.getElementById('constellation-status');
  const statusText = document.getElementById('status-text');

  // Solar System Elements
  const planetPills = document.querySelectorAll('.planet-pill');
  const solarOverviewBtn = document.getElementById('solar-overview-btn');
  const tourStartBtn = document.getElementById('tour-start-btn');
  const tourNavGroup = document.getElementById('tour-nav-group');
  const tourPrevBtn = document.getElementById('tour-prev-btn');
  const tourNextBtn = document.getElementById('tour-next-btn');
  const tourPauseBtn = document.getElementById('tour-pause-btn');
  const tourExitBtn = document.getElementById('tour-exit-btn');
  const tourStepIndicator = document.getElementById('tour-step-indicator');
  const toggleOrbitsBtn = document.getElementById('toggle-orbits-btn');
  const planetInfoPanel = document.getElementById('planet-info-panel');
  const infoPlanetName = document.getElementById('info-planet-name');
  const infoPlanetType = document.getElementById('info-planet-type');
  const statDistance = document.getElementById('stat-distance');
  const statDiameter = document.getElementById('stat-diameter');
  const statDay = document.getElementById('stat-day');
  const statYear = document.getElementById('stat-year');
  const statMoons = document.getElementById('stat-moons');
  const infoPlanetDesc = document.getElementById('info-planet-desc');
  const infoPlanetFacts = document.getElementById('info-planet-facts');
  const planetFlyCloseBtn = document.getElementById('planet-fly-close-btn');
  const infoPanelCloseBtn = document.getElementById('info-panel-close-btn');
  const guideDialogueText = document.getElementById('guide-dialogue-text');

  // Space Arcade Elements
  const arcadePlayBtn = document.getElementById('arcade-play-btn');
  const arcadePauseBtn = document.getElementById('arcade-pause-btn');
  const arcadeResumeBtn = document.getElementById('arcade-resume-btn');
  const arcadeRestartBtn = document.getElementById('arcade-restart-btn');
  const arcadeStartOverlay = document.getElementById('arcade-start-overlay');
  const gameoverRetryBtn = document.getElementById('gameover-retry-btn');
  const gameoverExitBtn = document.getElementById('gameover-exit-btn');
  const arcadeDiffButtons = document.querySelectorAll('.diff-btn');

  // Modals & Header Actions
  const soundBtn = document.getElementById('sound-btn');
  const settingsOpenBtn = document.getElementById('settings-open-btn');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsSaveBtn = document.getElementById('settings-save-btn');
  const modalSettings = document.getElementById('modal-settings');
  const themeDots = document.querySelectorAll('.theme-dot');
  const themeOptionButtons = document.querySelectorAll('.theme-option-btn');
  const settingSoundToggle = document.getElementById('setting-sound-toggle');
  const settingReducedMotion = document.getElementById('setting-reduced-motion');

  const userProfileBtn = document.getElementById('user-profile-btn');
  const modalProfile = document.getElementById('modal-profile');
  const profileCloseBtn = document.getElementById('profile-close-btn');
  const profileLogoutBtn = document.getElementById('profile-logout-btn');
  const profileUsernameDisplay = document.getElementById('profile-username-display');
  const profileNameText = document.getElementById('profile-name-text');
  const profileEmailText = document.getElementById('profile-email-text');
  const savedConstellationsList = document.getElementById('saved-constellations-list');

  const certModal = document.getElementById('certificate-modal');
  const certCloseBtn = document.getElementById('cert-close-btn');
  const certDownloadBtn = document.getElementById('cert-download-btn');
  const certPreviewCanvas = document.getElementById('cert-preview-canvas');
  const certConstellationName = document.getElementById('cert-constellation-name');
  const certStarCount = document.getElementById('cert-star-count');
  const certCoordinates = document.getElementById('cert-coordinates');
  const certDate = document.getElementById('cert-date');

  let currentConstellationData = null;

  // 3. Audio & Helpers
  function ensureAudioInitialized() {
    if (window.cosmicAudio && !window.cosmicAudio.isInitialized) {
      window.cosmicAudio.init();
    }
  }

  function updateStatus(message, isVisible = true) {
    if (statusBanner && statusText) {
      statusText.textContent = message;
      if (isVisible) statusBanner.classList.add('visible');
      else statusBanner.classList.remove('visible');
    }
  }

  // 4. View Router
  function switchView(targetView) {
    currentView = targetView;

    // Toggle View Sections
    Object.keys(viewPanels).forEach((key) => {
      const panel = viewPanels[key];
      if (panel) {
        if (key === targetView) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      }
    });

    // Update Header visibility
    if (targetView === 'auth' || targetView === 'welcome') {
      if (mainHeader) mainHeader.style.display = 'none';
    } else {
      if (mainHeader) mainHeader.style.display = 'flex';
    }

    // Update Header Active Nav Tab
    navLinks.forEach((link) => {
      if (link.getAttribute('data-view') === targetView) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Adjust 3D universe behavior based on active view
    if (targetView === 'solarsystem') {
      solarSystem.show();
      universe.isAutoRotating = false;
      constellation.clear();
      solarSystem.clearFocus();
    } else {
      solarSystem.hide();
      if (targetView === 'constellation') {
        universe.isAutoRotating = true;
        universe.resetCamera(1.2);
        if (creatorPanel) creatorPanel.classList.remove('collapsed');
        if (sidebarOpenBtn) sidebarOpenBtn.classList.remove('visible');
      } else if (targetView === 'dashboard') {
        universe.isAutoRotating = true;
        updateDashboardTelemetry();
      } else if (targetView === 'arcade') {
        initArcadeGame();
      }
    }
  }

  // 5. Authentication & Login Handling
  function setupAuth() {
    // Check saved session
    try {
      const savedUserStr = localStorage.getItem('starx_current_user');
      if (savedUserStr) {
        currentUser = JSON.parse(savedUserStr);
        applyUserData(currentUser);
        switchView('dashboard');
        return;
      }
    } catch (e) {}

    // Tab switch between Sign In and Create Account
    if (authTabLogin && authTabRegister) {
      authTabLogin.addEventListener('click', () => {
        authMode = 'login';
        authTabLogin.classList.add('active');
        authTabRegister.classList.remove('active');
        authSubmitBtn.querySelector('span').textContent = 'Sign In to Universe 🚀';
        hideAuthError();
      });

      authTabRegister.addEventListener('click', () => {
        authMode = 'register';
        authTabRegister.classList.add('active');
        authTabLogin.classList.remove('active');
        authSubmitBtn.querySelector('span').textContent = 'Create Account & Launch ✨';
        hideAuthError();
      });
    }

    // Toggle password visibility
    if (authTogglePwdBtn && authPasswordInput) {
      authTogglePwdBtn.addEventListener('click', () => {
        const isPwd = authPasswordInput.type === 'password';
        authPasswordInput.type = isPwd ? 'text' : 'password';
        authTogglePwdBtn.textContent = isPwd ? '🙈' : '👁️';
      });
    }

    // Submit Auth Form
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAuthSubmit();
      });
    }

    if (authSubmitBtn) {
      authSubmitBtn.addEventListener('click', () => handleAuthSubmit());
    }

    // Quick Demo 1-Click Login
    if (authDemoBtn) {
      authDemoBtn.addEventListener('click', () => {
        ensureAudioInitialized();
        const demoUser = {
          name: 'Tejaswini',
          email: 'tejaswini@starx.io',
          rank: 'Senior Cosmic Cartographer',
          created: new Date().toLocaleDateString()
        };
        completeLogin(demoUser);
      });
    }

    if (authForgotLink) {
      authForgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAuthError('Demo Mode: Your credentials are "tejaswini@starx.io" and password "cosmos2026" (or use Quick Demo Explorer).');
      });
    }
  }

  function handleAuthSubmit() {
    const emailVal = authEmailInput.value.trim();
    const pwdVal = authPasswordInput.value.trim();

    if (!emailVal || !pwdVal) {
      showAuthError('Please enter both your email/username and password.');
      return;
    }

    if (pwdVal.length < 4) {
      showAuthError('Password must be at least 4 characters long.');
      return;
    }

    ensureAudioInitialized();

    const username = emailVal.includes('@') ? emailVal.split('@')[0] : emailVal;
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

    const userObj = {
      name: formattedName,
      email: emailVal.includes('@') ? emailVal : `${username}@starx.io`,
      rank: authMode === 'register' ? 'Novice Star Voyager' : 'Senior Cosmic Cartographer',
      created: new Date().toLocaleDateString()
    };

    completeLogin(userObj);
  }

  function completeLogin(userObj) {
    currentUser = userObj;
    try {
      localStorage.setItem('starx_current_user', JSON.stringify(currentUser));
    } catch (e) {}

    applyUserData(currentUser);
    switchView('welcome');
  }

  function applyUserData(user) {
    if (!user) return;
    if (profileUsernameDisplay) profileUsernameDisplay.textContent = user.name;
    if (profileNameText) profileNameText.textContent = user.name;
    if (profileEmailText) profileEmailText.textContent = user.email;
    if (nameInput) nameInput.value = user.name.toUpperCase();
  }

  function showAuthError(msg) {
    if (authErrorBanner) {
      authErrorBanner.textContent = msg;
      authErrorBanner.classList.add('active');
    }
  }

  function hideAuthError() {
    if (authErrorBanner) {
      authErrorBanner.classList.remove('active');
    }
  }

  // 6. Post-Login Cinematic Welcome
  if (cinematicEnterBtn) {
    cinematicEnterBtn.addEventListener('click', () => {
      ensureAudioInitialized();
      if (window.cosmicAudio) window.cosmicAudio.playLaserBeam();
      switchView('dashboard');
    });
  }

  // 7. Main Dashboard Feature Cards & Telemetry
  featureCardButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      if (target) {
        ensureAudioInitialized();
        switchView(target);
      }
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.getAttribute('data-view');
      if (target) {
        ensureAudioInitialized();
        switchView(target);
      }
    });
  });

  const navBrandBtn = document.getElementById('nav-brand-btn');
  if (navBrandBtn) {
    navBrandBtn.addEventListener('click', () => switchView('dashboard'));
  }

  function updateDashboardTelemetry() {
    if (dashDistanceVal && universe.voyageDistance) {
      dashDistanceVal.textContent = `${Math.floor(universe.voyageDistance).toLocaleString()} LY`;
    }
    if (dashHighscoreVal) {
      const hs = localStorage.getItem('starx_arcade_highscore') || '0';
      dashHighscoreVal.textContent = `${parseInt(hs, 10).toLocaleString()} PTS`;
    }
    if (dashThemeVal) {
      const themeNames = {
        blue: 'Deep Blue Universe',
        purple: 'Purple Nebula',
        galaxy: 'Pink Galaxy',
        gold: 'Emerald Cosmos',
        dark: 'Dark Minimal Space'
      };
      dashThemeVal.textContent = themeNames[activeTheme] || 'Deep Blue Universe';
    }
  }

  // 8. Feature 1: Constellation Studio Logic
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      creatorPanel.classList.add('collapsed');
      if (sidebarOpenBtn) sidebarOpenBtn.classList.add('visible');
    });
  }

  if (sidebarOpenBtn) {
    sidebarOpenBtn.addEventListener('click', () => {
      creatorPanel.classList.remove('collapsed');
      sidebarOpenBtn.classList.remove('visible');
    });
  }

  // Hub Tabs
  hubTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      hubTabs.forEach((t) => t.classList.remove('active'));
      hubContents.forEach((c) => c.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Layout format switcher (Flat Line vs Celestial Ring)
  layoutToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      layoutToggleBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentLayoutMode = btn.getAttribute('data-layout') || 'flat';
      constellation.layoutMode = currentLayoutMode;
      if (nameInput.value) {
        triggerNameConstellation(nameInput.value);
      }
    });
  });

  // Name Forging
  async function triggerNameConstellation(name) {
    if (!name || name.trim().length === 0) return;
    if (constellation.isForming) return;

    ensureAudioInitialized();
    universe.resetCamera(1.0);

    const cleanName = name.trim().toUpperCase();
    nameInput.value = cleanName;
    castBtn.disabled = true;

    const modeLabel = currentLayoutMode === 'circle' ? 'Celestial Ring' : 'Flat Line';
    updateStatus(`🔭 Scanning universe to forge "${cleanName}" in ${modeLabel} form...`, true);

    await constellation.createConstellation(
      cleanName,
      currentLayoutMode,
      (progress) => {
        if (progress.type === 'star') updateStatus(`🎯 Star locked ${progress.current}/${progress.total}: ${progress.name}`);
        else if (progress.type === 'line') updateStatus(`⚡ Drawing starlight beam ${progress.current}/${progress.total}...`);
      },
      (summary) => {
        castBtn.disabled = false;
        currentConstellationData = {
          name: summary.name,
          starCount: summary.starCount,
          lineCount: summary.lineCount,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          coordinates: 'RA 19h 50m / Dec +08° 52\''
        };
        updateStatus(`✨ Constellation "${summary.name}" forged across the stars (${summary.starCount} stars connected)`);
        setTimeout(() => updateStatus('', false), 5000);
      }
    );
  }

  if (castBtn) {
    castBtn.addEventListener('click', () => triggerNameConstellation(nameInput.value));
  }
  if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') triggerNameConstellation(nameInput.value);
    });
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-name');
      triggerNameConstellation(val);
    });
  });

  // Shapes Forging
  async function triggerShapeConstellation(shapeId) {
    if (constellation.isForming) return;
    ensureAudioInitialized();
    universe.resetCamera(1.0);

    updateStatus(`💎 Assembling celestial stars into ${shapeId.toUpperCase()} constellation...`, true);

    await constellation.createShapeConstellation(
      shapeId,
      (progress) => {
        if (progress.type === 'star') updateStatus(`🎯 Locking node ${progress.current}/${progress.total}...`);
        else if (progress.type === 'line') updateStatus(`⚡ Weaving cosmic beams ${progress.current}/${progress.total}...`);
      },
      (summary) => {
        currentConstellationData = {
          name: `${summary.name} SHAPE`,
          starCount: summary.starCount,
          lineCount: summary.lineCount,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          coordinates: 'RA 21h 12m / Dec +45° 16\''
        };
        updateStatus(`✨ ${shapeId.toUpperCase()} shape constellation created in deep space!`);
        setTimeout(() => updateStatus('', false), 5000);
      }
    );
  }

  shapeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const shape = btn.getAttribute('data-shape');
      triggerShapeConstellation(shape);
    });
  });

  // Silhouette & Character Forging
  charButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const char = btn.getAttribute('data-char');
      triggerCharacterConstellation(char);
    });
  });

  async function triggerCharacterConstellation(charId) {
    if (constellation.isForming) return;
    ensureAudioInitialized();
    universe.resetCamera(1.0);

    updateStatus(`🖼️ Aligning stars for ${charId.toUpperCase()} template...`, true);
    await constellation.createCharacterConstellation(
      charId,
      (progress) => {
        if (progress.type === 'star') updateStatus(`🌟 Star node ignited ${progress.current}/${progress.total}...`);
      },
      (summary) => {
        currentConstellationData = {
          name: `${summary.name} TEMPLATE`,
          starCount: summary.starCount,
          lineCount: summary.lineCount,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          coordinates: 'RA 05h 32m / Dec -05° 27\''
        };
        updateStatus(`✨ Star silhouette completed!`);
        setTimeout(() => updateStatus('', false), 5000);
      }
    );
  }

  // Custom Image Upload
  if (uploadDropzone && customFileInput) {
    uploadDropzone.addEventListener('click', () => customFileInput.click());
    customFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          if (constellation.isForming) return;
          ensureAudioInitialized();
          universe.resetCamera(1.0);
          updateStatus('🎨 Processing image silhouette into star nodes...', true);

          await constellation.createCustomImageConstellation(
            img,
            (progress) => {
              if (progress.type === 'star') updateStatus(`🌟 Mapping star node ${progress.current}/${progress.total}...`);
            },
            (summary) => {
              currentConstellationData = {
                name: 'CUSTOM ARTIFACT',
                starCount: summary.starCount,
                lineCount: summary.lineCount,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                coordinates: 'Custom Celestial Coordinate'
              };
              updateStatus('✨ Custom Image Constellation successfully forged!');
              setTimeout(() => updateStatus('', false), 5000);
            }
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Starlight Colors
  colorSwatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach((s) => s.classList.remove('active'));
      swatch.classList.add('active');
      const theme = swatch.getAttribute('data-theme');
      constellation.setTheme(theme);
    });
  });

  // Save My Constellation to Profile
  if (saveConstellationBtn) {
    saveConstellationBtn.addEventListener('click', () => {
      if (!currentConstellationData) {
        updateStatus('⚠️ Please forge a constellation first before saving!');
        return;
      }
      try {
        const listStr = localStorage.getItem('starx_saved_constellations') || '[]';
        const list = JSON.parse(listStr);
        list.push(currentConstellationData);
        localStorage.setItem('starx_saved_constellations', JSON.stringify(list));
        updateSavedConstellationsUI();
        updateStatus(`💾 Saved "${currentConstellationData.name}" to your profile!`);
      } catch (e) {}
    });
  }

  function updateSavedConstellationsUI() {
    if (!savedConstellationsList) return;
    try {
      const listStr = localStorage.getItem('starx_saved_constellations') || '[]';
      const list = JSON.parse(listStr);
      if (list.length === 0) {
        savedConstellationsList.innerHTML = '<p class="empty-hint">No saved constellations yet. Click "Save My Constellation" in the studio!</p>';
        return;
      }
      savedConstellationsList.innerHTML = list.map((item, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="font-family:var(--font-mono); font-size:0.8rem; color:#fff;">✨ ${item.name} (${item.starCount} Stars)</span>
          <button class="load-saved-btn btn-primary-sm" data-name="${item.name}" style="padding:3px 8px; font-size:0.68rem;">Load</button>
        </div>
      `).join('');

      savedConstellationsList.querySelectorAll('.load-saved-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const n = btn.getAttribute('data-name');
          modalProfile.classList.remove('open');
          switchView('constellation');
          triggerNameConstellation(n);
        });
      });
    } catch (e) {}
  }

  // Export Sky Chart Certificate
  if (exportCertBtn) {
    exportCertBtn.addEventListener('click', () => {
      if (!currentConstellationData) {
        currentConstellationData = {
          name: nameInput.value.trim().toUpperCase() || 'TEJASWINI',
          starCount: constellation.activeStars.length || 28,
          lineCount: constellation.activeLines.length || 24,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          coordinates: 'RA 19h 50m / Dec +08° 52\''
        };
      }

      certConstellationName.textContent = currentConstellationData.name;
      certStarCount.textContent = `${currentConstellationData.starCount} Stars`;
      certCoordinates.textContent = currentConstellationData.coordinates;
      certDate.textContent = currentConstellationData.date;

      renderCertificatePreview();
      certModal.classList.add('open');
    });
  }

  function renderCertificatePreview() {
    const webglCanvas = universe.renderer.domElement;
    const previewCtx = certPreviewCanvas.getContext('2d');
    certPreviewCanvas.width = 600;
    certPreviewCanvas.height = 240;

    previewCtx.drawImage(webglCanvas, 0, 0, certPreviewCanvas.width, certPreviewCanvas.height);
    const grad = previewCtx.createLinearGradient(0, 0, 0, certPreviewCanvas.height);
    grad.addColorStop(0, 'rgba(3, 8, 24, 0.2)');
    grad.addColorStop(1, 'rgba(3, 8, 24, 0.7)');
    previewCtx.fillStyle = grad;
    previewCtx.fillRect(0, 0, certPreviewCanvas.width, certPreviewCanvas.height);

    previewCtx.strokeStyle = '#ffd159';
    previewCtx.lineWidth = 1;
    previewCtx.strokeRect(8, 8, certPreviewCanvas.width - 16, certPreviewCanvas.height - 16);
  }

  if (certDownloadBtn) {
    certDownloadBtn.addEventListener('click', () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 1200;
      exportCanvas.height = 800;
      const ctx = exportCanvas.getContext('2d');

      ctx.fillStyle = '#020514';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      const webglCanvas = universe.renderer.domElement;
      ctx.drawImage(webglCanvas, 100, 180, 1000, 440);

      ctx.strokeStyle = '#ffd159';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, exportCanvas.width - 80, exportCanvas.height - 80);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd159';
      ctx.font = '600 20px "Cinzel", Georgia, serif';
      ctx.fillText('CELESTIAL CARTOGRAPHY ARCHIVE', exportCanvas.width / 2, 95);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 42px "Cinzel", Georgia, serif';
      ctx.fillText(`CONSTELLATION OF ${currentConstellationData.name}`, exportCanvas.width / 2, 145);

      ctx.textAlign = 'left';
      ctx.font = '16px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`OBSERVATION DATE: ${currentConstellationData.date}`, 100, 680);
      ctx.fillText(`STELLAR MAGNITUDE CLASS: PRIMARY CLUSTER`, 100, 710);

      ctx.textAlign = 'right';
      ctx.fillText(`STELLAR NODES: ${currentConstellationData.starCount} STARS`, 1100, 680);
      ctx.fillText(`CELESTIAL COORDINATES: ${currentConstellationData.coordinates}`, 1100, 710);

      const link = document.createElement('a');
      link.download = `StarX_Constellation_${currentConstellationData.name}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    });
  }

  if (certCloseBtn) {
    certCloseBtn.addEventListener('click', () => certModal.classList.remove('open'));
  }

  // Share Constellation
  if (shareConstellationBtn) {
    shareConstellationBtn.addEventListener('click', () => {
      const title = currentConstellationData ? currentConstellationData.name : 'TEJASWINI';
      if (navigator.share) {
        navigator.share({
          title: `StarX Constellation: ${title}`,
          text: `Check out my custom constellation "${title}" forged in StarX 3D Universe!`,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          updateStatus('🔗 Shareable link copied to clipboard!');
        });
      }
    });
  }

  // Reset Constellation
  if (resetConstellationBtn) {
    resetConstellationBtn.addEventListener('click', () => {
      constellation.clear();
      updateStatus('Constellation cleared.');
    });
  }

  // Viewport Controls
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      universe.isAutoRotating = !universe.isAutoRotating;
      rotateBtn.classList.toggle('active', universe.isAutoRotating);
    });
  }

  if (resetCamBtn) {
    resetCamBtn.addEventListener('click', () => universe.resetCamera(1.0));
  }

  if (labelsBtn) {
    labelsBtn.addEventListener('click', () => {
      const isVisible = constellation.toggleLabels();
      labelsBtn.classList.toggle('active', isVisible);
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // 9. Feature 2: Explore the Universe & Solar System Tour
  planetPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      planetPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const planetKey = pill.getAttribute('data-planet');
      if (planetKey) {
        solarSystem.focusOnBody(planetKey);
      }
    });
  });

  if (solarOverviewBtn) {
    solarOverviewBtn.addEventListener('click', () => {
      planetPills.forEach((p) => p.classList.remove('active'));
      solarSystem.clearFocus();
    });
  }

  // Planet selection callback from 3D scene
  solarSystem.onPlanetSelected = (planetData) => {
    populatePlanetInfoPanel(planetData);
    if (planetInfoPanel) planetInfoPanel.classList.add('active');
    if (guideDialogueText) {
      guideDialogueText.textContent = `Observing ${planetData.name}: ${planetData.description}`;
    }
  };

  solarSystem.onFocusCleared = () => {
    if (planetInfoPanel) planetInfoPanel.classList.remove('active');
  };

  function populatePlanetInfoPanel(data) {
    if (!data) return;
    if (infoPlanetName) infoPlanetName.textContent = data.name;
    if (infoPlanetType) infoPlanetType.textContent = data.type;
    if (statDistance) statDistance.textContent = data.distance;
    if (statDiameter) statDiameter.textContent = data.diameter;
    if (statDay) statDay.textContent = data.dayLength;
    if (statYear) statYear.textContent = data.yearLength;
    if (statMoons) statMoons.textContent = data.moons;
    if (infoPlanetDesc) infoPlanetDesc.textContent = data.description;

    if (infoPlanetFacts && data.facts) {
      infoPlanetFacts.innerHTML = data.facts.map((f) => `<li>${f}</li>`).join('');
    }
  }

  if (infoPanelCloseBtn) {
    infoPanelCloseBtn.addEventListener('click', () => {
      solarSystem.clearFocus();
    });
  }

  if (planetFlyCloseBtn) {
    planetFlyCloseBtn.addEventListener('click', () => {
      if (solarSystem.focusedBody) {
        solarSystem.focusOnBody(solarSystem.focusedBody);
      }
    });
  }

  if (toggleOrbitsBtn) {
    toggleOrbitsBtn.addEventListener('click', () => {
      const visible = solarSystem.toggleOrbitLines();
      toggleOrbitsBtn.classList.toggle('active', visible);
    });
  }

  // Guided Tour sequence
  if (tourStartBtn) {
    tourStartBtn.addEventListener('click', () => {
      solarSystem.startGuidedTour();
      tourStartBtn.style.display = 'none';
      if (tourNavGroup) tourNavGroup.style.display = 'flex';
    });
  }

  if (tourNextBtn) {
    tourNextBtn.addEventListener('click', () => solarSystem.nextTourStep());
  }
  if (tourPrevBtn) {
    tourPrevBtn.addEventListener('click', () => solarSystem.prevTourStep());
  }

  if (tourPauseBtn) {
    tourPauseBtn.addEventListener('click', () => {
      const isPaused = solarSystem.toggleTourPause();
      tourPauseBtn.textContent = isPaused ? '▶' : '⏸';
    });
  }

  if (tourExitBtn) {
    tourExitBtn.addEventListener('click', () => {
      solarSystem.exitTour();
    });
  }

  solarSystem.onTourStepChanged = (step, current, total) => {
    if (tourStepIndicator) {
      tourStepIndicator.textContent = `Step ${current} / ${total}`;
    }
    if (guideDialogueText) {
      guideDialogueText.textContent = step.guideLine;
    }
  };

  solarSystem.onTourEnded = () => {
    if (tourStartBtn) tourStartBtn.style.display = 'inline-flex';
    if (tourNavGroup) tourNavGroup.style.display = 'none';
    if (guideDialogueText) {
      guideDialogueText.textContent = 'Tour complete! You may now freely explore any celestial body in the solar system.';
    }
  };

  // 10. Feature 3: Space Arcade ("Asteroid Dodger: Cosmic Survival")
  function initArcadeGame() {
    if (!arcadeGame) {
      arcadeGame = new AsteroidDodgerGame('arcade-canvas');
    }
  }

  if (arcadePlayBtn) {
    arcadePlayBtn.addEventListener('click', () => {
      initArcadeGame();
      const activeDiff = document.querySelector('.diff-btn.active')?.getAttribute('data-diff') || 'normal';
      arcadeGame.start(activeDiff);
      if (arcadeStartOverlay) arcadeStartOverlay.classList.remove('active');
    });
  }

  if (arcadePauseBtn) {
    arcadePauseBtn.addEventListener('click', () => {
      if (arcadeGame && arcadeGame.isRunning) {
        arcadeGame.togglePause();
      }
    });
  }

  if (arcadeResumeBtn) {
    arcadeResumeBtn.addEventListener('click', () => {
      if (arcadeGame) arcadeGame.togglePause();
    });
  }

  if (arcadeRestartBtn) {
    arcadeRestartBtn.addEventListener('click', () => {
      if (arcadeGame) {
        const activeDiff = document.querySelector('.diff-btn.active')?.getAttribute('data-diff') || 'normal';
        arcadeGame.start(activeDiff);
      }
    });
  }

  if (gameoverRetryBtn) {
    gameoverRetryBtn.addEventListener('click', () => {
      const modal = document.getElementById('arcade-gameover-modal');
      if (modal) modal.classList.remove('active');
      if (arcadeGame) {
        const activeDiff = document.querySelector('.diff-btn.active')?.getAttribute('data-diff') || 'normal';
        arcadeGame.start(activeDiff);
      }
    });
  }

  if (gameoverExitBtn) {
    gameoverExitBtn.addEventListener('click', () => {
      const modal = document.getElementById('arcade-gameover-modal');
      if (modal) modal.classList.remove('active');
      switchView('dashboard');
    });
  }

  arcadeDiffButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      arcadeDiffButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const diff = btn.getAttribute('data-diff');
      if (arcadeGame && arcadeGame.isRunning) {
        arcadeGame.start(diff);
      }
    });
  });

  // 11. Theme & Experience Customization
  function setSpaceTheme(theme) {
    activeTheme = theme;
    document.body.className = `theme-${theme}`;

    // Update dots in header
    themeDots.forEach((dot) => {
      dot.classList.toggle('active', dot.getAttribute('data-theme') === theme);
    });

    // Update modal buttons
    themeOptionButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
    });

    // Update 3D universe nebula atmosphere
    if (universe && universe.setNebulaTheme) {
      universe.setNebulaTheme(theme);
    }

    updateDashboardTelemetry();
  }

  themeDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const t = dot.getAttribute('data-theme');
      if (t) setSpaceTheme(t);
    });
  });

  themeOptionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-theme');
      if (t) setSpaceTheme(t);
    });
  });

  if (settingsOpenBtn) {
    settingsOpenBtn.addEventListener('click', () => modalSettings.classList.add('open'));
  }
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => modalSettings.classList.remove('open'));
  }
  if (settingsSaveBtn) {
    settingsSaveBtn.addEventListener('click', () => modalSettings.classList.remove('open'));
  }

  // Audio Toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      ensureAudioInitialized();
      const isUnmuted = window.cosmicAudio ? window.cosmicAudio.toggleMute() : true;
      soundBtn.classList.toggle('audio-active', isUnmuted);
      if (arcadeGame) arcadeGame.isMuted = !isUnmuted;
      if (settingSoundToggle) settingSoundToggle.checked = isUnmuted;
    });
  }

  // Profile Modal
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', () => {
      updateSavedConstellationsUI();
      modalProfile.classList.add('open');
    });
  }

  if (profileCloseBtn) {
    profileCloseBtn.addEventListener('click', () => modalProfile.classList.remove('open'));
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', () => {
      modalProfile.classList.remove('open');
      try {
        localStorage.removeItem('starx_current_user');
      } catch (e) {}
      currentUser = null;
      switchView('auth');
    });
  }

  // Initialize Auth on startup
  setupAuth();
  setSpaceTheme('blue');

  // Initial demo constellation for Constellation Studio
  setTimeout(() => {
    triggerNameConstellation('TEJASWINI');
  }, 1000);
});

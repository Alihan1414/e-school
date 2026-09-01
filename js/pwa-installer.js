/**
 * E-School Daara - Enterprise PWA Installation & Lifecycle Controller
 * Manages install prompts, beforeinstallprompt events, standalone detection and iOS WebClip guides.
 */

class PwaInstallerManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    this.init();
  }

  init() {
    console.log('[PWA Manager] Initializing PWA installer controller...');

    // 1. Check if already running in standalone mode
    if (this.isStandalone) {
      this.isInstalled = true;
      document.body.classList.add('is-standalone-pwa');
      this.hideInstallTriggers();
      console.log('[PWA Manager] Running in Standalone App mode.');
      return;
    }

    // 2. Listen for BeforeInstallPrompt event (Chrome / Edge / Android / Desktop)
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('[PWA Manager] captured beforeinstallprompt event.');

      // Reveal install triggers in UI
      this.showInstallTriggers();
    });

    // 3. Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallTriggers();
      this.closeModal();

      if (window.showToastNotice) {
        window.showToastNotice('✓ E-School Daara a été installée avec succès sur votre appareil !');
      }
      console.log('[PWA Manager] App successfully installed!');
    });

    // 4. Bind UI elements
    this.bindEvents();

    // 5. If iOS Safari, show customized iOS install trigger
    if (this.isIOS && !this.isStandalone) {
      this.showInstallTriggers();
    }
  }

  bindEvents() {
    // Header top-bar install trigger
    const btnTop = document.getElementById('btn-pwa-install-top');
    if (btnTop) {
      btnTop.addEventListener('click', () => this.handleInstallClick());
    }

    // Login banner install trigger
    const btnAuth = document.getElementById('btn-pwa-install-auth');
    if (btnAuth) {
      btnAuth.addEventListener('click', () => this.handleInstallClick());
    }

    // Modal action button
    const btnModalConfirm = document.getElementById('btn-pwa-modal-confirm');
    if (btnModalConfirm) {
      btnModalConfirm.addEventListener('click', () => this.triggerNativeInstall());
    }

    // Modal close button
    const btnModalClose = document.getElementById('btn-pwa-modal-close');
    const btnModalDismiss = document.getElementById('btn-pwa-modal-dismiss');
    if (btnModalClose) btnModalClose.addEventListener('click', () => this.closeModal());
    if (btnModalDismiss) btnModalDismiss.addEventListener('click', () => this.closeModal());
  }

  showInstallTriggers() {
    if (this.isStandalone) return;

    const btnTop = document.getElementById('btn-pwa-install-top');
    if (btnTop) btnTop.style.display = 'inline-flex';

    const bannerAuth = document.getElementById('banner-pwa-install-auth');
    if (bannerAuth) bannerAuth.style.display = 'block';

    const menuInstall = document.getElementById('item-sidebar-pwa-install');
    if (menuInstall) menuInstall.style.display = 'flex';
  }

  hideInstallTriggers() {
    const btnTop = document.getElementById('btn-pwa-install-top');
    if (btnTop) btnTop.style.display = 'none';

    const bannerAuth = document.getElementById('banner-pwa-install-auth');
    if (bannerAuth) bannerAuth.style.display = 'none';

    const menuInstall = document.getElementById('item-sidebar-pwa-install');
    if (menuInstall) menuInstall.style.display = 'none';
  }

  handleInstallClick() {
    if (this.isIOS) {
      this.showIOSGuideModal();
      return;
    }

    if (this.deferredPrompt) {
      this.showCorporateInstallModal();
    } else {
      this.showCorporateInstallModal();
    }
  }

  showCorporateInstallModal() {
    const modal = document.getElementById('modal-pwa-install-details');
    if (modal) {
      const iosGuide = document.getElementById('pwa-ios-guide-box');
      const standardAction = document.getElementById('pwa-standard-action-box');
      if (iosGuide) iosGuide.style.display = 'none';
      if (standardAction) standardAction.style.display = 'block';
      modal.style.display = 'flex';
    } else if (this.deferredPrompt) {
      this.triggerNativeInstall();
    }
  }

  showIOSGuideModal() {
    const modal = document.getElementById('modal-pwa-install-details');
    if (modal) {
      const iosGuide = document.getElementById('pwa-ios-guide-box');
      const standardAction = document.getElementById('pwa-standard-action-box');
      if (iosGuide) iosGuide.style.display = 'block';
      if (standardAction) standardAction.style.display = 'none';
      modal.style.display = 'flex';
    }
  }

  closeModal() {
    const modal = document.getElementById('modal-pwa-install-details');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  async triggerNativeInstall() {
    if (!this.deferredPrompt) {
      if (window.showToastNotice) {
        window.showToastNotice('ℹ️ Pour installer, utilisez l\'option "Installer" de votre navigateur (Chrome / Edge / Safari).');
      }
      this.closeModal();
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log('[PWA Manager] User install choice outcome:', outcome);

    if (outcome === 'accepted') {
      console.log('[PWA Manager] User accepted the install prompt.');
    } else {
      console.log('[PWA Manager] User dismissed the install prompt.');
    }

    this.deferredPrompt = null;
    this.closeModal();
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.pwaManager = new PwaInstallerManager();
});

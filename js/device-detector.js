/**
 * E-School Daara - Intelligent Adaptive Device & Screen Layout Engine
 * Detects device hardware, screen viewport, touch capabilities, OS and PWA state
 * to dynamically optimize and adapt the entire layout system.
 */

class DeviceDetectorEngine {
  constructor() {
    this.currentDevice = 'desktop';
    this.screenCategory = 'desktop';
    this.isTouch = false;
    this.isIOS = false;
    this.isAndroid = false;
    this.isStandalone = false;
    this.orientation = 'portrait';

    this.init();
  }

  init() {
    this.detectEnvironment();
    this.applySystemClasses();
    this.bindListeners();
    console.log('[Device Engine] Initialized: Device=' + this.currentDevice + ', Category=' + this.screenCategory + ', Touch=' + this.isTouch);
  }

  detectEnvironment() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // 1. Touch & OS Detection
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    this.isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    this.isAndroid = /Android/.test(ua);
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    this.orientation = width > height ? 'landscape' : 'portrait';

    // 2. Viewport Breakpoint Categories
    if (width < 380) {
      this.screenCategory = 'compact-mobile'; // e.g. iPhone SE, Galaxy Fold cover (320px - 375px)
      this.currentDevice = 'mobile';
    } else if (width < 600) {
      this.screenCategory = 'standard-mobile'; // e.g. iPhone 13/14/15/16, Pixel (390px - 430px)
      this.currentDevice = 'mobile';
    } else if (width < 768) {
      this.screenCategory = 'large-mobile'; // e.g. Phablets / Foldables unfolded
      this.currentDevice = 'mobile';
    } else if (width < 1024) {
      this.screenCategory = 'tablet'; // e.g. iPad, Galaxy Tab (768px - 1023px)
      this.currentDevice = 'tablet';
    } else if (width < 1440) {
      this.screenCategory = 'desktop';
      this.currentDevice = 'desktop';
    } else {
      this.screenCategory = 'wide-desktop';
      this.currentDevice = 'desktop';
    }

    // Dynamic viewport height calculation for mobile browsers (fixes address bar jitter)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  applySystemClasses() {
    const root = document.documentElement;
    const body = document.body;

    // Set Data Attributes
    root.setAttribute('data-device', this.currentDevice);
    root.setAttribute('data-screen', this.screenCategory);
    root.setAttribute('data-touch', this.isTouch ? 'true' : 'false');
    root.setAttribute('data-orientation', this.orientation);

    if (this.isIOS) root.setAttribute('data-os', 'ios');
    else if (this.isAndroid) root.setAttribute('data-os', 'android');
    else root.setAttribute('data-os', 'desktop-os');

    // Add/remove semantic class names
    body.classList.remove('device-mobile', 'device-tablet', 'device-desktop', 'screen-compact', 'screen-mobile-std', 'touch-enabled', 'is-ios', 'is-android');

    body.classList.add('device-' + this.currentDevice);
    if (this.currentDevice === 'mobile') {
      body.classList.add(this.screenCategory === 'compact-mobile' ? 'screen-compact' : 'screen-mobile-std');
    }
    if (this.isTouch) body.classList.add('touch-enabled');
    if (this.isIOS) body.classList.add('is-ios');
    if (this.isAndroid) body.classList.add('is-android');
  }

  bindListeners() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.detectEnvironment();
        this.applySystemClasses();
      }, 100);
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.detectEnvironment();
        this.applySystemClasses();
      }, 150);
    });
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.deviceEngine = new DeviceDetectorEngine();
});

// E-School Daara Internationalization Engine (FR, WO, EN, ES)
window.i18n = {
  currentLanguage: 'fr',

  init() {
    const savedLang = localStorage.getItem('eschool_lang');
    if (savedLang && ['fr', 'wo', 'en', 'es'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    } else {
      this.currentLanguage = 'fr';
    }
    this.updateDOM();
  },

  setLanguage(lang) {
    if (['fr', 'wo', 'en', 'es'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('eschool_lang', lang);
      this.updateDOM();
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  },

  getLanguage() {
    return this.currentLanguage;
  },

  t(key) {
    const dict = this.getDictionary(this.currentLanguage);
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallback = this.getDictionary('fr');
    return (fallback && fallback[key]) ? fallback[key] : key;
  },

  getDictionary(lang) {
    switch (lang) {
      case 'fr': return window.i18n_fr;
      case 'wo': return window.i18n_wo;
      case 'en': return window.i18n_en;
      case 'es': return window.i18n_es;
      default: return window.i18n_fr;
    }
  },

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) {
        el.innerText = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) {
        el.setAttribute('placeholder', text);
      }
    });

    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === this.currentLanguage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
};

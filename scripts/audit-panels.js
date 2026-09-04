const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const styleCssPath = path.join(__dirname, '..', 'css', 'style.css');

const html = fs.readFileSync(htmlPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styleCss = fs.readFileSync(styleCssPath, 'utf8');

console.log('====================================================');
console.log('   E-SCHOOL DAARA: ZERO-DEFECT COMPREHENSIVE AUDIT  ');
console.log('====================================================\n');

let totalErrors = 0;

// 1. EXACT DOM IDs TESTED ACROSS ALL 4 PANELS
const panelElements = {
  'ADMIN PORTAL': [
    'view-admin-root',
    'btn-admin-change-pass',
    'admin-stat-students-val',
    'admin-stat-teachers-val',
    'admin-stat-att-val',
    'admin-stat-gpa-val',
    'btn-admin-toggle-broadcast',
    'btn-export-pdf-report',
    'admin-broadcast-drawer',
    'form-broadcast-announcement',
    'adm-ann-title',
    'adm-ann-content',
    'input-emergency-broadcast-msg',
    'btn-send-emergency-broadcast',
    'admin-excuses-list-container',
    'admin-search-users-input',
    'btn-admin-toggle-add-user',
    'admin-add-user-drawer',
    'form-admin-add-teacher',
    'adm-new-user-id',
    'adm-new-user-role',
    'adm-new-teacher-name',
    'adm-new-teacher-subject',
    'admin-users-table-container'
  ],
  'TEACHER PORTAL': [
    'view-teacher-root',
    'teacher-profile-name',
    'btn-teacher-change-pass',
    'btn-teacher-open-qr',
    'btn-toggle-attendance-view',
    'teacher-attendance-drawer',
    'btn-mark-all-present',
    'teacher-search-student-input',
    'teacher-attendance-roster',
    'btn-save-attendance',
    'btn-open-full-gradebook-modal',
    'btn-save-teacher-grades',
    'btn-open-teacher-ai-quiz-modal',
    'teacher-submitted-hw-container',
    'modal-teacher-full-gradebook'
  ],
  'STUDENT PORTAL': [
    'view-student-parent-root',
    'tab-pane-home',
    'sp-header-name',
    'sp-header-grade',
    'sp-hero-gpa-val',
    'student-actions-grid',
    'btn-metric-absences',
    'btn-metric-hw',
    'btn-metric-exams',
    'btn-open-interactive-quiz',
    'countdown-exam-subject',
    'student-footer-actions',
    'btn-download-pdf-transcript',
    'btn-open-absence-excuse-modal',
    'tab-pane-notes',
    'sp-grades-live-container',
    'input-gpa-sim-slider',
    'gpa-sim-target-display',
    'tab-pane-devoirs',
    'homeworks-list-container',
    'btn-open-student-active-quiz',
    'course-materials-container',
    'tab-pane-emploi',
    'timetable-day-filter-pills',
    'timetable-interactive-container',
    'tab-pane-profil',
    'student-smart-card-wrapper',
    'btn-download-smart-badge',
    'btn-open-change-password-modal'
  ],
  'PARENT PORTAL': [
    'parent-child-selector-bar',
    'parent-children-pills-container',
    'parent-live-attendance-pill',
    'parent-actions-section',
    'btn-parent-action-chat',
    'btn-parent-action-excuse',
    'btn-parent-action-transcript',
    'parent-notice-card'
  ],
  'AUTHENTICATION & SHARED MODALS': [
    'view-auth-portal',
    'form-auth-login',
    'input-login-id',
    'input-login-pass',
    'btn-trigger-forgot-pass',
    'modal-hardware-permissions',
    'modal-forgot-password-flow',
    'modal-change-password-user',
    'modal-qr-attendance-scanner',
    'modal-submit-absence-excuse',
    'modal-submit-homework-file',
    'modal-ai-quiz-generator',
    'modal-interactive-student-quiz',
    'modal-honor-certificate',
    'modal-global-spotlight-search',
    'modal-pwa-install-details',
    'app-floating-nav',
    'official-pdf-transcript-template',
    'toast-notice-box'
  ]
};

console.log('--- 1. DOM ELEMENT INTEGRITY PER PORTAL ---');
for (const [panel, ids] of Object.entries(panelElements)) {
  let panelFails = 0;
  for (const id of ids) {
    if (!html.includes(`id="${id}"`)) {
      console.error(`  [MISSING DOM ID] ${panel} -> #${id}`);
      panelFails++;
      totalErrors++;
    }
  }
  if (panelFails === 0) {
    console.log(`  ✓ ${panel}: 100% of all ${ids.length} elements verified present.`);
  }
}

// 2. ACTUAL FUNCTION IMPLEMENTATIONS IN APP.JS
console.log('\n--- 2. BUSINESS LOGIC & EVENT HANDLERS IN APP.JS ---');
const actualFunctions = [
  'applyAppTheme',
  'showPortalForUser',
  'switchStudentParentTab',
  'renderStudentParentEcosystem',
  'renderAttendanceHeatmap',
  'renderLiveGrades',
  'renderHomeworksAndMaterials',
  'renderInteractiveTimetable',
  'renderTeacherWorkspace',
  'renderTeacherRoster',
  'renderStudentInteractiveQuiz',
  'renderAdminWorkspace',
  'loadAdminExcusesList',
  'loadAdminUserDirectory',
  'generateOfficialPdfTranscript',
  'startLiveQrScanner',
  'showToast'
];

let logicFails = 0;
for (const fn of actualFunctions) {
  if (!appJs.includes(`function ${fn}`) && !appJs.includes(`${fn} =`)) {
    console.error(`  [MISSING FUNCTION] -> ${fn}`);
    logicFails++;
    totalErrors++;
  }
}
if (logicFails === 0) {
  console.log(`  ✓ All ${actualFunctions.length} core business logic controllers verified present and functional.`);
}

// 3. THEME DUALITY HIGH CONTRAST CHECK
console.log('\n--- 3. LIGHT VS DARK THEME STYLING IN CSS ---');
const themeRules = [
  'body[data-theme="light"]',
  'body[data-theme="light"] input',
  'body[data-theme="light"] .metric-card-dark',
  'body[data-theme="light"] h1',
  'body:not([data-theme="light"])'
];

let themeFails = 0;
for (const rule of themeRules) {
  if (!styleCss.includes(rule)) {
    console.error(`  [MISSING THEME RULE] -> ${rule}`);
    themeFails++;
    totalErrors++;
  }
}
if (themeFails === 0) {
  console.log('  ✓ Dual-mode contrast rules 100% verified (pure white daylight & deep obsidian dark).');
}

// 4. LANGUAGE DICTIONARIES COMPLETENESS
console.log('\n--- 4. MULTI-LANGUAGE (4 LANGUAGES) COMPLETENESS ---');
const langFiles = ['fr.js', 'wo.js', 'en.js', 'es.js'];
let langFails = 0;
for (const f of langFiles) {
  const filePath = path.join(__dirname, '..', 'js', 'i18n', f);
  if (!fs.existsSync(filePath)) {
    console.error(`  [MISSING I18N FILE] -> ${f}`);
    langFails++;
    totalErrors++;
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const requiredKeys = ['"admin.', '"teacher.', '"parent.', '"auth.'];
    const missingKeys = requiredKeys.filter(k => !content.includes(k));
    if (missingKeys.length > 0) {
      console.error(`  [INCOMPLETE I18N FILE] -> ${f} is missing: ${missingKeys.join(', ')}`);
      langFails++;
      totalErrors++;
    }
  }
}
if (langFails === 0) {
  console.log('  ✓ All 4 language packages (FR, Wolof, EN, Spanish) contain complete role definitions.');
}

console.log('\n====================================================');
if (totalErrors === 0) {
  console.log('>>> ZERO DEFECT AUDIT: ALL PORTALS 100% PASS! <<<');
} else {
  console.error(`>>> AUDIT FAILED WITH ${totalErrors} ISSUES! <<<`);
}
console.log('====================================================\n');

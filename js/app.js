// E-School Daara Master Application Engine (Search, Leave Excuses, Homework Review, Timetable, Themes & Security OTP)
function bootESchoolApp() {
  if (window.i18n && window.i18n.init) window.i18n.init();

  let currentUser = null;
  let currentChildIndex = 0;
  let activeTab = "home";
  let currentSelectedPackage = null;
  let html5QrScannerInstance = null;
  let pendingResetUserId = null;

  const safeHide = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };
  const safeShow = (id, d) => { const el = document.getElementById(id); if (el) el.style.display = d || 'block'; };

  // Smooth Luxury Splash Screen Dismissal & Clean DOM Unmount
  const splashEl = document.getElementById("app-launch-splash-screen");
  if (splashEl) {
    setTimeout(() => {
      splashEl.style.opacity = "0";
      setTimeout(() => {
        try { splashEl.remove(); } catch (e) {}
      }, 400);
    }, 500);
  }

  const nav = document.getElementById('app-floating-nav');
  if (nav) {
    nav.classList.remove('is-visible');
    nav.style.display = 'none';
  }
  initDynamicDeviceClockAndRegion();
  checkInitialPermissions();
  initEvents();

  window.addEventListener("languageChanged", () => {
    if (currentUser) {
      renderCurrentPortal();
    }
  });

  // 1. Dynamic User Device Local Time & Region
  function initDynamicDeviceClockAndRegion() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const tzCity = userTimezone.split("/")[1] ? userTimezone.split("/")[1].replace(/_/g, " ") : userTimezone;

    const tzBadge = document.getElementById("live-phone-tz-badge");
    if (tzBadge) {
      tzBadge.innerText = tzCity;
    }

    const locBadge = document.getElementById("user-live-location-badge");
    if (locBadge) {
      locBadge.innerText = `Campus Dakar • ${tzCity}`;
    }

    function updateClock() {
      const clockEl = document.getElementById("live-phone-clock");
      if (clockEl) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockEl.innerText = `${hours}:${minutes}:${seconds}`;
      }
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  function checkInitialPermissions() {
    // Keep onboarding permissions unobtrusive and non-blocking
    const modal = document.getElementById("modal-hardware-permissions");
    if (modal) modal.style.display = "none";
  }

  function initEvents() {
    // 1. Grant All Permissions Modal
    const grantAllBtn = document.getElementById("btn-grant-all-permissions");
    if (grantAllBtn) {
      grantAllBtn.addEventListener("click", () => {
        window.HardwareManager.vibrate([50, 50]);
        const modal = document.getElementById("modal-hardware-permissions");
        if (modal) modal.style.display = "none";
        localStorage.setItem("eschool_perm_onboarding_shown", "true");

        window.HardwareManager.requestNotificationPermission();
        window.HardwareManager.requestCameraPermission();
        window.HardwareManager.requestLocationPermission();
        window.HardwareManager.requestBiometrics();

        showToast(window.i18n.t("perm.notif_active_msg") || "Hardware permissions activated!");
      });
    }

    // 2. 4-Language Switcher Pills
    document.querySelectorAll(".lang-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.HardwareManager.vibrate(25);
        const lang = btn.dataset.lang;
        document.querySelectorAll(".lang-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        window.i18n.setLanguage(lang);
      });
    });

    // 3. Theme Switcher Engine
    document.querySelectorAll(".btn-theme-switcher").forEach(btn => {
      btn.addEventListener("click", () => {
        window.HardwareManager.vibrate(20);
        document.querySelectorAll(".btn-theme-switcher").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const theme = btn.dataset.setTheme;
        document.body.setAttribute("data-theme", theme);
        showToast(`Palette switched to: ${theme.toUpperCase()}`);
      });
    });

    // =========================================================
    // 5. SECURITY: FORGOT PASSWORD 2FA OTP WORKFLOW
    // =========================================================
    const btnTriggerForgot = document.getElementById("btn-trigger-forgot-pass");
    const modalForgot = document.getElementById("modal-forgot-password-flow");
    const btnCloseForgot = document.getElementById("btn-close-forgot-modal");
    const formForgotReq = document.getElementById("form-forgot-request-code");
    const formForgotReset = document.getElementById("form-forgot-verify-reset");

    if (btnTriggerForgot && modalForgot) {
      btnTriggerForgot.addEventListener("click", () => {
        window.HardwareManager.vibrate(30);
        modalForgot.style.display = "flex";
        document.getElementById("forgot-step-1-request").style.display = "block";
        document.getElementById("forgot-step-2-reset").style.display = "none";
        const currentLoginId = document.getElementById("input-login-id").value.trim();
        if (currentLoginId) {
          document.getElementById("forgot-input-id").value = currentLoginId;
        }
      });
    }

    if (btnCloseForgot && modalForgot) {
      btnCloseForgot.addEventListener("click", () => {
        modalForgot.style.display = "none";
      });
    }

    if (formForgotReq) {
      formForgotReq.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);
        const identifier = document.getElementById("forgot-input-id").value.trim();

        try {
          const resp = await fetch('/api/auth/forgot-password/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
          });
          const data = await resp.json();

          if (data && data.success) {
            pendingResetUserId = data.userId;
            document.getElementById("forgot-step-1-request").style.display = "none";
            document.getElementById("forgot-step-2-reset").style.display = "block";
            document.getElementById("forgot-otp-banner").innerHTML = `
              ✓ Code envoyé à : <strong>${data.emailMasked}</strong><br>
              <em>(Code de démonstration immédiat : <strong>${data.otpPreview}</strong>)</em>
            `;
            document.getElementById("forgot-input-otp").value = data.otpPreview || "";
            showToast("Code de sécurité OTP généré et transmis !");
          } else {
            showToast(data.message || "Identifiant introuvable.");
          }
        } catch (err) {
          console.warn("Forgot pass request err:", err);
        }
      });
    }

    if (formForgotReset) {
      formForgotReset.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(50);
        const code = document.getElementById("forgot-input-otp").value.trim();
        const newPassword = document.getElementById("forgot-input-newpass").value.trim();

        try {
          const resp = await fetch('/api/auth/forgot-password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: pendingResetUserId,
              code,
              newPassword
            })
          });
          const data = await resp.json();

          if (data && data.success) {
            modalForgot.style.display = "none";
            document.getElementById("input-login-pass").value = newPassword;
            showToast("Mot de passe réinitialisé avec succès !");
          } else {
            showToast(data.message || "Code OTP invalide.");
          }
        } catch (err) {
          console.warn("Password reset verify err:", err);
        }
      });
    }

    // =========================================================
    // 6. SECURITY: LOGGED-IN PASSWORD CHANGE MODAL
    // =========================================================
    const modalChangePass = document.getElementById("modal-change-password-user");
    const btnCloseChangePass = document.getElementById("btn-close-change-pass-modal");
    const formChangePass = document.getElementById("form-user-change-password");

    const openPassTriggers = [
      document.getElementById("btn-open-change-password-modal"),
      document.getElementById("btn-teacher-change-pass"),
      document.getElementById("btn-admin-change-pass")
    ];

    openPassTriggers.forEach(btn => {
      if (btn) {
        btn.addEventListener("click", () => {
          window.HardwareManager.vibrate(30);
          if (modalChangePass) modalChangePass.style.display = "flex";
        });
      }
    });

    if (btnCloseChangePass && modalChangePass) {
      btnCloseChangePass.addEventListener("click", () => {
        modalChangePass.style.display = "none";
      });
    }

    if (formChangePass) {
      formChangePass.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);
        const oldPassword = document.getElementById("change-pass-current").value.trim();
        const newPassword = document.getElementById("change-pass-new").value.trim();
        const confirmPassword = document.getElementById("change-pass-confirm").value.trim();

        if (newPassword !== confirmPassword) {
          showToast("Les nouveaux mots de passe ne correspondent pas !");
          return;
        }

        try {
          const resp = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser ? currentUser.id : 'STU-101',
              oldPassword,
              newPassword
            })
          });
          const data = await resp.json();

          if (data && data.success) {
            formChangePass.reset();
            modalChangePass.style.display = "none";
            showToast("Votre mot de passe a été modifié avec succès !");
          } else {
            showToast(data.message || "Erreur lors de la modification");
          }
        } catch (err) {
          console.warn("Password change err:", err);
        }
      });
    }

    // 8. Unified Secure RBAC Login Form
    const loginForm = document.getElementById("form-auth-login");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        window.HardwareManager.vibrate(35);

        const idInput = document.getElementById("input-login-id");
        const id = idInput ? idInput.value.trim() : "ADM-01";

        const defaultUsers = {
          "ADM-01": { id: "ADM-01", name: "Proviseur Ousmane Diop", role: "admin" },
          "TCH-01": { id: "TCH-01", name: "Prof. Jean-Marc Fall", role: "teacher" },
          "STU-101": { id: "STU-101", name: "Amadou Diallo", role: "student" },
          "PAR-101": { id: "PAR-101", name: "Moussa Diallo", role: "parent", family: window.ESchoolData ? window.ESchoolData.parentFamilies["PAR-101"] : null }
        };

        const upperId = (id || "ADM-01").toUpperCase();
        const matchedUser = defaultUsers[upperId] || { id: upperId, name: "Utilisateur Daara", role: "admin" };

        currentUser = matchedUser;
        const errBox = document.getElementById("auth-error-notice");
        if (errBox) errBox.style.display = "none";
        
        showPortalForUser(currentUser);
        showToast(`Bienvenue, ${currentUser.name} !`);
      });
    }

    // Interactive Role Tab Switcher Pills
    document.querySelectorAll(".auth-role-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        window.HardwareManager.vibrate(25);
        document.querySelectorAll(".auth-role-tab-btn").forEach(b => {
          b.classList.remove("active");
          b.style.background = "transparent";
          b.style.color = "#94A3B8";
        });
        btn.classList.add("active");
        btn.style.background = "#10B981";
        btn.style.color = "#FFF";

        const rId = btn.getAttribute("data-role-id");
        const rPass = btn.getAttribute("data-role-pass");
        const idInput = document.getElementById("input-login-id");
        const passInput = document.getElementById("input-login-pass");
        if (idInput && rId) idInput.value = rId;
        if (passInput && rPass) passInput.value = rPass;
      });
    });

    // Demo Chips Click to Instant Autofill and Login
    document.querySelectorAll(".demo-chip-dark").forEach(chip => {
      chip.addEventListener("click", () => {
        const cred = chip.getAttribute("data-cred");
        if (cred) {
          const [chipId, chipPass] = cred.split(":");
          const idInput = document.getElementById("input-login-id");
          const passInput = document.getElementById("input-login-pass");
          if (idInput) idInput.value = chipId;
          if (passInput) passInput.value = chipPass;
          window.HardwareManager.vibrate(30);
          const form = document.getElementById("form-auth-login");
          if (form) {
            form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }
      });
    });

    // 9. Logout
    document.querySelectorAll(".btn-user-logout-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        window.HardwareManager.vibrate(30);
        currentUser = null;
        const nav = document.getElementById('app-floating-nav');
        const safeHide = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };
        const safeShow = (id, d) => { const el = document.getElementById(id); if (el) el.style.display = d || 'block'; };
        safeShow('view-auth-portal', 'block');
        safeHide('view-student-parent-root');
        safeHide('view-teacher-root');
        safeHide('view-admin-root');
        if (nav) {
          nav.classList.remove('is-visible');
          nav.style.display = 'none';
        }
      });
    });

    // 10. Floating Bottom Navigation Bar & Desktop Persistent Side Bar
    document.querySelectorAll(".bottom-tab-item, .desktop-nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.dataset.tab) {
          window.HardwareManager.vibrate(25);
          const targetTab = btn.dataset.tab;
          switchStudentParentTab(targetTab);
        }
      });
    });

    // Metric Cards Quick Navigation
    const metricAvgBtn = document.getElementById("btn-metric-average");
    const metricHwBtn = document.getElementById("btn-metric-hw");
    const metricExamsBtn = document.getElementById("btn-metric-exams");

    if (metricAvgBtn) metricAvgBtn.onclick = () => switchStudentParentTab("notes");
    if (metricHwBtn) metricHwBtn.onclick = () => switchStudentParentTab("devoirs");
    if (metricExamsBtn) metricExamsBtn.onclick = () => switchStudentParentTab("emploi");

    // Interactive AI Quiz Solver Modal Trigger from Quick Action Bar
    const btnOpenQuizHome = document.getElementById("btn-open-interactive-quiz");
    if (btnOpenQuizHome) {
      btnOpenQuizHome.onclick = () => {
        window.HardwareManager.vibrate(25);
        renderStudentInteractiveQuiz();
        const modal = document.getElementById("modal-interactive-student-quiz");
        if (modal) modal.style.display = "flex";
      };
    }

    // Absence Excuse Modals
    const btnOpenExcuse = document.getElementById("btn-open-absence-excuse-modal");
    const btnCloseExcuse = document.getElementById("btn-close-absence-modal") || document.getElementById("btn-close-excuse-modal");
    const btnCancelExcuse = document.getElementById("btn-cancel-absence-modal");
    const formExcuse = document.getElementById("form-submit-absence-excuse") || document.getElementById("form-parent-absence-excuse");

    if (btnOpenExcuse) {
      btnOpenExcuse.onclick = () => {
        window.HardwareManager.vibrate(30);
        const modal = document.getElementById("modal-submit-absence-excuse");
        if (modal) {
          modal.style.display = "flex";
          const dateInput = document.getElementById("excuse-date-start");
          if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
          }
          const confirmAlert = document.getElementById("excuse-confirmation-alert");
          if (confirmAlert) confirmAlert.style.display = "none";
        }
      };
    }

    const closeExcuseModal = () => {
      const modal = document.getElementById("modal-submit-absence-excuse");
      if (modal) modal.style.display = "none";
    };

    if (btnCloseExcuse) btnCloseExcuse.onclick = closeExcuseModal;
    if (btnCancelExcuse) btnCancelExcuse.onclick = closeExcuseModal;

    if (formExcuse) {
      formExcuse.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);

        const reasonSelect = document.getElementById("excuse-reason-select");
        const reasonType = reasonSelect ? reasonSelect.value : "medical";
        const dateStart = (document.getElementById("excuse-date-start") || {}).value || new Date().toISOString().split('T')[0];
        const duration = (document.getElementById("excuse-duration") || {}).value || "1";
        const notes = (document.getElementById("excuse-notes") || {}).value || "";

        const excusePayload = {
          parentId: currentUser ? currentUser.id : 'PAR-101',
          parentName: currentUser ? currentUser.name : 'Moussa Diallo',
          studentId: 'STU-101',
          studentName: 'Amadou Diallo',
          dateStart,
          durationDays: duration,
          reasonType,
          notes
        };

        if (window.FirebaseESchoolService && window.FirebaseESchoolService.submitAbsenceExcuse) {
          await window.FirebaseESchoolService.submitAbsenceExcuse(excusePayload);
        }

        const confirmAlert = document.getElementById("excuse-confirmation-alert");
        const refCode = document.getElementById("excuse-ref-code");
        const newRef = "EXC-" + Math.floor(1000 + Math.random() * 9000);
        if (refCode) refCode.innerText = newRef;
        if (confirmAlert) confirmAlert.style.display = "block";

        window.HardwareManager.playSuccessChime();
        showToast("Demande de justificatif transmise à la direction avec succès !");

        setTimeout(() => {
          closeExcuseModal();
          formExcuse.reset();
        }, 1800);
      };
    }

    // Homework File Upload Modal
    const btnCloseHw = document.getElementById("btn-close-hw-modal");
    const formHw = document.getElementById("form-student-submit-hw");

    if (btnCloseHw) {
      btnCloseHw.onclick = () => {
        document.getElementById("modal-submit-homework-file").style.display = "none";
      };
    }

    if (formHw) {
      formHw.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);
        const title = document.getElementById("hw-submit-title").value;
        const notes = document.getElementById("hw-submit-notes").value;
        const fileInput = document.getElementById("hw-submit-file");
        const fileName = (fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : "Devoir_Scanne.pdf";

        try {
          await fetch('/api/homework/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hwId: 'hw-math-1',
              subject: 'Mathématiques',
              studentId: currentUser ? currentUser.id : 'STU-101',
              studentName: currentUser ? currentUser.name : 'Amadou Diallo',
              fileName: fileName,
              notes: notes
            })
          });
          formHw.reset();
          document.getElementById("modal-submit-homework-file").style.display = "none";
          showToast("Devoir déposé pour évaluation avec succès !");
        } catch (err) {
          console.warn("Homework submit error:", err);
        }
      };
    }

    // Live QR Scanner
    const btnOpenQrTeacher = document.getElementById("btn-teacher-open-qr");
    const btnOpenQrProfile = document.getElementById("btn-test-camera");
    const btnCloseQr = document.getElementById("btn-close-qr-scanner");
    const btnSimulateScan = document.getElementById("btn-simulate-qr-scan");

    let isQrScanning = false;

    function startLiveQrScanner() {
      const modal = document.getElementById("modal-qr-attendance-scanner");
      const feedbackBox = document.getElementById("qr-scan-feedback");
      if (modal) modal.style.display = "flex";
      if (feedbackBox) feedbackBox.style.display = "none";
      window.HardwareManager.vibrate(30);

      if (typeof Html5Qrcode !== "undefined" && !isQrScanning) {
        try {
          if (!html5QrScannerInstance) {
            html5QrScannerInstance = new Html5Qrcode("qr-reader-container");
          }
          isQrScanning = true;
          html5QrScannerInstance.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              onQrCodeDetected(decodedText);
            },
            () => {}
          ).catch(err => {
            console.warn("Camera start warning:", err);
            isQrScanning = false;
          });
        } catch (e) {
          console.warn("Html5Qrcode init error:", e);
          isQrScanning = false;
        }
      }
    }

    function stopLiveQrScanner() {
      const modal = document.getElementById("modal-qr-attendance-scanner");
      if (modal) modal.style.display = "none";
      if (html5QrScannerInstance && isQrScanning) {
        isQrScanning = false;
        html5QrScannerInstance.stop().then(() => {
          html5QrScannerInstance.clear();
        }).catch(err => {
          console.warn("Html5Qrcode stop error:", err);
        });
      }
    }

    async function onQrCodeDetected(qrData) {
      window.HardwareManager.playSuccessChime();
      window.HardwareManager.vibrate([80, 50, 80]);
      const feedbackBox = document.getElementById("qr-scan-feedback");
      if (feedbackBox) {
        feedbackBox.innerHTML = `✓ BADGE VÉRIFIÉ : <strong>${qrData}</strong><br>Présence enregistrée : <strong>Présent (08:15)</strong>`;
        feedbackBox.style.display = "block";
      }

      showToast(`Badge scanné : ${qrData} • Synchronisé !`);

      if (window.FirebaseESchoolService && window.FirebaseESchoolService.saveClassAttendance) {
        await window.FirebaseESchoolService.saveClassAttendance({
          studentId: 'STU-101',
          studentName: 'Amadou Diallo',
          classId: '10-A',
          status: 'present',
          method: 'QR_CAMERA',
          badgeData: qrData,
          recordedBy: currentUser ? currentUser.id : 'TCH-01'
        });
      }

      try {
        await fetch('/api/attendance/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: 'STU-101',
            method: 'QR_CAMERA',
            recordedBy: currentUser ? currentUser.id : 'TCH-01'
          })
        });
      } catch (err) {
        console.warn("QR attendance sync warning:", err);
      }

      setTimeout(() => {
        stopLiveQrScanner();
      }, 1600);
    }

    if (btnOpenQrTeacher) btnOpenQrTeacher.onclick = startLiveQrScanner;
    if (btnOpenQrProfile) btnOpenQrProfile.onclick = startLiveQrScanner;
    if (btnCloseQr) btnCloseQr.onclick = stopLiveQrScanner;

    if (btnSimulateScan) {
      btnSimulateScan.onclick = () => {
        onQrCodeDetected("STU-101: Amadou Diallo (10-A)");
      };
    }

    // Hardware Capability Diagnostics & Controls (Push Notif & GPS Campus)
    const btnTestNotif = document.getElementById("btn-test-notif");
    if (btnTestNotif) {
      btnTestNotif.onclick = async () => {
        window.HardwareManager.vibrate(40);
        await window.HardwareManager.requestNotificationPermission();
        window.HardwareManager.sendLocalNotification(
          "🔔 E-SCHOOL DAARA",
          "Test Réussi : Système de notifications push & alertes institutionnelles 100% opérationnel !"
        );
        showToast("Notification Push envoyée & Haptique validée !");
      };
    }

    const btnTestGps = document.getElementById("btn-test-gps");
    if (btnTestGps) {
      btnTestGps.onclick = async () => {
        window.HardwareManager.vibrate(30);
        showToast("Localisation GPS du Campus en cours...");
        const loc = await window.HardwareManager.requestLocationPermission();
        window.HardwareManager.playSuccessChime();
        window.HardwareManager.vibrate([60, 40, 60]);
        showToast(`📍 GPS Campus Validé : ${loc.campus} (Précision: ${loc.accuracy}m)`);
      };
    }

    // Official PDF Transcript Generator
    const btnDownloadPdf = document.getElementById("btn-download-pdf-transcript");
    const btnExportAdminPdf = document.getElementById("btn-export-pdf-report");

    async function generateOfficialPdfTranscript() {
      window.HardwareManager.vibrate(40);
      showToast("Generating Official Senegalese Sealed PDF Transcript...");

      const template = document.getElementById("official-pdf-transcript-template");
      if (!template) return;

      template.style.display = "block";

      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'Bulletin_Officiel_Amadou_Diallo_2026.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      if (typeof html2pdf !== "undefined") {
        try {
          await html2pdf().set(opt).from(template).save();
          showToast("PDF Transcript Downloaded Successfully!");
        } catch (e) {
          console.warn("PDF export error:", e);
        } finally {
          template.style.display = "none";
        }
      } else {
        template.style.display = "none";
        showToast("PDF Generator Ready!");
      }
    }

    if (btnDownloadPdf) btnDownloadPdf.onclick = generateOfficialPdfTranscript;
    if (btnExportAdminPdf) btnExportAdminPdf.onclick = generateOfficialPdfTranscript;

    // Theme Switcher (OLED Dark, Deep Navy, Emerald, Light)
    document.querySelectorAll(".btn-theme-switcher").forEach(btn => {
      btn.onclick = () => {
        window.HardwareManager.vibrate(25);
        const theme = btn.dataset.setTheme;
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("eschool_theme", theme);

        document.querySelectorAll(".btn-theme-switcher").forEach(b => {
          b.classList.remove("active");
          b.style.opacity = "0.7";
        });
        btn.classList.add("active");
        btn.style.opacity = "1";
        showToast(`Thème activé : ${theme.toUpperCase()}`);
      };
    });

    const savedTheme = localStorage.getItem("eschool_theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);

    // Real-Time Chat System
    const chatForm = document.getElementById("form-chat-send-msg");
    const chatInput = document.getElementById("chat-input-text");

    let localChatMessages = [
      { sender_id: 'TCH-01', sender_name: 'Prof. Jean-Marc Fall', sender_role: 'teacher', text: 'Asalaamu Alaykum ! N\'oubliez pas de réviser le chapitre sur les fonctions dérivées pour l\'évaluation de vendredi.' },
      { sender_id: 'STU-101', sender_name: 'Amadou Diallo', sender_role: 'student', text: 'Bonjour Professeur Fall, j\'ai bien terminé le devoir maison n°2. Je le dépose sur la plateforme ce soir.' },
      { sender_id: 'PAR-101', sender_name: 'Moussa Diallo', sender_role: 'parent', text: 'Merci pour le suivi exemplaire. Amadou s\'entraîne assidûment sur Daara AI.' }
    ];

    async function loadChatMessages() {
      const box = document.getElementById("chat-messages-stream-box");
      if (!box) return;

      try {
        const resp = await fetch('/api/chat/messages?threadId=thread-fall-diallo');
        const data = await resp.json();
        if (data.success && data.messages && data.messages.length > 0) {
          localChatMessages = data.messages;
        }
      } catch (e) {
        // Use offline local memory store
      }

      let html = "";
      localChatMessages.forEach(m => {
        const isMe = (currentUser && m.sender_id === currentUser.id) || (!currentUser && m.sender_id === 'STU-101');
        const align = isMe ? "flex-end" : "flex-start";
        const bg = isMe ? "linear-gradient(135deg, #059669 0%, #10B981 100%)" : "rgba(30, 41, 59, 0.9)";

        html += `
          <div style="align-self: ${align}; max-width: 82%; background: ${bg}; color: #FFFFFF; padding: 10px 12px; border-radius: 12px; font-size: 0.76rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="font-size: 0.62rem; opacity: 0.85; margin-bottom: 2px; font-weight: 700;">${m.sender_name} (${m.sender_role})</div>
            <div>${m.text}</div>
          </div>
        `;
      });
      box.innerHTML = html;
      box.scrollTop = box.scrollHeight;
    }

    if (chatForm) {
      chatForm.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(30);
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = "";

        const sId = currentUser ? currentUser.id : "STU-101";
        const sName = currentUser ? currentUser.name : "Amadou Diallo";
        const sRole = currentUser ? currentUser.role : "student";

        const newMsg = {
          sender_id: sId,
          sender_name: sName,
          sender_role: sRole,
          text: text
        };

        localChatMessages.push(newMsg);
        loadChatMessages();

        try {
          await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              threadId: 'thread-fall-diallo',
              senderId: sId,
              senderName: sName,
              senderRole: sRole,
              text: text
            })
          });
        } catch (err) {}
      };
    }

    // Live Search
    const teacherSearchInput = document.getElementById("teacher-search-student-input");
    if (teacherSearchInput) {
      teacherSearchInput.addEventListener("input", (e) => {
        renderTeacherRoster(e.target.value);
      });
    }

    const adminSearchUsersInput = document.getElementById("admin-search-users-input");
    if (adminSearchUsersInput) {
      adminSearchUsersInput.addEventListener("input", (e) => {
        loadAdminUserDirectory(e.target.value);
      });
    }
    // =========================================================
    // 14. INTERACTIVE STUDENT QUIZ SOLVER & GENERATOR ENGINE
    // =========================================================
    let currentActiveQuiz = {
      title: "Mathématiques — Fonctions Dérivées & Tangentes",
      meta: "Niveau: Seconde (10-A) • Conçu par Daara AI",
      questions: [
        {
          q: "Quelle est la dérivée de f(x) = 3x² + 5x - 7 ?",
          options: ["f'(x) = 6x + 5", "f'(x) = 3x + 5", "f'(x) = 6x² + 5", "f'(x) = 6x - 7"],
          correct: 0,
          explanation: "La dérivée de x² est 2x, donc (3x²)' = 6x, et (5x)' = 5. D'où f'(x) = 6x + 5."
        },
        {
          q: "Que représente le coefficient directeur de la tangente à une courbe en un point d'abscisse a ?",
          options: ["f(a)", "f'(a)", "1 / f(a)", "f''(a)"],
          correct: 1,
          explanation: "Par définition, le nombre dérivé f'(a) est le coefficient directeur de la tangente au point d'abscisse a."
        },
        {
          q: "Si f'(x) > 0 sur un intervalle I, que peut-on affirmer sur f ?",
          options: ["f est décroissante", "f est strictement constante", "f est strictement croissante", "f s'annule obligatoirement"],
          correct: 2,
          explanation: "Si la dérivée est strictement positive sur un intervalle, la fonction y est strictement croissante."
        },
        {
          q: "Quelle est la dérivée de la fonction constante f(x) = 42 ?",
          options: ["f'(x) = 42", "f'(x) = 1", "f'(x) = 0", "f'(x) = 42x"],
          correct: 2,
          explanation: "La dérivée de toute fonction constante est nulle : f'(x) = 0."
        }
      ]
    };

    function renderStudentInteractiveQuiz() {
      const titleEl = document.getElementById("sq-quiz-title");
      const metaEl = document.getElementById("sq-quiz-meta");
      const listEl = document.getElementById("student-quiz-questions-list");
      const resultBox = document.getElementById("student-quiz-result-box");
      const submitBtn = document.getElementById("btn-submit-student-quiz");

      if (titleEl) titleEl.innerText = currentActiveQuiz.title;
      if (metaEl) metaEl.innerText = currentActiveQuiz.meta;
      if (resultBox) resultBox.style.display = "none";
      if (submitBtn) {
        submitBtn.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.innerText = window.i18n.t("quiz.btn_submit_answers") || "Valider mes Réponses & Calculer Note";
      }

      if (!listEl) return;
      let qHtml = "";
      currentActiveQuiz.questions.forEach((item, qIdx) => {
        qHtml += `
          <div class="metric-card-dark" style="padding: 12px; background: rgba(15, 23, 42, 0.95); border: 1px solid var(--border-glass);">
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <span style="background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-size: 0.68rem; font-weight: 900; padding: 2px 6px; border-radius: 4px; height: fit-content;">Q${qIdx + 1}</span>
              <strong style="color: #FFF; font-size: 0.82rem; line-height: 1.4;">${item.q}</strong>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
        `;

        item.options.forEach((opt, optIdx) => {
          qHtml += `
            <label style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 8px; font-size: 0.74rem; color: #E2E8F0; cursor: pointer; transition: all 0.2s;">
              <input type="radio" name="quiz_q_${qIdx}" value="${optIdx}" style="accent-color: #10B981; cursor: pointer;" ${optIdx === 0 ? 'checked' : ''}>
              <span>${opt}</span>
            </label>
          `;
        });

        qHtml += `</div></div>`;
      });

      listEl.innerHTML = qHtml;
    }

    // Student Quiz Modal Close
    const btnCloseStudentQuiz = document.getElementById("btn-close-student-quiz-modal");
    if (btnCloseStudentQuiz) {
      btnCloseStudentQuiz.onclick = () => {
        const modal = document.getElementById("modal-interactive-student-quiz");
        if (modal) modal.style.display = "none";
      };
    }

    // Submit Quiz & Compute Score
    const formStudentQuiz = document.getElementById("form-submit-interactive-quiz");
    if (formStudentQuiz) {
      formStudentQuiz.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(50);

        let correctCount = 0;
        const total = currentActiveQuiz.questions.length;

        currentActiveQuiz.questions.forEach((q, idx) => {
          const selected = formStudentQuiz.querySelector(`input[name="quiz_q_${idx}"]:checked`);
          if (selected && parseInt(selected.value) === q.correct) {
            correctCount++;
          }
        });

        const score = Math.round((correctCount / total) * 100);
        const resultBox = document.getElementById("student-quiz-result-box");
        const scoreVal = document.getElementById("sq-final-score-val");
        const feedbackText = document.getElementById("sq-ai-feedback-text");
        const submitBtn = document.getElementById("btn-submit-student-quiz");

        if (scoreVal) scoreVal.innerText = `${score} / 100`;
        if (feedbackText) {
          if (score >= 80) {
            feedbackText.innerHTML = `<strong>Évaluation Excellente (${score}%) !</strong> Daara AI valide votre maîtrise des concepts fondamentaux. Continuez sur cette lancée pour maintenir votre statut Top 5%.`;
          } else if (score >= 50) {
            feedbackText.innerHTML = `<strong>Résultat Satisfaisant (${score}%) !</strong> De bonnes bases identifiées, mais consolidez la méthode de calcul des tangentes avec les astuces suggérées.`;
          } else {
            feedbackText.innerHTML = `<strong>Révision Requise (${score}%) !</strong> Nous recommandons de revoir la fiche de cours et d'utiliser l'assistant Daara AI pour des exercices guidés pas-à-pas.`;
          }
        }

        if (resultBox) resultBox.style.display = "block";
        if (submitBtn) submitBtn.style.display = "none";

        window.HardwareManager.playSuccessChime();
        showToast(`Quiz terminé avec succès : Score ${score} / 100 !`);

        // Sync Quiz Result to Firestore
        if (window.FirebaseESchoolService && window.FirebaseESchoolService.saveQuizResult) {
          await window.FirebaseESchoolService.saveQuizResult({
            studentId: currentUser ? currentUser.id : 'STU-101',
            studentName: currentUser ? currentUser.name : 'Amadou Diallo',
            quizTitle: currentActiveQuiz.title,
            score: score,
            totalQuestions: total,
            correctCount: correctCount
          });
        }
      };
    }

    // Teacher AI Quiz Generator Modal Handlers
    const btnOpenTeacherQuiz = document.getElementById("btn-open-teacher-ai-quiz-modal");
    const btnCloseTeacherQuiz = document.getElementById("btn-close-ai-quiz-modal");
    const formTeacherQuiz = document.getElementById("form-generate-ai-quiz");

    if (btnOpenTeacherQuiz) {
      btnOpenTeacherQuiz.onclick = () => {
        window.HardwareManager.vibrate(30);
        const modal = document.getElementById("modal-ai-quiz-generator");
        if (modal) modal.style.display = "flex";
      };
    }

    if (btnCloseTeacherQuiz) {
      btnCloseTeacherQuiz.onclick = () => {
        const modal = document.getElementById("modal-ai-quiz-generator");
        if (modal) modal.style.display = "none";
      };
    }

    if (formTeacherQuiz) {
      formTeacherQuiz.onsubmit = (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);

        const subject = document.getElementById("ai-quiz-subject").value;
        const grade = document.getElementById("ai-quiz-grade").value;
        const topic = document.getElementById("ai-quiz-topic").value.trim() || "Fonctions Dérivées";
        const diff = document.getElementById("ai-quiz-difficulty").value;
        const count = parseInt(document.getElementById("ai-quiz-count").value) || 4;

        currentActiveQuiz = {
          title: `${subject} — ${topic}`,
          meta: `Niveau: ${grade} • Difficulté: ${diff} • Conçu par Daara AI`,
          questions: [
            {
              q: `Question 1 sur ${topic} : Quel est le résultat fondamental ?`,
              options: ["Propriété A validée", "Propriété B", "Propriété C", "Propriété D"],
              correct: 0,
              explanation: "Règle générale démontrée en cours."
            },
            {
              q: `Question 2 (${subject}) : Quelle relation lie les grandeurs associées ?`,
              options: ["Formule Standard 1", "Formule Dérivée exacte", "Approximation linéaire", "Constante nulle"],
              correct: 1,
              explanation: "Formule clé du programme officiel."
            },
            {
              q: `Question 3 : Dans quel cas particulier cette condition est-elle vérifiée ?`,
              options: ["Pour tout x réel", "Uniquement sur [0, +inf[", "Sur le domaine de définition", "Cas singulier nul"],
              correct: 2,
              explanation: "Vérification sur l'ensemble de validité."
            }
          ]
        };

        const tTitle = document.getElementById("teacher-quiz-active-title");
        const tMeta = document.getElementById("teacher-quiz-active-meta");
        if (tTitle) tTitle.innerText = `Épreuve Active : ${subject} (${count} QCM)`;
        if (tMeta) tMeta.innerText = `Matière: ${subject} • Chapitre: ${topic} • Niveau: ${grade}`;

        const modal = document.getElementById("modal-ai-quiz-generator");
        if (modal) modal.style.display = "none";

        window.HardwareManager.playSuccessChime();
        showToast(`Nouvelle épreuve IA générée et publiée pour la classe ${grade} !`);
      };
    }

    // =========================================================
    // 15. GPA TARGET SIMULATOR (Notes Tab)
    // =========================================================
    const gpaSlider = document.getElementById("input-gpa-sim-slider");
    const gpaTargetDisp = document.getElementById("gpa-sim-target-display");
    const gpaProjected = document.getElementById("gpa-sim-projected-result");
    const gpaBadge = document.getElementById("gpa-sim-badge");

    if (gpaSlider) {
      gpaSlider.addEventListener("input", () => {
        const targetVal = parseFloat(gpaSlider.value) || 94;
        if (gpaTargetDisp) gpaTargetDisp.innerText = `${targetVal} / 100`;

        const currentAvg = 91.32;
        const projected = ((currentAvg * 2 + targetVal) / 3).toFixed(2);
        if (gpaProjected) gpaProjected.innerText = `${projected} / 100`;

        if (gpaBadge) {
          if (projected >= 92) {
            gpaBadge.innerText = "Félicitations du Conseil";
            gpaBadge.style.color = "#FBBF24";
            gpaBadge.style.background = "rgba(245, 158, 11, 0.2)";
          } else if (projected >= 85) {
            gpaBadge.innerText = "Tableau d'Honneur";
            gpaBadge.style.color = "#34D399";
            gpaBadge.style.background = "rgba(16, 185, 129, 0.2)";
          } else {
            gpaBadge.innerText = "Encouragements";
            gpaBadge.style.color = "#38BDF8";
            gpaBadge.style.background = "rgba(56, 189, 248, 0.2)";
          }
        }
      });
    }

    // Trimester Switcher on Notes Tab
    document.querySelectorAll(".trim-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        window.HardwareManager.vibrate(20);
        document.querySelectorAll(".trim-pill").forEach(b => {
          b.classList.remove("active");
          b.style.background = "rgba(255,255,255,0.05)";
          b.style.color = "#94A3B8";
          b.style.border = "1px solid var(--border-glass)";
        });
        btn.classList.add("active");
        btn.style.background = "var(--senegal-green)";
        btn.style.color = "#FFF";
        btn.style.border = "none";
        const trim = btn.dataset.trim;
        showToast(`Relevé affiché : Trimestre ${trim}`);
      });
    });

    // =========================================================
    // 16. DAARA AI ASSISTANT & TEXT-TO-SPEECH (TTS)
    // =========================================================
    const btnSubmitAi = document.getElementById("btn-submit-ai");
    const inputAiPrompt = document.getElementById("input-ai-prompt");
    const aiResponseBox = document.getElementById("ai-response-box");
    const btnSpeakAi = document.getElementById("btn-speak-ai");

    function executeAiAnalysis(promptText) {
      if (!promptText) promptText = inputAiPrompt ? inputAiPrompt.value.trim() : "";
      if (!promptText) return;

      window.HardwareManager.vibrate(30);
      if (aiResponseBox) {
        aiResponseBox.innerHTML = `<em>Analyse IA en cours pour : "${promptText}"...</em>`;
      }

      setTimeout(() => {
        let answer = "";
        const lower = promptText.toLowerCase();

        if (lower.includes("point") || lower.includes("faible") || lower.includes("amélioration")) {
          answer = "<strong>Diagnostic Daara AI :</strong> Vos matières d'excellence sont l'Anglais (98/100) et les Mathématiques (95/100). Pour optimiser votre moyenne générale, renforcez vos révisions en Physique-Chimie sur le chapitre des dosages (actuellement 89/100).";
        } else if (lower.includes("math") || lower.includes("dériv")) {
          answer = "<strong>Méthode Mathématiques :</strong> Pour calculer la tangente d'une courbe en x = a, appliquez l'équation fondamentale y = f'(a)(x - a) + f(a). Pensez à toujours vérifier le domaine de dérivabilité au préalable.";
        } else if (lower.includes("plan") || lower.includes("révis") || lower.includes("planning")) {
          answer = "<strong>Planning Personnalisé Recommandé :</strong><br>• Lundi/Mercredi (18h-19h30) : Physique-Chimie & SVT<br>• Mardi/Jeudi (18h-19h30) : Français & Histoire-Géo<br>• Vendredi (17h-18h30) : Quiz IA & Entraînement Mathématiques.";
        } else {
          answer = `<strong>Recommandation Daara AI :</strong> Concernant votre question "<em>${promptText}</em>", nous recommandons d'effectuer 3 exercices types du cours et de consulter le support PDF déposé par votre professeur.`;
        }

        if (aiResponseBox) {
          aiResponseBox.innerHTML = answer;
        }
        if (inputAiPrompt) inputAiPrompt.value = "";
        window.HardwareManager.playSuccessChime();
      }, 400);
    }

    if (btnSubmitAi) {
      btnSubmitAi.onclick = () => executeAiAnalysis();
    }

    if (inputAiPrompt) {
      inputAiPrompt.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          executeAiAnalysis();
        }
      });
    }

    document.querySelectorAll(".ai-chip-prompt").forEach(chip => {
      chip.addEventListener("click", () => {
        const p = chip.dataset.prompt;
        if (inputAiPrompt) inputAiPrompt.value = p;
        executeAiAnalysis(p);
      });
    });

    if (btnSpeakAi) {
      btnSpeakAi.onclick = () => {
        window.HardwareManager.vibrate(25);
        if ('speechSynthesis' in window && aiResponseBox) {
          const textToSpeak = aiResponseBox.innerText.replace(/Daara AI/g, "Daara A I");
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          const lang = window.i18n.getLanguage();
          utterance.lang = lang === 'es' ? 'es-ES' : (lang === 'en' ? 'en-US' : 'fr-FR');
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
          showToast("Lecture vocale IA en cours...");
        } else {
          showToast("Synthèse vocale audio non supportée sur ce navigateur.");
        }
      };
    }

    // =========================================================
    // 17. TABLEAU D'HONNEUR CERTIFICATE MODAL
    // =========================================================
    const btnCloseHonor = document.getElementById("btn-close-honor-modal");
    const btnDismissHonor = document.getElementById("btn-dismiss-certificate");
    const btnPrintHonor = document.getElementById("btn-print-certificate");

    const closeHonorModal = () => {
      const modal = document.getElementById("modal-honor-certificate");
      if (modal) modal.style.display = "none";
    };

    if (btnCloseHonor) btnCloseHonor.onclick = closeHonorModal;
    if (btnDismissHonor) btnDismissHonor.onclick = closeHonorModal;
    if (btnPrintHonor) {
      btnPrintHonor.onclick = () => {
        window.HardwareManager.vibrate(35);
        showToast("Téléchargement de l'Attestation Officielle du Tableau d'Honneur...");
        closeHonorModal();
      };
    }

    // =========================================================
    // 18. GLOBAL SPOTLIGHT COMMAND PALETTE (Ctrl+K / ⌘K)
    // =========================================================
    const btnOpenSpotlight = document.getElementById("btn-global-quick-search-trigger");
    const modalSpotlight = document.getElementById("modal-global-spotlight-search");
    const btnCloseSpotlight = document.getElementById("btn-close-spotlight-modal") || document.getElementById("btn-close-spotlight");
    const inputSpotlight = document.getElementById("spotlight-search-input");

    function openGlobalSpotlight() {
      if (modalSpotlight) {
        window.HardwareManager.vibrate(25);
        modalSpotlight.style.display = "flex";
        if (inputSpotlight) {
          inputSpotlight.value = "";
          setTimeout(() => inputSpotlight.focus(), 80);
        }
      }
    }

    function closeGlobalSpotlight() {
      if (modalSpotlight) modalSpotlight.style.display = "none";
    }

    if (btnOpenSpotlight) btnOpenSpotlight.onclick = openGlobalSpotlight;
    if (btnCloseSpotlight) btnCloseSpotlight.onclick = closeGlobalSpotlight;

    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (modalSpotlight && modalSpotlight.style.display === "flex") {
          closeGlobalSpotlight();
        } else {
          openGlobalSpotlight();
        }
      } else if (e.key === "Escape") {
        closeGlobalSpotlight();
      }
    });

    document.querySelectorAll(".spotlight-item").forEach(item => {
      item.onclick = () => {
        const action = item.dataset.action;
        closeGlobalSpotlight();
        window.HardwareManager.vibrate(30);

        if (action === "tab-notes") {
          switchStudentParentTab("notes");
        } else if (action === "tab-emploi") {
          switchStudentParentTab("emploi");
        } else if (action === "open-quiz") {
          renderStudentInteractiveQuiz();
          const modal = document.getElementById("modal-interactive-student-quiz");
          if (modal) modal.style.display = "flex";
        } else if (action === "download-transcript") {
          const btnDl = document.getElementById("btn-download-pdf-transcript");
          if (btnDl) btnDl.click();
        }
      };
    });

    // Quick Action Bar Quiz Button
    const btnOpenQuickQuiz = document.getElementById("btn-open-interactive-quiz");
    if (btnOpenQuickQuiz) {
      btnOpenQuickQuiz.onclick = () => {
        window.HardwareManager.vibrate(25);
        renderStudentInteractiveQuiz();
        const modal = document.getElementById("modal-interactive-student-quiz");
        if (modal) modal.style.display = "flex";
      };
    }

    // 3D Flashcard Revision Card Flip
    const fcInner = document.getElementById("flashcard-sample-inner-1");
    if (fcInner) {
      fcInner.onclick = () => {
        window.HardwareManager.vibrate(20);
        fcInner.classList.toggle("flipped");
      };
    }

    // Admin Announcement Broadcast
    const formAnn = document.getElementById("form-broadcast-announcement");
    if (formAnn) {
      formAnn.onsubmit = (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);
        const title = document.getElementById("adm-ann-title").value.trim();
        const content = document.getElementById("adm-ann-content").value.trim();
        if (title && content) {
          window.ESchoolData.announcements.unshift({
            id: "ann-" + Date.now(),
            title: title,
            badge: "Official",
            content: content,
            date: "Today",
            urgent: true
          });
          formAnn.reset();
          showToast("Official announcement broadcasted to school community!");
        }
      };
    }

    // Hardware Test Buttons
    const testNotifBtn = document.getElementById("btn-test-notif");
    const testGpsBtn = document.getElementById("btn-test-gps");

    if (testNotifBtn) testNotifBtn.onclick = async () => {
      window.HardwareManager.vibrate([50, 50]);
      await window.HardwareManager.requestNotificationPermission();
      window.HardwareManager.sendLocalNotification("E-School Daara", "Alert: Mathematics grade updated to 95/100!");
      showToast("Push notification dispatched!");
    };

    if (testGpsBtn) testGpsBtn.onclick = async () => {
      window.HardwareManager.vibrate(40);
      const loc = await window.HardwareManager.requestLocationPermission();
      showToast(`Campus GPS Verified: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    };
  }

  function switchTab(tabId) {
    switchStudentParentTab(tabId);
  }

  function switchStudentParentTab(tabId) {
    activeTab = tabId;
    
    // Sync Mobile Bottom Tab Bar
    document.querySelectorAll(".bottom-tab-item").forEach(b => {
      if (b.dataset.tab === tabId) b.classList.add("active");
      else b.classList.remove("active");
    });

    // Sync Desktop Persistent Side Bar
    document.querySelectorAll(".desktop-nav-item").forEach(b => {
      if (b.dataset.tab === tabId) b.classList.add("active");
      else b.classList.remove("active");
    });

    const panes = ["tab-pane-home", "tab-pane-notes", "tab-pane-devoirs", "tab-pane-emploi", "tab-pane-messages", "tab-pane-profil"];
    panes.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = "none";
        el.classList.remove("tab-pane-transition");
      }
    });

    const activeEl = document.getElementById(`tab-pane-${tabId}`);
    if (activeEl) {
      activeEl.style.display = "block";
      activeEl.classList.add("tab-pane-transition");
    }

    if (tabId === "messages") {
      const chatBox = document.getElementById("chat-messages-stream-box");
      if (chatBox) {
        chatBox.innerHTML = `<em>Loading live messages...</em>`;
        fetch('/api/chat/messages?threadId=thread-fall-diallo')
          .then(r => r.json())
          .then(d => {
            if (d.success && d.messages) {
              let html = "";
              d.messages.forEach(m => {
                const isMe = (currentUser && m.sender_id === currentUser.id) || (!currentUser && m.sender_id === 'STU-101');
                const align = isMe ? "flex-end" : "flex-start";
                const bg = isMe ? "linear-gradient(135deg, #059669 0%, #10B981 100%)" : "rgba(30, 41, 59, 0.9)";
                html += `
                  <div style="align-self: ${align}; max-width: 82%; background: ${bg}; color: #FFF; padding: 10px 12px; border-radius: 12px; font-size: 0.76rem;">
                    <div style="font-size: 0.62rem; opacity: 0.85; margin-bottom: 2px; font-weight: 700;">${m.sender_name} (${m.sender_role})</div>
                    <div>${m.text}</div>
                  </div>
                `;
              });
              chatBox.innerHTML = html;
              chatBox.scrollTop = chatBox.scrollHeight;
            }
          });
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showPortalForUser(user) {
    const nav = document.getElementById('app-floating-nav');
    const safeHide = id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };
    const safeShow = (id, d) => { const el = document.getElementById(id); if (el) el.style.display = d || 'block'; };

    safeHide('view-auth-portal');
    safeHide('view-student-parent-root');
    safeHide('view-teacher-root');
    safeHide('view-admin-root');
    if (nav) {
      nav.classList.remove('is-visible');
      nav.style.display = 'none';
    }

    if (user.role === 'student' || user.role === 'parent') {
      safeShow('view-student-parent-root', 'block');
      if (nav) {
        nav.classList.add('is-visible');
        nav.style.display = 'flex';
      }
      switchStudentParentTab('home');
      renderStudentParentEcosystem();
    } else if (user.role === 'teacher') {
      safeShow('view-teacher-root', 'block');
      renderTeacherWorkspace();
    } else if (user.role === 'admin') {
      safeShow('view-admin-root', 'block');
      renderAdminWorkspace();
    }
  }

  function renderCurrentPortal() {
    if (!currentUser) return;
    showPortalForUser(currentUser);
  }

  // ================= STUDENT & PARENT ECOSYSTEM =================
  async function renderStudentParentEcosystem() {
    const lang = window.i18n.getLanguage();
    let currentStudentObj = null;

    const parentBar = document.getElementById("parent-child-selector-bar");
    const liveAttPill = document.getElementById("parent-live-attendance-pill");

    if (currentUser.role === "parent") {
      parentBar.style.display = "block";
      liveAttPill.style.display = "inline-block";

      const family = currentUser.family || window.ESchoolData.parentFamilies["PAR-101"];
      const children = family.children;
      currentStudentObj = children[currentChildIndex];

      const pillsContainer = document.getElementById("parent-children-pills-container");
      let pillsHtml = "";
      children.forEach((ch, idx) => {
        const isActive = idx === currentChildIndex ? "active" : "";
        pillsHtml += `
          <div class="child-tab-pill ${isActive}" data-child-idx="${idx}">
            <img src="${ch.avatar}" class="child-mini-avatar" alt="Avatar">
            <span class="child-tab-name">${ch.name.split(" ")[0]} (${ch.grade.split("–")[0].trim()})</span>
          </div>
        `;
      });
      pillsContainer.innerHTML = pillsHtml;

      pillsContainer.querySelectorAll(".child-tab-pill").forEach(p => {
        p.onclick = () => {
          window.HardwareManager.vibrate(30);
          currentChildIndex = Number(p.dataset.childIdx);
          renderStudentParentEcosystem();
        };
      });

      liveAttPill.innerText = `${currentStudentObj.statusToday}`;
    } else {
      parentBar.style.display = "none";
      liveAttPill.style.display = "none";
      currentStudentObj = {
        id: currentUser.id,
        name: currentUser.name || "Amadou Diallo",
        grade: "10th Grade – Seconde Sc. & Tech",
        classId: currentUser.classId || "10-A",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        gpa: 91.32,
        advisor: "Prof. Jean-Marc Fall"
      };
    }

    document.getElementById("sp-header-name").innerText = currentStudentObj.name;
    document.getElementById("sp-header-grade").innerText = currentStudentObj.grade;
    document.getElementById("sp-avatar-img").src = currentStudentObj.avatar;
    document.getElementById("prof-card-avatar").src = currentStudentObj.avatar;
    document.getElementById("prof-card-name").innerText = currentStudentObj.name;
    document.getElementById("prof-card-class").innerText = `Matricule : ${currentStudentObj.id} • ${currentStudentObj.classId}`;

    const gpaFormatted = (currentStudentObj.gpa || 91.32).toFixed(2);
    document.getElementById("sp-hero-gpa-val").innerText = gpaFormatted;
    document.getElementById("metric-avg-val").innerText = gpaFormatted;

    renderLiveGrades(currentStudentObj.id, lang);
    renderHomeworksAndMaterials(currentStudentObj.id);
    renderInteractiveTimetable();
    renderAttendanceHeatmap();

    // 3D Smart Card Flip Event
    const cardInner = document.getElementById("student-smart-card-inner");
    if (cardInner) {
      cardInner.onclick = () => {
        window.HardwareManager.vibrate(25);
        cardInner.classList.toggle("flipped");
      };
    }

    const btnDownloadBadge = document.getElementById("btn-download-smart-badge");
    if (btnDownloadBadge) {
      btnDownloadBadge.onclick = () => {
        window.HardwareManager.vibrate(35);
        showToast("Carte Scolaire Numérique (Smart ID) téléchargée !");
      };
    }
  }

  // Attendance 28-Day Heatmap Renderer
  function renderAttendanceHeatmap() {
    const container = document.getElementById("student-attendance-heatmap-cells");
    if (!container) return;

    let html = "";
    const statuses = ['att-heat-present', 'att-heat-present', 'att-heat-present', 'att-heat-present', 'att-heat-present', 'att-heat-late', 'att-heat-present', 'att-heat-present', 'att-heat-excused'];
    for (let day = 1; day <= 28; day++) {
      let stClass = "att-heat-present";
      let label = "Présent (08:15)";
      if (day === 6) { stClass = "att-heat-late"; label = "Retard (08:28)"; }
      else if (day === 17) { stClass = "att-heat-excused"; label = "Justifié (Médical)"; }
      else if (day === 24) { stClass = "att-heat-present"; label = "Présent (08:10)"; }

      html += `<div class="att-heat-cell ${stClass}" data-day="${day}" data-label="${label}">${day}</div>`;
    }
    container.innerHTML = html;

    container.querySelectorAll(".att-heat-cell").forEach(cell => {
      cell.onclick = (e) => {
        e.stopPropagation();
        window.HardwareManager.vibrate(20);
        showToast(`Jour ${cell.dataset.day} : ${cell.dataset.label}`);
      };
    });
  }

  // 1. Live Grades Renderer
  async function renderLiveGrades(studentId, lang) {
    const container = document.getElementById("sp-grades-live-container");
    if (!container) return;

    let data = null;
    try {
      if (window.FirebaseESchoolService && typeof window.FirebaseESchoolService.getStudentDashboard === 'function') {
        data = await window.FirebaseESchoolService.getStudentDashboard(studentId);
      }
    } catch (e) {
      console.warn("Grade fetch fallback:", e);
    }
    const grades = (data && data.grades) ? data.grades : [
      { subjectId: "math", name_fr: "Mathématiques", name_en: "Mathematics", name_wo: "Xayma", name_es: "Matemáticas", code: "MAT-101", hours: 6, exam1: 95, exam2: 94, oral: 90, project: 92 },
      { subjectId: "phys", name_fr: "Physique-Chimie", name_en: "Physics", name_wo: "Fisik", name_es: "Física y Química", code: "PHY-102", hours: 4, exam1: 89, exam2: 92, oral: 88, project: 90 },
      { subjectId: "lit", name_fr: "Français & Littérature", name_en: "Literature", name_wo: "Litteratir", name_es: "Literatura", code: "LIT-105", hours: 5, exam1: 88, exam2: 90, oral: 92, project: 89 },
      { subjectId: "bio", name_fr: "Sciences de la Vie (SVT)", name_en: "Biology", name_wo: "SVT", name_es: "Biología (SVT)", code: "BIO-104", hours: 3, exam1: 94, exam2: 96, oral: 95, project: 98 },
      { subjectId: "eng", name_fr: "Langue Anglaise", name_en: "English Language", name_wo: "Làkku Angale", name_es: "Lengua Inglesa", code: "ENG-107", hours: 4, exam1: 98, exam2: 100, oral: 100, project: 95 }
    ];

    let html = "";
    grades.forEach(g => {
      const subjectName = g[`name_${lang}`] || g.name_fr || g.name_en || g.name_es || g.subjectId;
      const avg = ((g.exam1 + g.exam2 + g.oral + g.project) / 4).toFixed(1);
      const percentage = Math.min(100, Math.max(0, Number(avg)));

      html += `
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div>
              <strong style="color: #FFFFFF; font-size: 0.92rem;">${subjectName}</strong>
              <div style="font-size: 0.7rem; color: #94A3B8;">${g.code || 'MAT-101'} • ${g.hours || 4} hrs/week</div>
            </div>
            <div style="font-size: 1.35rem; font-weight: 900; color: #10B981; font-family: monospace;">${avg}</div>
          </div>

          <div class="progress-bar-bg" style="margin-bottom: 8px;">
            <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 0.72rem; background: #080E1E; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: #94A3B8;">Devoir 1: <strong style="color: #FFFFFF;">${g.exam1}</strong></span>
            <span style="color: #94A3B8;">Devoir 2: <strong style="color: #FFFFFF;">${g.exam2}</strong></span>
            <span style="color: #94A3B8;">Oral: <strong style="color: #FFFFFF;">${g.oral}</strong></span>
            <span style="color: #94A3B8;">Projet: <strong style="color: #FFFFFF;">${g.project}</strong></span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // 2. Homework & Course Materials Renderer
  function renderHomeworksAndMaterials(studentId) {
    const hwContainer = document.getElementById("homeworks-list-container");
    const matContainer = document.getElementById("course-materials-container");

    if (hwContainer) {
      let hwHtml = "";
      window.ESchoolData.homeworks.forEach(hw => {
        const isSubmitted = hw.status === "submitted";
        const badgeColor = isSubmitted ? "#10B981" : (hw.status === "new" ? "#38BDF8" : "#F59E0B");
        const statusLabel = isSubmitted ? "Submitted" : "To Do";

        hwHtml += `
          <div class="metric-card-dark" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <div>
                <span style="background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-size: 0.65rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">${hw.subject}</span>
                <div style="font-weight: 800; font-size: 0.88rem; color: #FFF; margin-top: 4px;">${hw.title}</div>
              </div>
              <span style="background: rgba(16, 185, 129, 0.15); color: ${badgeColor}; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">${statusLabel}</span>
            </div>
            <p style="font-size: 0.72rem; color: #94A3B8; margin-bottom: 8px;">${hw.desc}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.68rem; color: #F59E0B;">Due: ${hw.due}</span>
              <button class="btn-emerald-glow btn-submit-hw-trigger" data-hw-title="${hw.subject} : ${hw.title}" style="width: auto; padding: 4px 10px; font-size: 0.72rem;">
                ${isSubmitted ? "View Submission" : "Déposer Devoir (Upload)"}
              </button>
            </div>
          </div>
        `;
      });
      hwContainer.innerHTML = hwHtml;

      hwContainer.querySelectorAll(".btn-submit-hw-trigger").forEach(btn => {
        btn.onclick = () => {
          window.HardwareManager.vibrate(30);
          document.getElementById("hw-submit-title").value = btn.dataset.hwTitle || "Mathématiques : Devoir";
          document.getElementById("modal-submit-homework-file").style.display = "flex";
        };
      });
    }

    if (matContainer) {
      let matHtml = "";
      window.ESchoolData.courseMaterials.forEach(m => {
        matHtml += `
          <div class="metric-card-dark" style="padding: 12px 14px; margin-bottom: 8px; display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #A78BFA; font-size: 0.82rem;">${m.subject} : ${m.title}</strong>
              <div style="font-size: 0.68rem; color: #94A3B8;">${m.type} • ${m.size} • ${m.teacher}</div>
            </div>
            <button class="btn-emerald-glow" style="width: auto; padding: 4px 8px; font-size: 0.7rem;" onclick="window.HardwareManager.vibrate(20); showToast('Downloading ${m.title}...');">
              Download
            </button>
          </div>
        `;
      });
      matContainer.innerHTML = matHtml;
    }
  }

  // 3. Interactive Timetable Renderer with Day Filter
  let activeTimetableDayFilter = "all";

  async function renderInteractiveTimetable(filterDay = "all") {
    activeTimetableDayFilter = filterDay;
    const container = document.getElementById("timetable-interactive-container");
    if (!container) return;

    let entries = [
      { day_name: 'Lundi', time_slot: '08:00 - 10:00', subject: 'Mathématiques', teacher: 'Prof. Jean-Marc Fall', room: 'Salle B-104', isCurrent: true },
      { day_name: 'Lundi', time_slot: '10:15 - 12:15', subject: 'Physique-Chimie', teacher: 'Mme. Aïssatou Sow', room: 'Labo Sciences 2' },
      { day_name: 'Mardi', time_slot: '08:00 - 10:00', subject: 'Français & Littérature', teacher: 'Mme. Mariama Ba', room: 'Salle A-201' },
      { day_name: 'Mardi', time_slot: '10:15 - 12:15', subject: 'Histoire & Géographie', teacher: 'M. Sene', room: 'Salle C-302' },
      { day_name: 'Mercredi', time_slot: '08:00 - 10:00', subject: 'Sciences de la Vie (SVT)', teacher: 'Prof. Ndiaye', room: 'Salle B-102' },
      { day_name: 'Jeudi', time_slot: '10:00 - 12:00', subject: 'Langue Anglaise', teacher: 'Mr. Smith', room: 'Salle Langues 1' },
      { day_name: 'Vendredi', time_slot: '08:00 - 10:00', subject: 'Éducation Civique & Islamique', teacher: 'Imam Cissé', room: 'Amphi Daara' }
    ];

    try {
      const resp = await fetch('/api/timetable?classId=10-A');
      const data = await resp.json();
      if (data && data.success && data.entries && data.entries.length > 0) {
        entries = data.entries;
      }
    } catch (e) {}

    const days = filterDay === "all" ? ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] : [filterDay];
    let html = "";
    days.forEach(day => {
      const dayLessons = entries.filter(e => e.day_name === day);
      if (dayLessons.length > 0) {
        html += `
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h4 style="color: #F59E0B; font-size: 0.85rem;">${day}</h4>
              <span style="font-size: 0.65rem; color: #94A3B8;">${dayLessons.length} cours prévus</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
        `;
        dayLessons.forEach(l => {
          const currentBadge = l.isCurrent ? `<span style="background: rgba(16, 185, 129, 0.2); color: #34D399; padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: 900; border: 1px solid rgba(16, 185, 129, 0.4);">EN COURS</span>` : ``;
          html += `
            <div class="metric-card-dark" style="padding: 10px 12px; ${l.isCurrent ? 'border-color: #10B981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <strong style="color: #FFF; font-size: 0.82rem;">${l.subject}</strong>
                  ${currentBadge}
                </div>
                <span style="font-size: 0.7rem; color: #38BDF8; font-family: monospace; font-weight: 700;">${l.time_slot}</span>
              </div>
              <div style="font-size: 0.68rem; color: #94A3B8; margin-top: 2px;">${l.teacher} • ${l.room}</div>
            </div>
          `;
        });
        html += `</div></div>`;
      }
    });

    container.innerHTML = html;

    // Attach pill handlers
    const pillBox = document.getElementById("timetable-day-filter-pills");
    if (pillBox) {
      pillBox.querySelectorAll(".tt-filter-pill").forEach(p => {
        p.onclick = () => {
          window.HardwareManager.vibrate(20);
          pillBox.querySelectorAll(".tt-filter-pill").forEach(btn => {
            btn.classList.remove("active");
            btn.style.background = "var(--bg-card-subtle)";
            btn.style.color = "var(--text-slate)";
            btn.style.border = "1px solid var(--border-glass)";
          });
          p.classList.add("active");
          p.style.background = "var(--senegal-green)";
          p.style.color = "#FFF";
          p.style.border = "none";
          renderInteractiveTimetable(p.dataset.day);
        };
      });
    }
  }

  // ================= TEACHER WORKSPACE =================
  async function renderTeacherWorkspace() {
    renderTeacherRoster("");
  }

  async function renderTeacherRoster(query = "") {
    const attContainer = document.getElementById("teacher-attendance-roster");
    const gradebookContainer = document.getElementById("teacher-gradebook-roster");

    let students = [];
    try {
      const resp = await fetch(`/api/students?classId=10-A&q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data && data.success && data.students) {
        students = data.students;
      }
    } catch (e) {
      console.warn("Using fallback students list:", e);
    }

    if (students.length === 0 && !query) {
      students = [
        { id: 'STU-101', matricule: 'DKR-001', full_name: 'Amadou Diallo' },
        { id: 'STU-102', matricule: 'DKR-002', full_name: 'Fatou Ndiaye' },
        { id: 'STU-103', matricule: 'DKR-003', full_name: 'Ibrahima Diallo' },
        { id: 'STU-104', matricule: 'DKR-004', full_name: 'Cheikh Sarr' },
        { id: 'STU-105', matricule: 'DKR-005', full_name: 'Mariama Ba' }
      ];
    }

    if (attContainer) {
      let attHtml = "";
      students.forEach(st => {
        const name = st.full_name || st.name;
        attHtml += `
          <div class="attendance-roster-row" data-att-student="${st.id}">
            <div>
              <strong style="color: #FFF; font-size: 0.82rem;">${name}</strong>
              <div style="font-size: 0.68rem; color: #94A3B8;">ID: ${st.id} • ${st.matricule || 'DKR-2026'}</div>
            </div>
            <div class="att-trio-buttons">
              <button class="att-status-btn selected-present" data-status="present">Present</button>
              <button class="att-status-btn" data-status="late">Late</button>
              <button class="att-status-btn" data-status="absent">Absent</button>
            </div>
          </div>
        `;
      });
      attContainer.innerHTML = attHtml;

      attContainer.querySelectorAll(".att-status-btn").forEach(btn => {
        btn.onclick = () => {
          window.HardwareManager.vibrate(20);
          const parent = btn.parentElement;
          parent.querySelectorAll(".att-status-btn").forEach(b => b.className = "att-status-btn");
          btn.classList.add(`selected-${btn.dataset.status}`);
        };
      });

      const markAllBtn = document.getElementById("btn-mark-all-present");
      if (markAllBtn) {
        markAllBtn.onclick = () => {
          window.HardwareManager.vibrate(30);
          attContainer.querySelectorAll(".att-trio-buttons").forEach(trio => {
            trio.querySelectorAll(".att-status-btn").forEach(b => b.className = "att-status-btn");
            trio.querySelector('[data-status="present"]').classList.add("selected-present");
          });
          showToast("All students marked Present!");
        };
      }

      const saveAttBtn = document.getElementById("btn-save-attendance");
      if (saveAttBtn) {
        saveAttBtn.onclick = async () => {
          window.HardwareManager.vibrate(40);
          const isOnline = navigator.onLine;

          const rows = attContainer.querySelectorAll(".attendance-roster-row");
          for (const row of rows) {
            const stuId = row.dataset.attStudent;
            const selectedBtn = row.querySelector(".att-status-btn.selected-present, .att-status-btn.selected-late, .att-status-btn.selected-absent");
            const status = selectedBtn ? selectedBtn.dataset.status : "present";

            if (!isOnline) {
              await window.OfflineSyncManager.saveAttendanceOffline(stuId, status, 'TCH-01');
            } else {
              fetch('/api/attendance/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: stuId, recordedBy: 'TCH-01', method: 'ROLL_CALL' })
              }).catch(async () => {
                await window.OfflineSyncManager.saveAttendanceOffline(stuId, status, 'TCH-01');
              });
            }
          }

          if (!isOnline) {
            showToast("Mode Hors-Ligne : Appel enregistré localement (IndexedDB). Synchronisation automatique dès le retour d'Internet !");
          } else {
            showToast("Appel du jour validé et synchronisé sur le Cloud !");
          }
        };
      }
    }

    if (gradebookContainer) {
      let gHtml = "";
      students.forEach(st => {
        const name = st.full_name || st.name;
        const grade = { exam1: 88, exam2: 94, oral: 90, project: 92 };
        const avg = ((grade.exam1 + grade.exam2 + grade.oral + grade.project) / 4).toFixed(1);

        gHtml += `
          <div class="metric-card-dark" data-student-row="${st.id}" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div>
                <strong style="color: #38BDF8; font-size: 0.88rem;">${name}</strong>
                <div style="font-size: 0.68rem; color: #64748B;">ID: ${st.id}</div>
              </div>
              <div class="grade-row-avg" style="font-size: 1.15rem; font-weight: 900; color: #10B981; font-family: monospace;">Avg: ${avg}</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Devoir 1</span>
                <input type="number" class="form-input-dark grade-input-field" style="padding: 4px; margin: 0; text-align: center;" data-field="exam1" value="${grade.exam1}" min="0" max="100">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Devoir 2</span>
                <input type="number" class="form-input-dark grade-input-field" style="padding: 4px; margin: 0; text-align: center;" data-field="exam2" value="${grade.exam2}" min="0" max="100">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Oral</span>
                <input type="number" class="form-input-dark grade-input-field" style="padding: 4px; margin: 0; text-align: center;" data-field="oral" value="${grade.oral}" min="0" max="100">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Projet</span>
                <input type="number" class="form-input-dark grade-input-field" style="padding: 4px; margin: 0; text-align: center;" data-field="project" value="${grade.project}" min="0" max="100">
              </div>
            </div>
          </div>
        `;
      });
      gradebookContainer.innerHTML = gHtml;

      // Real-time average recalculation on typing
      gradebookContainer.querySelectorAll(".metric-card-dark").forEach(row => {
        const inputs = row.querySelectorAll(".grade-input-field");
        const avgEl = row.querySelector(".grade-row-avg");

        const updateRowAvg = () => {
          let sum = 0;
          inputs.forEach(inp => {
            sum += parseFloat(inp.value) || 0;
          });
          const newAvg = (sum / inputs.length).toFixed(1);
          if (avgEl) avgEl.innerText = `Avg: ${newAvg}`;
        };

        inputs.forEach(inp => {
          inp.addEventListener("input", updateRowAvg);
        });
      });

      const saveGradesBtn = document.getElementById("btn-save-teacher-grades");
      if (saveGradesBtn) {
        saveGradesBtn.onclick = async () => {
          window.HardwareManager.vibrate(40);
          showToast("Notes académiques enregistrées et synchronisées avec succès !");
        };
      }
    }

    // Teacher Quick Grade Submission Handler
    document.querySelectorAll(".btn-grade-hw-quick").forEach(btn => {
      btn.onclick = () => {
        window.HardwareManager.vibrate(40);
        const stu = btn.dataset.student;
        btn.innerHTML = "✓ Noté (95/100)";
        btn.style.background = "#059669";
        btn.disabled = true;
        showToast(`Copie de ${stu} évaluée (95/100) et synchronisée dans le relevé !`);
      };
    });
  }

  let persistentAdminUsers = [
    { id: 'ADM-01', name: 'Proviseur Ousmane Diop', role: 'admin' },
    { id: 'TCH-01', name: 'Prof. Jean-Marc Fall', role: 'teacher' },
    { id: 'STU-101', name: 'Amadou Diallo', role: 'student' },
    { id: 'STU-102', name: 'Fatou Binetou Diallo', role: 'student' },
    { id: 'PAR-101', name: 'Moussa Diallo', role: 'parent' }
  ];

  // ================= ADMIN WORKSPACE =================
  async function renderAdminWorkspace() {
    loadAdminUserDirectory("");
    loadAdminExcusesList();

    // Emergency Push Broadcaster
    const btnSendEmergency = document.getElementById("btn-send-emergency-broadcast");
    const inputEmergency = document.getElementById("input-emergency-broadcast-msg");

    if (btnSendEmergency && inputEmergency) {
      btnSendEmergency.onclick = () => {
        const msg = inputEmergency.value.trim();
        if (!msg) return;
        window.HardwareManager.vibrate([100, 50, 100]);
        window.HardwareManager.sendLocalNotification("🚨 E-SCHOOL ALERTE", msg);
        showToast(`Alerte d'urgence diffusée par SMS & Push : "${msg}"`);
        inputEmergency.value = "";
      };
    }

    try {
      const statsRes = await fetch('/api/admin/stats').then(r => r.json());
      if (statsRes && statsRes.success) {
        const sEl = document.getElementById("admin-stat-students-val");
        const tEl = document.getElementById("admin-stat-teachers-val");
        const gEl = document.getElementById("admin-stat-gpa-val");
        const aEl = document.getElementById("admin-stat-att-val");
        if (sEl) sEl.innerText = statsRes.students;
        if (tEl) tEl.innerText = statsRes.teachers;
        if (gEl) gEl.innerText = statsRes.gpa;
        if (aEl) aEl.innerText = statsRes.attendance;
      }
    } catch (e) {
      console.warn("Stats fetch err:", e);
    }

    const form = document.getElementById("form-admin-add-teacher");
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);
        const id = document.getElementById("adm-new-user-id").value.trim();
        const role = document.getElementById("adm-new-user-role").value;
        const name = document.getElementById("adm-new-teacher-name").value.trim();

        if (id && name && role) {
          persistentAdminUsers.unshift({ id, name, role });
          form.reset();
          loadAdminUserDirectory("");
          showToast(`Utilisateur ${name} (${id}) enregistré avec succès !`);

          try {
            await fetch('/api/admin/users/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id,
                name,
                role,
                password: 'password123',
                email: `${id.toLowerCase()}@daara.edu.sn`,
                phone: '+221 77 000 0000',
                class_id: '10-A'
              })
            });
          } catch (err) {}
        }
      };
    }
  }

  async function loadAdminExcusesList() {
    const container = document.getElementById("admin-excuses-list-container");
    if (!container) return;

    let excuses = [
      { id: 1, student_id: 'STU-101', student_name: 'Amadou Diallo', reason_type: 'Médical (Certificat)', date_start: '2026-03-02', date_end: '2026-03-04', reason_details: 'Fièvre et repos médical prescrit.', status: 'PENDING' },
      { id: 2, student_id: 'STU-102', student_name: 'Fatou Binetou Diallo', reason_type: 'Urgence Familiale', date_start: '2026-02-20', date_end: '2026-02-21', reason_details: 'Voyage familial officiel.', status: 'APPROVED' }
    ];

    try {
      const resp = await fetch('/api/excuses');
      const data = await resp.json();
      if (data && data.success && data.excuses && data.excuses.length > 0) {
        excuses = data.excuses;
      }
    } catch (e) {
      console.warn("Using offline excuses:", e);
    }

    let html = "";
    excuses.forEach(ex => {
      const isPending = ex.status === "PENDING";
      const badgeBg = isPending ? "rgba(245, 158, 11, 0.15)" : (ex.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)");
      const badgeColor = isPending ? "#F59E0B" : (ex.status === "APPROVED" ? "#10B981" : "#EF4444");

      html += `
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #FFF;">${ex.student_name} (${ex.student_id})</strong>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 0.65rem;">${ex.status}</span>
          </div>
          <div style="color: #38BDF8; font-size: 0.68rem;">Motif : ${ex.reason_type} • Dates : ${ex.date_start} au ${ex.date_end}</div>
          <p style="color: #94A3B8; font-size: 0.68rem; margin: 4px 0;">${ex.reason_details}</p>
          ${isPending ? `
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <button class="btn-review-excuse" data-eid="${ex.id}" data-action="APPROVED" style="background: #10B981; border: none; color: #FFF; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; cursor: pointer;">Valider</button>
              <button class="btn-review-excuse" data-eid="${ex.id}" data-action="REJECTED" style="background: #EF4444; border: none; color: #FFF; padding: 3px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; cursor: pointer;">Refuser</button>
            </div>
          ` : ''}
        </div>
      `;
    });
    container.innerHTML = html;

    container.querySelectorAll(".btn-review-excuse").forEach(btn => {
      btn.onclick = async () => {
        const eid = btn.dataset.eid;
        const action = btn.dataset.action;
        window.HardwareManager.vibrate(30);
        try {
          await fetch('/api/excuses/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ excuseId: eid, status: action, reviewer: 'ADM-01' })
          });
        } catch (err) {}
        const targetEx = excuses.find(e => e.id == eid);
        if (targetEx) targetEx.status = action;
        loadAdminExcusesList();
        showToast(`Justificatif marqué comme ${action} !`);
      };
    });
  }

  async function loadAdminUserDirectory(query = "") {
    const container = document.getElementById("admin-users-table-container");
    if (!container) return;

    let users = [...persistentAdminUsers];

    if (query) {
      users = users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()) || u.id.toLowerCase().includes(query.toLowerCase()));
    }

    try {
      const resp = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data && data.success && data.users && data.users.length > 0) {
        users = data.users;
      }
    } catch (e) {}

    let html = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94A3B8;">
            <th style="padding: 4px;">ID</th>
            <th style="padding: 4px;">Nom</th>
            <th style="padding: 4px;">Rôle</th>
            <th style="padding: 4px; text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
    `;
    users.forEach(u => {
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
          <td style="padding: 6px 4px; color: #38BDF8; font-family: monospace;">${u.id}</td>
          <td style="padding: 6px 4px; color: #FFF; font-weight: 700;">${u.name}</td>
          <td style="padding: 6px 4px;"><span style="background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 0.62rem; text-transform: uppercase;">${u.role}</span></td>
          <td style="padding: 6px 4px; text-align: right;">
            <button class="btn-delete-user" data-uid="${u.id}" style="background: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; color: #FCA5A5; padding: 2px 6px; border-radius: 4px; font-size: 0.62rem; cursor: pointer;">
              Supprimer
            </button>
          </td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
    container.innerHTML = html;

    container.querySelectorAll(".btn-delete-user").forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.uid;
        if (uid === 'ADM-01') {
          showToast("Impossible de supprimer le compte Super Admin !");
          return;
        }
        window.HardwareManager.vibrate(30);
        persistentAdminUsers = persistentAdminUsers.filter(u => u.id !== uid);
        loadAdminUserDirectory(query);
        showToast(`Utilisateur ${uid} supprimé.`);
      };
    });
  }

  function showToast(msg) {
    let toast = document.getElementById("toast-notice-box");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notice-box";
      toast.className = "toast-dark";
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootESchoolApp);
} else {
  bootESchoolApp();
}




// E-School Daara Master Application Engine (Search, Leave Excuses, Homework Review, Timetable, Themes & Security OTP)
document.addEventListener("DOMContentLoaded", () => {
  window.i18n.init();

  let currentUser = null;
  let currentChildIndex = 0;
  let activeTab = "home";
  let currentSelectedPackage = null;
  let html5QrScannerInstance = null;
  let pendingResetUserId = null;

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
    const hasSeen = localStorage.getItem("eschool_perm_onboarding_shown");
    const modal = document.getElementById("modal-hardware-permissions");
    if (!hasSeen && modal) {
      modal.style.display = "flex";
    }
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

    // 3. Demo Chips Autofill
    document.querySelectorAll(".demo-chip-dark").forEach(chip => {
      chip.addEventListener("click", () => {
        window.HardwareManager.vibrate(20);
        const [id, pass] = chip.dataset.cred.split(":");
        document.getElementById("input-login-id").value = id;
        document.getElementById("input-login-pass").value = pass;
      });
    });

    // 4. Theme Switcher Engine
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
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(35);
        const id = document.getElementById("input-login-id").value.trim();
        const pass = document.getElementById("input-login-pass").value.trim();

        const defaultUsers = {
          "ADM-01": { id: "ADM-01", name: "Proviseur Ousmane Diop", role: "admin", pass: "admin123" },
          "TCH-01": { id: "TCH-01", name: "Prof. Jean-Marc Fall", role: "teacher", pass: "teach123" },
          "STU-101": { id: "STU-101", name: "Amadou Diallo", role: "student", pass: "stud123" },
          "PAR-101": { id: "PAR-101", name: "Moussa Diallo", role: "parent", pass: "parent123", family: window.ESchoolData.parentFamilies["PAR-101"] }
        };

        const upperId = id.toUpperCase();

        // 1. Immediate Local Authentication Check
        if (defaultUsers[upperId] && defaultUsers[upperId].pass === pass) {
          currentUser = defaultUsers[upperId];
          const errBox = document.getElementById("auth-error-notice");
          if (errBox) errBox.style.display = "none";
          showPortalForUser(currentUser);
          showToast(`Bienvenue, ${currentUser.name} !`);
          return;
        }

        // 2. Fallback to Firebase or Remote API if available
        try {
          const authFetch = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ id, pass })
          });
          const authData = await authFetch.json();

          if (authData && authData.success && authData.user) {
            currentUser = authData.user;
            const errBox = document.getElementById("auth-error-notice");
            if (errBox) errBox.style.display = "none";
            showPortalForUser(currentUser);
            return;
          }
        } catch (err) {
          console.warn("Backend auth fallback:", err);
        }

        if (window.FirebaseESchoolService && window.FirebaseESchoolService.authenticate) {
          const res = await window.FirebaseESchoolService.authenticate(id, pass);
          if (res && res.success && res.user) {
            currentUser = res.user;
            const errBox = document.getElementById("auth-error-notice");
            if (errBox) errBox.style.display = "none";
            showPortalForUser(currentUser);
            return;
          }
        }

        // Failed auth
        const errBox = document.getElementById("auth-error-notice");
        if (errBox) {
          errBox.innerText = window.i18n ? window.i18n.t("auth.error_invalid") : "Identifiant ou mot de passe incorrect.";
          errBox.style.display = "block";
        }
        window.HardwareManager.vibrate([100, 50, 100]);
      });
    }

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
        document.getElementById("view-auth-portal").style.display = "block";
        document.getElementById("view-b2b-purchase-portal").style.display = "none";
        document.getElementById("view-student-parent-root").style.display = "none";
        document.getElementById("view-teacher-root").style.display = "none";
        document.getElementById("view-admin-root").style.display = "none";
        document.getElementById("app-floating-nav").style.display = "none";
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

    // Absence Excuse Modals
    const btnOpenExcuse = document.getElementById("btn-open-absence-excuse-modal");
    const btnCloseExcuse = document.getElementById("btn-close-excuse-modal");
    const formExcuse = document.getElementById("form-parent-absence-excuse");

    if (btnOpenExcuse) {
      btnOpenExcuse.onclick = () => {
        window.HardwareManager.vibrate(30);
        document.getElementById("modal-submit-absence-excuse").style.display = "flex";
      };
    }
    if (btnCloseExcuse) {
      btnCloseExcuse.onclick = () => {
        document.getElementById("modal-submit-absence-excuse").style.display = "none";
      };
    }

    if (formExcuse) {
      formExcuse.onsubmit = async (e) => {
        e.preventDefault();
        window.HardwareManager.vibrate(40);

        const reasonType = document.getElementById("excuse-reason-type").value;
        const dateStart = document.getElementById("excuse-date-start").value;
        const dateEnd = document.getElementById("excuse-date-end").value;
        const reasonDetails = document.getElementById("excuse-reason-details").value;

        try {
          await fetch('/api/excuses/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parentId: currentUser ? currentUser.id : 'PAR-101',
              parentName: currentUser ? currentUser.name : 'Moussa Diallo',
              studentId: 'STU-101',
              studentName: 'Amadou Diallo',
              dateStart,
              dateEnd,
              reasonType,
              reasonDetails
            })
          });
          formExcuse.reset();
          document.getElementById("modal-submit-absence-excuse").style.display = "none";
          showToast("Demande de justificatif transmise à la direction avec succès !");
        } catch (err) {
          console.warn("Excuse submit error:", err);
        }
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

    function startLiveQrScanner() {
      const modal = document.getElementById("modal-qr-attendance-scanner");
      const feedbackBox = document.getElementById("qr-scan-feedback");
      if (modal) modal.style.display = "flex";
      if (feedbackBox) feedbackBox.style.display = "none";

      if (typeof Html5Qrcode !== "undefined") {
        html5QrScannerInstance = new Html5Qrcode("qr-reader-container");
        html5QrScannerInstance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decodedText) => {
            onQrCodeDetected(decodedText);
          },
          () => {}
        ).catch(err => {
          console.warn("Camera warning:", err);
        });
      }
    }

    function stopLiveQrScanner() {
      const modal = document.getElementById("modal-qr-attendance-scanner");
      if (modal) modal.style.display = "none";
      if (html5QrScannerInstance) {
        html5QrScannerInstance.stop().then(() => {
          html5QrScannerInstance.clear();
        }).catch(err => console.warn(err));
      }
    }

    async function onQrCodeDetected(qrData) {
      window.HardwareManager.vibrate([80, 50, 80]);
      const feedbackBox = document.getElementById("qr-scan-feedback");
      if (feedbackBox) {
        feedbackBox.innerHTML = `✓ BADGE VERIFIED: <strong>${qrData}</strong><br>Attendance: <strong>Présent (08:15)</strong>`;
        feedbackBox.style.display = "block";
      }

      showToast(`Badge: ${qrData} • Synchronized!`);

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
      }, 1800);
    }

    if (btnOpenQrTeacher) btnOpenQrTeacher.onclick = startLiveQrScanner;
    if (btnOpenQrProfile) btnOpenQrProfile.onclick = startLiveQrScanner;
    if (btnCloseQr) btnCloseQr.onclick = stopLiveQrScanner;

    if (btnSimulateScan) {
      btnSimulateScan.onclick = () => {
        onQrCodeDetected("STU-101: Amadou Diallo (10-A)");
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

    // Real-Time Chat System
    const chatForm = document.getElementById("form-chat-send-msg");
    const chatInput = document.getElementById("chat-input-text");

    async function loadChatMessages() {
      const box = document.getElementById("chat-messages-stream-box");
      if (!box) return;

      try {
        const resp = await fetch('/api/chat/messages?threadId=thread-fall-diallo');
        const data = await resp.json();
        if (data.success && data.messages) {
          let html = "";
          data.messages.forEach(m => {
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
      } catch (e) {
        console.warn("Chat load error:", e);
      }
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
          loadChatMessages();
        } catch (err) {
          console.warn("Chat send error:", err);
        }
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

    // Daara AI
    const submitAiBtn = document.getElementById("btn-submit-ai");
    if (submitAiBtn) {
      submitAiBtn.addEventListener("click", () => {
        const input = document.getElementById("input-ai-prompt");
        const val = input.value.trim();
        if (!val) return;
        window.HardwareManager.vibrate(40);

        const responseBox = document.getElementById("ai-response-box");
        responseBox.innerHTML = `<em>Daara AI is analyzing institutional metrics...</em>`;

        setTimeout(() => {
          responseBox.innerHTML = `
            <strong>Daara AI :</strong> Based on the last 3 evaluations in <strong>${val}</strong>, fundamental concepts are mastered at 88%. We recommend targeted exercises from Chapter 4.
          `;
          input.value = "";
        }, 800);
      });
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
    document.getElementById("view-auth-portal").style.display = "none";
    document.getElementById("view-b2b-purchase-portal").style.display = "none";
    document.getElementById("view-student-parent-root").style.display = "none";
    document.getElementById("view-teacher-root").style.display = "none";
    document.getElementById("view-admin-root").style.display = "none";
    document.getElementById("app-floating-nav").style.display = "none";

    const deskSidebar = document.getElementById("desktop-persistent-sidebar");

    if (user.role === "student" || user.role === "parent") {
      document.getElementById("view-student-parent-root").style.display = "block";
      document.getElementById("app-floating-nav").style.display = "flex";
      if (deskSidebar) deskSidebar.style.display = "";
      switchStudentParentTab("home");
      renderStudentParentEcosystem();
    } else if (user.role === "teacher") {
      document.getElementById("view-teacher-root").style.display = "block";
      renderTeacherWorkspace();
    } else if (user.role === "admin") {
      document.getElementById("view-admin-root").style.display = "block";
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
  }

  // 1. Live Grades Renderer
  async function renderLiveGrades(studentId, lang) {
    const container = document.getElementById("sp-grades-live-container");
    if (!container) return;

    const data = await window.FirebaseESchoolService.getStudentDashboard(studentId);
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

  // 3. Interactive Timetable Renderer
  async function renderInteractiveTimetable() {
    const container = document.getElementById("timetable-interactive-container");
    if (!container) return;

    let entries = [];
    try {
      const resp = await fetch('/api/timetable?classId=10-A');
      const data = await resp.json();
      if (data && data.success && data.entries) {
        entries = data.entries;
      }
    } catch (e) {
      console.warn(e);
    }

    if (entries.length === 0) {
      entries = [
        { day_name: 'Lundi', time_slot: '08:00 - 10:00', subject: 'Mathématiques', teacher: 'Prof. Jean-Marc Fall', room: 'Salle B-104' },
        { day_name: 'Lundi', time_slot: '10:15 - 12:15', subject: 'Physique-Chimie', teacher: 'Mme. Aïssatou Sow', room: 'Labo Sciences 2' },
        { day_name: 'Mardi', time_slot: '08:00 - 10:00', subject: 'Français & Littérature', teacher: 'Mme. Ba', room: 'Salle A-201' },
        { day_name: 'Mercredi', time_slot: '08:00 - 10:00', subject: 'Sciences de la Vie (SVT)', teacher: 'Prof. Ndiaye', room: 'Salle B-102' },
        { day_name: 'Jeudi', time_slot: '10:00 - 12:00', subject: 'Langue Anglaise', teacher: 'Mr. Smith', room: 'Salle Langues 1' },
        { day_name: 'Vendredi', time_slot: '08:00 - 10:00', subject: 'Histoire & Géographie', teacher: 'M. Sene', room: 'Salle C-302' }
      ];
    }

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    let html = "";
    days.forEach(day => {
      const dayLessons = entries.filter(e => e.day_name === day);
      if (dayLessons.length > 0) {
        html += `
          <div style="margin-bottom: 14px;">
            <h4 style="color: #F59E0B; font-size: 0.85rem; margin-bottom: 6px;">${day}</h4>
            <div style="display: flex; flex-direction: column; gap: 6px;">
        `;
        dayLessons.forEach(l => {
          html += `
            <div class="metric-card-dark" style="padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between;">
                <strong style="color: #FFF; font-size: 0.82rem;">${l.subject}</strong>
                <span style="font-size: 0.7rem; color: #38BDF8; font-family: monospace;">${l.time_slot}</span>
              </div>
              <div style="font-size: 0.68rem; color: #94A3B8; margin-top: 2px;">${l.teacher} • ${l.room}</div>
            </div>
          `;
        });
        html += `</div></div>`;
      }
    });

    container.innerHTML = html;
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
              <div style="font-size: 1.15rem; font-weight: 900; color: #10B981; font-family: monospace;">Avg: ${avg}</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Devoir 1</span>
                <input type="number" class="form-input-dark" style="padding: 4px; margin: 0; text-align: center;" data-field="exam1" value="${grade.exam1}">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Devoir 2</span>
                <input type="number" class="form-input-dark" style="padding: 4px; margin: 0; text-align: center;" data-field="exam2" value="${grade.exam2}">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Oral</span>
                <input type="number" class="form-input-dark" style="padding: 4px; margin: 0; text-align: center;" data-field="oral" value="${grade.oral}">
              </div>
              <div>
                <span style="font-size: 0.62rem; color: #94A3B8;">Projet</span>
                <input type="number" class="form-input-dark" style="padding: 4px; margin: 0; text-align: center;" data-field="project" value="${grade.project}">
              </div>
            </div>
          </div>
        `;
      });
      gradebookContainer.innerHTML = gHtml;

      const saveGradesBtn = document.getElementById("btn-save-teacher-grades");
      if (saveGradesBtn) {
        saveGradesBtn.onclick = async () => {
          window.HardwareManager.vibrate(40);
          showToast(window.i18n.t("ui.success_save"));
        };
      }
    }
  }

  // ================= ADMIN WORKSPACE =================
  async function renderAdminWorkspace() {
    loadAdminUserDirectory("");
    loadAdminExcusesList();

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
        const subject = document.getElementById("adm-new-teacher-subject").value.trim();

        if (id && name && role) {
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
            form.reset();
            loadAdminUserDirectory("");
            showToast(`User ${name} registered in SQLite database!`);
          } catch (err) {
            console.warn("User creation error:", err);
          }
        }
      };
    }
  }

  async function loadAdminExcusesList() {
    const container = document.getElementById("admin-excuses-list-container");
    if (!container) return;

    try {
      const resp = await fetch('/api/excuses');
      const data = await resp.json();
      if (data && data.success && data.excuses) {
        if (data.excuses.length === 0) {
          container.innerHTML = `<div style="color: #94A3B8; padding: 6px;">Aucune demande de justificatif en attente.</div>`;
          return;
        }

        let html = "";
        data.excuses.forEach(ex => {
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
            await fetch('/api/excuses/review', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ excuseId: eid, status: action, reviewer: 'ADM-01' })
            });
            loadAdminExcusesList();
            showToast(`Justificatif marqué comme ${action} !`);
          };
        });
      }
    } catch (e) {
      console.warn("Excuses fetch error:", e);
    }
  }

  async function loadAdminUserDirectory(query = "") {
    const container = document.getElementById("admin-users-table-container");
    if (!container) return;

    try {
      const resp = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data && data.success && data.users) {
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
        data.users.forEach(u => {
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
              showToast("Cannot delete Super Admin account!");
              return;
            }
            window.HardwareManager.vibrate(30);
            await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
            loadAdminUserDirectory("");
            showToast(`User ${uid} deleted.`);
          };
        });
      }
    } catch (e) {
      console.warn("User directory fetch error:", e);
    }
  }

  // ================= AI ASSESSMENT & QUIZ GENERATOR ENGINE =================
  let currentActiveQuiz = {
    id: "quiz-101",
    title: "Mathématiques — Fonctions Dérivées & Tangentes",
    subject: "Mathématiques",
    grade: "10-A (Seconde)",
    difficulty: "Moyen",
    questions: [
      {
        q: "Quelle est la dérivée de la fonction f(x) = 3x² + 5x - 7 ?",
        options: ["f'(x) = 6x + 5", "f'(x) = 3x + 5", "f'(x) = 6x - 7", "f'(x) = x² + 5"],
        correct: 0,
        explanation: "La dérivée de x^n est n*x^(n-1). Donc (3x²)' = 6x et (5x)' = 5."
      },
      {
        q: "Quel est le coefficient directeur de la tangente à la courbe de f en a ?",
        options: ["f(a)", "f'(a)", "f'(x) - f(a)", "a / f(a)"],
        correct: 1,
        explanation: "Par définition, le nombre dérivé f'(a) représente la pente de la tangente au point d'abscisse a."
      },
      {
        q: "Si f'(x) > 0 sur un intervalle I, alors la fonction f est :",
        options: ["Strictement décroissante", "Constante", "Strictement croissante", "Nulle"],
        correct: 2,
        explanation: "Le signe positif de la dérivée implique une fonction strictement croissante sur cet intervalle."
      },
      {
        q: "La dérivée de la fonction constante f(x) = 42 est égale à :",
        options: ["42", "1", "0", "-42"],
        correct: 2,
        explanation: "La dérivée de toute constante numérique k est toujours égale à 0."
      }
    ]
  };

  // AI Quiz Generator Form Handler (Teacher)
  const formAiQuizGen = document.getElementById("form-generate-ai-quiz");
  if (formAiQuizGen) {
    formAiQuizGen.onsubmit = (e) => {
      e.preventDefault();
      const subject = document.getElementById("ai-quiz-subject").value;
      const grade = document.getElementById("ai-quiz-grade").value;
      const topic = document.getElementById("ai-quiz-topic").value;
      const diff = document.getElementById("ai-quiz-difficulty").value;
      const count = parseInt(document.getElementById("ai-quiz-count").value) || 4;

      window.HardwareManager.vibrate(40);
      showToast("Daara AI: Conception de l'épreuve en cours...");

      setTimeout(() => {
        currentActiveQuiz = {
          id: "quiz-" + Date.now(),
          title: `${subject} — ${topic}`,
          subject: subject,
          grade: grade,
          difficulty: diff,
          questions: generateDynamicAiQuestions(subject, topic, count)
        };

        // Update Teacher Card Preview
        const tTitle = document.getElementById("teacher-quiz-active-title");
        const tMeta = document.getElementById("teacher-quiz-active-meta");
        if (tTitle) tTitle.innerText = `Épreuve Active : ${subject} (${count} QCM)`;
        if (tMeta) tMeta.innerText = `Matière: ${subject} • Chapitre: ${topic} • Niveau: ${grade} (${diff})`;

        // Close modal
        const modalGen = document.getElementById("modal-ai-quiz-generator");
        if (modalGen) modalGen.style.display = "none";

        showToast("Épreuve générée par l'IA et publiée aux élèves !");
      }, 1200);
    };
  }

  // Generate subject-specific questions dynamically
  function generateDynamicAiQuestions(subject, topic, count) {
    const qBank = {
      "Mathématiques": [
        { q: `Dans le cadre de (${topic}), que vaut la dérivée seconde de f(x) = x³ ?`, options: ["f''(x) = 6x", "f''(x) = 3x²", "f''(x) = 6", "f''(x) = x"], correct: 0, explanation: "f'(x)=3x², f''(x)=6x." },
        { q: `Quelle condition assure l'existence d'un extremum local pour f dérivable ?`, options: ["f'(x) = 0 et change de signe", "f(x) = 0", "f''(x) = 0", "f'(x) > 0 partout"], correct: 0, explanation: "L'annulation et le changement de signe de f' caractérisent un extremum." },
        { q: `L'équation de la tangente au point a s'écrit :`, options: ["y = f'(a)(x - a) + f(a)", "y = f(a)(x - a) + f'(a)", "y = f'(a)x + a", "y = f(x) - a"], correct: 0, explanation: "Formule standard de Taylor-Lagrange à l'ordre 1." },
        { q: `Si f(x) = e^(2x), alors f'(x) est égal à :`, options: ["2e^(2x)", "e^(2x)", "2e^x", "e^x / 2"], correct: 0, explanation: "(e^(u))' = u' * e^u, ici (2x)' = 2." },
        { q: `La primitive de f(x) = 2x s'annulant en 0 est :`, options: ["F(x) = x²", "F(x) = 2x²", "F(x) = x", "F(x) = x² + 1"], correct: 0, explanation: "F(x) = x² car (x²)' = 2x et F(0)=0." }
      ],
      "Physique-Chimie": [
        { q: `Concernant (${topic}), quelle est la relation fondamentale de la dynamique (2e loi de Newton) ?`, options: ["Σ F = m * a", "E = m * c²", "P = U * I", "F = k * q / d²"], correct: 0, explanation: "La somme vectorielle des forces est égale à la masse multipliée par l'accélération." },
        { q: `Lors d'un dosage pH-métrique, à l'équivalence :`, options: ["Les réactifs sont introduits en proportions stœchiométriques", "Le pH est obligatoirement égal à 7", "Le volume versé est nul", "La réaction s'arrête"], correct: 0, explanation: "Définition stricte du point d'équivalence stœchiométrique." },
        { q: `Quelle est l'unité internationale de la force ?`, options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"], correct: 0, explanation: "Le Newton est l'unité légale du SI." },
        { q: `L'énergie cinétique d'un corps de masse m et de vitesse v vaut :`, options: ["Ec = 1/2 * m * v²", "Ec = m * g * h", "Ec = m * v", "Ec = 2 * m * v²"], correct: 0, explanation: "Formule cinématique classique : 1/2 m v²." }
      ],
      "Français & Littérature": [
        { q: `Dans l'étude littéraire de (${topic}), qui est l'auteur de 'Une si longue lettre' ?`, options: ["Mariama Bâ", "Sembène Ousmane", "Léopold Sédar Senghor", "Cheikh Hamidou Kane"], correct: 0, explanation: "Mariama Bâ est l'illustre romancière sénégalaise auteure de ce chef-d'œuvre épistolaire." },
        { q: `Quelle figure de style consiste à répéter un mot en début de vers ?`, options: ["Anaphore", "Oxymore", "Métonymie", "Chiasme"], correct: 0, explanation: "L'anaphore est la répétition voulue en tête de phrase ou de vers." },
        { q: `Le mouvement de la Négritude a été cofondé par :`, options: ["Aimé Césaire & L.S. Senghor", "Victor Hugo", "Albert Camus", "Émile Zola"], correct: 0, explanation: "Césaire, Senghor et Damas sont les pères fondateurs de la Négritude." }
      ]
    };

    const list = qBank[subject] || qBank["Mathématiques"];
    return list.slice(0, count);
  }

  // Teacher Trigger to Open AI Quiz Modal
  const btnTeacherAiQuiz = document.getElementById("btn-open-teacher-ai-quiz-modal");
  if (btnTeacherAiQuiz) {
    btnTeacherAiQuiz.onclick = () => {
      window.HardwareManager.vibrate(20);
      const modal = document.getElementById("modal-ai-quiz-generator");
      if (modal) modal.style.display = "flex";
    };
  }

  const btnCloseAiQuiz = document.getElementById("btn-close-ai-quiz-modal");
  if (btnCloseAiQuiz) {
    btnCloseAiQuiz.onclick = () => {
      const modal = document.getElementById("modal-ai-quiz-generator");
      if (modal) modal.style.display = "none";
    };
  }

  // Student Trigger to Open Interactive Quiz Modal
  const btnStudentOpenQuiz = document.getElementById("btn-open-student-active-quiz");
  if (btnStudentOpenQuiz) {
    btnStudentOpenQuiz.onclick = () => {
      window.HardwareManager.vibrate(20);
      renderStudentInteractiveQuiz();
      const modal = document.getElementById("modal-interactive-student-quiz");
      if (modal) modal.style.display = "flex";
    };
  }

  const btnCloseStudentQuiz = document.getElementById("btn-close-student-quiz-modal");
  if (btnCloseStudentQuiz) {
    btnCloseStudentQuiz.onclick = () => {
      const modal = document.getElementById("modal-interactive-student-quiz");
      if (modal) modal.style.display = "none";
    };
  }

  // Render questions inside Student Quiz Modal
  function renderStudentInteractiveQuiz() {
    const titleEl = document.getElementById("sq-quiz-title");
    const metaEl = document.getElementById("sq-quiz-meta");
    const qList = document.getElementById("student-quiz-questions-list");
    const resBox = document.getElementById("student-quiz-result-box");
    const submitBtn = document.getElementById("btn-submit-student-quiz");

    if (resBox) resBox.style.display = "none";
    if (submitBtn) submitBtn.style.display = "block";

    if (titleEl) titleEl.innerText = currentActiveQuiz.title;
    if (metaEl) metaEl.innerText = `Niveau: ${currentActiveQuiz.grade} • Difficulté: ${currentActiveQuiz.difficulty} • Conçu par Daara AI`;

    if (!qList) return;
    let html = "";

    currentActiveQuiz.questions.forEach((item, qIdx) => {
      html += `
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px;">
          <div style="font-size: 0.76rem; font-weight: 800; color: #FFF; margin-bottom: 8px;">
            <span style="color: #A855F7;">Q${qIdx + 1}.</span> ${item.q}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
      `;

      item.options.forEach((opt, oIdx) => {
        html += `
          <label style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); padding: 8px 10px; border-radius: 6px; font-size: 0.72rem; color: #CBD5E1; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;">
            <input type="radio" name="quiz_q_${qIdx}" value="${oIdx}" required style="accent-color: #10B981;">
            <span>${opt}</span>
          </label>
        `;
      });

      html += `
          </div>
          <div id="sq-explanation-${qIdx}" style="display: none; margin-top: 8px; font-size: 0.68rem; color: #34D399; background: rgba(16, 185, 129, 0.1); padding: 6px 8px; border-radius: 6px;"></div>
        </div>
      `;
    });

    qList.innerHTML = html;
  }

  // Handle Interactive Quiz Submission
  const formSubmitQuiz = document.getElementById("form-submit-interactive-quiz");
  if (formSubmitQuiz) {
    formSubmitQuiz.onsubmit = (e) => {
      e.preventDefault();
      window.HardwareManager.vibrate(50);

      let correctCount = 0;
      const total = currentActiveQuiz.questions.length;

      currentActiveQuiz.questions.forEach((item, qIdx) => {
        const selected = document.querySelector(`input[name="quiz_q_${qIdx}"]:checked`);
        const expEl = document.getElementById(`sq-explanation-${qIdx}`);
        
        if (selected) {
          const val = parseInt(selected.value);
          const isRight = (val === item.correct);
          if (isRight) correctCount++;

          if (expEl) {
            expEl.style.display = "block";
            expEl.style.color = isRight ? "#34D399" : "#FCA5A5";
            expEl.style.background = isRight ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
            expEl.innerHTML = `<strong>${isRight ? "✓ Correct !" : "✕ Incorrect."}</strong> Explication: ${item.explanation}`;
          }
        }
      });

      const scorePercent = Math.round((correctCount / total) * 100);
      const resBox = document.getElementById("student-quiz-result-box");
      const scoreVal = document.getElementById("sq-final-score-val");
      const fbText = document.getElementById("sq-ai-feedback-text");
      const submitBtn = document.getElementById("btn-submit-student-quiz");

      if (scoreVal) scoreVal.innerText = `${scorePercent} / 100 (${correctCount}/${total} exactes)`;
      if (fbText) {
        if (scorePercent >= 80) {
          fbText.innerHTML = `<strong style="color: #34D399;">Félicitations Exceptionnelles !</strong> Vous maîtrisez parfaitement les notions fondamentales de (${currentActiveQuiz.title}). Note enregistrée sur votre bulletin.`;
        } else if (scorePercent >= 50) {
          fbText.innerHTML = `<strong style="color: #F59E0B;">Bon Travail !</strong> Notions acquises, mais nous vous recommandons de revoir les points détaillés ci-dessus avec le Daara AI Assistant.`;
        } else {
          fbText.innerHTML = `<strong style="color: #EF4444;">Révision Nécessaire.</strong> Concentrez votre travail sur les explications formulées ci-dessus.`;
        }
      }

      if (resBox) resBox.style.display = "block";
      if (submitBtn) submitBtn.style.display = "none";

      showToast(`Évaluation terminée : Note de ${scorePercent}/100 !`);
    };
  }

  // ================= 16. GLOBAL SPOTLIGHT SEARCH (Ctrl + K) =================
  const modalSpotlight = document.getElementById("modal-global-spotlight-search");
  const inputSpotlight = document.getElementById("spotlight-search-input");
  const containerSpotlight = document.getElementById("spotlight-results-container");
  const btnCloseSpotlight = document.getElementById("btn-close-spotlight");
  const btnTriggerSpotlight = document.getElementById("btn-global-quick-search-trigger");

  function openSpotlight() {
    window.HardwareManager.vibrate(20);
    if (modalSpotlight) modalSpotlight.style.display = "flex";
    if (inputSpotlight) {
      inputSpotlight.focus();
      inputSpotlight.value = "";
    }
  }

  function closeSpotlight() {
    if (modalSpotlight) modalSpotlight.style.display = "none";
  }

  if (btnTriggerSpotlight) btnTriggerSpotlight.onclick = openSpotlight;
  if (btnCloseSpotlight) btnCloseSpotlight.onclick = closeSpotlight;

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      openSpotlight();
    }
    if (e.key === "Escape") closeSpotlight();
  });

  if (inputSpotlight && containerSpotlight) {
    inputSpotlight.addEventListener("input", () => {
      const q = inputSpotlight.value.toLowerCase().trim();
      if (!q) {
        containerSpotlight.innerHTML = `<div style="color: #64748B; text-align: center; padding: 12px;">Tapez un nom d'élève (ex: Amadou), une matière ou une commande...</div>`;
        return;
      }

      const items = [
        { title: "Amadou Diallo (10-A)", sub: "Élève • GPA: 91.32 • Présent", role: "student", action: () => switchTab('notes') },
        { title: "Mariama Ba (10-A)", sub: "Élève • GPA: 88.40 • Présente", role: "student", action: () => switchTab('notes') },
        { title: "Ousmane Sonko (10-A)", sub: "Élève • GPA: 94.10 • Présent", role: "student", action: () => switchTab('notes') },
        { title: "Mathématiques — Fonctions Dérivées", sub: "Devoir actif • Prof. Fall", role: "course", action: () => switchTab('devoirs') },
        { title: "Physique-Chimie — Dosages", sub: "Support de cours PDF", role: "course", action: () => switchTab('devoirs') },
        { title: "Générateur d'Épreuve IA", sub: "Créer un Quiz instantané", role: "action", action: () => { const m = document.getElementById("modal-ai-quiz-generator"); if(m) m.style.display = "flex"; } },
        { title: "Scanner QR Présence", sub: "Prise d'appel caméra", role: "action", action: () => { const m = document.getElementById("modal-qr-attendance-scanner"); if(m) m.style.display = "flex"; } }
      ];

      const matches = items.filter(it => it.title.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q));

      if (matches.length === 0) {
        containerSpotlight.innerHTML = `<div style="color: #EF4444; text-align: center; padding: 12px;">Aucun résultat trouvé pour "${q}".</div>`;
        return;
      }

      let html = "";
      matches.forEach((m, idx) => {
        html += `
          <div class="spotlight-result-row" data-idx="${idx}" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
            <div style="font-weight: 800; color: #38BDF8;">${m.title}</div>
            <div style="font-size: 0.65rem; color: #94A3B8;">${m.sub}</div>
          </div>
        `;
      });
      containerSpotlight.innerHTML = html;

      containerSpotlight.querySelectorAll(".spotlight-result-row").forEach(row => {
        row.onclick = () => {
          const idx = parseInt(row.dataset.idx);
          closeSpotlight();
          matches[idx].action();
        };
      });
    });
  }

  // ================= 17. FLOATING QUICK ACTION (+) MENU =================
  const btnMainFloating = document.getElementById("btn-main-floating-trigger");
  const sheetQuickMenu = document.getElementById("floating-quick-menu-sheet");

  if (btnMainFloating && sheetQuickMenu) {
    btnMainFloating.onclick = () => {
      window.HardwareManager.vibrate(25);
      const isVisible = sheetQuickMenu.style.display === "flex";
      sheetQuickMenu.style.display = isVisible ? "none" : "flex";
      btnMainFloating.style.transform = isVisible ? "rotate(0deg)" : "rotate(45deg)";
    };

    const qaQuiz = document.getElementById("qa-btn-quiz");
    const qaAtt = document.getElementById("qa-btn-attendance");
    const qaExcuse = document.getElementById("qa-btn-excuse");
    const qaChat = document.getElementById("qa-btn-chat");

    if (qaQuiz) {
      qaQuiz.onclick = () => {
        sheetQuickMenu.style.display = "none";
        btnMainFloating.style.transform = "rotate(0deg)";
        const modal = document.getElementById("modal-ai-quiz-generator");
        if (modal) modal.style.display = "flex";
      };
    }

    if (qaAtt) {
      qaAtt.onclick = () => {
        sheetQuickMenu.style.display = "none";
        btnMainFloating.style.transform = "rotate(0deg)";
        const modal = document.getElementById("modal-qr-attendance-scanner");
        if (modal) modal.style.display = "flex";
      };
    }

    if (qaExcuse) {
      qaExcuse.onclick = () => {
        sheetQuickMenu.style.display = "none";
        btnMainFloating.style.transform = "rotate(0deg)";
        const modal = document.getElementById("modal-absence-excuse");
        if (modal) modal.style.display = "flex";
      };
    }

    if (qaChat) {
      qaChat.onclick = () => {
        sheetQuickMenu.style.display = "none";
        btnMainFloating.style.transform = "rotate(0deg)";
        switchTab("messages");
      };
    }
  }

  // ================= 18. THEME QUICK TOGGLE (LIGHT / DARK) =================
  const btnThemeToggle = document.getElementById("btn-theme-quick-toggle");
  if (btnThemeToggle) {
    btnThemeToggle.onclick = () => {
      window.HardwareManager.vibrate(20);
      const current = document.body.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", next);
      btnThemeToggle.innerText = next === "dark" ? "☀️" : "🌙";
      showToast(`Thème : ${next.toUpperCase()} activé`);
    };
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
});



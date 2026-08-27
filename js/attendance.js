// Attendance Engine (Mobile-First e-Okul Devamsızlık Takip)
window.AttendanceEngine = {
  renderAttendanceData() {
    const data = window.ESchoolData.attendance;
    const currentLang = window.i18n.getLanguage();

    // Summary cards
    const unexcusedEl = document.getElementById("att-unexcused-count");
    const excusedEl = document.getElementById("att-excused-count");
    const totalEl = document.getElementById("att-total-count");
    const remainingEl = document.getElementById("att-remaining-count");
    const progressBar = document.getElementById("att-progress-fill");

    const unexcused = data.summary.unexcused;
    const excused = data.summary.excused;
    const total = unexcused + excused;
    const remaining = Math.max(0, data.maxUnexcused - unexcused);

    if (unexcusedEl) unexcusedEl.innerText = unexcused.toFixed(1);
    if (excusedEl) excusedEl.innerText = excused.toFixed(1);
    if (totalEl) totalEl.innerText = total.toFixed(1);
    if (remainingEl) remainingEl.innerText = remaining.toFixed(1);

    if (progressBar) {
      const pct = Math.min(100, (unexcused / data.maxUnexcused) * 100);
      progressBar.style.width = pct + "%";
      if (pct > 70) {
        progressBar.className = "progress-bar-fill bg-danger";
      } else if (pct > 40) {
        progressBar.className = "progress-bar-fill bg-warning";
      } else {
        progressBar.className = "progress-bar-fill bg-success";
      }
    }

    // Render Visual Calendar
    this.renderVisualCalendar();

    // Attendance Log Table
    const tableBody = document.getElementById("attendance-table-body");
    if (!tableBody) return;

    let html = "";
    data.records.forEach(rec => {
      const dayName = rec.dayName[currentLang] || rec.dayName["en"];
      const reason = rec.reason[currentLang] || rec.reason["en"];
      const isExcused = rec.type === "excused";

      html += `
        <tr class="att-row">
          <td class="font-mono text-sm font-semibold">${rec.date}</td>
          <td><span class="day-badge">${dayName}</span></td>
          <td>
            <span class="att-type-tag ${isExcused ? 'type-excused' : 'type-unexcused'}">
              ${isExcused ? '🛡️ ' + window.i18n.t('attendance.excused') : '⚠️ ' + window.i18n.t('attendance.unexcused')}
            </span>
          </td>
          <td class="text-sm font-medium">${rec.hours}</td>
          <td class="text-sm text-secondary">${reason}</td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  },

  renderVisualCalendar() {
    const calendarContainer = document.getElementById("attendance-calendar-grid");
    if (!calendarContainer) return;

    const days = window.ESchoolData.attendance.calendarDays;
    let html = "";

    days.forEach(d => {
      let statusClass = "cal-present";
      let dotColor = "🟢";
      if (d.status === "unexcused") {
        statusClass = "cal-unexcused";
        dotColor = "🔴";
      } else if (d.status === "excused") {
        statusClass = "cal-excused";
        dotColor = "🔵";
      } else if (d.status === "late") {
        statusClass = "cal-late";
        dotColor = "🟡";
      } else if (d.status === "weekend") {
        statusClass = "cal-weekend";
        dotColor = "⚪";
      }

      html += `
        <div class="calendar-day-box ${statusClass}" title="${d.note || d.status}">
          <span class="cal-day-num font-mono">${d.day}</span>
          <span class="cal-status-dot">${dotColor}</span>
        </div>
      `;
    });

    calendarContainer.innerHTML = html;
  }
};

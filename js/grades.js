// Live Student Grades Renderer with 4 Languages & Visual Progress Bars
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
            <div style="font-size: 0.7rem; color: #94A3B8;">${g.code || 'MAT-101'} • ${g.hours || 4} hrs/semaine</div>
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

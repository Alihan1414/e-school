// Official Institution Master Dataset for Lycée d'Excellence Sénégalo-Turc
window.ESchoolData = {
  institution: {
    name: "Lycée d'Excellence Sénégalo-Turc",
    motto: "Excellence – Discipline – Réussite",
    country: "Sénégal",
    city: "Dakar",
    year: "2025-2026",
    term: "2ème Semestre",
    gpa: 88.4,
    stats: {
      totalStudents: 1240,
      totalTeachers: 64,
      totalClasses: 32,
      attendanceRate: 97.6,
      homeworkTurnInRate: 94.2
    }
  },

  // Multi-Child Parent Accounts (Official Family Roster)
  parentFamilies: {
    "PAR-101": {
      id: "PAR-101",
      name: "Moussa Diallo",
      phone: "+221 77 123 4567",
      children: [
        {
          id: "STU-101",
          name: "Amadou Diallo",
          grade: "10th Grade – Seconde Sc. & Tech",
          classId: "10-A",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          gpa: 91.32,
          advisor: "Prof. Jean-Marc Fall",
          statusToday: "Présent (08:15)",
          unreadMessages: 1,
          unreadHomework: 2,
          attendanceRate: "94.2%",
          upcomingClass: {
            subject: "Mathématiques",
            time: "10:30 AM",
            countdown: "35m",
            room: "Salle B-104",
            teacher: "Prof. Jean-Marc Fall"
          },
          quickGrades: [
            { subject: "Maths", score: "18/20", pct: 90, color: "#10B981" },
            { subject: "Physique", score: "15.5/20", pct: 78, color: "#00F5D4" },
            { subject: "Histoire", score: "17/20", pct: 85, color: "#38BDF8" }
          ],
          grades: [
            { subjectId: "math", name_fr: "Mathématiques", name_en: "Mathematics", name_wo: "Xayma", name_es: "Matemáticas", code: "MAT-101", hours: 6, exam1: 95, exam2: 94, oral: 90, project: 92 },
            { subjectId: "phys", name_fr: "Physique-Chimie", name_en: "Physics", name_wo: "Fisik", name_es: "Física y Química", code: "PHY-102", hours: 4, exam1: 89, exam2: 92, oral: 88, project: 90 },
            { subjectId: "lit", name_fr: "Français & Littérature", name_en: "Literature", name_wo: "Litteratir", name_es: "Literatura", code: "LIT-105", hours: 5, exam1: 88, exam2: 90, oral: 92, project: 89 },
            { subjectId: "bio", name_fr: "Sciences de la Vie (SVT)", name_en: "Biology", name_wo: "SVT", name_es: "Biología (SVT)", code: "BIO-104", hours: 3, exam1: 94, exam2: 96, oral: 95, project: 98 },
            { subjectId: "eng", name_fr: "Langue Anglaise", name_en: "English Language", name_wo: "Làkku Angale", name_es: "Lengua Inglesa", code: "ENG-107", hours: 4, exam1: 98, exam2: 100, oral: 100, project: 95 }
          ],
          homeworks: [
            { id: "hw-101", subject: "Mathématiques", title: "Exercices de Fonctions & Dérivées", due: "Demain à 23:59", desc: "Résoudre les exercices 1 à 4 avec représentations graphiques complètes.", status: "pending", badgeColor: "#F59E0B" },
            { id: "hw-102", subject: "Physique-Chimie", title: "Rapport de Laboratoire – Dosage pH", due: "Dans 4 jours", desc: "Rédiger le compte-rendu d'expérience avec courbes d'étalonnage.", status: "new", badgeColor: "#38BDF8" },
            { id: "hw-103", subject: "Français & Littérature", title: "Commentaire Composé – Sembène Ousmane", due: "Hier", desc: "Analyse littéraire du passage sur Les Bouts de bois de Dieu.", status: "submitted", badgeColor: "#10B981" }
          ],
          timetable: [
            { day_name: 'Lundi', time_slot: '08:00 - 10:00', subject: 'Mathématiques', teacher: 'Prof. Jean-Marc Fall', room: 'Salle B-104', isCurrent: true },
            { day_name: 'Lundi', time_slot: '10:15 - 12:15', subject: 'Physique-Chimie', teacher: 'Mme. Aïssatou Sow', room: 'Labo Sciences 2' },
            { day_name: 'Mardi', time_slot: '08:00 - 10:00', subject: 'Français & Littérature', teacher: 'Mme. Mariama Ba', room: 'Salle A-201' },
            { day_name: 'Mardi', time_slot: '10:15 - 12:15', subject: 'Histoire & Géographie', teacher: 'M. Sene', room: 'Salle C-302' },
            { day_name: 'Mercredi', time_slot: '08:00 - 10:00', subject: 'Sciences de la Vie (SVT)', teacher: 'Prof. Ndiaye', room: 'Salle B-102' },
            { day_name: 'Jeudi', time_slot: '10:00 - 12:00', subject: 'Langue Anglaise', teacher: 'Mr. Smith', room: 'Salle Langues 1' },
            { day_name: 'Vendredi', time_slot: '08:00 - 10:00', subject: 'Éducation Civique', teacher: 'M. Cissé', room: 'Amphi Daara' }
          ],
          chatMessages: [
            { sender_id: 'TCH-01', sender_name: 'Prof. Jean-Marc Fall', sender_role: 'Prof. Principal (Maths)', text: 'Bonjour M. Diallo, Amadou a d\'excellents résultats en mathématiques ce trimestre (18.5/20). Il participe très bien.' },
            { sender_id: 'PAR-101', sender_name: 'Moussa Diallo', sender_role: 'Parent', text: 'Merci beaucoup Professeur Fall pour votre rigueur pédagogique et votre accompagnement.' }
          ]
        },
        {
          id: "STU-102",
          name: "Fatou Binetou Diallo",
          grade: "7th Grade – Classe de 5ème B",
          classId: "7-B",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
          gpa: 94.80,
          advisor: "Mme. Mariama Ba",
          statusToday: "Présent (08:10)",
          unreadMessages: 0,
          unreadHomework: 1,
          attendanceRate: "98.5%",
          upcomingClass: {
            subject: "Français & Grammaire",
            time: "11:00 AM",
            countdown: "1h 05m",
            room: "Salle A-203",
            teacher: "Mme. Mariama Ba"
          },
          quickGrades: [
            { subject: "Français", score: "19.5/20", pct: 98, color: "#10B981" },
            { subject: "Anglais", score: "18/20", pct: 90, color: "#00F5D4" },
            { subject: "SVT", score: "18.5/20", pct: 92, color: "#38BDF8" }
          ],
          grades: [
            { subjectId: "lit", name_fr: "Français & Expression", name_en: "French & Grammar", name_wo: "Farañse", name_es: "Francés", code: "FR-701", hours: 5, exam1: 98, exam2: 96, oral: 95, project: 100 },
            { subjectId: "math", name_fr: "Mathématiques", name_en: "Mathematics", name_wo: "Xayma", name_es: "Matemáticas", code: "MAT-702", hours: 5, exam1: 92, exam2: 94, oral: 90, project: 93 },
            { subjectId: "eng", name_fr: "Langue Anglaise", name_en: "English Language", name_wo: "Làkku Angale", name_es: "Inglés", code: "ENG-703", hours: 4, exam1: 95, exam2: 98, oral: 96, project: 95 },
            { subjectId: "hist", name_fr: "Histoire-Géographie", name_en: "History & Geography", name_wo: "Taariix", name_es: "Historia y Geografía", code: "HG-704", hours: 3, exam1: 92, exam2: 90, oral: 94, project: 92 },
            { subjectId: "bio", name_fr: "Sciences Naturelles", name_en: "Natural Sciences", name_wo: "SVT", name_es: "Ciencias Naturales", code: "SN-705", hours: 3, exam1: 94, exam2: 95, oral: 96, project: 94 }
          ],
          homeworks: [
            { id: "hw-201", subject: "Français & Expression", title: "Dissertation sur l'épopée de Soundiata Keïta", due: "Vendredi à 18:00", desc: "Rédiger un paragraphe structuré sur les valeurs de courage et de loyauté.", status: "new", badgeColor: "#38BDF8" },
            { id: "hw-202", subject: "Anglais", title: "Vocabulaire : Daily Routines & Hobbies", due: "Lundi prochain", desc: "Compléter le cahier d'exercices pages 42 à 45.", status: "submitted", badgeColor: "#10B981" }
          ],
          timetable: [
            { day_name: 'Lundi', time_slot: '08:00 - 10:00', subject: 'Français & Expression', teacher: 'Mme. Mariama Ba', room: 'Salle A-203', isCurrent: true },
            { day_name: 'Lundi', time_slot: '10:15 - 12:15', subject: 'Langue Anglaise', teacher: 'Mrs. Kane', room: 'Salle Langues 2' },
            { day_name: 'Mardi', time_slot: '08:00 - 10:00', subject: 'Mathématiques', teacher: 'M. Faye', room: 'Salle B-105' },
            { day_name: 'Mercredi', time_slot: '08:00 - 10:00', subject: 'Sciences Naturelles', teacher: 'Dr. Diop', room: 'Labo 1' },
            { day_name: 'Jeudi', time_slot: '10:00 - 12:00', subject: 'Histoire-Géographie', teacher: 'M. Sene', room: 'Salle C-201' },
            { day_name: 'Vendredi', time_slot: '08:00 - 10:00', subject: 'Arts Plastiques & Culture', teacher: 'Mme. Sy', room: 'Atelier Art' }
          ],
          chatMessages: [
            { sender_id: 'TCH-02', sender_name: 'Mme. Mariama Ba', sender_role: 'Prof. Principale (Français)', text: 'Bonjour M. Diallo, Fatou Binetou est la première de sa classe avec une moyenne générale de 19/20 ! Toutes mes félicitations.' },
            { sender_id: 'PAR-101', sender_name: 'Moussa Diallo', sender_role: 'Parent', text: 'C\'est une merveilleuse nouvelle ! Nous sommes très fiers de son travail et nous vous remercions pour vos encouragements.' }
          ]
        },
        {
          id: "STU-103",
          name: "Ibrahima Diallo",
          grade: "5th Grade – Classe de CM2 Primaire",
          classId: "5-A",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
          gpa: 89.50,
          advisor: "M. Oumar Ndiaye",
          statusToday: "Présent (08:05)",
          unreadMessages: 1,
          unreadHomework: 0,
          attendanceRate: "96.0%",
          upcomingClass: {
            subject: "Calcul Mental & Géométrie",
            time: "09:30 AM",
            countdown: "45m",
            room: "Salle Primaire P-12",
            teacher: "M. Oumar Ndiaye"
          },
          quickGrades: [
            { subject: "Calcul", score: "17.5/20", pct: 88, color: "#10B981" },
            { subject: "Lecture", score: "16.5/20", pct: 82, color: "#00F5D4" },
            { subject: "Éveil", score: "18/20", pct: 90, color: "#38BDF8" }
          ],
          grades: [
            { subjectId: "calc", name_fr: "Calcul & Numération", name_en: "Arithmetic & Math", name_wo: "Xayma", name_es: "Aritmética", code: "CM-501", hours: 6, exam1: 88, exam2: 90, oral: 86, project: 92 },
            { subjectId: "read", name_fr: "Lecture & Dictée", name_en: "Reading & Spelling", name_wo: "Jàng", name_es: "Lectura y Dictado", code: "CM-502", hours: 6, exam1: 85, exam2: 88, oral: 90, project: 86 },
            { subjectId: "eveil", name_fr: "Éveil Scientifique & Histoire", name_en: "Science & Discovery", name_wo: "Xam-Xam", name_es: "Conocimiento del Medio", code: "CM-503", hours: 4, exam1: 90, exam2: 92, oral: 94, project: 90 },
            { subjectId: "recit", name_fr: "Récitation & Poésie", name_en: "Poetry & Recitation", name_wo: "Woy", name_es: "Poesía", code: "CM-504", hours: 2, exam1: 95, exam2: 92, oral: 96, project: 94 }
          ],
          homeworks: [
            { id: "hw-301", subject: "Calcul & Numération", title: "Opérations de fractions et problèmes de partage", due: "Demain matin", desc: "Faire les 5 problèmes de la fiche n°8.", status: "submitted", badgeColor: "#10B981" }
          ],
          timetable: [
            { day_name: 'Lundi', time_slot: '08:00 - 09:30', subject: 'Calcul & Numération', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12', isCurrent: true },
            { day_name: 'Lundi', time_slot: '09:45 - 11:30', subject: 'Lecture & Vocabulaire', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12' },
            { day_name: 'Mardi', time_slot: '08:00 - 10:00', subject: 'Éveil Scientifique', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12' },
            { day_name: 'Mercredi', time_slot: '08:00 - 10:00', subject: 'Géométrie & Tracé', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12' },
            { day_name: 'Jeudi', time_slot: '08:00 - 10:00', subject: 'Histoire du Sénégal', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12' },
            { day_name: 'Vendredi', time_slot: '08:00 - 10:00', subject: 'Poésie & Éducation Morale', teacher: 'M. Oumar Ndiaye', room: 'Salle P-12' }
          ],
          chatMessages: [
            { sender_id: 'TCH-03', sender_name: 'M. Oumar Ndiaye', sender_role: 'Maître de CM2', text: 'Bonjour M. Diallo, Ibrahima prépare très sérieusement son examen d\'entrée en 6ème. Il a bien progressé en calcul mental.' },
            { sender_id: 'PAR-101', sender_name: 'Moussa Diallo', sender_role: 'Parent', text: 'Merci beaucoup M. Ndiaye, nous continuons de le faire réviser chaque soir à la maison.' }
          ]
        }
      ]
    }
  },

  // Official Upcoming Exams
  upcomingExams: [
    {
      id: "ex-1",
      subject: "Mathématiques & Algèbre",
      targetDate: "2026-06-15T09:00:00",
      daysLeft: "3",
      hoursLeft: "14",
      room: "Salle B-104",
      teacher: "Prof. Jean-Marc Fall",
      topics: ["Fonctions & Dérivées", "Trigonométrie", "Vecteurs"],
      materials: ["Guide de Révision PDF", "Formulaire Officiel"]
    },
    {
      id: "ex-2",
      subject: "Physique & Chimie",
      targetDate: "2026-06-18T10:30:00",
      daysLeft: "6",
      hoursLeft: "08",
      room: "Labo Sciences 2",
      teacher: "Mme. Aïssatou Sow",
      topics: ["Cinématique du Point", "Dosages Acido-Basiques"],
      materials: ["Fiche TP Synthèse"]
    }
  ],

  // Official Homework Directory
  homeworks: [
    {
      id: "hw-101",
      studentId: "STU-101",
      subject: "Mathématiques",
      title: "Exercices de Fonctions & Dérivées",
      due: "Demain à 23:59",
      dueDateIso: "2026-06-02",
      teacher: "Prof. Jean-Marc Fall",
      desc: "Résoudre les exercices 1 à 4 avec représentations graphiques complètes.",
      status: "pending",
      grade: null,
      fileAttached: "Devoir_Math_10A.pdf"
    },
    {
      id: "hw-102",
      studentId: "STU-101",
      subject: "Physique-Chimie",
      title: "Rapport de Laboratoire – Dosage pH",
      due: "Dans 4 jours",
      dueDateIso: "2026-06-05",
      teacher: "Mme. Aïssatou Sow",
      desc: "Rédiger le compte-rendu d'expérience avec courbes d'étalonnage.",
      status: "new",
      grade: null,
      fileAttached: "Protocole_TP.pdf"
    },
    {
      id: "hw-103",
      studentId: "STU-101",
      subject: "Français & Littérature",
      title: "Commentaire Composé – Sembène Ousmane",
      due: "Hier",
      dueDateIso: "2026-05-28",
      teacher: "Mme. Mariama Ba",
      desc: "Analyse littéraire du passage sur Les Bouts de bois de Dieu.",
      status: "submitted",
      grade: "18.5 / 20",
      fileAttached: "Devoir_Rendu_Amadou.pdf"
    }
  ],

  // Official Course Materials Hub
  courseMaterials: [
    { id: "mat-1", subject: "Mathématiques", title: "Cours Complet : Calcul Intégral & Dérivées", type: "PDF", size: "4.8 MB", date: "24 Mai 2026", teacher: "Prof. Fall" },
    { id: "mat-2", subject: "Physique-Chimie", title: "Diaporama : Électrostatique & Circuits", type: "PDF", size: "8.2 MB", date: "20 Mai 2026", teacher: "Mme. Sow" },
    { id: "mat-3", subject: "SVT / Biologie", title: "Schémas Bilan : Génétique & Hérédité", type: "PDF", size: "5.1 MB", date: "15 Mai 2026", teacher: "Dr. Diop" }
  ],

  // Official Announcements
  announcements: [
    {
      id: "ann-1",
      title: "Conseil de Classe du 2ème Trimestre",
      badge: "Direction",
      content: "Les délibérations officielles auront lieu ce vendredi 19 juin à 15h00.",
      date: "Aujourd'hui",
      urgent: true
    }
  ],

  // Official Attendance Dataset
  attendance: {
    summary: { unexcused: 1.0, excused: 3.5 },
    maxUnexcused: 10.0,
    records: [
      {
        date: "2026-05-22",
        dayName: { fr: "Vendredi", en: "Friday", es: "Viernes", wo: "Àjjuma" },
        type: "excused",
        hours: "2h",
        reason: { fr: "Consultation médicale (Justifié)", en: "Medical checkup", es: "Consulta médica", wo: "Faju" }
      },
      {
        date: "2026-05-14",
        dayName: { fr: "Jeudi", en: "Thursday", es: "Jueves", wo: "Alxamis" },
        type: "unexcused",
        hours: "1h",
        reason: { fr: "Retard transport scolaire", en: "School bus delay", es: "Retraso transporte", wo: "Gàddaay" }
      }
    ],
    calendarDays: [
      { day: 1, status: "present" },
      { day: 2, status: "present" },
      { day: 3, status: "present" },
      { day: 4, status: "present" },
      { day: 5, status: "excused", note: "Justifié" },
      { day: 6, status: "weekend" },
      { day: 7, status: "weekend" },
      { day: 8, status: "present" },
      { day: 9, status: "present" },
      { day: 10, status: "late", note: "Retard 10min" },
      { day: 11, status: "present" },
      { day: 12, status: "present" },
      { day: 13, status: "weekend" },
      { day: 14, status: "weekend" },
      { day: 15, status: "present" }
    ]
  }
};


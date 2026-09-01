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
          unreadHomework: 2
        },
        {
          id: "STU-102",
          name: "Fatou Binetou Diallo",
          grade: "7th Grade – Classe de 5ème",
          classId: "7-B",
          avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
          gpa: 94.80,
          advisor: "Mme. Mariama Ba",
          statusToday: "Présent (08:10)",
          unreadMessages: 0,
          unreadHomework: 1
        },
        {
          id: "STU-103",
          name: "Ibrahima Diallo",
          grade: "5th Grade – CM2 Primaire",
          classId: "5-A",
          avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
          gpa: 89.50,
          advisor: "Prof. Jean-Marc Fall",
          statusToday: "Présent (08:05)",
          unreadMessages: 1,
          unreadHomework: 0
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


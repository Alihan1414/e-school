// Real-Time Firebase Cloud Firestore Service Layer
window.FirebaseESchoolService = {
  // Real-time listener unsubscribers
  activeListeners: [],

  // Seed default data to Firestore if users collection is empty
  async initializeFirestoreCollections() {
    if (!window.db) return;
    try {
      const snap = await window.db.collection('users').get();
      if (snap.empty) {
        console.log("Seeding initial school users into Cloud Firestore...");
        const batch = window.db.batch();

        const initialUsers = [
          { id: 'ADM-01', password: 'admin123', role: 'admin', name: 'Dr. Babacar Diagne', title: 'School Principal / Proviseur', phone: '+221 33 800 0001' },
          { id: 'TCH-01', password: 'teach123', role: 'teacher', name: 'Prof. Jean-Marc Fall', title: 'Mathematics Professor', subject: 'Mathématiques & Sciences', classId: '10-A', phone: '+221 77 100 0002' },
          { id: 'TCH-02', password: 'teach123', role: 'teacher', name: 'Mme. Mariama Ba', title: 'Literature Professor', subject: 'Français & Littérature', classId: '10-A', phone: '+221 77 100 0003' },
          { id: 'STU-101', password: 'stud123', role: 'student', name: 'Amadou Diallo', classId: '10-A', parentId: 'PAR-101', studentNo: '435' },
          { id: 'STU-102', password: 'stud123', role: 'student', name: 'Fatoumata Binetou', classId: '10-A', parentId: 'PAR-102', studentNo: '436' },
          { id: 'PAR-101', password: 'parent123', role: 'parent', name: 'Moussa Diallo', studentId: 'STU-101', phone: '+221 77 123 4567' },
          { id: 'PAR-102', password: 'parent123', role: 'parent', name: 'Ibrahima Ndiaye', studentId: 'STU-102', phone: '+221 77 987 6543' }
        ];

        initialUsers.forEach(u => {
          batch.set(window.db.collection('users').doc(u.id), { ...u, createdAt: new Date().toISOString() });
        });

        // Initial default grades
        const defaultGrades = [
          { studentId: 'STU-101', subjectId: 'math', name_fr: 'Mathématiques', name_en: 'Mathematics', name_es: 'Matemáticas', name_wo: 'Xayma', code: 'MAT-101', hours: 6, exam1: 88, exam2: 94, oral: 90, project: 92, term: 2 },
          { studentId: 'STU-101', subjectId: 'lit', name_fr: 'Français & Littérature', name_en: 'Literature', name_es: 'Literatura', name_wo: 'Litteratir', code: 'LIT-105', hours: 5, exam1: 84, exam2: 88, oral: 90, project: 89, term: 2 },
          { studentId: 'STU-101', subjectId: 'phys', name_fr: 'Physique-Chimie', name_en: 'Physics', name_es: 'Física', name_wo: 'Fisik', code: 'PHY-102', hours: 4, exam1: 82, exam2: 89, oral: 85, project: 88, term: 2 },
          { studentId: 'STU-101', subjectId: 'bio', name_fr: 'Sciences de la Vie (SVT)', name_en: 'Biology', name_es: 'Biología', name_wo: 'SVT', code: 'BIO-104', hours: 3, exam1: 91, exam2: 96, oral: 95, project: 98, term: 2 },
          { studentId: 'STU-101', subjectId: 'eng', name_fr: 'Langue Anglaise', name_en: 'English Language', name_es: 'Inglés', name_wo: 'Làkku Angale', code: 'ENG-107', hours: 4, exam1: 95, exam2: 98, oral: 100, project: 95, term: 2 }
        ];

        defaultGrades.forEach(g => {
          batch.set(window.db.collection('grades').doc(`${g.studentId}_${g.subjectId}`), { ...g, updatedAt: new Date().toISOString() });
        });

        await batch.commit();
        console.log("Firestore Seed successfully completed!");
      }
    } catch(err) {
      console.warn("Firestore seed note:", err);
    }
  },

  async authenticate(userId, password) {
    if (window.db) {
      try {
        const doc = await window.db.collection('users').doc(userId.trim().toUpperCase()).get();
        if (doc.exists && doc.data().password === password) {
          return { success: true, user: doc.data() };
        }
      } catch(err) {
        console.warn("Firestore auth query error:", err);
      }
    }
    return await window.ESchoolAPI.login(userId, password);
  },

  async getAdminOverview() {
    if (window.db) {
      try {
        const snap = await window.db.collection('users').get();
        const usersList = [];
        snap.forEach(doc => usersList.push(doc.data()));

        if (usersList.length > 0) {
          const totalStudents = usersList.filter(u => u.role === 'student').length;
          const totalTeachers = usersList.filter(u => u.role === 'teacher').length;
          return {
            stats: { totalStudents, totalTeachers, totalClasses: 2, schoolGPA: 89.2 },
            teachers: usersList.filter(u => u.role === 'teacher'),
            students: usersList.filter(u => u.role === 'student').map(s => ({
              student_id: s.id,
              student_name: s.name,
              class_id: s.classId || '10-A',
              parent_id: s.parentId || '-',
              parent_name: (usersList.find(p => p.id === s.parentId) || {}).name || '-'
            }))
          };
        }
      } catch(err) {
        console.warn("Firestore getAdminOverview fallback:", err);
      }
    }
    return await window.ESchoolAPI.getAdminOverview();
  },

  async registerTeacher(name, subject) {
    const data = await window.ESchoolAPI.registerTeacher(name, subject);
    if (window.db && data.teacherId) {
      try {
        await window.db.collection('users').doc(data.teacherId).set({
          id: data.teacherId,
          password: data.password || 'teach123',
          role: 'teacher',
          name: name,
          subject: subject,
          title: 'Instructor',
          classId: '10-A',
          createdAt: new Date().toISOString()
        });
      } catch(e) {
        console.warn("Firestore teacher write note:", e);
      }
    }
    return data;
  },

  async registerStudentAndParent(studentName, classId, parentName, parentPhone) {
    const data = await window.ESchoolAPI.registerStudentAndParent(studentName, classId, parentName, parentPhone);
    if (window.db && data.studentId) {
      try {
        const batch = window.db.batch();
        batch.set(window.db.collection('users').doc(data.studentId), {
          id: data.studentId, password: 'stud123', role: 'student', name: studentName, classId: classId || '10-A', parentId: data.parentId, createdAt: new Date().toISOString()
        });
        batch.set(window.db.collection('users').doc(data.parentId), {
          id: data.parentId, password: 'parent123', role: 'parent', name: parentName, studentId: data.studentId, phone: parentPhone, createdAt: new Date().toISOString()
        });
        await batch.commit();
      } catch(e) {
        console.warn("Firestore student write note:", e);
      }
    }
    return data;
  },

  async saveTeacherGrades(gradesList) {
    const res = await window.ESchoolAPI.saveTeacherGrades(gradesList);
    if (window.db) {
      try {
        const batch = window.db.batch();
        gradesList.forEach(g => {
          const docRef = window.db.collection('grades').doc(`${g.studentId}_${g.subjectId}`);
          batch.set(docRef, { ...g, updatedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
      } catch(e) {
        console.warn("Firestore grade batch write note:", e);
      }
    }
    return res;
  },

  async saveClassAttendance(attendanceRecord) {
    if (window.db) {
      try {
        const id = `${attendanceRecord.studentId || 'STU-101'}_${new Date().toISOString().split('T')[0]}`;
        await window.db.collection('attendance').doc(id).set({
          ...attendanceRecord,
          timestamp: new Date().toISOString()
        }, { merge: true });
        console.log("🔥 Attendance record committed to Cloud Firestore:", id);
      } catch(e) {
        console.warn("Firestore attendance write caught:", e);
      }
    }
    return { success: true };
  },

  async submitAbsenceExcuse(excuseData) {
    if (window.db) {
      try {
        const docRef = await window.db.collection('excuses').add({
          ...excuseData,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
        console.log("🔥 Absence excuse registered in Firestore:", docRef.id);
        return { success: true, excuseId: docRef.id };
      } catch(e) {
        console.warn("Firestore excuse submission note:", e);
      }
    }
    return { success: true, excuseId: 'EXC-' + Math.floor(1000 + Math.random() * 9000) };
  },

  async saveQuizResult(studentId, quizTitle, score) {
    if (window.db) {
      try {
        await window.db.collection('quiz_results').add({
          studentId: studentId || 'STU-101',
          quizTitle,
          score,
          timestamp: new Date().toISOString()
        });
        console.log("🔥 Quiz assessment score saved to Cloud Firestore!");
      } catch(e) {
        console.warn("Firestore quiz score note:", e);
      }
    }
    return { success: true };
  },

  async publishAnnouncement(announcement) {
    if (window.db) {
      try {
        await window.db.collection('announcements').add({
          ...announcement,
          createdAt: new Date().toISOString()
        });
        console.log("🔥 School announcement broadcasted to Firestore!");
      } catch(e) {
        console.warn("Firestore announcement broadcast note:", e);
      }
    }
    return { success: true };
  },

  // Realtime Live Subscription (WebSocket / Firestore onSnapshot)
  subscribeToStudentGrades(studentId, onUpdate) {
    if (window.db) {
      try {
        const unsubscribe = window.db.collection('grades')
          .where('studentId', '==', studentId)
          .onSnapshot(snapshot => {
            const grades = [];
            let totalWeighted = 0;
            let totalHours = 0;

            snapshot.forEach(doc => {
              const g = doc.data();
              const hours = g.hours || 4;
              const avg = (g.exam1 + g.exam2 + g.oral + g.project) / 4.0;
              totalWeighted += avg * hours;
              totalHours += hours;
              grades.push(g);
            });

            const gpa = totalHours > 0 ? Number((totalWeighted / totalHours).toFixed(2)) : 88.5;
            onUpdate({ grades, gpa });
          });

        this.activeListeners.push(unsubscribe);
        return unsubscribe;
      } catch(e) {
        console.warn("Firestore realtime subscribe error:", e);
      }
    }
    return null;
  }
};

// Run initial seed if ready
setTimeout(() => {
  if (window.FirebaseESchoolService) {
    window.FirebaseESchoolService.initializeFirestoreCollections();
  }
}, 1000);

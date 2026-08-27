// Frontend API Client Bridge connecting to Node.js / SQLite REST API
window.ESchoolAPI = {
  baseUrl: '',

  async login(id, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      return await res.json();
    } catch(err) {
      console.error("Login API error:", err);
      // Fallback to local DB if backend offline
      const user = window.ESchoolDB.authenticate(id, password);
      return user ? { success: true, user } : { error: 'Authentication failed' };
    }
  },

  async getAdminOverview() {
    try {
      const res = await fetch('/api/admin/overview');
      return await res.json();
    } catch(err) {
      const db = window.ESchoolDB.get();
      return {
        stats: { totalStudents: db.users.filter(u => u.role === 'student').length, totalTeachers: db.users.filter(u => u.role === 'teacher').length, totalClasses: db.classes.length, schoolGPA: 88.4 },
        teachers: db.users.filter(u => u.role === 'teacher'),
        students: db.users.filter(u => u.role === 'student').map(s => ({
          student_id: s.id, student_name: s.name, class_id: s.classId, parent_id: s.parentId, parent_name: (db.users.find(p => p.id === s.parentId) || {}).name || '-'
        }))
      };
    }
  },

  async registerTeacher(name, subject) {
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject })
      });
      return await res.json();
    } catch(err) {
      return window.ESchoolDB.registerTeacher(name, subject);
    }
  },

  async registerStudentAndParent(studentName, classId, parentName, parentPhone) {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, classId, parentName, parentPhone })
      });
      return await res.json();
    } catch(err) {
      return window.ESchoolDB.registerStudentAndParent(studentName, classId, parentName, parentPhone);
    }
  },

  async getTeacherGrades(classId = '10-A') {
    try {
      const res = await fetch(`/api/teacher/grades/${classId}`);
      return await res.json();
    } catch(err) {
      const db = window.ESchoolDB.get();
      return {
        students: db.users.filter(u => u.role === 'student'),
        subjects: db.subjects,
        grades: db.grades
      };
    }
  },

  async saveTeacherGrades(gradesList) {
    try {
      const res = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradesList })
      });
      return await res.json();
    } catch(err) {
      gradesList.forEach(g => {
        window.ESchoolDB.saveStudentGrade(g.studentId, g.subjectId, g.exam1, g.exam2, g.oral, g.project);
      });
      return { success: true };
    }
  },

  async getStudentDashboard(studentId) {
    try {
      const res = await fetch(`/api/student/dashboard/${studentId}`);
      return await res.json();
    } catch(err) {
      const db = window.ESchoolDB.get();
      const student = db.users.find(u => u.id === studentId) || db.users.find(u => u.role === 'student');
      const grades = db.subjects.map(s => {
        const g = db.grades.find(gr => gr.studentId === student.id && gr.subjectId === s.id) || { exam1: 85, exam2: 90, oral: 88, project: 90 };
        return { ...g, name_fr: s.name, name_en: s.name, name_es: s.name, name_wo: s.name, code: s.code, hours: s.hours };
      });
      return { student, grades, attendance: db.attendance.filter(a => a.studentId === student.id), gpa: 88.6 };
    }
  }
};

import { Student, ClassAttendance, FiringItem, StudioAnnouncement, StudioRates } from '../types';
import { INITIAL_STUDENTS, INITIAL_ATTENDANCE, INITIAL_FIRINGS, INITIAL_ANNOUNCEMENTS, INITIAL_RATES } from './mockData';

const KEYS = {
  STUDENTS: 'ollaria_students_v4',
  ATTENDANCE: 'ollaria_attendance_v4',
  FIRINGS: 'ollaria_firings_v4',
  ANNOUNCEMENTS: 'ollaria_announcements_v1',
  RATES: 'ollaria_rates_v1',
  AUTH_ROLE: 'ollaria_auth_role_v1',
  ACTIVE_STUDENT_ID: 'ollaria_active_student_id_v1',
  ADMIN_2FA: 'ollaria_admin_2fa_v1',
  ADMIN_CREDS: 'ollaria_admin_creds_v1',
};

export const StorageService = {
  getStudents(): Student[] {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (!data) {
      this.saveStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getAttendance(): ClassAttendance[] {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    if (!data) {
      this.saveAttendance(INITIAL_ATTENDANCE);
      return INITIAL_ATTENDANCE;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  },

  saveAttendance(records: ClassAttendance[]) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getFirings(): FiringItem[] {
    const data = localStorage.getItem(KEYS.FIRINGS);
    if (!data) {
      this.saveFirings(INITIAL_FIRINGS);
      return INITIAL_FIRINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_FIRINGS;
    }
  },

  saveFirings(firings: FiringItem[]) {
    localStorage.setItem(KEYS.FIRINGS, JSON.stringify(firings));
  },

  getAnnouncements(): StudioAnnouncement[] {
    const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
    if (!data) {
      this.saveAnnouncements(INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  saveAnnouncements(announcements: StudioAnnouncement[]) {
    localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  },

  getRates(): StudioRates {
    const data = localStorage.getItem(KEYS.RATES);
    if (!data) {
      this.saveRates(INITIAL_RATES);
      return INITIAL_RATES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_RATES;
    }
  },

  saveRates(rates: StudioRates) {
    localStorage.setItem(KEYS.RATES, JSON.stringify(rates));
  },

  getAuthRole(): 'admin' | 'student' | null {
    return (localStorage.getItem(KEYS.AUTH_ROLE) as 'admin' | 'student' | null) || null;
  },

  setAuthRole(role: 'admin' | 'student' | null) {
    if (role) {
      localStorage.setItem(KEYS.AUTH_ROLE, role);
    } else {
      localStorage.removeItem(KEYS.AUTH_ROLE);
    }
  },

  getActiveStudentId(): string | null {
    return localStorage.getItem(KEYS.ACTIVE_STUDENT_ID);
  },

  setActiveStudentId(studentId: string | null) {
    if (studentId) {
      localStorage.setItem(KEYS.ACTIVE_STUDENT_ID, studentId);
    } else {
      localStorage.removeItem(KEYS.ACTIVE_STUDENT_ID);
    }
  },

  getAdmin2FAVerified(): boolean {
    return localStorage.getItem(KEYS.ADMIN_2FA) === 'true';
  },

  setAdmin2FAVerified(verified: boolean) {
    if (verified) {
      localStorage.setItem(KEYS.ADMIN_2FA, 'true');
    } else {
      localStorage.removeItem(KEYS.ADMIN_2FA);
    }
  },

  getAdminCredentials(): { email: string; password: string } {
    const data = localStorage.getItem(KEYS.ADMIN_CREDS);
    if (!data) {
      return { email: 'ollariaatelie@gmail.com', password: 'admin2026' };
    }
    try {
      const parsed = JSON.parse(data);
      return {
        email: parsed.email || 'ollariaatelie@gmail.com',
        password: parsed.password || 'admin2026',
      };
    } catch {
      return { email: 'ollariaatelie@gmail.com', password: 'admin2026' };
    }
  },

  saveAdminCredentials(creds: { email: string; password: string }) {
    localStorage.setItem(KEYS.ADMIN_CREDS, JSON.stringify(creds));
  },

  resetAllData() {
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.FIRINGS);
    localStorage.removeItem(KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(KEYS.RATES);
    localStorage.removeItem(KEYS.AUTH_ROLE);
    localStorage.removeItem(KEYS.ACTIVE_STUDENT_ID);
    localStorage.removeItem(KEYS.ADMIN_2FA);
    localStorage.removeItem(KEYS.ADMIN_CREDS);
  }
};

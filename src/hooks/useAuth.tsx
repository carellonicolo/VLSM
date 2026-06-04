import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  apiChangePassword,
  apiLogin,
  apiMe,
  apiRegister,
  clearToken,
  getToken,
  type ExamState,
  type StudentProfile,
} from '../lib/auth';

interface AuthContextValue {
  loading: boolean;
  student: StudentProfile | null;
  exam: ExamState | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: { email: string; password: string; fullName: string; declaredClass: string }) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [exam, setExam] = useState<ExamState | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setStudent(null);
      setExam(null);
      return;
    }
    const res = await apiMe();
    if (!mounted.current) return;
    if (res.ok && res.data) {
      setStudent(res.data.student);
      setExam(res.data.exam);
    } else if (res.status === 401) {
      clearToken();
      setStudent(null);
      setExam(null);
    }
    // Altri errori (rete/500): manteniamo lo stato precedente.
  }, []);

  useEffect(() => {
    mounted.current = true;
    void (async () => {
      await refresh();
      if (mounted.current) setLoading(false);
    })();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (res.ok) {
      await refresh();
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, [refresh]);

  const register = useCallback(
    async (input: { email: string; password: string; fullName: string; declaredClass: string }) => {
      const res = await apiRegister(input);
      if (res.ok) {
        await refresh();
        return { ok: true };
      }
      return { ok: false, error: res.error };
    },
    [refresh]
  );

  const changePassword = useCallback(async (current: string, next: string) => {
    const res = await apiChangePassword(current, next);
    if (res.ok) {
      await refresh();
      return { ok: true };
    }
    return { ok: false, error: res.error };
  }, [refresh]);

  const logout = useCallback(() => {
    clearToken();
    setStudent(null);
    setExam(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ loading, student, exam, login, register, changePassword, logout, refresh }),
    [loading, student, exam, login, register, changePassword, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>.');
  return ctx;
}

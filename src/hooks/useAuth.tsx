import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { apiMe, redirectToLogin, redirectToLogout, type ExamState, type StudentProfile } from '../lib/auth';

interface AuthContextValue {
  loading: boolean;
  student: StudentProfile | null;
  exam: ExamState | null;
  /** Manda al login centrale SSO. */
  login: () => void;
  /** Logout globale SSO. */
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
    const res = await apiMe();
    if (!mounted.current) return;
    if (res.ok && res.data) {
      setStudent(res.data.student);
      setExam(res.data.exam);
    } else if (res.status === 401) {
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

  const login = useCallback(() => redirectToLogin(), []);
  const logout = useCallback(() => redirectToLogout(), []);

  const value = useMemo<AuthContextValue>(
    () => ({ loading, student, exam, login, logout, refresh }),
    [loading, student, exam, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>.');
  return ctx;
}

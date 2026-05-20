import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './components/screens/HomePage';
import { CalcolatoriPage } from './components/screens/CalcolatoriPage';
import { TestFlow } from './components/screens/TestFlow';
import { AdminPage } from './components/screens/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calcolatori" element={<CalcolatoriPage />} />
        <Route path="/verifica" element={<TestFlow categoria="verifica" />} />
        <Route path="/esercitazione" element={<TestFlow categoria="esercitazione" />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

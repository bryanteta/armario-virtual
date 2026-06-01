import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { WardrobePage } from './pages/WardrobePage';
import { OutfitsPage } from './pages/OutfitsPage';
import { CalendarPage } from './pages/CalendarPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={<WardrobePage />} />
          <Route path="/outfits" element={<OutfitsPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

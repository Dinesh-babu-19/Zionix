import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import DailyVerse from './pages/DailyVerse';
import GospelClarity from './pages/GospelClarity';
import GospelExplore from './pages/GospelExplore';
import BibleExplorer from './pages/BibleExplorer';
import Login from './pages/Login';
import AdminDailyVerse from './pages/AdminDailyVerse';
import PrayerWall from './pages/PrayerWall';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import './App.css';


function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
      <Router>
        <ScrollToTop />
        <AuthModal />
        <Routes>
          {/* Standard Layout Pages */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/prayer-wall" element={<Layout><PrayerWall /></Layout>} />
          <Route path="/verse" element={<Layout><DailyVerse /></Layout>} />
          <Route path="/gospel" element={<Layout><GospelClarity /></Layout>} />
          <Route path="/gospel/explore" element={<Layout><GospelExplore /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />

          {/* Private Developer Admin Portal (Direct Link Only) */}
          <Route path="/admin" element={<AdminDailyVerse />} />

          {/* Full-Screen Bible Explorer */}
          <Route path="/bible" element={<BibleExplorer />} />
          <Route path="/holybible" element={<BibleExplorer />} />
          <Route path="/holy-bible" element={<BibleExplorer />} />
          <Route path="/daily-verse" element={<Navigate to="/verse" replace />} />
          <Route path="/dailyverse" element={<Navigate to="/verse" replace />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;

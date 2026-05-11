import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import AdDetail from './pages/AdDetail';
import Talent from './pages/Talent';
import TalentProfile from './pages/TalentProfile';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function NotFound() {
  return (
    <div style={{ paddingTop:64, minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--cream)', gap:12, padding:'80px 24px' }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, color:'var(--ink)', letterSpacing:'-.03em' }}>Page not found</h1>
      <p style={{ color:'var(--grey-500)', fontSize:15 }}>Great gigs are just a click away though.</p>
      <a href="/" style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:8, background:'var(--green)', color:'white', padding:'12px 24px', borderRadius:'var(--r-sm)', fontWeight:600, fontSize:14 }}>Go Home →</a>
    </div>
  );
}

function AppRoutes() {
  const loc = useLocation();
  // key={loc.search} forces Login/Register to remount when the ?role= param
  // changes so useState initializers re-run with the new value.
  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/login"        element={<Login    key={loc.search} />} />
      <Route path="/register"     element={<Register key={loc.search} />} />
      <Route path="/browse"       element={<Browse />} />
      <Route path="/ad/:id"       element={<AdDetail />} />
      <Route path="/talent"       element={<Talent />} />
      <Route path="/talent/:id"   element={<TalentProfile />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/messages"     element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/analytics"    element={<Analytics />} />
      <Route path="/terms"        element={<Terms />} />
      <Route path="/privacy"      element={<Privacy />} />
      <Route path="*"             element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
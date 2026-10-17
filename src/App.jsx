import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';

function App() {
  // إدارة الحالة هنا لتكون متاحة للناف بار ولصفحة الهوم
  const [activeView, setActiveView] = useState('hero');

  return (
    <div className="bg-[#030303] min-h-screen text-white font-sans overflow-x-hidden">
      {/* الناف بار ثابت في الأعلى دائماً */}
      <Navbar setActiveView={setActiveView} activeView={activeView} />
      
      <Routes>
        <Route path="/" element={<Home activeView={activeView} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
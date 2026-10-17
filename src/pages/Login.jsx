import { Link, Navigate } from 'react-router-dom';
import { buildDiscordAuthUrl } from '../config';
import { useAuth } from '../auth';

const Login = () => {
  const { loggedIn } = useAuth();

  const handleDiscordLogin = (e) => {
    e.preventDefault();
    window.location.href = buildDiscordAuthUrl();
  };

  // Already signed in → go straight to the dashboard.
  if (loggedIn) return <Navigate to="/dashboard" replace />;

  return (
    <section className="relative w-full min-h-screen bg-[#030303] flex items-center justify-center px-6 pt-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#e62b1e]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-8 lg:p-10">
          <div className="text-center mb-8">
            <h1 className="text-white font-black uppercase tracking-tighter text-4xl lg:text-5xl mb-2">
              Albioner
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">
              Login to continue
            </p>
          </div>

          <button
            type="button"
            onClick={handleDiscordLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold uppercase tracking-widest py-3 px-6 rounded-xl transition-colors duration-300 shadow-lg"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            Continue with Discord
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-400 hover:text-white text-sm font-medium tracking-widest uppercase transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;

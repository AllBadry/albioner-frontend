import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import { saveAuth } from '../auth';
import { useI18n } from '../i18n';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [status, setStatus] = useState(t('auth.processing'));

  useEffect(() => {
    let cancelled = false;

    const fail = (message) => {
      if (cancelled) return;
      setStatus(message);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    };

    const exchangeCode = async (code) => {
      try {
        if (!cancelled) setStatus(t('auth.exchanging'));
        const res = await fetch(`${API_URL}/auth/discord/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (!res.ok || !data.token) {
          fail(data.message || t('auth.failed'));
          return;
        }

        if (cancelled) return;
        setStatus(t('auth.success'));
        saveAuth(data.token, data.user);
        setTimeout(() => navigate('/dashboard', { replace: true }), 800);
      } catch {
        fail(t('auth.network'));
      }
    };

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;

      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        fail(t('auth.failedWith', { error }));
        return;
      }
      if (!code) {
        fail(t('auth.missingCode'));
        return;
      }
      await exchangeCode(code);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, t]);

  return (
    <section className="relative w-full min-h-screen bg-[#030303] flex items-center justify-center px-6 pt-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#e62b1e]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="relative z-10 text-center animate-fade-in">
        <h1 className="text-white font-black uppercase tracking-tighter text-3xl lg:text-4xl mb-4">
          {t('auth.heading')}
        </h1>
        <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">{status}</p>
      </div>
    </section>
  );
};

export default AuthCallback;

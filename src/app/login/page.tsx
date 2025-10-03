// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock } from 'lucide-react';

export default function LoginPage() {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-vh-100 w-100 d-flex align-items-center justify-content-center p-4 auth-page">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <div className="card rounded-4 shadow-lg card-glass p-2">
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <div style={{width: '96px', height: '96px'}} className="bg-white bg-opacity-25 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3">
                <User style={{width: '48px', height: '48px'}} className="text-white opacity-75" />
              </div>
              <h1 className="h3 fw-bold text-white" style={{letterSpacing: '0.1em'}}>LOGIN</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3 position-relative">
                <User className="position-absolute text-white opacity-50" size={20} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-glass"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-3 position-relative">
                <Lock className="position-absolute text-white opacity-50" size={20} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass"
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="alert alert-danger p-2 text-center">
                  {error}
                </div>
              )}
              <div className="d-grid mt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg fw-bold"
                  style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  {isLoading ? 'Verifying...' : 'LOGIN'}
                </button>
              </div>
            </form>
            <p className="text-sm text-center text-white opacity-50 mt-4">
              No account yet?{' '}
              <Link href="/register" className="fw-semibold text-white opacity-75 text-decoration-none">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
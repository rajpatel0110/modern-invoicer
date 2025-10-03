import Link from 'next/link';
import { FileText, Users, ShieldCheck, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();
  const isLoggedIn = !!session;

  // This is a Server Action. It runs securely on the server when the form is submitted.
  async function handleLogout() {
    'use server';
    // 1. Clear the session cookie on the server.
    (await
      // 1. Clear the session cookie on the server.
      cookies()).set('token', '', { expires: new Date(0), path: '/' });
    // 2. Redirect the user to the login page from the server.
    redirect('/login');
  }

  return (
    <div>
      {/* Header */}
      <header className="navbar navbar-expand-lg navbar-dark hero-gradient shadow-sm sticky-top">
        <div className="container">
          <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
            <FileText />
            <span className="fw-bold fs-4">Modern Invoicer</span>
          </Link>
          <div className="d-flex gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="btn btn-light fw-bold d-flex align-items-center gap-2">
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                {/* This form calls the Server Action to log out */}
                <form action={handleLogout}>
                  <button type="submit" className="btn btn-outline-light d-flex align-items-center gap-2">
                    <LogOut size={18} />
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline-light">Login</Link>
                <Link href="/register" className="btn btn-light fw-bold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-gradient text-white text-center py-5">
          <div className="container col-xxl-8 px-4 py-5">
            <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
              <div className="col-10 col-sm-8 col-lg-6 mx-auto">
                {/* SVG Illustration */}
                <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="5" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.2"/>
                    </filter>
                  </defs>
                  <g filter="url(#shadow)">
                    <rect x="50" y="30" width="300" height="240" rx="15" fill="white" fillOpacity="0.95"/>
                    <rect x="70" y="50" width="100" height="15" rx="5" fill="#E9ECEF"/>
                    <rect x="250" y="50" width="80" height="15" rx="5" fill="#E9ECEF"/>
                    <rect x="70" y="80" width="260" height="8" rx="4" fill="#CED4DA"/>
                    <rect x="70" y="100" width="260" height="8" rx="4" fill="#E9ECEF"/>
                    <rect x="70" y="120" width="180" height="8" rx="4" fill="#E9ECEF"/>
                    <rect x="70" y="150" width="260" height="8" rx="4" fill="#CED4DA"/>
                    <rect x="70" y="170" width="260" height="8" rx="4" fill="#E9ECEF"/>
                    <rect x="70" y="190" width="150" height="8" rx="4" fill="#E9ECEF"/>
                    <rect x="230" y="220" width="100" height="30" rx="8" fill="#667eea"/>
                    <circle cx="100" cy="235" r="15" fill="#764ba2" fillOpacity="0.2"/>
                    <circle cx="130" cy="235" r="15" fill="#667eea" fillOpacity="0.2"/>
                  </g>
                </svg>
              </div>
              <div className="col-lg-6 text-lg-start">
                <h1 className="display-4 fw-bold lh-1 mb-3">
                  Invoicing, Simplified and Modernized
                </h1>
                <p className="lead mb-4">
                  Create, send, and manage professional invoices in minutes. Our tool is designed for freelancers and small businesses who value simplicity and efficiency.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                  <Link href="/register" className="btn btn-light btn-lg px-4 me-md-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                    Get Started <ArrowRight size={20} />
                  </Link>
                  <Link href="/login" className="btn btn-outline-light btn-lg px-4">
                    Login to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 bg-white">
          <div className="container px-4 py-5" id="featured-3">
            <h2 className="pb-2 border-bottom text-center h1 fw-bold">Why Choose Modern Invoicer?</h2>
            <div className="row g-4 py-5 row-cols-1 row-cols-lg-3">
              <div className="feature col text-center">
                <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                  <FileText size={32} />
                </div>
                <h3 className="fs-3 fw-semibold">Effortless Invoicing</h3>
                <p>Generate beautiful, professional invoices with just a few clicks. Customize with your logo, and manage line items, taxes, and discounts with ease.</p>
              </div>
              <div className="feature col text-center">
                <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                  <Users size={32} />
                </div>
                <h3 className="fs-3 fw-semibold">Client Management</h3>
                <p>Keep all your client information organized in one place. Track billing addresses, contact details, and view invoice history for each client effortlessly.</p>
              </div>
              <div className="feature col text-center">
                <div className="feature-icon bg-primary bg-gradient text-white mb-3">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="fs-3 fw-semibold">Secure & Reliable</h3>
                <p>Your data is safe with us. We use secure authentication and cloud storage to ensure your business information is always protected and accessible.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-3 bg-dark text-white text-center">
        <div className="container">
          <p className="mb-0">&copy; {new Date().getFullYear()} Modern Invoicer. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, setCurrentUser, saveUsers } from '../utils/db';
import { 
  KeyRound, 
  ShieldAlert, 
  UserCheck, 
  ArrowRight, 
  Compass, 
  TrendingUp, 
  CheckCircle2, 
  Mail, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft, 
  Send, 
  ChevronRight, 
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

type LoginMode = 'login' | 'forgot' | 'verify' | 'reset-password';

export default function Login({ onLoginSuccess }: LoginProps) {
  // Navigation & Core States
  const [mode, setMode] = useState<LoginMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password / OTP States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resolvedUser, setResolvedUser] = useState<User | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Simulated Mail Server Dispatch State
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [showIncomingNotification, setShowIncomingNotification] = useState(false);

  // Confidence Estimator State (for investment calculator on left side)
  const [simYears, setSimYears] = useState<number>(10);
  const [simBaseValue, setSimBaseValue] = useState<number>(1000000); // 10 Lakhs Default
  const [appreciationRate] = useState<number>(12); // Standard 12% land growth rate

  const formatLakhsCrores = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(num / 100000).toFixed(1)} Lakhs`;
  };

  const simFutureValue = simBaseValue * Math.pow(1 + appreciationRate / 100, simYears);
  const simMultiplier = (simFutureValue / simBaseValue).toFixed(1);

  // Normal Login Flow
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setError('Please provide both your credential identity and password.');
      return;
    }

    const allUsers = getUsers();
    const cleanId = identifier.trim().toLowerCase();

    const matchedUser = allUsers.find((u) => {
      const emailLower = u.email.toLowerCase();
      const usernameLower = u.username.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];

      return (
        emailLower === cleanId ||
        usernameLower === cleanId ||
        emailPrefix === cleanId
      );
    });

    if (!matchedUser) {
      setError('No matching luxury profile found with that identifier.');
      return;
    }

    if (matchedUser.password !== password) {
      setError('Security verification failed. Invalid password.');
      return;
    }

    // Success
    setCurrentUser(matchedUser);
    onLoginSuccess(matchedUser);
  };

  // Quick seed account login
  const handleQuickLogin = (userVal: string, passVal: string) => {
    const allUsers = getUsers();
    const cleanId = userVal.trim().toLowerCase();
    const matchedUser = allUsers.find((u) => {
      const emailLower = u.email.toLowerCase();
      const usernameLower = u.username.toLowerCase();
      const emailPrefix = emailLower.split('@')[0];

      return (
        emailLower === cleanId ||
        usernameLower === cleanId ||
        emailPrefix === cleanId
      );
    });

    if (matchedUser && matchedUser.password === passVal) {
      setCurrentUser(matchedUser);
      onLoginSuccess(matchedUser);
    }
  };

  // Forgot Password Phase 1: Verify user identity and send OTP
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!forgotIdentifier.trim()) {
      setError('Please provide your registered Username or Email.');
      return;
    }

    const allUsers = getUsers();
    const cleanId = forgotIdentifier.trim().toLowerCase();

    const foundUser = allUsers.find((u) => {
      return (
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase().split('@')[0] === cleanId
      );
    });

    if (!foundUser) {
      setError('No user profile matches that identifier in our database.');
      return;
    }

    setResolvedUser(foundUser);
    startMailDispatch(foundUser);
  };

  // Simulated SMTP Dispatcher with exact logs
  const startMailDispatch = (user: User) => {
    setIsDispatching(true);
    setDispatchLogs([]);
    setError(null);

    // Create custom 6-digit code
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(rawCode);

    const logSteps = [
      `[SMTP PORT 587] Initializing handshake request to mail.gembasrv.com...`,
      `[SMTP AUTHORIZATION] Connected. Authenticating credential mailer: gembaqa@gmail.com...`,
      `[SMTP TLS HANDSHAKE] Secure TLS Session verified. SSL cipher suite accepted.`,
      `[SMTP QUEUE] Preparing message package. Sender Address: gembaqa@gmail.com`,
      `[SMTP ENVELOPE] Dispatch payload to destination: ${user.email}`,
      `[SMTP DATA] Subject: [All in 1 Assets] OTP Security Reset Code: ${rawCode}`,
      `[SMTP TRANSMISSION] Payload streamed. Waiting for response...`,
      `[SMTP SUCCESS] 250 OK - Message accepted for delivery. Packet ID: dmns-otp-${Date.now()}`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setDispatchLogs(prev => [...prev, logSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDispatching(false);
        setMode('verify');
        // Trigger simulated incoming notification bubble so the preview user sees the code
        setTimeout(() => {
          setShowIncomingNotification(true);
        }, 800);
      }
    }, 400);
  };

  // OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredOtp.trim() !== generatedOtp) {
      setError('Incorrect 6-digit Security code. Please try again.');
      return;
    }

    setSuccessMessage('Code verified successfully! Please enter your new security password.');
    setMode('reset-password');
    setShowIncomingNotification(false);
  };

  // Save New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Password cannot be left blank.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    if (!resolvedUser) {
      setError('Session timeout. Please restart.');
      return;
    }

    // Save user password change dynamically in database
    const allUsers = getUsers();
    const updatedUsers = allUsers.map(u => {
      if (u.id === resolvedUser.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    saveUsers(updatedUsers);

    setSuccessMessage(`Password updated successfully for ${resolvedUser.name}! Sign in with your new credential.`);
    setIdentifier(resolvedUser.username);
    setPassword('');
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0B0B0C] relative flex select-none overflow-hidden font-sans">
      
      {/* 1. NOTIFICATION POPUP SIMULATOR (DUMMY CLIENT-SIDE MAIL BUBBLE) */}
      {showIncomingNotification && (
        <div 
          className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-white dark:bg-[#1C1C22] rounded-2xl p-4.5 shadow-2xl border border-[#2563EB]/20 animate-bounce cursor-pointer flex gap-3"
          onClick={() => setShowIncomingNotification(false)}
          id="simulated-mail-notification"
        >
          <div className="w-10 h-10 rounded-full bg-[#2563EB]/15 flex items-center justify-center text-[#2563EB] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">Mail Received</span>
              <span className="text-[9px] text-neutral-400 font-mono">Just Now</span>
            </div>
            <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF] mt-0.5">From: gembaqa@gmail.com</h4>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#AEAEB2] mt-1">
              Your All in 1 Assets OTP verification code is:{' '}
              <strong className="text-[#2563EB] font-mono text-xs tracking-wider bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                {generatedOtp}
              </strong>
            </p>
            <span className="text-[9px] text-[#2563EB] mt-1.5 block font-semibold hover:underline">
              Click to dismiss • Use code to reset
            </span>
          </div>
        </div>
      )}

      {/* DUAL MODE SPLIT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* LEFT COLUMN: LAND INVESTMENT CONFIDENCE & GROWTH COMPANION (lg:col-span-7) */}
        <div className="hidden lg:flex lg:col-span-7 bg-neutral-900 text-white p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Subtle grid pattern background to represent plots */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Decorative giant background blurs */}
          <div className="absolute -top-48 -left-48 w-96 h-96 bg-[#C7A15A]/15 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-48 -right-48 w-[400px] h-[400px] bg-[#10B981]/15 rounded-full filter blur-3xl"></div>

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm">
              D
            </div>
            <div>
              <span className="text-sm font-serif font-bold tracking-tight text-white leading-none block">
                All in 1 Assets
              </span>
              <span className="text-[9px] text-[#2563EB] uppercase tracking-widest font-semibold block mt-0.5">
                Invest in Solid Ground
              </span>
            </div>
          </div>

          {/* Main Visual confidence messaging */}
          <div className="relative z-10 my-auto max-w-xl text-left space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Wealth Appreciation Guarantee
              </span>
              <h2 className="text-4xl xl:text-5xl font-serif font-semibold tracking-tight text-white leading-[1.15]">
                Plots Don't Just Stand.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300">
                  They Grow Value.
                </span>
              </h2>
              <p className="text-sm text-neutral-300 font-light leading-relaxed">
                Vacant land in strategic South India development corridors is a premier high-growth asset. With verified layouts, secure registrations, and absolute transparency, DMNS gives you the ultimate asset foundation.
              </p>
            </div>

            {/* REAL-TIME DYNAMIC INVESTMENT GRAPH SIMULATOR CARD */}
            <div className="bg-neutral-800/80 backdrop-blur-md border border-neutral-700/50 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">Interactive Asset Growth Estimator</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
                  Avg. {appreciationRate}% CAGR
                </span>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">Initial Plot Value</span>
                  <input 
                    type="range" 
                    min="500000" 
                    max="5000000" 
                    step="100000"
                    value={simBaseValue}
                    onChange={(e) => setSimBaseValue(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-neutral-200 block">{formatLakhsCrores(simBaseValue)}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">Holding Tenure</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={simYears}
                    onChange={(e) => setSimYears(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-neutral-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-neutral-200 block">{simYears} Years</span>
                </div>
              </div>

              {/* Output Readout */}
              <div className="pt-3 border-t border-neutral-700/60 flex items-center justify-between gap-2">
                <div className="text-left">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Estimated Future Value</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{formatLakhsCrores(simFutureValue)}</span>
                </div>
                <div className="text-right bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-bold">Multiplier Result</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-300">+{simMultiplier}x Growth</span>
                </div>
              </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800 text-left">
              <div>
                <span className="text-emerald-400 text-sm font-bold block">100%</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium mt-0.5">Verified Deeds</span>
              </div>
              <div>
                <span className="text-amber-400 text-sm font-bold block">12-15%</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium mt-0.5">Annual Growth</span>
              </div>
              <div>
                <span className="text-blue-400 text-sm font-bold block">24/7</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium mt-0.5">Map Surveillance</span>
              </div>
            </div>
          </div>

          {/* Footer of Left Panel */}
          <div className="relative z-10 text-xs text-neutral-400 text-left flex items-center justify-between">
            <span>All in 1 Assets Systems KA &amp; AP Layouts.</span>
            <span className="font-mono text-[10px]">v1.4.2 Secure</span>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN OR RESET PANELS (lg:col-span-5) */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-6 md:p-12 relative z-10 min-h-screen">
          
          {/* Decorative blurs for mobile */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#C7A15A]/5 dark:bg-[#C7A15A]/2 rounded-full filter blur-3xl pointer-events-none lg:hidden"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#2563EB]/5 dark:bg-[#2563EB]/2 rounded-full filter blur-3xl pointer-events-none lg:hidden"></div>

          <div className="w-full max-w-sm space-y-6">
            
            {/* Logo header for mobile and layout spacing */}
            <div className="text-center lg:text-left space-y-3">
              <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-[#121215] shadow-sm border border-neutral-100 dark:border-neutral-800 text-[#2563EB] mb-1">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#1D1D1F] dark:text-[#FFFFFF] font-extrabold tracking-tight text-left">
                {mode === 'login' && 'Sign In to Portfolio'}
                {mode === 'forgot' && 'Reset Security Pin'}
                {mode === 'verify' && 'SMTP Dispatcher'}
                {mode === 'reset-password' && 'Configure Password'}
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#AEAEB2] font-light leading-relaxed text-left">
                {mode === 'login' && 'Verify your layout credentials to access empty plot mapping & pricing.'}
                {mode === 'forgot' && 'Provide your registered handle to authorize a secure email OTP transmission.'}
                {mode === 'verify' && `An authorization packet is being transmitted via gembaqa@gmail.com.`}
                {mode === 'reset-password' && 'Establish your new cryptographic password to secure your real estate asset profile.'}
              </p>
            </div>

            {/* Error or Success alerts */}
            {error && (
              <div className="flex items-start gap-3.5 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 text-[#FF453A] rounded-2xl text-xs text-left" id="login-error-pane">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Security Exception</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3.5 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[#10B981] rounded-2xl text-xs text-left animate-fade-in" id="login-success-pane">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Operation Success</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* ==========================================
                MODE A: NORMAL LOGIN FORM
                ========================================== */}
            {mode === 'login' && (
              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="identifier" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest">
                      Email, Username, or Prefix
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      className="input-luxury w-full"
                      placeholder="e.g., dinesh or mapuser"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label htmlFor="password" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest">
                        Security Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotIdentifier(identifier);
                          setError(null);
                          setSuccessMessage(null);
                          setMode('forgot');
                        }}
                        className="text-[10px] font-bold text-[#2563EB] hover:underline uppercase tracking-wider cursor-pointer"
                        id="forgot-password-link"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      className="input-luxury w-full"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="w-full btn-premium btn-primary-luxury mt-3 py-3 gap-2 text-sm justify-between shadow-sm cursor-pointer"
                  >
                    <span>Explore DMNS Portfolios</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Seed Account Quick access */}
                <div className="pt-5 border-t border-neutral-200/50 dark:border-neutral-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-wider">
                      Quick Access Accounts
                    </span>
                    <span className="text-[9px] text-[#2563EB] font-bold uppercase tracking-wider">
                      One-Click
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('dinesh', '123')}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#121215] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 transition duration-200 flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          Dinesh (Administrator)
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono mt-0.5">dinesh • 123</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('user', '123')}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#121215] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 transition duration-200 flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          Guest Client (Price Access)
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono mt-0.5">user • 123</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('mapuser', 'user123')}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-[#121215] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800 transition duration-200 flex items-center justify-between group cursor-pointer shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                          Map Explorer (No Price Access)
                        </div>
                        <div className="text-[9px] text-neutral-400 font-mono mt-0.5">mapuser • user123</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                MODE B: FORGOT PASSWORD REQUEST
                ========================================== */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="forgot-identifier" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest">
                    Your Registered Username or Email
                  </label>
                  <input
                    id="forgot-identifier"
                    type="text"
                    required
                    className="input-luxury w-full"
                    placeholder="e.g., dinesh or dinesh@gmail.com"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                  />
                  <span className="text-[10px] text-neutral-400 block mt-1 leading-normal text-left">
                    The security system will look up your profile and dispatch an email OTP.
                  </span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMessage(null);
                      setMode('login');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-[#6E6E73] dark:text-[#AEAEB2] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#2563EB]/40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isDispatching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Routing...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ==========================================
                MODE C: DISPATCH LOGS & CODE VERIFICATION
                ========================================== */}
            {mode === 'verify' && (
              <div className="space-y-5 text-left">
                {/* SMTP DISPATCH CONSOLE LOGS */}
                <div className="bg-neutral-950 text-emerald-400 font-mono text-[10px] p-3 rounded-2xl border border-neutral-800 space-y-1 h-36 overflow-y-auto text-left shadow-inner custom-scrollbar">
                  <div className="text-neutral-500 text-[9px] border-b border-neutral-900 pb-1 flex justify-between items-center">
                    <span>TRANSMITTING VIA: gembaqa@gmail.com</span>
                    <span className="animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 font-bold"></span>
                      ACTIVE
                    </span>
                  </div>
                  {dispatchLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  {isDispatching && (
                    <div className="text-neutral-400 animate-pulse">
                      Sending mail payload...
                    </div>
                  )}
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="otp-code" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest text-left">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      required
                      maxLength={6}
                      className="input-luxury w-full text-center text-lg font-mono tracking-[0.4em]"
                      placeholder="000000"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                    />
                    <div className="flex items-center gap-1 mt-1 text-neutral-400 text-[10px]">
                      <AlertCircle className="w-3 h-3 text-[#2563EB]" />
                      <span>Sender: <strong className="font-mono text-neutral-300">gembaqa@gmail.com</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccessMessage(null);
                        setMode('forgot');
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-[#6E6E73] dark:text-[#AEAEB2] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Retry Email
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==========================================
                MODE D: NEW PASSWORD CONFIGURATION
                ========================================== */}
            {mode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-3.5 text-left">
                  <div className="space-y-1.5">
                    <label htmlFor="new-password" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest">
                      New Security Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                      <input
                        id="new-password"
                        type="password"
                        required
                        className="input-luxury w-full pl-10"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm-new-password" className="block text-[10px] font-bold text-[#6E6E73] dark:text-[#AEAEB2] uppercase tracking-widest">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                      <input
                        id="confirm-new-password"
                        type="password"
                        required
                        className="input-luxury w-full pl-10"
                        placeholder="••••••••"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-premium btn-primary-luxury mt-3 py-3 gap-2 text-sm justify-center shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update &amp; Authenticate</span>
                </button>
              </form>
            )}

            {/* FOOTER */}
            <p className="text-center text-[10px] text-[#6E6E73] dark:text-[#AEAEB2] pt-4 leading-normal">
              All in 1 Assets Systems are fully encrypted &copy; {new Date().getFullYear()} Bangalore, KA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

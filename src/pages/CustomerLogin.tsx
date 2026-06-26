import React, { useState, useRef, useEffect } from 'react';
import { Phone, Shield, ArrowLeft, CheckCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CustomerLoginProps {
  onNavigate: (page: string) => void;
}

type Step = 'phone' | 'otp' | 'name';

// Generate a 6-digit OTP
function genOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function CustomerLogin({ onNavigate }: CustomerLoginProps) {
  const { language, setCustomerSession } = useAuth();
  const kn = language === 'kn';

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError(kn ? '10 ಅಂಕಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    // Check if existing customer
    const { data: existingApps } = await supabase
      .from('applications')
      .select('applicant_name')
      .eq('applicant_phone', cleaned)
      .limit(1)
      .maybeSingle();

    const { data: existingSession } = await supabase
      .from('customer_sessions')
      .select('full_name')
      .eq('phone', cleaned)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const existingName = existingSession?.full_name || existingApps?.applicant_name || null;
    setIsNewUser(!existingName);
    if (existingName) setFullName(existingName);

    // Generate & store OTP
    const newOtp = genOTP();
    setGeneratedOtp(newOtp);

    const { data: otpData, error: otpErr } = await supabase
      .from('otp_requests')
      .insert({ phone: cleaned, otp: newOtp })
      .select('id')
      .single();

    setLoading(false);

    if (otpErr) {
      setError(kn ? 'OTP ಕಳುಹಿಸಲು ವಿಫಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Failed to send OTP. Please try again.');
      return;
    }

    setOtpId(otpData.id);
    setResendTimer(30);
    setStep('otp');
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) {
      // Handle paste
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (idx + i < 6) newOtp[idx + i] = d; });
      setOtp(newOtp);
      const nextIdx = Math.min(idx + digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError(kn ? '6 ಅಂಕಿ OTP ನಮೂದಿಸಿ' : 'Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    // Verify against DB record
    const { data: otpRecord } = await supabase
      .from('otp_requests')
      .select('*')
      .eq('id', otpId)
      .maybeSingle();

    if (!otpRecord) {
      setError(kn ? 'OTP ಅವಧಿ ಮೀರಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'OTP expired. Please try again.');
      setLoading(false);
      return;
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      setError(kn ? 'OTP ಅವಧಿ ಮೀರಿದೆ. ಹೊಸ OTP ಪಡೆಯಿರಿ.' : 'OTP has expired. Please request a new one.');
      setLoading(false);
      return;
    }

    // Increment attempts
    await supabase.from('otp_requests').update({ attempts: (otpRecord.attempts || 0) + 1 }).eq('id', otpId);

    if (otpRecord.attempts >= 3) {
      setError(kn ? 'ಹೆಚ್ಚು ಪ್ರಯತ್ನಗಳು. ಹೊಸ OTP ಪಡೆಯಿರಿ.' : 'Too many attempts. Please request a new OTP.');
      setLoading(false);
      return;
    }

    if (enteredOtp !== otpRecord.otp) {
      setError(kn ? 'ತಪ್ಪಾದ OTP. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Incorrect OTP. Please try again.');
      setLoading(false);
      return;
    }

    // OTP correct — mark verified
    await supabase.from('otp_requests').update({ verified: true }).eq('id', otpId);

    setLoading(false);

    if (isNewUser) {
      setStep('name');
    } else {
      await createSession(phone.replace(/\D/g, ''), fullName);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(kn ? 'ಹೆಸರು ನಮೂದಿಸಿ' : 'Please enter your name');
      return;
    }
    await createSession(phone.replace(/\D/g, ''), fullName.trim());
  };

  const createSession = async (ph: string, name: string) => {
    setLoading(true);
    const { data: sessionData, error: sessErr } = await supabase
      .from('customer_sessions')
      .insert({ phone: ph, full_name: name })
      .select('token, phone, full_name')
      .single();

    setLoading(false);

    if (sessErr || !sessionData) {
      setError(kn ? 'ಲಾಗಿನ್ ವಿಫಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' : 'Login failed. Please try again.');
      return;
    }

    setCustomerSession({
      token: sessionData.token,
      phone: sessionData.phone,
      full_name: sessionData.full_name,
    });

    onNavigate('dashboard');
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    const newOtp = genOTP();
    setGeneratedOtp(newOtp);
    const { data } = await supabase
      .from('otp_requests')
      .insert({ phone: cleaned, otp: newOtp })
      .select('id')
      .single();
    if (data) setOtpId(data.id);
    setResendTimer(30);
    inputRefs.current[0]?.focus();
  };

  const WA_MSG = encodeURIComponent(`Your SK Digital Seva OTP is: ${generatedOtp}. Valid for 10 minutes.`);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => onNavigate('home')} className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-gov-main to-gov-dark rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4 hover:shadow-xl transition-shadow">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </button>
          <div className="font-bold text-2xl text-gov-dark">SK Digital Seva</div>
          <div className={`text-slate-500 text-sm mt-1 ${kn ? 'font-kn' : ''}`}>
            {kn ? 'ಗ್ರಾಹಕ ಲಾಗಿನ್' : 'Customer Login'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header bar */}
          <div className="bg-gov-main px-5 py-3 text-center border-b border-gold/20">
            <p className={`text-sm font-semibold text-white ${kn ? 'font-kn' : ''}`}>
              {kn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮೂಲಕ ಲಾಗಿನ್' : 'Login with Mobile Number'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-gov-main to-gov-mid transition-all duration-500"
              style={{ width: step === 'phone' ? '33%' : step === 'otp' ? '66%' : '100%' }}
            />
          </div>

          <div className="p-8">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-3 mb-8">
              {[
                { s: 'phone', label: kn ? 'ಮೊಬೈಲ್' : 'Mobile' },
                { s: 'otp',   label: 'OTP' },
                { s: 'name',  label: kn ? 'ಹೆಸರು' : 'Name' },
              ].map((item, i) => {
                const stepOrder = ['phone', 'otp', 'name'];
                const current = stepOrder.indexOf(step);
                const itemIdx = stepOrder.indexOf(item.s);
                const done = itemIdx < current;
                const active = itemIdx === current;
                return (
                  <React.Fragment key={item.s}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-gov-main text-white' :
                        active ? 'bg-gov-main text-white ring-4 ring-gov-pale' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-xs font-medium ${active ? 'text-gov-main' : 'text-slate-400'} ${kn ? 'font-kn' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-px mt-[-10px] ${itemIdx < current ? 'bg-gov-main' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className={kn ? 'font-kn' : ''}>{error}</span>
              </div>
            )}

            {/* ---- STEP 1: PHONE ---- */}
            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gov-pale rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-7 h-7 text-gov-main" />
                  </div>
                  <h2 className={`text-xl font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Enter Mobile Number'}
                  </h2>
                  <p className={`text-slate-500 text-sm mt-1 ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'OTP ಪರಿಶೀಲನೆ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ' : 'Login via OTP verification'}
                  </p>
                </div>

                <div>
                  <label className={`label ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' : 'Mobile Number'} *
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-3.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-600 font-medium text-sm">
                      +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      className="input-field rounded-l-none flex-1"
                      placeholder="98XXXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading || phone.replace(/\D/g,'').length !== 10} className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />{kn ? 'OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'Sending OTP...'}</>
                  ) : (
                    <><MessageSquare className="w-4 h-4" />{kn ? 'OTP ಕಳುಹಿಸಿ' : 'Send OTP'}</>
                  )}
                </button>
              </form>
            )}

            {/* ---- STEP 2: OTP ---- */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gov-pale rounded-xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-7 h-7 text-gov-main" />
                  </div>
                  <h2 className={`text-xl font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'OTP ನಮೂದಿಸಿ' : 'Enter OTP'}
                  </h2>
                  <p className={`text-slate-500 text-sm mt-1 ${kn ? 'font-kn' : ''}`}>
                    {kn ? `+91 ${phone} ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ` : `OTP sent to +91 ${phone}`}
                  </p>
                  <button type="button" onClick={() => { setStep('phone'); setError(''); }}
                    className="text-xs text-gov-main hover:underline mt-1">
                    {kn ? 'ಸಂಖ್ಯೆ ಬದಲಿಸಿ' : 'Change number'}
                  </button>
                </div>

                {/* OTP info banner - shows OTP in demo mode */}
                <div className="bg-gold-pale border border-gold/30 rounded-lg p-3 text-center">
                  <p className="text-gold-dark text-xs font-medium mb-1">
                    {kn ? 'ನಿಮ್ಮ OTP (Demo):' : 'Your OTP (Demo):'}
                  </p>
                  <p className="text-2xl font-bold text-gold-dark tracking-[0.3em]">{generatedOtp}</p>
                  <p className="text-gold-dark/70 text-xs mt-1">
                    {kn ? '10 ನಿಮಿಷಗಳಲ್ಲಿ ಅವಧಿ ಮೀರುತ್ತದೆ' : 'Expires in 10 minutes'}
                  </p>
                </div>

                {/* 6 OTP boxes */}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-lg transition-all focus:outline-none ${
                        digit
                          ? 'border-gov-main bg-gov-pale text-gov-dark'
                          : 'border-slate-200 bg-white text-slate-800 focus:border-gov-main'
                      }`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading || otp.join('').length !== 6}
                  className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />{kn ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Verifying...'}</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" />{kn ? 'OTP ಪರಿಶೀಲಿಸಿ' : 'Verify OTP'}</>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className={`text-slate-400 text-sm ${kn ? 'font-kn' : ''}`}>
                      {kn ? `${resendTimer} ಸೆಕೆಂಡ್‌ನಲ್ಲಿ ಮತ್ತೆ ಕಳುಹಿಸಿ` : `Resend in ${resendTimer}s`}
                    </p>
                  ) : (
                    <button type="button" onClick={handleResend}
                      className={`text-gov-main text-sm font-semibold hover:underline ${kn ? 'font-kn' : ''}`}>
                      {kn ? 'OTP ಮತ್ತೆ ಕಳುಹಿಸಿ' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* ---- STEP 3: NAME (new users only) ---- */}
            {step === 'name' && (
              <form onSubmit={handleNameSubmit} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gov-pale rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-gov-main" />
                  </div>
                  <h2 className={`text-xl font-bold text-slate-900 ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'ಸ್ವಾಗತ!' : 'Welcome!'}
                  </h2>
                  <p className={`text-slate-500 text-sm mt-1 ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'OTP ಪರಿಶೀಲನೆ ಯಶಸ್ವಿ. ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ.' : 'OTP verified. Please enter your name to continue.'}
                  </p>
                </div>

                <div>
                  <label className={`label ${kn ? 'font-kn' : ''}`}>
                    {kn ? 'ಪೂರ್ಣ ಹೆಸರು' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder={kn ? 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು' : 'Your full name'}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading || !fullName.trim()}
                  className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />{kn ? 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...' : 'Logging in...'}</>
                  ) : (
                    <>{kn ? 'ಮುಂದುವರಿಯಿರಿ' : 'Continue to Dashboard'}<ArrowLeft className="w-4 h-4 rotate-180" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm mx-auto transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {kn ? 'ಹೋಮ್‌ಗೆ ಹಿಂದಿರುಗಿ' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

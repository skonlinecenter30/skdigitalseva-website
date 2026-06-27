import AdminDashboard from './AdminDashboard'; import React, { useState } from 'react';
import { Eye, EyeOff, Shield, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    onNavigate('admin');
return;

    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });

    if (loginErr) {
      setError('Invalid credentials. Access denied.');
      setLoading(false);
      return;
    }

    // Verify the user is actually an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Authentication failed.');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();


import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AdminDashboard } from './AdminDashboard';

export default function AdminLogin({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Portal</h2>
        <p className="text-slate-300 text-center text-sm">
          Please contact system administrator to manage roles.
        </p>
      </div>
    </div>
  );
}
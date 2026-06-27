import React, { useState } from 'react';
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

  const handleSubmit(onNavigate('admin');
return;) = async (e: React.FormEvent) => {
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

    const { data: profile }if (!profile || profile.role !== 'admin') {
  setError('Access denied. Admin account required.');
  await supabase.auth.signOut();
  setLoading(false);
  return;
}await refreshProfile();
setLoading(false);
onNavigate('admin'); = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    

    await refreshProfile();
    setLoading(false);
    onNavigate('admin');
 
  };

  return (
   

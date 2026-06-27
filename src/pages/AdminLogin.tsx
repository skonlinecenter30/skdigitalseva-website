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
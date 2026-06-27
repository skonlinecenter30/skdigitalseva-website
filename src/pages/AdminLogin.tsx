import React, { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

export default function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Authentication failed.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("Access denied. Admin account required.");
      setLoading(false);
      return;
    }

    await refreshProfile();
    setLoading(false);
    onNavigate("admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Shield className="w-12 h-12 text-blue-700"/>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-3 rounded mb-4">
            <AlertCircle className="w-5 h-5"/>
            <span>{error}</span>
          </div>
        )}

        <label className="block mb-2 font-medium">Email</label>
        <input
          className="w-full border rounded-lg p-3 mb-4"
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <label className="block mb-2 font-medium">Password</label>
        <div className="relative mb-6">
          <input
            className="w-full border rounded-lg p-3 pr-10"
            type={showPass?"text":"password"}
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
          <button type="button" className="absolute right-3 top-3" onClick={()=>setShowPass(!showPass)}>
            {showPass?<EyeOff size={20}/>:<Eye size={20}/>}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-700 text-white rounded-lg p-3 font-semibold"
        >
          {loading?"Signing in...":"Login"}
        </button>
      </form>
    </div>
  );
}

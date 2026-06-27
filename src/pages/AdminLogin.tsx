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

    try {
      // Login
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      // Get User
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found.");

      console.log("User ID:", user.id);

      // Get Profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Profile:", profile);
      console.log("Profile Error:", profileError);

      if (profileError) {
        throw new Error("Profile not found.");
      }

      if (profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin account required.");
      }

      await refreshProfile();

      onNavigate("admin");

    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex justify-center mb-5">
          <Shield className="w-12 h-12 text-blue-600" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Admin Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-5">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-3 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="absolute right-3 top-3"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  );
}
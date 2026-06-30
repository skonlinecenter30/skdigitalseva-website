import React, { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

// Admin email that should always have admin role
const ADMIN_EMAIL = "admin@skdigitalseva.in";

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
      console.log("[AdminLogin] Starting login for:", email);

      // Step 1: Sign in with Supabase Auth
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        console.error("[AdminLogin] Auth error:", loginError);
        throw new Error("Invalid email or password.");
      }

      console.log("[AdminLogin] Auth successful");

      // Step 2: Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("[AdminLogin] GetUser error:", userError);
        throw new Error("Failed to get user session.");
      }

      console.log("[AdminLogin] User ID:", user.id);
      console.log("[AdminLogin] User email:", user.email);

      // Step 3: Check for existing profile
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("id, email, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      console.log("[AdminLogin] Existing profile:", existingProfile);
      console.log("[AdminLogin] Profile fetch error:", profileFetchError);

      // Determine the role based on email
      const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const role = isAdminEmail ? "admin" : "customer";

      let profile = existingProfile;

      // Step 4: Create or update profile if needed
      if (!existingProfile) {
        console.log("[AdminLogin] Profile not found, creating new profile with role:", role);

        // Use upsert to create profile
        const { data: newProfile, error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email || email.trim().toLowerCase(),
            full_name: user.user_metadata?.full_name || email.split("@")[0],
            role: role,
          }, {
            onConflict: "id",
          })
          .select()
          .maybeSingle();

        if (upsertError) {
          console.error("[AdminLogin] Profile upsert error:", upsertError);
          // If upsert failed due to RLS, try with RPC or continue anyway
          // The trigger should have created the profile
        }

        profile = newProfile || existingProfile;
        console.log("[AdminLogin] Upserted profile:", profile);
      } else if (existingProfile.role !== role && isAdminEmail) {
        // Update role if admin email has wrong role
        console.log("[AdminLogin] Updating admin role");

        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", user.id)
          .select()
          .maybeSingle();

        if (!updateError) {
          profile = updatedProfile;
        }
      }

      // Step 5: Verify admin role
      if (!profile) {
        // Profile might have been created by trigger, fetch again
        const { data: refetchedProfile } = await supabase
          .from("profiles")
          .select("id, email, role, full_name")
          .eq("id", user.id)
          .maybeSingle();

        profile = refetchedProfile;
        console.log("[AdminLogin] Refetched profile:", profile);
      }

      // Step 6: Check admin access
      if (!profile || profile.role !== "admin") {
        console.error("[AdminLogin] Access denied. Profile role:", profile?.role);
        await supabase.auth.signOut();
        throw new Error("Access Denied. Admin privileges required.");
      }

      console.log("[AdminLogin] Login successful. Redirecting to admin dashboard.");

      // Step 7: Refresh context and navigate
      await refreshProfile();
      onNavigate("admin");

    } catch (err: any) {
      console.error("[AdminLogin] Error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gov-main to-gov-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl ring-1 ring-white/10">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1 font-mono tracking-wider">SK DIGITAL SEVA</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-7 shadow-2xl ring-1 ring-black/20">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                className="w-full px-4 py-3.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-gov-main focus:border-transparent transition-all"
                placeholder="admin@skdigitalseva.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-gov-main focus:border-transparent transition-all pr-12"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-gov-main to-gov-dark hover:from-gov-dark hover:to-gov-main text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Admin Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          This page is restricted to authorized administrators only.
          <br />
          <span className="text-slate-600">Not for public access.</span>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

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
      console.log("========== ADMIN LOGIN START ==========");
      console.log("[Step 1] Email input:", email);

      // Step 1: Sign in with Supabase Auth
      console.log("[Step 2] Calling supabase.auth.signInWithPassword...");
      const signInResult = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("[Step 2] Sign in result:", {
        error: signInResult.error?.message,
        hasData: !!signInResult.data,
        hasSession: !!signInResult.data?.session,
        hasUser: !!signInResult.data?.user,
      });

      if (signInResult.error) {
        console.error("[Step 2] AUTH ERROR:", signInResult.error);
        throw new Error(`Auth failed: ${signInResult.error.message}`);
      }

      // Step 2: Wait a moment for session to be established
      console.log("[Step 3] Waiting for session to propagate...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Get the session
      console.log("[Step 4] Getting session...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      console.log("[Step 4] Session result:", {
        hasSession: !!sessionData?.session,
        sessionUser: sessionData?.session?.user?.id,
        sessionEmail: sessionData?.session?.user?.email,
        error: sessionError?.message,
      });

      // Step 4: Get the user
      console.log("[Step 5] Getting user...");
      const { data: userData, error: userError } = await supabase.auth.getUser();

      console.log("[Step 5] GetUser result:", {
        user: userData?.user ? {
          id: userData.user.id,
          email: userData.user.email,
        } : null,
        error: userError?.message,
      });

      if (userError) {
        console.error("[Step 5] GETUSER ERROR:", userError);
        throw new Error(`Failed to get user: ${userError.message}`);
      }

      if (!userData?.user) {
        console.error("[Step 5] NO USER FOUND");
        throw new Error("No user returned after login");
      }

      const user = userData.user;
      console.log("[Step 5] USER CONFIRMED:", {
        id: user.id,
        email: user.email,
      });

      // Step 5: Query profiles table
      console.log("[Step 6] Querying profiles table for user.id:", user.id);
      console.log("[Step 6] Query: SELECT * FROM profiles WHERE id =", user.id);

      const profileQuery = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      console.log("[Step 6] PROFILE QUERY RESULT:", {
        data: profileQuery.data,
        error: profileQuery.error ? {
          message: profileQuery.error.message,
          code: profileQuery.error.code,
          details: profileQuery.error.details,
          hint: profileQuery.error.hint,
        } : null,
      });

      // If there's an RLS error, it will show here
      if (profileQuery.error) {
        console.error("[Step 6] RLS/QUERY ERROR:", profileQuery.error);
        throw new Error(`Profile query failed: ${profileQuery.error.message} (code: ${profileQuery.error.code})`);
      }

      let profile = profileQuery.data;

      // Step 6: If no profile, try to create one
      if (!profile) {
        console.log("[Step 7] NO PROFILE FOUND - attempting to create...");

        const isAdminEmail = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const role = isAdminEmail ? "admin" : "customer";

        console.log("[Step 7] Creating profile with:", {
          id: user.id,
          email: user.email,
          role: role,
        });

        const upsertResult = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email || email.trim().toLowerCase(),
            full_name: user.user_metadata?.full_name || email.split("@")[0],
            role: role,
          }, { onConflict: "id" })
          .select()
          .maybeSingle();

        console.log("[Step 7] UPSERT RESULT:", {
          data: upsertResult.data,
          error: upsertResult.error ? {
            message: upsertResult.error.message,
            code: upsertResult.error.code,
          } : null,
        });

        if (upsertResult.error) {
          console.error("[Step 7] UPSERT FAILED:", upsertResult.error);
          // Try fetching again - trigger might have created it
          console.log("[Step 7] Retrying fetch after upsert failure...");
          const retryResult = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (retryResult.data) {
            profile = retryResult.data;
            console.log("[Step 7] RETRY SUCCESS - found profile:", profile);
          } else {
            throw new Error(`Failed to create profile: ${upsertResult.error.message}`);
          }
        } else {
          profile = upsertResult.data;
        }
      }

      console.log("[Step 8] FINAL PROFILE:", profile);

      // Step 7: Verify admin role
      if (!profile) {
        console.error("[Step 8] NO PROFILE AFTER ALL ATTEMPTS");
        throw new Error("Could not load or create user profile. Please contact support.");
      }

      if (profile.role !== "admin") {
        console.error("[Step 8] NOT ADMIN - role is:", profile.role);
        await supabase.auth.signOut();
        throw new Error(`Access Denied. Your role is "${profile.role}", but admin access is required.`);
      }

      console.log("[Step 9] LOGIN SUCCESS - refreshing profile and navigating...");
      await refreshProfile();
      onNavigate("admin");

      console.log("========== ADMIN LOGIN END ==========");

    } catch (err: any) {
      console.error("========== LOGIN ERROR ==========");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
              <span className="break-words">{error}</span>
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

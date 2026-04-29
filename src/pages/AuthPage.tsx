/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { LogIn, Car, Shield, Mail, Lock } from "lucide-react";
import { loginWithGoogle, loginWithEmail } from "../lib/firebase";
import React, { useState, FormEvent } from "react";

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"google" | "admin">("google");
  
  // Admin form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      if (err.code === "auth/auth-domain-config-required") {
        setError("Admin login requires 'Email/Password' to be enabled in Firebase Console.");
      } else if (err.code === "auth/user-not-found") {
        setError("Admin account not found. Please create it in Firebase Console first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome to ParkMyCar</h1>
          <p className="text-slate-500 text-sm mt-2">Manage your vehicle alerts privately.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setMode("google")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === "google" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            User Login
          </button>
          <button 
            onClick={() => setMode("admin")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === "admin" ? "bg-red-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Admin ID
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === "google" ? (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl font-bold bg-white hover:bg-slate-50 hover:border-slate-200 transition-all text-slate-700 active:scale-95"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                    Sign in with Google
                  </>
                )}
              </button>
              <p className="mt-6 text-center text-[10px] text-slate-400 font-medium">Recommended for all users</p>
            </motion.div>
          ) : (
            <motion.form
              key="admin"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleAdminLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@parkmycar.online"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm">Secret Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 disabled:bg-slate-200"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Authorize Admin Login
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-[10px] text-slate-400 leading-relaxed uppercase tracking-tighter">
                Used for system maintenance and oversight.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
          Privacy Guaranteed • 256-bit Encryption
        </p>
      </motion.div>
    </div>
  );
}

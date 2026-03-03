"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#071C38] via-[#0A254F] to-[#020617]">

      <div className="absolute w-[600px] h-[600px] bg-blue-500/10 blur-3xl rounded-full"></div>

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-12 w-[420px]">

        <div className="mb-10 text-center">
          <p className="text-xs tracking-widest text-gray-400">
            IT’S THOUGHTFUL. IT’S
          </p>
          <h1 className="text-4xl font-serif text-white mt-2">
            Rustomjee
          </h1>
          <p className="text-gray-400 mt-4">
            MEP Executive Command Center
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-300">
              Corporate Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded-lg font-semibold tracking-wide"
          >
            {loading ? "Signing in..." : "Secure Login"}
          </button>

          {errorMsg && (
            <p className="text-center text-sm text-red-400">
              {errorMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
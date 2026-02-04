"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handlesubmission(formData: FormData) {
    setError("");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.error || "Signup failed");
            return;
        }

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        } else {
            // Fallback if API doesn't return the full user object
            localStorage.setItem("user", JSON.stringify({ username, email }));
        }
      
        alert(`Account created successfully! Welcome, ${username}.`);
        router.push("/Games");

    } catch (err) {
        setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center p-4 font-sans">
      
      <Link href="/" className="absolute top-6 left-6 text-stone-400 hover:text-white flex items-center gap-2 transition-colors">
           <ArrowLeft className="w-4 h-4"/> Back to Home
      </Link>

      <div className="w-full max-w-md bg-[#1a2333] border border-stone-800 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-3xl text-center text-white font-black uppercase italic mb-2">Create Account</h3>
        <p className="text-center text-stone-400 mb-6 text-sm">Join LuckyBet today</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-center text-sm py-2 rounded mb-4">
                {error}
            </div>
        )}

        <form action={handlesubmission} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Username</label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-4 py-3 bg-[#0f1728] border border-stone-700 rounded-lg text-white outline-none focus:border-[#eab308] transition-colors"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 bg-[#0f1728] border border-stone-700 rounded-lg text-white outline-none focus:border-[#eab308] transition-colors"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-[#0f1728] border border-stone-700 rounded-lg text-white outline-none focus:border-[#eab308] transition-colors"
              placeholder="Create a password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold rounded-lg shadow-lg shadow-yellow-900/20 transition-all active:scale-95 mt-2"
          >
            CREATE ACCOUNT
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#eab308] hover:text-[#ca8a04] font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { anton } from '@/lib/fonts';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api'; 

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; 

    setError("");
    setLoading(true);

    try {
      // 1. Request login ke Elysia Backend
      const { data, error: apiError } = await api.api.admin.login.post({
        email: email,
        password: password,
      });

      // 2. Error Handling
      if (apiError) {
        const errorMsg = (apiError.value as any)?.error || "Email atau Password salah!";
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // 3. Simpan Sesi & Password Sementara
      if (data?.token && data?.data) {
        // Bersihkan data lama
        localStorage.clear();

        // Simpan Sesi Baru
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('admin_data', JSON.stringify(data.data));
        
        /** * PENTING: Simpan password asli di localStorage.
         * Ini digunakan oleh halaman /scanner untuk verifikasi Argon2 di backend.
         */
        localStorage.setItem('admin_temp_pass', password); 
        
        // Navigasi ke Dashboard
        router.replace('/dashboard'); 
      } else {
        throw new Error("Format respons server tidak sesuai.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError("Gagal terhubung ke server. Pastikan Backend aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-64 h-64 bg-[#cc111f] rounded-full blur-[120px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>

      <div className="w-full max-w-[360px] p-8 bg-[#121212]/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className={`${anton.className} text-5xl text-[#cc111f] mb-2 tracking-tighter uppercase`}>
            RPLAY
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-black">Admin Management</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[11px] p-3 rounded-lg mb-6 text-center font-bold uppercase animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-zinc-500 text-[10px] uppercase ml-1 font-bold tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rplay.com" 
              className="w-full py-3 bg-zinc-900/50 border border-zinc-800 text-white px-4 rounded-xl focus:outline-none focus:border-[#cc111f] transition-all text-sm" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-zinc-500 text-[10px] uppercase ml-1 font-bold tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full py-3 pr-12 bg-zinc-900/50 border border-zinc-800 text-white px-4 rounded-xl focus:outline-none focus:border-[#cc111f] transition-all text-sm" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 uppercase tracking-[0.2em] font-black text-[11px] bg-[#cc111f] hover:bg-[#aa0e19] text-white rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Authenticating..." : "Authorized Access"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-[11px] font-medium">
            New Admin?{' '}
            <Link href="/register" className="text-[#cc111f] hover:text-[#ff1a2b] font-bold transition-all hover:underline underline-offset-4">
              Request Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
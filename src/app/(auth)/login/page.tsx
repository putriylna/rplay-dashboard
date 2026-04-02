"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { anton } from '@/lib/fonts';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// --- IMPORT EDEN CLIENT ---
import { api } from '@/lib/api'; 

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk menangkap input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // --- PROSES LOGIN KE BACKEND ---
      const { data, error: apiError } = await api.api.admin.login.post({
        email: email,
        password: password,
      });

      if (apiError) {
        // Jika error dari backend (salah password/email)
        setError(apiError.value?.error || "Terjadi kesalahan login");
        setLoading(false);
        return;
      }

      if (data?.token) {
        // Simpan Token JWT asli dari Backend
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('admin_data', JSON.stringify(data.data));
        
        router.push('/dashboard');
      }
    } catch (err) {
      setError("Gagal terhubung ke server. Pastikan Tmole aktif.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-montserrat relative overflow-hidden">
      <div className="absolute w-48 h-48 bg-[#cc111f] rounded-full blur-[100px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>

      <div className="w-full max-w-[360px] p-7 bg-[#121212]/90 backdrop-blur-md rounded-xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className={`${anton.className} text-4xl text-[#cc111f] mb-1 tracking-tight uppercase`}>
            RPLAY
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Admin Portal</p>
        </div>

        {/* Tampilkan pesan error jika login gagal */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-[10px] p-2 rounded mb-4 text-center font-bold uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-zinc-500 text-[10px] uppercase mb-1.5 ml-1 font-bold">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rplay.com" 
              className="admin-input py-2.5 text-sm w-full bg-zinc-900 border-zinc-800 text-white px-3 rounded-lg focus:outline-none focus:border-[#cc111f]" 
              required 
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-[10px] uppercase mb-1.5 ml-1 font-bold">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="admin-input py-2.5 text-sm pr-10 w-full bg-zinc-900 border-zinc-800 text-white px-3 rounded-lg focus:outline-none focus:border-[#cc111f]" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 mt-2 uppercase tracking-widest font-bold text-xs bg-[#cc111f] hover:bg-[#aa0e19] text-white rounded-lg transition-all"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-[11px]">
            Belum punya akses?{' '}
            <Link href="/register" className="text-[#cc111f] hover:text-[#ff1a2b] font-bold transition-all underline-offset-4 hover:underline">
              Daftar Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
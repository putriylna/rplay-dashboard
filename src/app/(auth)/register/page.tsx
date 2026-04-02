"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { anton } from '@/lib/fonts';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// --- Pastikan path import benar ---
import { api } from '@/lib/api'; 

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // State untuk form
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Memanggil endpoint dengan nama field yang tepat (full_name)
      const { data, error: apiError } = await api.api.admin.register.post({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        photo_url: "" // Diisi string kosong agar validasi schema t.String() di backend terpenuhi
      });

      // 2. Cek jika ada error dari Elysia (Validation error atau Email terdaftar)
      if (apiError) {
        console.error("Detail API Error:", apiError.value);
        // Menampilkan pesan error spesifik dari backend jika ada
        const message = (apiError.value as any)?.error || "Gagal mendaftar. Cek kembali data Anda.";
        setError(message);
        setLoading(false);
        return;
      }

      // 3. Jika berhasil
      if (data) {
        alert("Admin berhasil didaftarkan! Silakan login.");
        router.push('/login');
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("Gagal terhubung ke backend. Pastikan Tmole aktif di laptop backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-montserrat relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute w-48 h-48 bg-[#cc111f] rounded-full blur-[100px] opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"></div>

      <div className="w-full max-w-[360px] p-7 bg-[#121212]/90 backdrop-blur-md rounded-xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className={`${anton.className} text-4xl text-[#cc111f] mb-1 tracking-tight uppercase`}>
            JOIN RPLAY
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">New Admin Account</p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-[11px] p-3 rounded-lg mb-4 text-center font-bold uppercase tracking-wider">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-zinc-500 text-[10px] uppercase mb-1.5 ml-1 font-bold tracking-widest">Full Name</label>
            <input 
              type="text" 
              placeholder="Admin Name" 
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#cc111f] transition-all text-sm"
              required 
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-[10px] uppercase mb-1.5 ml-1 font-bold tracking-widest">Email</label>
            <input 
              type="email" 
              placeholder="email@rplay.com" 
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#cc111f] transition-all text-sm"
              required 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-zinc-500 text-[10px] uppercase mb-1.5 ml-1 font-bold tracking-widest">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#cc111f] transition-all text-sm pr-10"
                required 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
            className="w-full py-3 mt-2 uppercase tracking-[0.2em] font-bold text-[10px] bg-[#cc111f] hover:bg-[#aa0e19] text-white rounded-lg transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-[11px] tracking-wide">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#cc111f] hover:text-[#ff1a2b] font-bold transition-all underline-offset-4 hover:underline">
              Login Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
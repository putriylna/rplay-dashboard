"use client";

import { useState, useEffect, useCallback } from 'react';
import { anton } from '@/lib/fonts';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  EllipsisVerticalIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api'; // Pastikan path ini sesuai dengan konfigurasi edenTreaty kamu

interface User {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  jk: 'L' | 'P';
  tanggalLahir: string;
  photoUrl?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Mengakses endpoint: GET /api/akun/all
      const { data, error } = await api.api.akun.all.get();
      
      if (error) {
        setErrorMsg("Gagal mengambil daftar pelanggan.");
        return;
      }

      if (data?.success) {
        setUsers(data.data as User[]);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-8 font-montserrat min-h-screen pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>
            Customer Database
          </h1>
          <p className="text-zinc-500 text-sm">Daftar pelanggan yang terdaftar melalui aplikasi publik RPlay.</p>
        </div>
        
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <UserGroupIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Registered Users</p>
            <p className="text-2xl text-white font-bold">{loading ? '...' : users.length}</p>
          </div>
        </div>
        <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-pink-500/10 rounded-xl">
            <UserIcon className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Gender Diversity (L / P)</p>
            <p className="text-2xl text-white font-bold">
              {users.filter(u => u.jk === 'L').length} <span className="text-zinc-600 mx-2">/</span> {users.filter(u => u.jk === 'P').length}
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cari Nama, Email, atau No. HP..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-red-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                <th className="p-5">Pelanggan</th>
                <th className="p-5">Kontak</th>
                <th className="p-5">Gender</th>
                <th className="p-5">Tgl Lahir</th>
                <th className="p-5">Tgl Daftar</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-zinc-600 text-xs animate-pulse font-bold uppercase tracking-widest">
                    Synchronizing Database...
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-zinc-700" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm leading-none">{user.fullName}</div>
                        <div className="text-[10px] text-zinc-600 mt-1 uppercase font-bold tracking-tighter">ID: USER-{user.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs">
                        <EnvelopeIcon className="w-3 h-3" /> {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                        <PhoneIcon className="w-3 h-3" /> {user.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${user.jk === 'L' ? 'border-blue-500/20 text-blue-500 bg-blue-500/5' : 'border-pink-500/20 text-pink-500 bg-pink-500/5'}`}>
                      {user.jk === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-zinc-500 font-medium italic">
                    {user.tanggalLahir}
                  </td>
                  <td className="p-5 text-[10px] text-zinc-400 font-bold uppercase">
                    {new Date(user.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredUsers.length === 0 && (
          <div className="p-20 text-center text-zinc-600 text-sm italic">
            Tidak ada data pelanggan yang ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
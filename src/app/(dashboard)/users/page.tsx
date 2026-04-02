"use client";

import { useState } from 'react';
import { anton } from '@/lib/fonts';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon,
  EllipsisVerticalIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Customer';
  status: 'Active' | 'Suspended';
  joined_at: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState<User[]>([
    { 
      user_id: 1, 
      username: "admin_rplay", 
      email: "admin@rplay.id", 
      role: 'Admin', 
      status: 'Active',
      joined_at: "2026-01-01" 
    },
    { 
      user_id: 2, 
      username: "rizky_p", 
      email: "rizky@mail.com", 
      role: 'Customer', 
      status: 'Active',
      joined_at: "2026-03-10" 
    },
    { 
      user_id: 3, 
      username: "hacker_99", 
      email: "spam@bot.com", 
      role: 'Customer', 
      status: 'Suspended',
      joined_at: "2026-03-12" 
    },
  ]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-montserrat">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${anton.className} text-4xl uppercase tracking-wider text-white`}>User Management</h1>
          <p className="text-zinc-500 text-sm">Kelola hak akses dan data pelanggan RPlay.</p>
        </div>
        
        <Button className="flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest">
          <UserPlusIcon className="w-4 h-4" /> Add Staff
        </Button>
      </div>

      {/* Stats Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-2xl text-white font-bold">{users.length}</p>
        </div>
        <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Active Customers</p>
          <p className="text-2xl text-green-500 font-bold">{users.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="bg-[#121212] p-4 rounded-xl border border-zinc-800">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Staff / Admins</p>
          <p className="text-2xl text-[#cc111f] font-bold">{users.filter(u => u.role === 'Admin').length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#121212] rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="admin-input pl-10 py-2 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                <th className="p-5">User Info</th>
                <th className="p-5">Role</th>
                <th className="p-5">Joined Date</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${user.role === 'Admin' ? 'border-[#cc111f] bg-[#cc111f]/10' : 'border-zinc-700 bg-zinc-800'}`}>
                        {user.role === 'Admin' ? <ShieldCheckIcon className="w-4 h-4 text-[#cc111f]" /> : <UserIcon className="w-4 h-4 text-zinc-400" />}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm leading-none">{user.username}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${user.role === 'Admin' ? 'border-[#cc111f] text-[#cc111f]' : 'border-zinc-700 text-zinc-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-zinc-400 font-medium">
                    {user.joined_at}
                  </td>
                  <td className="p-5">
                    <span className={`text-[10px] font-bold flex items-center gap-1.5 ${user.status === 'Active' ? 'text-green-500' : 'text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-600'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
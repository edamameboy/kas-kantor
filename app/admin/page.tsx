"use client";
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '@/app/actions';
import { ArrowLeft, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => alert("Akses Ditolak"));
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert("Role berhasil diubah!");
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto relative shadow-sm pb-24">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold text-gray-800">Admin Control</h1>
        <UserCog className="w-6 h-6 text-gray-600" />
      </header>

      <main className="p-4 space-y-4">
        <h2 className="font-bold text-gray-600 uppercase text-sm mb-4">Manajemen Pengguna</h2>
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm font-semibold text-blue-600 mb-1">{user.phone}</p>
                <p className="text-[10px] text-gray-400 mt-1">BCA: {user.bca || '-'} | S-Bank: {user.seabank || '-'} | GoPay: {user.gopay || '-'} | DANA: {user.dana || '-'}</p>
              </div>
              <select 
                value={user.role} 
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className={`text-xs font-bold py-1 px-2 rounded outline-none border ${user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
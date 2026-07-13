"use client";
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, getAllTransactions } from '@/app/actions';
import { ArrowLeft, UserCog, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => alert("Akses Ditolak"));
    getAllTransactions().then(setTransactions);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const pendingReimbursements = transactions.filter(t => t.isReimburse && (t.status === 'PENDING' || t.status === 'APPROVED'));

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto relative shadow-sm pb-24">
      <header className="flex items-center p-4 bg-white border-b border-gray-100">
        <Link href="/profile" className="flex items-center gap-1 text-gray-600 absolute"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">Admin Control</h1>
      </header>

      <main className="p-4 space-y-8">
        
        {/* BAGIAN 1: DAFTAR REIMBURSE */}
        <section>
          <h2 className="font-bold text-gray-600 uppercase text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Butuh Tindakan Admin ({pendingReimbursements.length})
          </h2>
          
          {pendingReimbursements.length === 0 ? (
            <p className="text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 text-center">Bersih! Tidak ada tugas berjalan.</p>
          ) : (
            <div className="space-y-3">
              {pendingReimbursements.map(trx => (
                <Link href={`/transactions/${trx.id}`} key={trx.id} className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex justify-between items-center hover:bg-gray-50 transition cursor-pointer">
                  <div>
                    <p className="font-bold text-gray-900">{trx.category}</p>
                    <p className="text-xs text-gray-500">{trx.user?.name}</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">Rp {trx.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {trx.status === 'PENDING' && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">MENUNGGU ACC</span>}
                    {trx.status === 'APPROVED' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">BUTUH TRANSFER</span>}
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* BAGIAN 2: MANAJEMEN USER */}
        <section>
          <h2 className="font-bold text-gray-600 uppercase text-sm mb-4 flex items-center gap-2">
            <UserCog className="w-4 h-4" /> Manajemen Pengguna
          </h2>
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm font-semibold text-blue-600 mb-1">{user.phone}</p>
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
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
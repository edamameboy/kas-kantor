"use client";
import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole, getAllTransactions } from '@/app/actions';
import { ArrowLeft, UserCog, Clock, ArrowRight, ChevronDown, ChevronUp, Copy, Check, Wallet, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // State untuk mengontrol dropdown detail user mana yang sedang dibuka
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  // State untuk melacak teks mana yang baru saja di-copy (untuk efek visual)
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers().then(setUsers).catch(() => alert("Akses Ditolak"));
    getAllTransactions().then(setTransactions);
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const toggleDropdown = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    // Kembalikan ikon copy setelah 2 detik
    setTimeout(() => setCopiedField(null), 2000);
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
          <div className="space-y-4">
            {users.map(user => {
              const isExpanded = expandedUserId === user.id;

              return (
                <div key={user.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all">
                  {/* Bar Utama User (Bisa di-tap untuk buka dropdown) */}
                  <div 
                    onClick={() => toggleDropdown(user.id)}
                    className="p-4 flex justify-between items-center hover:bg-gray-50/50 active:bg-gray-100/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{user.phone}</p>
                    </div>
                    
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {/* Select Role (e.stopPropagation agar klik select tidak memicu tutup dropdown) */}
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-[11px] font-bold py-1 px-2 rounded outline-none border transition-colors ${
                          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      
                      {/* Indikator Panah Dropdown */}
                      <div onClick={() => toggleDropdown(user.id)} className="text-gray-400 p-1 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN DROPDOWN DETAIL KEUANGAN USER */}
                  {isExpanded && (
                    <div className="bg-gray-50/70 border-t border-gray-100 p-4 space-y-3 animate-fadeIn">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Informasi Rekening / E-Wallet</p>
                      
                      {/* Render Tiap Kolom Keuangan */}
                      {[
                        { label: 'Nomor Rekening', value: user.bca, icon: <Landmark className="w-3.5 h-3.5" />, id: 'bca' },
                        { label: 'SeaBank', value: user.seabank, icon: <Landmark className="w-3.5 h-3.5 text-orange-500" />, id: 'seabank' },
                        { label: 'GoPay', value: user.gopay, icon: <Wallet className="w-3.5 h-3.5 text-blue-500" />, id: 'gopay' },
                        { label: 'DANA', value: user.dana, icon: <Wallet className="w-3.5 h-3.5 text-sky-500" />, id: 'dana' }
                      ].map((item) => {
                        const uniqueId = `${user.id}-${item.id}`;
                        const isCopied = copiedField === uniqueId;

                        return (
                          <div key={item.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-xs">
                            <div className="flex items-center gap-2">
                              {item.icon}
                              <div>
                                <p className="text-[10px] text-gray-400 font-medium">{item.label}</p>
                                {/* select-text dipasang khusus di sini agar sistem copy internal browser bawaan mobile masih bisa bekerja jika dibutuhkan */}
                                <p className="text-xs font-bold text-gray-800 select-text">
                                  {item.value || <span className="text-gray-300 font-normal italic">Belum diisi</span>}
                                </p>
                              </div>
                            </div>
                            
                            {item.value && (
                              <button 
                                onClick={() => handleCopy(item.value, uniqueId)}
                                className={`p-2 rounded-md transition border flex items-center justify-center ${
                                  isCopied 
                                    ? 'bg-green-50 border-green-200 text-green-600' 
                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 active:scale-95'
                                }`}
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 animate-scaleIn" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
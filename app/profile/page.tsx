"use client";
import { useEffect, useState } from 'react';
import { getCurrentUser, updateProfile, logoutUser } from '@/app/actions';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', bca: '', seabank: '', gopay: '', dana: '' });

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUser(data);
      if(data) setFormData({ name: data.name || '', phone: data.phone || '', bca: data.bca || '', seabank: data.seabank || '', gopay: data.gopay || '', dana: data.dana || '' });
    });
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      alert('Profil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = '/login';
  };

  if (!user) return <div className="text-center p-10">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto relative shadow-sm pb-24">
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100">
        <Link href="/" className="flex items-center gap-1 text-gray-600"><ArrowLeft className="w-5 h-5" /> Back</Link>
        <h1 className="text-lg font-bold text-gray-800">Profil Saya</h1>
        <div className="w-5"></div>
      </header>

      <main className="p-4 space-y-6">
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="bg-amber-100 text-amber-800 p-4 rounded-xl flex items-center justify-between border border-amber-200">
            <div className="flex gap-2 items-center"><ShieldAlert className="w-5 h-5"/> <span className="font-bold">Admin Dashboard</span></div>
            <span>Masuk ➔</span>
          </Link>
        )}

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Pribadi</p>
          <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} placeholder="Nama Lengkap" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
          <div className="relative">
            <input type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} placeholder="Nomor Handphone" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
            <span className="absolute right-3 top-3 text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">ID LOGIN</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Rekening PRIBADI</p>
          <input type="text" value={formData.bca} onChange={(e)=>setFormData({...formData, bca: e.target.value})} placeholder="No. Rek BCA" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
          <input type="text" value={formData.seabank} onChange={(e)=>setFormData({...formData, seabank: e.target.value})} placeholder="No. Rek Seabank" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
          <input type="text" value={formData.gopay} onChange={(e)=>setFormData({...formData, gopay: e.target.value})} placeholder="No. GoPay" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
          <input type="text" value={formData.dana} onChange={(e)=>setFormData({...formData, dana: e.target.value})} placeholder="No. DANA" className="w-full p-3 text-gray-600 border rounded-lg outline-none" />
        </div>

        <button onClick={handleSave} className="w-full bg-blue-600 text-white font-medium py-3.5 rounded-xl">Simpan Profil</button>
        <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2"><LogOut className="w-5 h-5" /> Keluar (Logout)</button>
      </main>
    </div>
  );
}
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '@/app/actions';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser({ phone, password });
      window.location.href = '/'; 
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6 text-blue-600"><Wallet className="w-12 h-12" /></div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Masuk KasKantor</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="tel" placeholder="Nomor Handphone" required value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-blue-500" />
          <input type="password" placeholder="Password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700">Masuk</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Belum punya akun? <Link href="/register" className="text-blue-600 font-semibold">Daftar</Link></p>
      </div>
    </div>
  );
}
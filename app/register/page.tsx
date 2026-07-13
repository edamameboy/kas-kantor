"use client";
import { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({ name, phone, password });
      alert('Registrasi sukses! Silakan login.');
      router.push('/login');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">Daftar Akun</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" placeholder="Nama Lengkap" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-blue-500" />
          <input type="tel" placeholder="Nomor Handphone (08xxx)" required value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-blue-500" />
          <input type="password" placeholder="Buat Password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700">Daftar Sekarang</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">Sudah punya akun? <Link href="/login" className="text-blue-600 font-semibold">Login</Link></p>
      </div>
    </div>
  );
}
"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { encrypt, getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

// ==================== AUTH & USER ====================
export async function registerUser(data: any) {
  // Cek apakah nomor HP sudah terdaftar
  const existingUser = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existingUser) throw new Error("Nomor HP sudah terdaftar");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  // LOGIKA AUTO-ADMIN:
  const userRole = data.phone === '085155010170, 081289999669' ? 'ADMIN' : 'STAFF';

  await prisma.user.create({
    data: { 
      name: data.name, 
      phone: data.phone, 
      password: hashedPassword, 
      role: userRole 
    }
  });
  return { success: true };
}

export async function loginUser(data: any) {
  // Tambahkan validasi ini
  if (!data.phone || !data.password) {
    throw new Error("Nomor HP dan Password wajib diisi!");
  }

  // Cari user berdasarkan nomor HP
  const user = await prisma.user.findUnique({ where: { phone: data.phone } });
  
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new Error("Nomor HP atau password salah");
  }

  const session = await encrypt({ id: user.id, role: user.role, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set('session', session, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });
  return { success: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return await prisma.user.findUnique({ where: { id: session.id as string } });
}

export async function updateProfile(data: any) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  
  // Cek apakah nomor HP diubah dan sudah dipakai orang lain
  const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existingPhone && existingPhone.id !== session.id) {
    throw new Error("Nomor HP sudah digunakan pengguna lain");
  }

  await prisma.user.update({
    where: { id: session.id as string },
    data: { name: data.name, phone: data.phone, bca: data.bca, seabank: data.seabank, gopay: data.gopay, dana: data.dana }
  });
  revalidatePath('/profile');
  return { success: true };
}

// ==================== ADMIN ====================
export async function getAllUsers() {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Unauthorized");
  return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  revalidatePath('/admin');
}

// ==================== FUNGSI BARU: SIMPAN GAMBAR LOKAL ====================
async function saveImageLocal(base64String: string, type: 'receipt' | 'proof') {
  // Jika string bukan base64 (sudah berupa URL pendek), kembalikan saja
  if (!base64String.startsWith('data:image')) return base64String;

  // Pisahkan header base64 dan datanya
  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) throw new Error('Invalid base64 format');

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  
  // Buat nama file unik
  const fileName = `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`;
  
  // Arahkan ke folder public/uploads di project Next.js Anda
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Cek apakah folder uploads sudah ada, jika belum otomatis buatkan
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Tulis file fisiknya ke folder tersebut
  const filePath = path.join(uploadDir, fileName);
  await fs.promises.writeFile(filePath, buffer);
  
  // Kembalikan URL pendeknya untuk disimpan ke Database
  return `/uploads/${fileName}`; 
}

// ==================== TRANSACTIONS ====================
export async function saveTransaction(data: any) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const status = data.isReimburse ? "PENDING" : "COMPLETED";

  // PROSES GAMBAR NOTA SEBELUM SIMPAN KE DATABASE
  let savedReceiptPath = null;
  if (data.receiptImage) {
    savedReceiptPath = await saveImageLocal(data.receiptImage, 'receipt');
  }

  await prisma.transaction.create({
    data: {
      amount: data.amount, type: data.type, category: data.category,
      date: new Date(data.date), note: data.note, isReimburse: data.isReimburse || false,
      status: status,
      userId: session.id as string,
      receiptImage: savedReceiptPath, // <--- KINI HANYA MENYIMPAN TEKS PENDEK
    }
  });
  revalidatePath('/'); revalidatePath('/transactions'); revalidatePath('/admin');
  return { success: true };
}

export async function getAllTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { user: { select: { name: true, phone: true } } }
  });
}

export async function getTransactionById(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: { user: { select: { name: true, phone: true } } }
  });
}

export async function updateTransactionStatus(transactionId: string, newStatus: string) {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: newStatus }
  });
  
  revalidatePath('/'); revalidatePath('/transactions'); revalidatePath('/admin');
  return { success: true };
}

export async function submitTransferProof(transactionId: string, imageBase64: string) {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Unauthorized");

  // PROSES GAMBAR BUKTI TRANSFER SEBELUM SIMPAN KE DB
  const savedProofPath = await saveImageLocal(imageBase64, 'proof');

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { 
      status: 'COMPLETED',
      transferProof: savedProofPath // <--- KINI HANYA MENYIMPAN TEKS PENDEK
    }
  });
  
  revalidatePath('/'); 
  revalidatePath('/transactions'); 
  revalidatePath(`/transactions/${transactionId}`);
  return { success: true };
}
"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { encrypt, getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

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
  return await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Unauthorized");
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
  revalidatePath('/admin');
}

// ==================== TRANSACTIONS ====================
export async function saveTransaction(data: any) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const status = data.isReimburse ? "PENDING" : "COMPLETED";

  // SIMPAN BASE64 LANGSUNG KARENA VERCEL TIDAK MENDUKUNG PENULISAN FILE LOKAL
  let savedReceiptPath = data.receiptImage || null;

  await prisma.transaction.create({
    data: {
      amount: data.amount, type: data.type, category: data.category,
      date: new Date(data.date), note: data.note, isReimburse: data.isReimburse || false,
      status: status,
      userId: session.id as string,
      receiptImage: savedReceiptPath, 
    }
  });
  revalidatePath('/'); revalidatePath('/transactions'); revalidatePath('/admin');
  return { success: true };
}

export async function getAllTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      note: true,
      isReimburse: true,
      status: true,
      userId: true,
      createdAt: true,
      user: { select: { name: true, phone: true } }
      // Kita TIDAK mengambil receiptImage & transferProof agar halaman list tidak berat!
    }
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

  // SIMPAN BASE64 LANGSUNG KARENA VERCEL TIDAK MENDUKUNG PENULISAN FILE LOKAL
  const savedProofPath = imageBase64;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { 
      status: 'COMPLETED',
      transferProof: savedProofPath
    }
  });
  
  revalidatePath('/'); 
  revalidatePath('/transactions'); 
  revalidatePath(`/transactions/${transactionId}`);
  return { success: true };
}
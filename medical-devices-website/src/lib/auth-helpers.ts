import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(process.env.ADMIN_LOGIN_PATH || '/admin/login');
  }
  
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  
  if ((session.user as any).role !== UserRole.ADMIN) {
    redirect('/');
  }
  
  return session;
}

export async function getSession() {
  return getServerSession(authOptions);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return (session?.user as any)?.role === UserRole.ADMIN;
}

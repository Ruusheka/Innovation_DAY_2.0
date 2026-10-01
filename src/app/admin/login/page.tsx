'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Invalid email or password.');
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // Verify this user is in admin_users
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_users')
        .select('id, name, role, is_active')
        .eq('auth_user_id', data.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError || !adminRecord) {
        await supabase.auth.signOut();
        setError('This account does not have admin access. Please contact the administrator.');
        return;
      }

      toast.success(`Welcome back, ${adminRecord.name}.`);
      router.push('/admin/vote');
      router.refresh();
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between p-6">
      {/* Top back navigation */}
      <div className="max-w-[1200px] w-full mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#41516B] hover:text-[#041128] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Exhibition</span>
        </Link>
      </div>

      {/* Center login card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="bg-white rounded-[24px] border border-[rgba(4,17,40,0.08)] p-8 sm:p-10 shadow-[0_12px_40px_rgba(4,17,40,0.06)]"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="relative h-12 w-48 mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="BUILD CLUB Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-[#041128] tracking-tight">
              Admin Portal
            </h1>
            <p className="text-sm text-[#848C9B] mt-1">
              Sign in to manage votes, projects & leaderboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ssn.edu.in"
                autoComplete="email"
                required
                className="input-clean"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#041128] uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="input-clean pr-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#848C9B] hover:text-[#041128] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 h-12 rounded-xl bg-[#041128] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#112244] disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-[#041128]/10"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-[#848C9B] py-4">
        © {new Date().getFullYear()} BUILD CLUB SSN. Authorized Registration Access Only.
      </div>
    </div>
  );
}

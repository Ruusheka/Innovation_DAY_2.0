'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
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
        setError('This account does not have admin access. Make sure your user is added to the admin_users table.');
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
    <div className="min-h-screen bg-[#040411] bg-ambient bg-grid flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#91A9C9]/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="glass border border-white/10 rounded-2xl p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#91A9C9]/10 border border-[#91A9C9]/20 mb-4">
              <span className="text-[#91A9C9] font-bold text-base font-mono">BC</span>
            </div>
            <h1 className="text-white font-semibold text-xl">Admin Portal</h1>
            <p className="text-[#848C9B] text-sm mt-1">BUILD CLUB — SSN I FOUND</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ssn.edu.in"
                autoComplete="email"
                required
                className="input-base"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#848C9B] uppercase tracking-widest mb-2"
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
                  className="input-base pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848C9B] hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-[#91A9C9] text-[#040411] font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to public */}
        <p className="text-center text-[#848C9B]/50 text-xs mt-6">
          <a href="/" className="hover:text-[#91A9C9] transition-colors">
            ← Back to public site
          </a>
        </p>
      </motion.div>
    </div>
  );
}

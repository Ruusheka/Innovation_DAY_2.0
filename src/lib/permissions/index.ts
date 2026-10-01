import { type AdminRole } from '@/types';

// ============================================================
// Role-based permission checks
// ============================================================

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  VIEWER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

function hasRole(userRole: AdminRole, requiredRole: AdminRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canVote(role: AdminRole): boolean {
  return hasRole(role, 'ADMIN');
}

export function canManageProjects(role: AdminRole): boolean {
  return hasRole(role, 'ADMIN');
}

export function canViewLeaderboard(role: AdminRole): boolean {
  return hasRole(role, 'VIEWER');
}

export const VOTING_CONTROLLER_EMAIL = 'ruushekas@gmail.com';

export function canManageAdmins(role: AdminRole): boolean {
  return hasRole(role, 'SUPER_ADMIN');
}

export function canImportStudents(role: AdminRole): boolean {
  return hasRole(role, 'SUPER_ADMIN');
}

export function canToggleVoting(role: AdminRole, email?: string | null): boolean {
  if (!isSuperAdmin(role)) return false;
  if (!email) return false;
  return email.trim().toLowerCase() === VOTING_CONTROLLER_EMAIL.toLowerCase();
}

export function canCorrectVotes(role: AdminRole): boolean {
  return hasRole(role, 'SUPER_ADMIN');
}

export function canViewAuditLogs(role: AdminRole): boolean {
  return hasRole(role, 'SUPER_ADMIN');
}

export function isSuperAdmin(role: AdminRole): boolean {
  return role === 'SUPER_ADMIN';
}

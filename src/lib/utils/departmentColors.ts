// ============================================================
// Centralized Department Color & Visual Identity System
// Provides accessible, distinct color palettes and badge styling
// ============================================================

export interface DepartmentColorMeta {
  code: string;
  name: string;
  primary: string;       // main accent hex
  secondary: string;     // lighter gradient accent hex
  badgeBg: string;       // background CSS class or hex
  badgeText: string;     // text CSS class or hex
  border: string;        // border hex/style
  glow: string;          // shadow/glow rgba
}

export const DEPARTMENT_COLORS: Record<string, DepartmentColorMeta> = {
  CSE: {
    code: 'CSE',
    name: 'Computer Science and Engineering',
    primary: '#2563EB',      // Royal Blue
    secondary: '#60A5FA',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    border: '#BFDBFE',
    glow: 'rgba(37, 99, 235, 0.18)',
  },
  IT: {
    code: 'IT',
    name: 'Information Technology',
    primary: '#0284C7',      // Sky Blue
    secondary: '#38BDF8',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    border: '#BAE6FD',
    glow: 'rgba(2, 132, 199, 0.18)',
  },
  'M.TECH CSE': {
    code: 'M.TECH CSE',
    name: 'M.Tech Computer Science and Engineering',
    primary: '#7C3AED',      // Purple
    secondary: '#A78BFA',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    border: '#DDD6FE',
    glow: 'rgba(124, 58, 237, 0.18)',
  },
  MTECHCSE: {
    code: 'MTECHCSE',
    name: 'M.Tech Computer Science and Engineering',
    primary: '#7C3AED',      // Purple
    secondary: '#A78BFA',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    border: '#DDD6FE',
    glow: 'rgba(124, 58, 237, 0.18)',
  },
  ECE: {
    code: 'ECE',
    name: 'Electronics and Communication Engineering',
    primary: '#D97706',      // Amber / Orange
    secondary: '#FBBF24',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    border: '#FDE68A',
    glow: 'rgba(217, 119, 6, 0.18)',
  },
  EEE: {
    code: 'EEE',
    name: 'Electrical and Electronics Engineering',
    primary: '#CA8A04',      // Gold / Yellow
    secondary: '#FACC15',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    border: '#FEF08A',
    glow: 'rgba(202, 138, 4, 0.18)',
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical Engineering',
    primary: '#E11D48',      // Rose / Crimson
    secondary: '#FB7185',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    border: '#FECDD3',
    glow: 'rgba(225, 29, 72, 0.18)',
  },
  CIVIL: {
    code: 'CIVIL',
    name: 'Civil Engineering',
    primary: '#059669',      // Emerald Green
    secondary: '#34D399',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    border: '#A7F3D0',
    glow: 'rgba(5, 150, 105, 0.18)',
  },
  CHEM: {
    code: 'CHEM',
    name: 'Chemical Engineering',
    primary: '#0D9488',      // Teal
    secondary: '#2DD4BF',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    border: '#99F6E4',
    glow: 'rgba(13, 148, 136, 0.18)',
  },
  CHEMISTRY: {
    code: 'CHEMISTRY',
    name: 'Chemical Engineering',
    primary: '#0D9488',
    secondary: '#2DD4BF',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    border: '#99F6E4',
    glow: 'rgba(13, 148, 136, 0.18)',
  },
  BME: {
    code: 'BME',
    name: 'Biomedical Engineering',
    primary: '#C026D3',      // Fuchsia / Magenta
    secondary: '#E879F9',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    border: '#F5D0FE',
    glow: 'rgba(192, 38, 211, 0.18)',
  },
  BIOTECH: {
    code: 'BIOTECH',
    name: 'Biotechnology / Biomedical',
    primary: '#C026D3',
    secondary: '#E879F9',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    border: '#F5D0FE',
    glow: 'rgba(192, 38, 211, 0.18)',
  },
  GPP: {
    code: 'GPP',
    name: 'Grand Project Pathway (Batch: 2025-26)',
    primary: '#0F766E',      // Deep Teal / Jade
    secondary: '#2DD4BF',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    border: '#99F6E4',
    glow: 'rgba(15, 118, 110, 0.18)',
  },
};

const DEFAULT_META: DepartmentColorMeta = {
  code: 'DEFAULT',
  name: 'Engineering Exhibition',
  primary: '#5277A8',
  secondary: '#91A9C9',
  badgeBg: 'bg-[#EDF4FC]',
  badgeText: 'text-[#041128]',
  border: '#D9E1EA',
  glow: 'rgba(82, 119, 168, 0.15)',
};

export function getDepartmentMeta(code?: string | null): DepartmentColorMeta {
  if (!code) return DEFAULT_META;
  const normalized = code.trim().toUpperCase().replace(/[\s_.-]/g, '');
  
  for (const key of Object.keys(DEPARTMENT_COLORS)) {
    if (key.replace(/[\s_.-]/g, '') === normalized) {
      return DEPARTMENT_COLORS[key];
    }
  }

  // Fallback for M.Tech CSE variants
  if (normalized.includes('MTECH') || normalized.includes('M.TECH')) {
    return DEPARTMENT_COLORS['MTECHCSE'];
  }
  if (normalized.includes('GPP')) {
    return DEPARTMENT_COLORS['GPP'];
  }
  if (normalized.includes('CHEM')) {
    return DEPARTMENT_COLORS['CHEM'];
  }
  if (normalized.includes('BIO') || normalized.includes('BME')) {
    return DEPARTMENT_COLORS['BME'];
  }

  return DEFAULT_META;
}

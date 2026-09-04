import { format, parseISO } from 'date-fns';

/**
 * Normalizes any UTC ISO string to IST (Asia/Kolkata, UTC+5:30) display format
 */
export function formatToIST(utcIsoString?: string | null, formatStr = 'dd MMM yyyy, HH:mm:ss'): string {
  if (!utcIsoString) return '--';
  try {
    const date = typeof utcIsoString === 'string' ? parseISO(utcIsoString) : new Date(utcIsoString);
    if (isNaN(date.getTime())) return '--';
    
    // Convert to IST
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return format(istDate, formatStr) + ' IST';
  } catch (err) {
    return '--';
  }
}

export function formatRelativeTime(utcIsoString?: string | null): string {
  if (!utcIsoString) return '--';
  try {
    const date = new Date(utcIsoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return '--';
  }
}

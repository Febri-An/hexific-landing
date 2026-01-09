import { supabase } from './supabase';

export type ServiceType = 'zip_upload' | 'address_audit';

const DAILY_LIMIT = 3;

/**
 * Get user's IP address from request
 */
export async function getClientIP(): Promise<string> {
  try {
    // Try to get IP from client-side (works in browser)
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
}

/**
 * Check if user has exceeded daily limit
 */
export async function checkRateLimit(
  ipAddress: string,
  serviceType: ServiceType
): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  // Bypass in development
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: 999, resetTime: getNextResetTime() };
  }

  try {
    // Get start of today (UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Query usage count for today
    const { data, error } = await supabase
      .from('audit_usage')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('service_type', serviceType)
      .gte('created_at', todayStart.toISOString());

    if (error) {
      console.error('Supabase error:', error);
      // If error, allow the request (fail open)
      return {
        allowed: true,
        remaining: DAILY_LIMIT,
        resetTime: getNextResetTime(),
      };
    }

    const usageCount = data?.length || 0;
    const remaining = Math.max(0, DAILY_LIMIT - usageCount);
    const allowed = usageCount < DAILY_LIMIT;

    return {
      allowed,
      remaining,
      resetTime: getNextResetTime(),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if there's an error
    return {
      allowed: true,
      remaining: DAILY_LIMIT,
      resetTime: getNextResetTime(),
    };
  }
}

/**
 * Log usage to database
 */
// export async function logUsage(
//   ipAddress: string,
//   serviceType: ServiceType,
//   metadata?: Record<string, any>
// ): Promise<boolean> {
//   try {
//     const { error } = await supabase.from('audit_usage').insert({
//       ip_address: ipAddress,
//       service_type: serviceType,
//       metadata: metadata || null,
//     });

//     if (error) {
//       console.error('Error logging usage:', error);
//       return false;
//     }

//     return true;
//   } catch (error) {
//     console.error('Error logging usage:', error);
//     return false;
//   }
// }

/**
 * Get next reset time (midnight UTC)
 */
function getNextResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Format reset time for display
 */
export function formatResetTime(resetTime: Date): string {
  const hours = resetTime.getUTCHours();
  const minutes = resetTime.getUTCMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} UTC`;
}

/**
 * Get time until reset in human-readable format
 */
export function getTimeUntilReset(resetTime: Date): string {
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
import crypto from 'crypto';

export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.IP_HASH_SALT || 'default-salt';
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
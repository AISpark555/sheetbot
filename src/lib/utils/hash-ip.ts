import * as crypto from 'crypto';

// Hash IP address for privacy while still being able to identify users
export async function hashIp(ip: string): Promise<string> {
  // Use a secret salt for the hash to prevent rainbow table attacks
  const salt = process.env.IP_HASH_SALT || 'default-salt-change-this';
  
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex');
}

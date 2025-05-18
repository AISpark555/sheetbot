
import * as crypto from 'crypto';

// For optimal identification, use a fingerprinting service like FingerprintJS
// If you want a simpler approach, create a hash of available headers
export async function getDeviceFingerprint(req: Request): Promise<string> {

  // Not as reliable but works without 3rd party services
  const headers = {
    'user-agent': req.headers.get('user-agent') || 'unknown',
    'accept-language': req.headers.get('accept-language') || 'unknown',
    'sec-ch-ua': req.headers.get('sec-ch-ua') || 'unknown',
    'sec-ch-ua-platform': req.headers.get('sec-ch-ua-platform') || 'unknown',
  };
  
  // Add IP address for better identification
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0];
  
  // Create a hash of all the information
  const fingerprint = crypto
    .createHash('sha256')
    .update(JSON.stringify({ ...headers, ip }))
    .digest('hex');
  
  return fingerprint;
}
import { createHmac } from 'crypto';

export function validateInitData(initData: string, botToken: string): boolean {
  const params = initData.split('&').map(p => {
    const idx = p.indexOf('=');
    return [p.slice(0, idx), p.slice(idx + 1)];
  });

  const hashEntry = params.find(p => p[0] === 'hash');
  if (!hashEntry) return false;

  const originalHash = hashEntry[1];
  if (!originalHash) return false;

  const launchParams = params
    .filter(p => p[0] !== 'hash')
    .map(p => `${p[0]}=${decodeURIComponent(p[1] ?? '')}`)
    .sort()
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const signature = createHmac('sha256', secretKey).update(launchParams).digest('hex');

  return signature === originalHash;
}

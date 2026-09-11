const { createSign } = require('node:crypto');
let tokenCache = null;
function serviceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    const error = new Error('Mural aguardando configuração.'); error.status = 503; error.code = 'NOT_CONFIGURED'; throw error;
  }
  let account;
  try { account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); }
  catch { const error = new Error('Configuração do mural inválida.'); error.status = 503; throw error; }
  if (!account.project_id || !account.client_email || !account.private_key) {
    const error = new Error('Configuração do mural incompleta.'); error.status = 503; throw error;
  }
  return account;
}
async function accessToken(account) {
  if (tokenCache && tokenCache.expires > Date.now() + 60000) return tokenCache.value;
  const now = Math.floor(Date.now() / 1000);
  const encode = data => Buffer.from(JSON.stringify(data)).toString('base64url');
  const data = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: account.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(data).sign(account.private_key.replace(/\\n/g, '\n'), 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${data}.${signature}` }),
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error('FIREBASE_AUTH_FAILED');
  const result = await response.json();
  tokenCache = { value: result.access_token, expires: Date.now() + result.expires_in * 1000 };
  return tokenCache.value;
}
async function firestore(path, options = {}) {
  const account = serviceAccount();
  const token = await accessToken(account);
  return fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(account.project_id)}/databases/(default)/documents${path}`, {
    ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000)
  });
}
function decode(document) {
  const f = document.fields || {};
  return { id: document.name.split('/').pop(), name: f.name?.stringValue || '', category: f.category?.stringValue || '', place: f.place?.stringValue || '', note: f.note?.stringValue || '', url: f.url?.stringValue || '', day: f.day?.stringValue || '', createdAt: f.createdAt?.timestampValue || '' };
}
module.exports = { firestore, decode, serviceAccount };

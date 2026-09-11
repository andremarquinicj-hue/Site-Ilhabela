const { firestore, decode, serviceAccount } = require('../lib/firestore');
function invalid(message) { const error = new Error(message); error.status = 400; throw error; }
function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Preencha os campos da sugestão.');
  const read = (key, min, max) => {
    if (body[key] !== undefined && typeof body[key] !== 'string') invalid('Formato de campo inválido.');
    const value = (body[key] || '').trim();
    if (value.length < min || value.length > max) invalid(`Confira o campo ${ { name:'nome', place:'lugar', note:'comentário', url:'link', day:'dia' }[key] || key }.`);
    return value;
  };
  const input = { name: read('name',2,60), place: read('place',2,100), note: read('note',0,500), url: read('url',0,1000), day: read('day',0,10) };
  if (!['praia','restaurante'].includes(body.category)) invalid('Escolha praia ou restaurante.');
  input.category = body.category;
  if (input.day && !/^2026-11-(14|15|16|17|18|19|20|21)$/.test(input.day)) invalid('Escolha um dia entre 14 e 21 de novembro.');
  if (input.url) {
    let url; try { url = new URL(input.url); } catch { invalid('Use um link completo, começando com https://.'); }
    if (!['https:','http:'].includes(url.protocol) || url.username || url.password) invalid('Use um link http ou https válido.');
    input.url = url.href;
  }
  if (typeof body.requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.requestId)) invalid('Atualize a página e tente novamente.');
  return { input, requestId: body.requestId };
}
async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow','GET, POST'); return res.status(405).json({ error:'Método não permitido.' }); }
  try {
    if (req.method === 'GET') {
      const response = await firestore(':runQuery', { method:'POST', body:JSON.stringify({ structuredQuery: { from:[{collectionId:'ilhabelaSuggestions'}], orderBy:[{field:{fieldPath:'createdAt'},direction:'DESCENDING'}], limit:200 } }) });
      if (!response.ok) throw new Error(`FIRESTORE_READ_${response.status}`);
      const rows = await response.json();
      return res.status(200).json({ suggestions:rows.filter(row => row.document).map(row => decode(row.document)) });
    }
    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return res.status(415).json({ error:'Envie a sugestão pelo formulário.' });
    if (req.headers.origin) {
      let origin; try { origin = new URL(req.headers.origin); } catch { return res.status(403).json({error:'Origem inválida.'}); }
      if (origin.host !== req.headers.host) return res.status(403).json({error:'Envie a sugestão pelo próprio site.'});
    }
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { invalid('Dados inválidos.'); } }
    if (Buffer.byteLength(JSON.stringify(body || {}),'utf8') > 12000) return res.status(413).json({error:'Sugestão muito longa.'});
    const {input,requestId} = validate(body);
    serviceAccount();
    const fields = Object.fromEntries(Object.entries(input).map(([key,value]) => [key,{stringValue:value}]));
    fields.createdAt = {timestampValue:new Date().toISOString()};
    const response = await firestore(`/ilhabelaSuggestions?documentId=${requestId}`, {method:'POST',body:JSON.stringify({fields})});
    if (response.status === 409) {
      const existing = await firestore(`/ilhabelaSuggestions/${requestId}`);
      if (!existing.ok) throw new Error('FIRESTORE_RETRY_READ');
      const saved = decode(await existing.json());
      if (!Object.entries(input).every(([key,value]) => saved[key] === value)) return res.status(409).json({error:'Essa tentativa já foi usada. Atualize a página para enviar outra sugestão.'});
      return res.status(200).json({suggestion:saved});
    }
    if (!response.ok) throw new Error(`FIRESTORE_WRITE_${response.status}`);
    return res.status(201).json({suggestion:decode(await response.json())});
  } catch(error) {
    if (!error.status) console.error('Suggestions API:', error.message);
    return res.status(error.status || 502).json({ error:error.status ? error.message : 'Não foi possível acessar o mural agora. Tente novamente em instantes.', code:error.code || 'REQUEST_FAILED' });
  }
}
module.exports = handler;
module.exports.validate = validate;

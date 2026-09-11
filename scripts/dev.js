const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../api/suggestions');
const root = path.resolve(__dirname,'../dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer(async(req,res) => {
  const url = new URL(req.url,'http://localhost');
  if (url.pathname === '/api/suggestions') {
    res.status = code => { res.statusCode = code; return res; };
    res.json = value => { res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
    let body = '', size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 12000) return res.status(413).json({error:'Sugestão muito longa.'}); body += chunk; }
    req.body = body; return api(req,res);
  }
  let filename;
  try { filename = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)); } catch { res.writeHead(400).end(); return; }
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try { const data = await fs.promises.readFile(filename); res.writeHead(200, {'Content-Type':types[path.extname(filename)] || 'application/octet-stream'}); res.end(data); }
  catch { res.writeHead(404).end('Não encontrado'); }
}).listen(Number(process.env.PORT) || 3000, () => console.log('Site disponível em http://localhost:' + (process.env.PORT || 3000)));

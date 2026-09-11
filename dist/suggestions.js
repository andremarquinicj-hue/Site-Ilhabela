(() => {
  const form = document.getElementById('suggestion-form');
  const submit = form.querySelector('[type=submit]');
  const formStatus = document.getElementById('form-status');
  const boardStatus = document.getElementById('board-status');
  const list = document.getElementById('suggestion-list');
  const refresh = document.getElementById('refresh-suggestions');
  let suggestions = [], filter = 'all', loaded = false, sending = false, requestId = null, lastPayload = null, refreshPromise = null, saveRevision = 0;
  const dateFormat = new Intl.DateTimeFormat('pt-BR', {day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'});
  function node(tag,className,text) { const element = document.createElement(tag); element.className = className; if (text !== undefined) element.textContent = text; return element; }
  function render() {
    list.replaceChildren();
    document.getElementById('suggestion-count').textContent = suggestions.length;
    const visible = suggestions.filter(item => filter === 'all' || item.category === filter);
    boardStatus.textContent = visible.length ? '' : (suggestions.length ? 'Ainda não tem sugestões nesta categoria. Qual é a sua dica?' : 'O roteiro está começando. Seja o primeiro a deixar uma dica!');
    visible.forEach(item => {
      const card = node('article','suggestion-card');
      const top = node('div','suggestion-card-top');
      top.appendChild(node('span',`suggestion-tag ${item.category}`,item.category === 'praia' ? 'PRAIA' : 'RESTAURANTE'));
      if (item.day) top.appendChild(node('span','suggested-date',dateFormat.format(new Date(item.day+'T12:00:00-03:00'))));
      card.append(top,node('h4','',item.place));
      if (item.note) card.appendChild(node('p','suggestion-note',item.note));
      const bottom = node('div','suggestion-card-bottom');
      bottom.appendChild(node('span','suggestion-author',`Dica de ${item.name}`));
      if (item.url) {
        try {
          const url = new URL(item.url);
          if (['https:','http:'].includes(url.protocol)) { const link = node('a','','Ver lugar ↗'); link.href = url.href; link.target='_blank'; link.rel='noopener noreferrer'; bottom.appendChild(link); }
        } catch { /* Não renderizar links inválidos. */ }
      }
      card.appendChild(bottom); list.appendChild(card);
    });
  }
  async function request(method='GET',body) {
    if (location.protocol === 'file:') { const error = new Error('O mural fica disponível depois que o site estiver publicado e conectado.'); error.code='NOT_CONFIGURED'; throw error; }
    const response = await fetch('/api/suggestions',{method,headers:body ? {'Content-Type':'application/json'} : {},body:body ? JSON.stringify(body) : undefined,cache:'no-store',signal:AbortSignal.timeout(25000)});
    let data; try { data = await response.json(); } catch { throw new Error('O mural está indisponível. Tente atualizar em instantes.'); }
    if (!response.ok) { const error = new Error(data.error || 'Não foi possível acessar o mural.'); error.code=data.code; throw error; }
    return data;
  }
  async function refreshBoard() {
    if (refreshPromise) return refreshPromise;
    const revision = saveRevision;
    refresh.disabled=true;
    if (!loaded) boardStatus.textContent='Carregando as ideias da turma…';
    refreshPromise = (async() => {
      try {
        const data = await request();
        // Uma leitura iniciada antes de um envio não pode apagar a nova sugestão da tela.
        if (revision === saveRevision) suggestions = data.suggestions;
        loaded=true; submit.disabled=sending; render();
        return suggestions;
      } catch(error) {
        if (error.code === 'NOT_CONFIGURED') { boardStatus.textContent='O mural está sendo preparado. Em breve a turma poderá deixar as dicas por aqui.'; submit.disabled=true; }
        else boardStatus.textContent=loaded ? 'Não foi possível atualizar. As últimas dicas continuam abaixo.' : 'Não foi possível carregar as dicas. Toque em atualizar para tentar novamente.';
        return null;
      } finally { refresh.disabled=false; refreshPromise=null; }
    })();
    return refreshPromise;
  }
  form.addEventListener('submit',async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    const input = Object.fromEntries(new FormData(form));
    const serialized = JSON.stringify(input);
    if (!requestId || serialized !== lastPayload) { requestId = crypto.randomUUID(); lastPayload=serialized; }
    sending=true; submit.disabled=true; submit.textContent='Enviando…'; formStatus.textContent='';
    try {
      const {suggestion} = await request('POST',{...input,requestId});
      saveRevision++;
      suggestions=[suggestion,...suggestions.filter(item => item.id !== suggestion.id)];
      loaded=true; filter='all'; updateFilters(); render();
      const name = input.name; form.reset(); form.elements.name.value=name;
      requestId=null; lastPayload=null;
      formStatus.textContent='Dica enviada! Ela já está no mural da turma.';
    } catch(error) { formStatus.textContent=error.message || 'Não foi possível enviar. Sua dica continua preenchida; tente novamente.'; }
    finally { sending=false; submit.disabled=false; submit.innerHTML='Mandar pra turma <span aria-hidden="true">↗</span>'; }
  });
  function updateFilters() { document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter === filter))); }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',() => { filter=button.dataset.filter; updateFilters(); if (loaded) render(); }));
  refresh.addEventListener('click',refreshBoard);
  refreshBoard();
  // Atualiza ao voltar para a aba ou a cada minuto enquanto ela estiver visível.
  setInterval(() => { if (!document.hidden) refreshBoard(); },60000);
  document.addEventListener('visibilitychange',() => { if (!document.hidden) refreshBoard(); });
  const context = document.modelContext;
  if (context?.registerTool) {
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name:'list_trip_suggestions',title:'Consultar sugestões da viagem',
        description:'Atualiza e consulta as sugestões compartilhadas de praias e restaurantes da viagem a Ilhabela de 14 a 21/11/2026.',
        inputSchema:{type:'object',properties:{category:{type:'string',enum:['all','praia','restaurante']}},additionalProperties:false},
        annotations:{readOnlyHint:true,untrustedContentHint:true},
        async execute(input) { const category=input?.category || 'all'; if (!['all','praia','restaurante'].includes(category)) throw new Error('Categoria inválida.'); const items=await refreshBoard(); if (!items) throw new Error('Mural indisponível.'); filter=category; updateFilters(); render(); return {suggestions:items.filter(item => category === 'all' || item.category === category)}; }
      },{signal:lifecycle.signal})).catch(() => {});
    } catch { /* Recurso opcional, sem afetar o mural. */ }
    window.addEventListener('pagehide',() => lifecycle.abort(),{once:true});
  }
})();

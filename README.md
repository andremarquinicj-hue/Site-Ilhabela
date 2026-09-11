# Ilhabela, lá vamos nós!

Site da viagem de **14 a 21 de novembro de 2026**. O pacote contém o site completo e as seis fotos da turma.

## O que tem no site

- Contagem regressiva ao vivo até **14/11/2026 às 00h00, horário de Brasília**.
- Visual de férias, animações suaves e versão adaptável a celular e computador.
- Galeria com as seis fotos, ampliação, navegação por setas e gesto de deslizar no celular.
- Referências e fotografias de Ilhabela com créditos no rodapé.
- Mural compartilhado para sugerir **praias e restaurantes**: nome, lugar, comentário, link e dia opcional entre 14 e 21/11.
- Filtros por categoria. Atualização automática a cada minuto enquanto a aba estiver visível, ao retornar à aba ou pelo botão de atualizar.

**O visual e o contador funcionam imediatamente. Para o mural salvar e mostrar as sugestões para todos, configure o Firebase conforme abaixo.** Não há sugestões fictícias nem armazenamento limitado a um celular. Sem a configuração, o site informa que o mural está em preparação.

## 1. Enviar os arquivos para o GitHub

1. Extraia o ZIP.
2. Crie um repositório no GitHub, por exemplo `viagem-ilhabela`.
3. Em **Add file → Upload files**, envie o conteúdo da pasta extraída.
4. Confirme que `package.json`, `vercel.json` e as pastas `dist`, `api`, `lib` e `scripts` ficaram na raiz do repositório.
5. Salve em **Commit changes**.

Envie os arquivos extraídos, não o ZIP. As fotos já estão em `dist/assets`. Arquivos ocultos como `.gitignore` podem precisar ser habilitados no explorador do computador.

## 2. Preparar o Firebase para o mural

Use um projeto exclusivo para a viagem, para manter seus outros sistemas separados.

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e crie um projeto, por exemplo **Viagem Ilhabela**. O Analytics não é necessário para este site.
2. Entre em **Build / Criação → Firestore Database → Criar banco de dados**.
3. Crie o banco **Standard**, no modo nativo, com o identificador padrão **(default)**. Se houver escolha de região, selecione a desejada para o projeto.
4. Selecione **modo de produção**. Na aba **Regras**, publique o conteúdo de `firestore.rules` deste pacote. Essas regras são para o projeto exclusivo da viagem; não as coloque sobre as regras de outros aplicativos.
5. Entre na engrenagem → **Configurações do projeto → Contas de serviço → Firebase Admin SDK**.
6. Clique em **Gerar nova chave privada** e baixe o JSON.
7. Abra esse JSON no Bloco de Notas. Seu conteúdo será colado na variável da Vercel no próximo passo.

A chave privada fica **somente na variável de ambiente da Vercel**. Não envie o JSON para o GitHub nem o coloque dentro de `dist`. O site acessa o Firestore pela API do servidor. Não precisa cadastrar aplicativo web nem habilitar login do Firebase.

A coleção `ilhabelaSuggestions` é criada automaticamente quando alguém envia a primeira dica. Os dados permanecem no Firestore quando o site é atualizado. Caso precise corrigir ou excluir uma sugestão, você pode fazê-lo pelo console do Firestore.

## 3. Publicar na Vercel

1. Acesse a [Vercel](https://vercel.com/), entre em **Add New → Project** e importe o repositório.
2. Confira as configurações:

| Campo | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Raiz do projeto, onde está o `package.json` |
| Build Command | Vazio / sem comando |
| Output Directory | `dist` |
| Node.js | 22.x |

3. Em **Environment Variables**, adicione:

| Nome | Valor |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Todo o conteúdo JSON da chave privada baixada do Firebase, incluindo as chaves `{ }` |

Cole o JSON original, sem aspas adicionais ao redor. Mantenha os `\n` presentes dentro de `private_key`. Selecione o ambiente **Production**; habilite **Preview** também caso queira usar o mural nos links de prévia.

4. Clique em **Deploy**.
5. Depois de publicar, abra o link, envie uma sugestão e confira em outro celular ou aba anônima. Use o botão ↻ para atualizar imediatamente.

Se o site já estiver publicado quando você adicionar a variável, faça **Redeploy** para que o servidor use a nova configuração. O `vercel.json` já define a pasta pública e a função `/api/suggestions`.

O mural é aberto para visitantes do site, sem login. O nome é informado pela própria pessoa, sem verificação de identidade. As 200 sugestões mais recentes são exibidas; as anteriores continuam no banco. Excluir ou editar dicas é uma ação feita pelo responsável no console do Firebase.

## 4. Abrir no computador antes de publicar

Para ver apenas o visual, abra `dist/index.html` no navegador. O mural precisa de servidor e do Firebase.

Para desenvolver com a API local, instale o Node.js 22 e, na pasta do projeto, execute:

```bash
npm run dev
```

Abra `http://localhost:3000`. Não há dependências para instalar. Para conectar o Firebase localmente, crie `.env.local` usando `.env.example` como referência. Coloque o JSON completo da conta de serviço em uma linha entre aspas simples, preservando os `\n` da chave. Esse arquivo é ignorado pelo Git.

## Personalizar

| O que alterar | Arquivo |
| --- | --- |
| Textos, período, fotos e referências | `dist/index.html` |
| Data e hora da saída | `dist/countdown.js` |
| Cores, tamanhos e animações | `dist/styles.css` |
| Galeria e comportamento visual | `dist/app.js` |
| Formulário e mural | `dist/suggestions.js` |
| Validação e API de sugestões | `api/suggestions.js` |

O contador usa dias completos, horas, minutos e segundos restantes. Por exemplo, de **11/09/2026 às 00h00** a **14/11/2026 às 00h00** são **64 dias**. Ao longo de 11/09, ele mostra **63 dias mais as horas restantes**. Isso é uma contagem de duração exata, não um erro de um dia. Ao chegar à data, o contador fica zerado, sem números negativos, e a mensagem muda. O início foi definido como meia-noite porque não foi informado um horário de partida.

## Fotografias e referências

As seis fotografias pessoais estão incluídas no pacote, em WebP, com proporções preservadas. As imagens de praias são carregadas de fontes externas; se uma fonte estiver indisponível, o site usa uma foto da turma e identifica a substituição nos cartões de destinos.

- Praia do Curral: **galio**, [arquivo original e autoria](https://commons.wikimedia.org/wiki/File:Praia_do_Curral,_Ilhabela_(2284333985).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/).
- Castelhanos: **João Vitor Oliveira Martins**, [arquivo original e autoria](https://commons.wikimedia.org/wiki/File:Castelhanos_-_Ilhabela_-_sp.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- As fotos externas têm o enquadramento ajustado por CSS; as licenças indicadas continuam aplicáveis às imagens e a eventuais adaptações. Elas não alteram os direitos das fotos pessoais.
- [Portal municipal de turismo](https://www.ilhabela.sp.gov.br/portal/turismo), [Castelhanos](https://pt.wikipedia.org/wiki/Praia_de_Castelhanos), [Praia do Curral](https://pt.wikipedia.org/wiki/Praia_do_Curral).

## Verificação e limites desta entrega

Conferidos: sintaxe JavaScript, caminhos dos arquivos locais, integridade das seis fotos, transição de datas do contador e validação da API. O fluxo de envio, listagem e repetição de envio foi verificado com respostas de teste do serviço externo.

**A conexão com um Firebase real e a publicação na sua Vercel dependem da configuração da sua conta.** Não foram executadas nesta entrega. Não foi realizado teste visual em navegador. As fontes das fotos externas foram identificadas, mas o download e a inspeção visual dessas imagens não ficaram disponíveis neste ambiente; o fallback utiliza as fotos pessoais incluídas. Fontes tipográficas externas possuem alternativas locais.

Documentação de apoio: [contas de serviço do Firebase](https://firebase.google.com/docs/admin/setup), [Firestore REST e autenticação](https://firebase.google.com/docs/firestore/use-rest-api), [funções Node.js da Vercel](https://vercel.com/docs/functions/runtimes/node-js), [configuração do projeto](https://vercel.com/docs/project-configuration), [variáveis de ambiente](https://vercel.com/docs/environment-variables).

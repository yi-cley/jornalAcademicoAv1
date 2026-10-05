# Folha Acadêmica: documentação do projeto

Este documento explica como o projeto está organizado, o que cada arquivo faz e quais ideias de framework aparecem nele. O objetivo não é só descrever o código, mas mostrar por que ele foi dividido dessa forma.

## 1. A ideia central: um mini framework feito à mão

O projeto não usa nenhum framework, mas foi organizado como se usasse um. Frameworks como Django, Laravel, Express ou React existem principalmente para resolver problemas de organização: onde ficam os dados, onde fica a regra de negócio, onde fica a tela, como uma página sabe o que mostrar. Quando escrevemos tudo à mão, precisamos tomar essas decisões sozinhos. É exatamente isso que torna o projeto bom para estudo: cada peça que um framework entregaria pronta está visível em um arquivo.

A organização segue o princípio de **separação de responsabilidades**: cada arquivo cuida de uma coisa só e conhece apenas o que precisa. O projeto está dividido em camadas, e cada camada só usa as que estão abaixo dela:

```
┌─────────────────────────────────────────────────────────────┐
│  Páginas HTML          index, regiao, materia, login,        │  estrutura da tela
│                        cadastro, cms                         │
├─────────────────────────────────────────────────────────────┤
│  Controladores         index.js, regiao.js, materia.js,      │  lógica de cada página
│  de página             login.js, cadastro.js, cms.js         │
├─────────────────────────────────────────────────────────────┤
│  Layout e componentes  layout.js                             │  partes repetidas da tela
├─────────────────────────────────────────────────────────────┤
│  Autenticação          auth.js                               │  quem está logado, permissões
├─────────────────────────────────────────────────────────────┤
│  Dados                 db.js                                 │  leitura e gravação
├─────────────────────────────────────────────────────────────┤
│  Utilidades            util.js                               │  funções genéricas
└─────────────────────────────────────────────────────────────┘
        style.css cuida da aparência de todas as camadas
```

Essa regra de dependência é o que mantém o projeto organizado. O `db.js` não sabe que existe tela; o `auth.js` não mexe em HTML; só os controladores e o layout tocam no DOM. Se um dia o localStorage for trocado por um servidor de verdade, só o `db.js` e o `auth.js` precisam mudar, e o resto do projeto continua igual.

## 2. Estrutura de pastas

```
jornal/
├── index.html          capa
├── regiao.html         organização das abas
├── materia.html        leitura de uma matéria
├── cadastro.html       criar conta
├── login.html          entrar
├── cms.html            painel de edição
├── css/
│   └── style.css       todo o visual
├── js/
│   ├── util.js         utilidades
│   ├── db.js           dados
│   ├── auth.js         autenticação
│   ├── layout.js       cabeçalho, rodapé e componentes
│   └── (um arquivo por página)
├── LEIAME.md           instruções rápidas
└── DOCUMENTACAO.md     este arquivo
```

A separação por tipo (HTML na raiz, CSS em `css/`, JavaScript em `js/`) é uma convenção. Frameworks também impõem convenções parecidas: o Django espera `models.py`, `views.py` e uma pasta `templates/`; o Laravel espera `app/Models`, `resources/views` e `routes/`. Seguir uma convenção faz qualquer pessoa encontrar as coisas sem precisar perguntar.

## 3. Como uma página funciona do começo ao fim

Vale acompanhar o que acontece quando alguém abre `regiao.html?aba=campus`, porque esse caminho passa por todas as camadas:

1. O navegador carrega o HTML, que tem um esqueleto vazio: `<header id="topo">`, `<main id="conteudo">` e `<footer id="rodape">`.
2. No fim do `<body>`, os scripts são carregados em ordem.
3. `util.js` cria as funções auxiliares.
4. `db.js` cria o objeto `DB` e, se for a primeira visita, grava os dados de exemplo.
5. `auth.js` cria o objeto `Auth`, que já consegue consultar o `DB`.
6. `layout.js` monta o cabeçalho, perguntando ao `Auth` quem está logado e ao `DB` quais abas existem.
7. `regiao.js` lê o parâmetro `aba=campus` da URL, busca a aba e as matérias no `DB` e escreve o resultado dentro de `#conteudo`.

Em um framework, os passos 2 a 6 aconteceriam "por baixo dos panos". Aqui eles estão explícitos na ordem das tags `<script>`.

## 4. Arquivo por arquivo

### 4.1 `js/util.js`: utilidades

É a camada mais baixa. Contém funções genéricas que não sabem nada sobre jornal, matéria ou usuário; poderiam ser copiadas para qualquer outro projeto.

| Função | O que faz |
|---|---|
| `esc(texto)` | Troca `< > & " '` por códigos HTML seguros antes de o texto ir para a tela |
| `param(nome)` | Lê um parâmetro da URL, como o `id` em `materia.html?id=2` |
| `formatarData(iso)` | Converte `2026-09-24` em "24 de setembro de 2026" |
| `hojeISO()` | Devolve a data de hoje no formato usado no banco |
| `paragrafos(texto)` | Quebra o texto nas linhas em branco e gera vários `<p>` |
| `gerarSlug(texto)` | Converte "Política & Economia" em `politica-economia`, próprio para URL |

**Pontos principais.** A função `esc()` é a mais importante do projeto do ponto de vista de segurança. Como as páginas montam HTML com template strings e `innerHTML`, qualquer texto digitado por um usuário (o título de uma matéria, por exemplo) poderia conter uma tag `<script>` e executar código na página de outra pessoa. Esse ataque se chama XSS. Frameworks como React, Django e Laravel fazem esse escape automaticamente em seus templates; aqui ele precisa ser chamado à mão em todo lugar que exibe dado vindo do banco.

A função `param()` faz o papel de um **roteador** simplificado. Em vez de ter uma página por matéria, existe uma única `materia.html` que decide o que mostrar a partir da URL. Frameworks fazem o mesmo com rotas como `/materia/<id>/`.

### 4.2 `js/db.js`: camada de dados

Funciona como o banco de dados e o **model** do projeto. Todo acesso a dados passa por aqui; nenhum outro arquivo usa `localStorage` diretamente para ler matérias, abas ou usuários.

**Como os dados são guardados.** O localStorage só guarda texto. Por isso cada "tabela" é uma lista de objetos convertida para JSON e salva numa chave própria: `jornal_abas`, `jornal_materias` e `jornal_usuarios`. O prefixo `jornal_` evita conflito com outros projetos abertos no mesmo navegador, já que arquivos abertos direto do computador compartilham o mesmo localStorage.

**As tabelas e suas relações:**

| Tabela | Campos | Relação |
|---|---|---|
| `abas` | `slug`, `nome`, `descricao`, `cor` | o `slug` é a chave |
| `usuarios` | `id`, `nome`, `email`, `senha`, `papel` | `papel` é `leitor` ou `editor` |
| `materias` | `id`, `titulo`, `resumo`, `conteudo`, `imagem`, `aba`, `autorId`, `data`, `publicada` | `aba` aponta para `abas.slug`; `autorId` aponta para `usuarios.id` |

Mesmo sem um banco relacional, o modelo tem chaves estrangeiras: uma matéria guarda o slug da aba e o id do autor, e as outras camadas fazem a "junção" buscando esses registros.

**Funções do objeto `DB`:**

| Função | O que faz |
|---|---|
| `ler(tabela)` | Busca a lista no localStorage e converte de JSON; se não existir, devolve lista vazia |
| `salvar(tabela, lista)` | Converte a lista para JSON e grava |
| `novoId(lista)` | Gera o próximo id (maior id existente + 1), imitando o auto incremento de um banco |
| `abas()`, `aba(slug)` | Todas as abas, ou uma aba específica |
| `usuarios()` | Todos os usuários |
| `materias()`, `materia(id)` | Todas as matérias em ordem da mais recente, ou uma específica |
| `resetar()` | Apaga todas as chaves com o prefixo e recria os dados de exemplo |

Fora do objeto, `popularDadosIniciais()` grava as cinco abas, a conta de editor e as dez matérias de exemplo. No fim do arquivo, uma verificação da chave `jornal_versao` compara com a constante `VERSAO_DADOS`: os dados de exemplo só são recriados na primeira visita ou quando esse número muda. Esse mecanismo corresponde às **seeds** ou **fixtures** dos frameworks: dados iniciais para o sistema já nascer utilizável.

**Pontos principais.** Centralizar o acesso em um objeto é o padrão **repositório**. As funções de atalho (`materia(id)`, `aba(slug)`) funcionam como consultas prontas, parecidas com `Materia.objects.get(id=2)` no Django. A ordenação em `materias()` usa a data e, em caso de empate, o id, para que a matéria criada por último apareça primeiro mesmo quando duas são do mesmo dia.

### 4.3 `js/auth.js`: autenticação

Cuida de tudo que envolve identidade: criar conta, entrar, sair, saber quem está logado e barrar quem não tem permissão.

**A sessão.** Em um sistema real, a sessão fica no servidor e o navegador guarda só um identificador em um cookie. Aqui a sessão é simplesmente o id do usuário gravado na chave `jornal_sessao`. Se a chave existe, alguém está logado.

| Função | O que faz |
|---|---|
| `usuarioAtual()` | Lê o id da sessão e devolve o usuário, ou `null` |
| `cadastrar(nome, email, senha)` | Valida, verifica email repetido, cria a conta como `leitor` e já inicia a sessão |
| `entrar(email, senha)` | Procura um usuário com esse email e senha e inicia a sessão |
| `sair()` | Remove a sessão |
| `exigirEditor()` | Se quem está na página não for editor, redireciona para o login |

**Pontos principais.** As funções `cadastrar` e `entrar` não mostram mensagens nem mexem na tela. Elas devolvem um objeto no formato `{ ok: true }` ou `{ ok: false, erro: '...' }`, e quem decide como exibir o erro é a página. Essa separação entre regra e apresentação permite reaproveitar a mesma lógica em telas diferentes.

`exigirEditor()` é uma **guarda de rota**, o equivalente ao `@login_required` do Django ou a um middleware de autenticação no Express. O CMS chama essa função na primeira linha, e o resto do painel só funciona se ela deixar passar.

O projeto também separa **autenticação** (quem é você) de **autorização** (o que você pode fazer). Qualquer pessoa pode se cadastrar e entrar, mas só quem tem `papel: 'editor'` acessa o painel e vê rascunhos.

### 4.4 `js/layout.js`: layout e componentes

Contém as partes da tela que se repetem em todas as páginas. Sem ele, o cabeçalho e o menu precisariam ser copiados em seis arquivos HTML, e cada mudança no menu exigiria editar os seis.

**`montarLayout()`** preenche o `#topo` e o `#rodape`. Para isso, ela consulta:

- o `Auth`, para decidir se mostra "Entrar / Criar conta" ou "Olá, nome / Painel / Sair";
- o `DB`, para gerar um link para cada aba existente, com a cor da aba;
- o atributo `data-pagina` do `<body>` e o parâmetro `aba` da URL, para marcar qual item do menu está ativo com `aria-current="page"`.

A função é chamada automaticamente no fim do arquivo, mas também pode ser chamada de novo. O CMS faz isso depois de criar ou excluir uma aba, para o menu se atualizar na hora sem recarregar a página.

**`cartaoMateria(materia, tipo)`** devolve o HTML de um cartão de matéria. É o **componente** do projeto: uma função que recebe dados e devolve um pedaço de interface. Ela tem três variações:

| Tipo | Onde aparece | Diferença |
|---|---|---|
| `destaque` | matéria principal da capa | título e resumo maiores, com imagem |
| `normal` | grade de matérias de uma aba | com imagem |
| `compacto` | coluna lateral da capa | só texto |

Quando a matéria não tem imagem, o cartão mostra um bloco na cor da aba com a inicial do nome, para a capa não ficar com buracos.

**Pontos principais.** `cartaoMateria()` é a mesma ideia de um componente React (`<CartaoMateria materia={m} tipo="destaque" />`) ou de um `{% include %}` no Django: escrever uma vez, usar em vários lugares. A capa e a região usam a mesma função, então uma mudança no cartão aparece nas duas páginas.

### 4.5 Controladores de página

Cada página HTML tem um script próprio que faz o papel de **controlador** (ou **view**, na nomenclatura do Django): lê a URL, busca os dados e monta o conteúdo. Todos seguem o mesmo roteiro: buscar dados, tratar o caso vazio ou de erro, renderizar.

#### `js/index.js` (capa)

Filtra só as matérias publicadas, separa a mais recente como destaque e as outras como lista lateral:

```js
const [destaque, ...outras] = publicadas;
```

Essa linha usa desestruturação: o primeiro item vai para `destaque` e o restante vai para `outras`. Se não houver nenhuma matéria publicada, a página mostra um **estado vazio** com um link para o painel, em vez de uma tela em branco.

#### `js/regiao.js` (região)

A Região é o lugar onde as abas do jornal ficam organizadas e documentadas. O script funciona em dois modos, decididos pelo parâmetro da URL:

- **Sem parâmetro** (`regiao.html`): lista todas as abas, cada uma com nome, descrição do que cobre e a quantidade de matérias publicadas. É o mapa do jornal.
- **Com parâmetro** (`regiao.html?aba=campus`): mostra o cabeçalho da aba na cor dela e a grade de matérias daquela aba.

Se o slug não existir, mostra uma mensagem com link para voltar à lista. Também altera o `document.title`, para a aba do navegador mostrar o nome da seção.

**Ponto principal:** uma única página atende a todas as abas, inclusive as que ainda serão criadas no CMS. Isso é **roteamento dinâmico**, o mesmo que `/regiao/<slug>/` em um framework.

#### `js/materia.js` (matéria)

Busca a matéria pelo `id` da URL e aplica uma regra de visibilidade:

```js
const podeVer = materia && (materia.publicada || (usuario && usuario.papel === 'editor'));
```

Ou seja, matérias publicadas aparecem para todos; rascunhos só para editores, com um aviso no topo. Também busca o autor pelo `autorId` (a junção entre as tabelas) e usa `paragrafos()` para transformar o texto em parágrafos.

#### `js/cadastro.js` e `js/login.js` (formulários)

Os dois seguem o mesmo padrão:

1. Escutam o evento `submit` do formulário.
2. Chamam `evento.preventDefault()`, que impede o navegador de recarregar a página (o comportamento padrão de um formulário).
3. Passam os valores para o `Auth`.
4. Se deu erro, mostram a mensagem; se deu certo, redirecionam.

Os campos são lidos pelo atributo `name`: um `<input name="email">` vira `form.email.value`.

No `login.js` há um detalhe de segurança: depois do login, a página só aceita voltar para `cms.html`. Se aceitasse qualquer endereço vindo da URL, alguém poderia enviar um link como `login.html?voltar=site-falso.com`, e o usuário cairia num site malicioso logo depois de digitar a senha. Esse problema se chama **open redirect**.

#### `js/cms.js` (painel)

É o maior arquivo, porque concentra o CRUD (criar, ler, atualizar e excluir) de três entidades. Está dividido em blocos comentados, um por entidade.

**Início.** A primeira linha chama `Auth.exigirEditor()`. Se o usuário não for editor, é redirecionado. No fim do arquivo, as listas só são desenhadas se houver um editor válido.

**Matérias.**

| Função | O que faz |
|---|---|
| `preencherSelectAbas()` | Monta o `<select>` com as abas existentes |
| `listarMaterias()` | Desenha a tabela com título, aba, situação e botões |
| `editarMateria(id)` | Carrega a matéria no formulário |
| `limparFormMateria()` | Volta o formulário ao modo "nova matéria" |

O mesmo formulário serve para criar e para editar. A diferença está no campo oculto `materiaId`: vazio significa criar, preenchido significa atualizar. Ao atualizar, o código usa `{ ...materias[i], ...dados }`, que mantém o que não foi alterado (id, autor, data) e substitui o resto.

**Abas.** Funciona do mesmo jeito, com duas regras de integridade:

- O **slug não muda** ao editar uma aba. Se mudasse, as matérias que apontam para o slug antigo ficariam órfãs e os links quebrariam.
- Uma aba **não pode ser excluída** enquanto tiver matérias. É o equivalente ao `on_delete=PROTECT` do Django ou a uma restrição de chave estrangeira no banco.

Depois de salvar ou excluir uma aba, o painel chama `montarLayout()` de novo para o menu do topo se atualizar.

**Usuários.** Lista as contas e permite alternar entre leitor e editor. O editor logado não consegue rebaixar a si mesmo, o que evita que o sistema fique sem nenhum editor.

**Recomeçar.** O botão chama `DB.resetar()` e recarrega a página.

**Pontos principais do CMS:**

- **Delegação de eventos.** Em vez de colocar um ouvinte em cada botão "Editar" e "Excluir", existe um único ouvinte na tabela inteira. Quando alguém clica, o código olha os atributos `data-editar` ou `data-excluir` do botão clicado para saber o que fazer. Isso funciona mesmo depois que a tabela é redesenhada.
- **Salvar e redesenhar.** Toda ação segue o ciclo: alterar os dados no `DB`, depois chamar as funções `listar...()` para redesenhar a tela a partir dos dados. A tela nunca é editada "no remendo"; ela sempre reflete o que está salvo. Esse é o princípio central de frameworks como React e Vue: a interface é uma função do estado.
- **Feedback.** A função `avisar()` mostra uma mensagem temporária no canto da tela ("Matéria criada", "Aba excluída"), usando `role="status"` para que leitores de tela também anunciem.

### 4.6 As páginas HTML

Todas as páginas partem do mesmo esqueleto:

```html
<body data-pagina="capa">
  <header id="topo"></header>
  <main class="container" id="conteudo"> ... </main>
  <footer id="rodape" class="rodape"></footer>

  <script src="js/util.js"></script>
  <script src="js/db.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/layout.js"></script>
  <script src="js/index.js"></script>
</body>
```

**Pontos principais:**

- **Ordem dos scripts.** Cada arquivo usa o que os anteriores criaram, então a ordem é a própria árvore de dependências do projeto. Se `auth.js` viesse antes de `db.js`, daria erro porque `DB` ainda não existiria.
- **Scripts comuns, não módulos.** O projeto usa `<script src>` em vez de `type="module"` porque módulos não funcionam em arquivos abertos direto do computador. O lado ruim é que tudo fica no escopo global, e por isso os nomes precisam ser únicos entre os arquivos carregados na mesma página.
- **Scripts no fim do `<body>`.** Quando eles rodam, os elementos `#topo` e `#conteudo` já existem, então não é preciso esperar o evento `DOMContentLoaded`.
- **`data-pagina`.** Um atributo simples que diz ao `layout.js` em qual página ele está, para marcar o item ativo do menu.
- **Conteúdo estático e dinâmico.** `index`, `regiao` e `materia` têm o `<main>` vazio porque todo o conteúdo vem do banco. `login`, `cadastro` e `cms` já trazem os formulários escritos no HTML, porque a estrutura deles é fixa; o JavaScript só preenche as tabelas e trata o envio.
- **Validação dupla.** Os formulários usam validação do próprio HTML (`required`, `type="email"`, `minlength="6"`) e o `auth.js` valida de novo. Num sistema real, a validação que vale é sempre a do servidor, porque a do navegador pode ser burlada.

### 4.7 `css/style.css`: aparência

Um único arquivo organizado em seções comentadas, na ordem em que aparecem na tela: variáveis, base, topo, cartões, capa, cabeçalhos de página, região, matéria, formulários, CMS, rodapé e, por último, os ajustes para celular.

**Pontos principais:**

- **Variáveis CSS.** Cores e fontes ficam em `:root` (`--marca`, `--tinta`, `--serifa`). Mudar `--marca` troca a cor do jornal inteiro. É o mesmo papel dos "tokens de design" de frameworks como Tailwind ou Bootstrap.
- **A variável `--cor` liga os dados ao visual.** Cada aba tem uma cor salva no banco. O JavaScript coloca essa cor no elemento com `style="--cor:#2e7d4f"`, e o CSS usa `var(--cor)` para pintar a borda da aba ativa, o rótulo da matéria e o cabeçalho da aba. Assim, uma aba nova criada no CMS já ganha sua identidade visual sem nenhuma linha de CSS nova.
- **Nomes no padrão BEM** (bloco, elemento, modificador): `.cartao` é o bloco, `.cartao__titulo` é um elemento dele, `.cartao--destaque` é uma variação. O nome já diz a que parte da tela a classe pertence, o que evita conflitos entre estilos de partes diferentes.
- **Estilo ligado à acessibilidade.** A aba ativa é estilizada pelo seletor `[aria-current="page"]` em vez de uma classe `.ativo`. O mesmo atributo informa ao leitor de tela qual é a página atual e diz ao CSS o que destacar.
- **Responsividade no fim.** A `@media (max-width: 760px)` transforma as grades de duas colunas em uma só no celular. Deixá-la no fim garante que ela sobrescreva as regras anteriores.
- **`:focus-visible`** desenha um contorno em quem navega pelo teclado, sem aparecer em cliques de mouse.

### 4.8 `LEIAME.md`

Guia rápido: como abrir o projeto, lista de páginas, conta de teste, ordem dos scripts, limitações e sugestões de exercícios. Este arquivo (`DOCUMENTACAO.md`) aprofunda o que o LEIAME resume.

## 5. Conceitos de framework presentes no projeto

| Conceito | Onde está no projeto | Equivalente em frameworks |
|---|---|---|
| Model / camada de dados | `db.js` | `models.py` (Django), Eloquent (Laravel) |
| Seeds / dados iniciais | `popularDadosIniciais()` | fixtures (Django), seeders (Laravel) |
| Rotas | parâmetros de URL lidos por `param()` | `urls.py`, `routes/web.php`, React Router |
| Controlador / view | `index.js`, `regiao.js`, `cms.js`... | `views.py`, Controllers |
| Template | HTML + template strings | templates Django, Blade, JSX |
| Layout base | `montarLayout()` | `` `base.html` com `{% extends %}`, layouts do Laravel `` |
| Componente | `cartaoMateria()` | componentes React/Vue, `{% include %}` |
| Guarda de rota | `Auth.exigirEditor()` | `@login_required`, middleware |
| Sessão | chave `jornal_sessao` | sessões do servidor com cookie |
| Escape automático | `esc()` chamado à mão | automático nos templates |
| Estado → interface | salvar e depois `listar...()` | reatividade do React/Vue |

A tabela mostra o ponto principal do projeto: um framework não faz nada de mágico. Ele padroniza e automatiza decisões que, aqui, foram tomadas à mão. Quem entende essas decisões aprende qualquer framework mais rápido, porque sabe qual problema cada recurso está resolvendo.

## 6. Como a organização ajuda a fazer mudanças

Uma boa forma de avaliar a organização é ver quantos arquivos uma mudança exige.

**Adicionar uma página nova** (por exemplo, "Sobre"):

1. Copiar o esqueleto de qualquer HTML, trocar o `data-pagina` e o último script.
2. Criar `js/sobre.js` com o conteúdo.
3. Adicionar o link no menu dentro de `montarLayout()`.

O cabeçalho, o login e o rodapé já funcionam na página nova sem nenhum esforço.

**Adicionar um campo nas matérias** (por exemplo, "fonte"):

1. `db.js`: incluir o campo nas matérias de exemplo.
2. `cms.html`: adicionar o `<input name="fonte">`.
3. `cms.js`: incluir o campo em `dados` e em `editarMateria()`.
4. `materia.js`: exibir o campo.

Cada arquivo tocado corresponde a uma camada (dados, formulário, lógica do painel, exibição). Quando uma mudança espalha em muitos lugares sem essa correspondência, é sinal de que a organização precisa de ajuste.

## 7. Limitações e o que um servidor resolveria

Estas limitações são intencionais, porque o projeto é de estudo e roda sem instalar nada:

- **Os dados existem só em um navegador.** Outra pessoa, ou o mesmo usuário em outro computador, vê o jornal com os dados de exemplo. Um servidor com banco de dados centraliza tudo.
- **Não há segurança real.** Qualquer pessoa pode abrir o F12, ver as senhas em texto puro e se tornar editora mudando o próprio `papel`. Num sistema real, senhas são guardadas com hash no servidor e as permissões são verificadas lá, onde o usuário não consegue alterar.
- **O escape de HTML depende de disciplina.** Basta esquecer um `esc()` para abrir uma falha. Frameworks invertem essa lógica: escapam tudo por padrão e exigem uma ação explícita para desligar.
- **Tudo no escopo global.** Sem módulos, os arquivos compartilham nomes. Em projetos maiores, módulos ES e ferramentas de build resolvem isso.

Essas limitações são justamente as partes que Django, Laravel ou Express entregam prontas, e ter passado por elas à mão torna mais fácil entender por que esses frameworks existem.

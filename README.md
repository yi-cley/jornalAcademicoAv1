# Folha Acadêmica

Jornal de estudo feito só com HTML, CSS e JavaScript. Não precisa instalar nada:
abra o `index.html` no navegador (dois cliques).

## Páginas

| Arquivo | O que faz |
|---|---|
| `index.html` | Capa: matéria mais recente em destaque e as outras ao lado |
| `regiao.html` | Região: organiza e descreve todas as abas. Com `?aba=campus`, mostra só uma aba |
| `materia.html` | Uma matéria: `materia.html?id=1` |
| `cadastro.html` | Cria conta (entra como leitor) |
| `login.html` | Entra na conta |
| `cms.html` | Painel: matérias, abas e usuários. Só para editores |

Conta de editor para testes: `admin@jornal.com` / `admin123`

## Como o código está dividido

Todas as páginas carregam os scripts nesta ordem:

1. `js/util.js`: funções pequenas (escapar texto, ler a URL, formatar data)
2. `js/db.js`: o "banco de dados" no localStorage e os dados de exemplo
3. `js/auth.js`: cadastro, login, logout e sessão
4. `js/layout.js`: cabeçalho, barra de abas, rodapé e o cartão de matéria
5. o script da própria página (`index.js`, `regiao.js`, `cms.js`...)

Para ver os dados: F12 > Application (ou Armazenamento) > Local Storage.

## Limitações (de propósito)

Não há servidor, então tudo fica só neste navegador e qualquer pessoa com o
F12 aberto pode ver e alterar os dados, inclusive as senhas. Serve para
entender o fluxo; num site real, login e dados ficam no servidor.

## Ideias para continuar estudando

- Busca de matérias por título na capa
- Campo de autor editável e página "matérias deste autor"
- Contador de visualizações em cada matéria
- Ordenar as abas (campo `ordem` e botões para subir/descer no CMS)
- Exportar e importar os dados em um arquivo JSON

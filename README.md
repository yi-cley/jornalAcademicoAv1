# Folha Acadêmica

Jornal de estudo feito só com HTML, CSS e JavaScript. 
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

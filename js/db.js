// db.js — o "banco de dados" do jornal, guardado no localStorage do navegador.
// Cada tabela é uma lista em JSON salva numa chave: jornal_abas, jornal_materias, jornal_usuarios.
// O prefixo evita conflito com outros projetos abertos no mesmo navegador.

const PREFIXO = 'jornal_';
// Mude este número quando alterar os dados de exemplo: o navegador recarrega a base
const VERSAO_DADOS = '3';

const DB = {
  ler(tabela) {
    return JSON.parse(localStorage.getItem(PREFIXO + tabela)) || [];
  },
  salvar(tabela, lista) {
    localStorage.setItem(PREFIXO + tabela, JSON.stringify(lista));
  },
  novoId(lista) {
    return lista.length ? Math.max(...lista.map(item => item.id)) + 1 : 1;
  },

  // Atalhos de consulta
  abas() { return this.ler('abas'); },
  aba(slug) { return this.ler('abas').find(a => a.slug === slug); },
  usuarios() { return this.ler('usuarios'); },
  materia(id) { return this.ler('materias').find(m => m.id === Number(id)); },
  materias() {
    // mais recentes primeiro; no mesmo dia, a criada por último vem antes
    return this.ler('materias').sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id);
  },

  // Apaga tudo do jornal e volta aos dados iniciais
  resetar() {
    Object.keys(localStorage)
      .filter(chave => chave.startsWith(PREFIXO))
      .forEach(chave => localStorage.removeItem(chave));
    popularDadosIniciais();
  }
};

function popularDadosIniciais() {
  DB.salvar('abas', [
    { slug: 'campus', nome: 'Campus', cor: '#2e7d4f',
      descricao: 'Notícias da faculdade: estrutura, calendário, avisos da coordenação e vida no campus.' },
    { slug: 'tecnologia', nome: 'Tecnologia', cor: '#3a5bd9',
      descricao: 'Programação, ferramentas e tendências explicadas para quem está começando no curso.' },
    { slug: 'cultura', nome: 'Cultura', cor: '#b8452e',
      descricao: 'Eventos, jogos, música e produções feitas pela comunidade acadêmica.' },
    { slug: 'esportes', nome: 'Esportes', cor: '#c27a00',
      descricao: 'Atividades físicas, projetos esportivos e saúde para quem estuda e trabalha.' },
    { slug: 'economia', nome: 'Economia', cor: '#7a3e9d',
      descricao: 'Dinheiro, mercado e trabalho explicados de forma simples para estudantes.' }
  ]);

  // ATENÇÃO: senha em texto puro só porque é uma simulação. Num sistema real,
  // a senha é verificada no servidor e guardada com hash, nunca no navegador.
  DB.salvar('usuarios', [
    { id: 1, nome: 'Redação', email: 'admin@jornal.com', senha: 'admin123', papel: 'editor' }
  ]);

  DB.salvar('materias', [
    {
      id: 1, aba: 'campus', autorId: 1, data: '2026-09-24', publicada: true, imagem: 'img/uninassau-fachada.jpg',
      titulo: 'Laboratório do bloco B reabre com 30 computadores novos',
      resumo: 'As máquinas substituem equipamentos antigos e ficam liberadas também no intervalo entre as aulas.',
      conteudo: 'O laboratório de informática do bloco B voltou a funcionar nesta semana depois de quase um mês fechado para reforma. A sala recebeu 30 computadores novos, cadeiras e uma rede elétrica refeita.\n\nSegundo a coordenação, o espaço fica aberto das 18h às 22h, inclusive no intervalo, para quem precisar terminar trabalhos ou estudar em grupo. É preciso apresentar a carteirinha na entrada.\n\nOs computadores antigos serão doados para escolas públicas da região após a formatação.'
    },
    {
      id: 2, aba: 'tecnologia', autorId: 1, data: '2026-09-22', publicada: true, imagem: 'img/laptop-estudo.jpg',
      titulo: 'Por que começar pelo HTML antes de qualquer framework',
      resumo: 'Entender o que o navegador faz sozinho ajuda a perceber o que as ferramentas resolvem por você.',
      conteudo: 'Frameworks como React, Angular e Vue aparecem em quase toda vaga de desenvolvimento web, e é natural querer começar por eles. Mas todos eles, no fim, geram HTML, CSS e JavaScript que o navegador executa.\n\nQuem entende como uma página é montada, como um formulário envia dados e como o JavaScript altera a tela consegue aprender qualquer framework mais rápido, porque sabe qual problema cada ferramenta está resolvendo.\n\nUma boa prática é construir um projeto pequeno do zero, sem bibliotecas, e depois refazer o mesmo projeto com um framework para comparar.'
    },
    {
      id: 3, aba: 'cultura', autorId: 1, data: '2026-09-20', publicada: true, imagem: 'img/rpg-mesa.jpg',
      titulo: 'Mostra de jogos independentes ocupa o auditório no sábado',
      resumo: 'Estudantes apresentam protótipos, e o público pode jogar e deixar comentários para os autores.',
      conteudo: 'O auditório principal recebe no sábado a primeira mostra de jogos independentes feitos por estudantes. Serão 12 projetos, entre jogos digitais, de tabuleiro e de RPG.\n\nCada mesa terá uma ficha para o público registrar o que achou. A ideia, segundo a organização, é que os autores saiam do evento com opiniões reais sobre o que funciona e o que precisa mudar.\n\nA entrada é gratuita e aberta à comunidade.'
    },
    {
      id: 4, aba: 'tecnologia', autorId: 1, data: '2026-10-03', publicada: true, imagem: 'img/ia-tendencias.jpg',
      titulo: 'Inteligência artificial entra na rotina de quem estuda programação',
      resumo: 'Ferramentas de IA ajudam a explicar erros e a sugerir código, mas não substituem entender o que está sendo feito.',
      conteudo: 'Cada vez mais estudantes de programação usam assistentes de inteligência artificial para tirar dúvidas, entender mensagens de erro e revisar trechos de código. O uso cresceu rápido nos últimos anos e já faz parte da rotina de muitas turmas.\n\nProfessores lembram que a ferramenta funciona melhor como apoio do que como atalho. Quem copia a resposta sem entender perde justamente o treino que a atividade pede, e ainda corre o risco de entregar um código que não sabe explicar.\n\nUma dica que se repete entre os docentes é tentar resolver o problema primeiro, usar a IA para conferir o raciocínio e sempre testar o resultado no navegador ou no terminal antes de confiar nele.'
    },
    {
      id: 5, aba: 'campus', autorId: 1, data: '2026-10-02', publicada: true, imagem: 'img/onibus-terminal.jpg',
      titulo: 'Frota renovada de ônibus chega aos terminais e promete viagens mais confortáveis',
      resumo: 'Os veículos novos têm acessibilidade e vão reforçar as linhas usadas por quem estuda à noite.',
      conteudo: 'Uma nova frota de ônibus começou a circular nos terminais da cidade nesta semana. Os veículos têm piso baixo, espaço para cadeira de rodas e painel que informa a linha com mais clareza.\n\nPara os estudantes que chegam ao campus no fim da tarde, a expectativa é de menos lotação e mais pontualidade. Muitos alunos trabalham durante o dia e dependem do transporte coletivo para não perder o início das aulas.\n\nA turma sugere que cada aluno anote o horário em que chega ao campus nas próximas semanas. Com esses dados, será possível mostrar à coordenação se a mudança realmente ajudou.'
    },
    {
      id: 6, aba: 'esportes', autorId: 1, data: '2026-10-01', publicada: true, imagem: 'img/bicicleta-pista.jpg',
      titulo: 'Aula de bicicleta ao ar livre reúne crianças e adultos em projeto comunitário',
      resumo: 'Instrutores ensinam e acompanham os iniciantes na pista de caminhada, sem custo para os participantes.',
      conteudo: 'Em uma pista de caminhada de um parque, instrutores uniformizados acompanham iniciantes que estão aprendendo a andar de bicicleta. Há crianças com bicicletas pequenas e também adultos que nunca tiveram a oportunidade de aprender.\n\nOs voluntários caminham ao lado de cada aluno, segurando o guidão no começo e soltando aos poucos conforme a pessoa ganha equilíbrio. Segundo os organizadores, a maioria aprende em duas ou três sessões.\n\nO projeto também incentiva o uso da bicicleta como meio de transporte, o que combina com a rotina de quem estuda e trabalha e precisa de alternativas baratas para se deslocar.'
    },
    {
      id: 7, aba: 'campus', autorId: 1, data: '2026-09-30', publicada: true, imagem: 'img/livros-cafe.jpg',
      titulo: 'Biblioteca estende horário e cria cantinho de leitura para a noite',
      resumo: 'O espaço silencioso foi pensado para quem chega do trabalho e quer estudar antes da aula.',
      conteudo: 'A biblioteca do campus passou a funcionar até mais tarde e ganhou um canto reservado para leitura, com mesas pequenas e luz mais suave. A proposta é oferecer um ambiente calmo para quem sai do trabalho direto para a faculdade.\n\nO acervo de tecnologia também foi ampliado, com novos títulos sobre lógica de programação, banco de dados e desenvolvimento web. Os alunos podem sugerir livros pelo formulário na entrada.\n\nA bibliotecária lembra que o empréstimo é feito com a carteirinha e que o prazo pode ser renovado uma vez, desde que ninguém esteja na fila de espera.'
    },
    {
      id: 8, aba: 'cultura', autorId: 1, data: '2026-09-28', publicada: true, imagem: 'img/serra-integracao.jpg',
      titulo: 'Turma planeja viagem de integração para a serra no fim do semestre',
      resumo: 'A ideia é reunir os colegas fora da sala de aula, com roteiro simples e custo dividido entre todos.',
      conteudo: 'A liderança da turma abriu a discussão sobre uma viagem de integração para uma cidade de serra, conhecida pela arquitetura de estilo europeu e pelo clima mais ameno. O passeio aconteceria depois das provas, para ninguém perder aula.\n\nPor enquanto, a proposta é só um rascunho: os alunos vão votar em data e orçamento, e quem não puder viajar poderá participar de um encontro local no mesmo fim de semana.\n\nO objetivo é fortalecer o grupo, já que muitos colegas se conhecem apenas pelas aulas e pelo grupo de mensagens da turma.'
    }
,
    {
      id: 9, aba: 'economia', autorId: 1, data: '2026-10-01', publicada: true, imagem: 'img/bolsa-valores.jpg',
      titulo: 'Bolsa de valores para iniciantes: o que entender antes de investir',
      resumo: 'Risco, prazo e diversificação são os três conceitos que professores indicam estudar primeiro.',
      conteudo: 'A bolsa de valores é o ambiente onde ações de empresas são compradas e vendidas. Quem compra uma ação se torna sócio de uma pequena parte da empresa, e o valor dela sobe ou desce conforme o desempenho e as expectativas do mercado.\n\nProfessores de finanças costumam recomendar que o iniciante comece estudando três ideias: risco (todo investimento pode render menos do que o esperado), prazo (por quanto tempo o dinheiro pode ficar aplicado) e diversificação (não concentrar tudo em um só lugar).\n\nEste texto é apenas educativo e não é recomendação de investimento. Para decisões reais, o ideal é buscar fontes confiáveis, como as cartilhas de educação financeira de órgãos reguladores, e só investir o que não fará falta no mês seguinte.'
    },
    {
      id: 10, aba: 'esportes', autorId: 1, data: '2026-09-29', publicada: true, imagem: 'img/futsal-quadra.jpg',
      titulo: 'Torneio de futsal entre turmas movimenta a quadra no fim de semana',
      resumo: 'Times de cursos diferentes disputam a taça em jogos curtos, e a torcida também é bem-vinda.',
      conteudo: 'A quadra poliesportiva recebe no sábado um torneio de futsal aberto a todas as turmas. Os jogos serão curtos, para que todos os times consigam jogar ao longo do dia, e as equipes podem ser mistas.\n\nCada turma deve inscrever um time com até dez jogadores. A organização pede que os participantes levem a carteirinha e usem calçado apropriado para quadra.\n\nPara quem não joga, o evento também é uma chance de torcer e conhecer colegas de outros cursos. Os campeões ganham a taça da edição e o direito de defender o título no próximo semestre.'
    }

  ]);

  localStorage.setItem(PREFIXO + 'versao', VERSAO_DADOS);
}

// Na primeira vez (ou quando a versão dos dados muda), cria os dados de exemplo
if (localStorage.getItem(PREFIXO + 'versao') !== VERSAO_DADOS) {
  popularDadosIniciais();
}

/**
 * Dados fictícios de demonstração (design D3). Sempre que a estrutura ou o
 * conteúdo mudar, incremente SEED_VERSAO: o repositório recarrega o seed
 * automaticamente quando a versão salva no navegador for diferente.
 */
import { calcularEstado, proximaQuestao } from '../adaptativo/motor';
import { somarDias } from '../dominio/datas';
import type { Curso, Dados, Dificuldade, Material, Questao, Resposta, UsuarioLegado as Usuario } from '../dominio/tipos';

export const SEED_VERSAO = 1;
export const DATA_INICIAL = '2026-03-16';

const usuarios: Usuario[] = [
  { id: 'u-ana', nome: 'Ana Souza', email: 'ana@exemplo.com', perfil: 'aluno', ativo: true },
  { id: 'u-bruno', nome: 'Bruno Lima', email: 'bruno@exemplo.com', perfil: 'aluno', ativo: true },
  { id: 'u-carla', nome: 'Carla Dias', email: 'carla@exemplo.com', perfil: 'aluno', ativo: true },
  { id: 'u-marcos', nome: 'Marcos Silva', email: 'marcos@exemplo.com', perfil: 'professor', ativo: true },
  { id: 'u-julia', nome: 'Júlia Rocha', email: 'julia@exemplo.com', perfil: 'professor', ativo: true },
  { id: 'u-paulo', nome: 'Paulo Antunes', email: 'paulo@exemplo.com', perfil: 'professor', ativo: false },
  { id: 'u-renata', nome: 'Renata Alves', email: 'renata@exemplo.com', perfil: 'admin', ativo: true },
  { id: 'u-helena', nome: 'Helena Souza', email: 'helena@exemplo.com', perfil: 'responsavel', ativo: true },
  { id: 'u-roberto', nome: 'Roberto Lima', email: 'roberto@exemplo.com', perfil: 'responsavel', ativo: true },
];

function texto(id: string, titulo: string, conteudo: string): Material {
  return { id, tipo: 'texto', titulo, conteudo };
}
function video(id: string, titulo: string, busca: string): Material {
  return { id, tipo: 'video', titulo, conteudo: `https://www.youtube.com/results?search_query=${encodeURIComponent(busca)}` };
}

export const cursos: Curso[] = [
  {
    id: 'c-mat',
    titulo: 'Matemática Básica',
    descricaoCurta: 'Frações, decimais e porcentagem no dia a dia.',
    descricao:
      'Revise os fundamentos de matemática usados no cotidiano: operações com frações, números decimais e cálculo de porcentagens, com questões que se adaptam ao seu ritmo.',
    area: 'Matemática',
    nivel: 'Iniciante',
    status: 'publicado',
    topicos: [
      { id: 't-fra', titulo: 'Frações', materiais: [
        texto('m-fra-1', 'O que é uma fração', 'Uma fração representa partes de um inteiro dividido em partes iguais. O denominador indica em quantas partes o inteiro foi dividido; o numerador, quantas partes foram tomadas. Para somar frações, use um denominador comum.'),
        video('m-fra-2', 'Vídeo: somando frações', 'soma de frações'),
      ] },
      { id: 't-dec', titulo: 'Decimais', materiais: [
        texto('m-dec-1', 'Números decimais', 'Números decimais usam vírgula para representar partes menores que a unidade. Ao multiplicar decimais, multiplique como inteiros e some as casas decimais dos fatores.'),
      ] },
      { id: 't-por', titulo: 'Porcentagem', materiais: [
        texto('m-por-1', 'Porcentagem', 'Porcentagem é uma fração de denominador 100: 25% = 25/100. Para calcular x% de um valor, multiplique o valor por x/100.'),
        video('m-por-2', 'Vídeo: descontos e aumentos', 'porcentagem desconto aumento'),
      ] },
    ],
  },
  {
    id: 'c-ing',
    titulo: 'Inglês Inicial',
    descricaoCurta: 'Primeiros passos: saudações, verbo "to be" e números.',
    descricao:
      'Curso introdutório de inglês para quem está começando: aprenda a cumprimentar, a se apresentar com o verbo "to be" e a usar os números.',
    area: 'Idiomas',
    nivel: 'Iniciante',
    status: 'publicado',
    topicos: [
      { id: 't-sau', titulo: 'Saudações', materiais: [
        texto('m-sau-1', 'Cumprimentos comuns', 'Hello / Hi = Olá. Good morning = Bom dia. Good afternoon = Boa tarde. Good evening = Boa noite (ao chegar). Good night = Boa noite (ao se despedir).'),
      ] },
      { id: 't-tobe', titulo: 'Verbo "to be"', materiais: [
        texto('m-tobe-1', 'Conjugação no presente', 'I am · You are · He/She/It is · We are · They are. Negativa: acrescente "not" (is not = isn\'t). Pergunta: inverta o verbo (Are you...?).'),
        video('m-tobe-2', 'Vídeo: verb to be', 'verb to be explicação'),
      ] },
      { id: 't-num', titulo: 'Números', materiais: [
        texto('m-num-1', 'Números de 1 a 100', 'one, two, three... ten. 11–19 terminam em -teen (fifteen). Dezenas terminam em -ty (twenty, fifty). Ordinais: first, second, third, fourth...'),
      ] },
    ],
  },
  {
    id: 'c-log',
    titulo: 'Lógica de Programação',
    descricaoCurta: 'Variáveis, condicionais e laços para começar a programar.',
    descricao:
      'Entenda os conceitos que estão por trás de qualquer linguagem de programação: variáveis, decisões com condicionais e repetição com laços.',
    area: 'Tecnologia',
    nivel: 'Iniciante',
    status: 'publicado',
    topicos: [
      { id: 't-var', titulo: 'Variáveis', materiais: [
        texto('m-var-1', 'Variáveis e tipos', 'Uma variável é um nome que guarda um valor. A atribuição (x = 5) substitui o valor anterior. Tipos comuns: inteiro, real, texto e booleano (verdadeiro/falso).'),
      ] },
      { id: 't-cond', titulo: 'Condicionais', materiais: [
        texto('m-cond-1', 'Se / senão', 'Condicionais executam blocos diferentes conforme uma condição: "se condição então A senão B". Operadores lógicos: E (ambos verdadeiros), OU (ao menos um), NÃO (inverte).'),
      ] },
      { id: 't-lacos', titulo: 'Laços de repetição', materiais: [
        texto('m-lacos-1', 'Para e enquanto', '"para i de 1 até N" repete N vezes. "enquanto condição" repete até a condição ficar falsa — cuidado com laços infinitos.'),
        video('m-lacos-2', 'Vídeo: laços de repetição', 'laços de repetição lógica de programação'),
      ] },
    ],
  },
  {
    id: 'c-geo',
    titulo: 'Geometria Plana',
    descricaoCurta: 'Ângulos e triângulos.',
    descricao: 'Curso em elaboração sobre ângulos e triângulos.',
    area: 'Matemática',
    nivel: 'Intermediário',
    status: 'rascunho',
    topicos: [
      { id: 't-ang', titulo: 'Ângulos', materiais: [] },
      { id: 't-tri', titulo: 'Triângulos', materiais: [] },
    ],
  },
];

type DefQuestao = [topicoId: string, dificuldade: Dificuldade, enunciado: string, alternativas: string[], explicacao: string];

/** A primeira alternativa de cada definição é a correta; ela é deslocada para variar a posição. */
const defsQuestoes: Record<string, DefQuestao[]> = {
  'c-mat': [
    ['t-fra', 'facil', 'Quanto é 1/2 + 1/2?', ['1', '2/4', '1/4', '2'], 'Duas metades formam um inteiro: 1/2 + 1/2 = 2/2 = 1.'],
    ['t-fra', 'facil', 'Qual fração representa metade de uma pizza?', ['1/2', '1/3', '2/3', '1/4'], 'Metade é uma de duas partes iguais: 1/2.'],
    ['t-fra', 'medio', 'Quanto é 1/3 + 1/6?', ['1/2', '2/9', '1/9', '2/6'], 'Com denominador comum 6: 2/6 + 1/6 = 3/6 = 1/2.'],
    ['t-fra', 'medio', 'Qual fração é equivalente a 3/4?', ['6/8', '3/8', '4/3', '9/16'], 'Multiplicando numerador e denominador por 2: 6/8.'],
    ['t-fra', 'dificil', 'Quanto é 2/3 × 3/5?', ['2/5', '5/8', '6/8', '1/5'], 'Multiplicam-se numeradores e denominadores: 6/15, que simplifica para 2/5.'],
    ['t-fra', 'dificil', 'Quanto é 3/4 ÷ 1/2?', ['3/2', '3/8', '2/3', '1/2'], 'Dividir por 1/2 é multiplicar por 2: 3/4 × 2 = 6/4 = 3/2.'],
    ['t-dec', 'facil', 'Quanto é 0,5 + 0,5?', ['1', '0,10', '1,5', '0,55'], 'Cinco décimos mais cinco décimos são dez décimos, ou seja, 1.'],
    ['t-dec', 'facil', 'Qual destes números é o maior?', ['0,8', '0,75', '0,08', '0,7'], 'Compare casa a casa: 0,8 = 0,80, que é maior que 0,75, 0,70 e 0,08.'],
    ['t-dec', 'medio', 'Quanto é 1,25 × 2?', ['2,5', '2,25', '1,50', '3,25'], '1,25 + 1,25 = 2,50 = 2,5.'],
    ['t-dec', 'medio', 'Como se escreve 3/4 em decimal?', ['0,75', '0,34', '0,43', '1,33'], '3 ÷ 4 = 0,75.'],
    ['t-dec', 'dificil', 'Quanto é 0,3 × 0,2?', ['0,06', '0,6', '0,006', '6'], '3 × 2 = 6 e somam-se as casas decimais (1 + 1 = 2): 0,06.'],
    ['t-dec', 'dificil', 'Quanto é 1 ÷ 0,25?', ['4', '0,25', '2,5', '40'], '0,25 cabe quatro vezes em 1.'],
    ['t-por', 'facil', 'Quanto é 50% de 20?', ['10', '5', '15', '20'], '50% é a metade: 20 ÷ 2 = 10.'],
    ['t-por', 'facil', '100% de uma quantia corresponde a:', ['a quantia inteira', 'metade dela', 'o dobro dela', 'nada'], '100% = 100/100 = 1 inteiro.'],
    ['t-por', 'medio', 'Quanto é 25% de 80?', ['20', '25', '40', '8'], '25% é um quarto: 80 ÷ 4 = 20.'],
    ['t-por', 'medio', 'Um produto de R$ 50 tem 10% de desconto. Quanto passa a custar?', ['R$ 45', 'R$ 40', 'R$ 49', 'R$ 55'], '10% de 50 = 5; 50 − 5 = 45.'],
    ['t-por', 'dificil', 'Um preço sobe 10% e depois cai 10%. Em relação ao original, ele:', ['fica 1% menor', 'volta ao original', 'fica 1% maior', 'fica 10% menor'], '100 → 110 → 110 − 11 = 99, ou seja, 1% menor.'],
    ['t-por', 'dificil', '30 é que porcentagem de 120?', ['25%', '30%', '40%', '20%'], '30 ÷ 120 = 0,25 = 25%.'],
  ],
  'c-ing': [
    ['t-sau', 'facil', 'Como se diz "Bom dia" em inglês?', ['Good morning', 'Good night', 'Goodbye', 'Good evening'], '"Good morning" é usado pela manhã.'],
    ['t-sau', 'facil', '"Hello" significa:', ['Olá', 'Tchau', 'Obrigado', 'Por favor'], '"Hello" é o cumprimento "olá".'],
    ['t-sau', 'medio', 'Qual a resposta adequada para "How are you?"', ["I'm fine, thanks.", "I'm John.", "I'm 10 years old.", "I'm from Brazil."], '"How are you?" pergunta como você está.'],
    ['t-sau', 'medio', '"Nice to meet you" é usado quando:', ['conhecemos alguém', 'nos despedimos à noite', 'pedimos desculpas', 'agradecemos um presente'], 'Significa "prazer em conhecê-lo".'],
    ['t-sau', 'dificil', 'Qual cumprimento é o mais formal?', ['Good afternoon, sir.', 'Hey!', "What's up?", 'Hi there!'], '"Good afternoon" com tratamento "sir" é formal; os demais são informais.'],
    ['t-sau', 'dificil', 'Ao chegar a um jantar à noite, você diz:', ['Good evening', 'Good night', 'Good morning', 'Good afternoon'], '"Good night" é usado para se despedir; ao chegar, diga "Good evening".'],
    ['t-tobe', 'facil', 'Complete: I ___ a student.', ['am', 'is', 'are', 'be'], 'Com "I" usa-se "am".'],
    ['t-tobe', 'facil', 'Complete: She ___ happy.', ['is', 'am', 'are', 'be'], 'Com he/she/it usa-se "is".'],
    ['t-tobe', 'medio', 'Complete: They ___ my friends.', ['are', 'is', 'am', 'be'], 'Com "they" usa-se "are".'],
    ['t-tobe', 'medio', 'Qual é a negativa de "He is tall"?', ["He isn't tall.", "He don't tall.", 'He not is tall.', "He aren't tall."], 'Acrescenta-se "not" após o verbo: is not = isn\'t.'],
    ['t-tobe', 'dificil', 'Qual pergunta está correta?', ['Are you a teacher?', 'You are a teacher?', 'Is you a teacher?', 'Am you a teacher?'], 'Na pergunta, o verbo vem antes do sujeito: Are you...?'],
    ['t-tobe', 'dificil', 'Complete: We ___ not at home yesterday.', ['were', 'was', 'are', 'is'], 'No passado, com "we" usa-se "were".'],
    ['t-num', 'facil', 'Como se escreve 3 em inglês?', ['three', 'tree', 'thirty', 'third'], '3 = three (tree significa árvore).'],
    ['t-num', 'facil', '"Ten" é o número:', ['10', '2', '12', '100'], 'ten = 10.'],
    ['t-num', 'medio', 'Como se escreve 15?', ['fifteen', 'fifty', 'five', 'fiveteen'], 'Números de 13 a 19 terminam em -teen: fifteen.'],
    ['t-num', 'medio', '"Twenty-one" é:', ['21', '12', '20', '201'], 'twenty (20) + one (1) = 21.'],
    ['t-num', 'dificil', 'Como se lê 1.250?', ['one thousand two hundred fifty', 'one hundred twenty-five', 'twelve fifty thousand', 'one thousand twenty-five'], '1.000 = one thousand; 250 = two hundred fifty.'],
    ['t-num', 'dificil', 'Qual é o ordinal de "three"?', ['third', 'threeth', 'thirdth', 'threest'], 'Os ordinais irregulares são first, second e third.'],
  ],
  'c-log': [
    ['t-var', 'facil', 'Uma variável serve para:', ['guardar um valor', 'desenhar a tela', 'desligar o computador', 'conectar à internet'], 'Variáveis armazenam valores usados pelo programa.'],
    ['t-var', 'facil', 'Após "x = 5", quanto vale x?', ['5', 'x', '0', 'indefinido'], 'A atribuição guarda 5 em x.'],
    ['t-var', 'medio', 'Após "a = 2; a = a + 3", quanto vale a?', ['5', '2', '3', '23'], 'a recebe o valor atual (2) mais 3.'],
    ['t-var', 'medio', 'Qual tipo representa verdadeiro ou falso?', ['booleano', 'inteiro', 'texto', 'real'], 'O tipo booleano tem só dois valores: verdadeiro e falso.'],
    ['t-var', 'dificil', 'Após "a = 1; b = 2; a = b; b = a", quanto valem a e b?', ['a = 2, b = 2', 'a = 2, b = 1', 'a = 1, b = 2', 'a = 1, b = 1'], 'a recebe 2; depois b recebe o novo a (2). Para trocar valores é preciso uma variável auxiliar.'],
    ['t-var', 'dificil', 'Após x = "3" + "4" (textos), x vale:', ['"34"', '7', '"7"', 'sempre um erro'], 'Somar textos os concatena: "3" + "4" = "34".'],
    ['t-cond', 'facil', 'Em "se nota >= 6 então aprovado", a nota 7 resulta em:', ['aprovado', 'reprovado', 'nada', 'erro'], '7 é maior ou igual a 6, então a condição é verdadeira.'],
    ['t-cond', 'facil', 'Qual operador testa igualdade em muitas linguagens?', ['==', '=+', '<>=', '=>'], '"==" compara; "=" costuma ser atribuição.'],
    ['t-cond', 'medio', 'Qual o resultado de (5 > 3) E (2 > 4)?', ['falso', 'verdadeiro', '5', 'erro'], 'E exige as duas verdadeiras; 2 > 4 é falso.'],
    ['t-cond', 'medio', 'Se x = 10, "se x > 5 então A senão B" executa:', ['A', 'B', 'A e B', 'nenhum'], '10 > 5 é verdadeiro, então executa A.'],
    ['t-cond', 'dificil', 'Qual o resultado de NÃO (verdadeiro OU falso)?', ['falso', 'verdadeiro', 'nulo', 'depende'], 'verdadeiro OU falso = verdadeiro; NÃO verdadeiro = falso.'],
    ['t-cond', 'dificil', 'Para x = 0, o que é impresso? se x > 0 "positivo" senão se x < 0 "negativo" senão "zero"', ['zero', 'positivo', 'negativo', 'nada'], 'As duas condições são falsas, então cai no último senão.'],
    ['t-lacos', 'facil', 'Um laço de repetição serve para:', ['repetir instruções', 'apagar variáveis', 'encerrar o programa', 'criar arquivos'], 'Laços executam um bloco várias vezes.'],
    ['t-lacos', 'facil', 'Quantas vezes "para i de 1 até 3" repete?', ['3', '1', '2', '4'], 'i assume 1, 2 e 3.'],
    ['t-lacos', 'medio', 'Qual a soma final? s = 0; para i de 1 até 4: s = s + i', ['10', '4', '6', '24'], '1 + 2 + 3 + 4 = 10.'],
    ['t-lacos', 'medio', 'Um "enquanto" cuja condição nunca fica falsa causa:', ['laço infinito', 'erro de sintaxe', 'fim imediato', 'nada'], 'Sem a condição ficar falsa, o laço nunca termina.'],
    ['t-lacos', 'dificil', 'Quantas vezes "x" é impresso? para i de 1 até 3: para j de 1 até 2: imprimir x', ['6', '5', '3', '2'], 'O laço interno roda 2 vezes para cada uma das 3 voltas do externo: 3 × 2 = 6.'],
    ['t-lacos', 'dificil', 'i = 10; enquanto i > 0: i = i − 3. Qual o valor final de i?', ['-2', '0', '1', '-3'], '10 → 7 → 4 → 1 → −2; aí a condição fica falsa.'],
  ],
  'c-geo': [
    ['t-ang', 'facil', 'Um ângulo reto mede:', ['90°', '180°', '45°', '360°'], 'Ângulo reto = 90°.'],
    ['t-ang', 'medio', 'Ângulos complementares somam:', ['90°', '180°', '360°', '45°'], 'Complementares somam 90°; suplementares, 180°.'],
    ['t-tri', 'facil', 'A soma dos ângulos internos de um triângulo é:', ['180°', '90°', '360°', '270°'], 'Em qualquer triângulo, a soma é 180°.'],
  ],
};

export function criarQuestoes(): Questao[] {
  const questoes: Questao[] = [];
  let n = 0;
  for (const [cursoId, defs] of Object.entries(defsQuestoes)) {
    for (const [topicoId, dificuldade, enunciado, alts, explicacao] of defs) {
      const posicao = n % alts.length;
      const alternativas = [...alts];
      [alternativas[0], alternativas[posicao]] = [alternativas[posicao], alternativas[0]];
      questoes.push({ id: `q-${++n}`, cursoId, topicoId, enunciado, alternativas, correta: posicao, explicacao, dificuldade });
    }
  }
  return questoes;
}

type Plano = [diasAtras: number, resultados: boolean[]][];
const V = true;
const F = false;

/** Gera um histórico coerente usando o próprio motor adaptativo para escolher as questões. */
function gerarHistorico(
  base: { cursos: Curso[]; questoes: Questao[] },
  alunoId: string,
  cursoId: string,
  plano: Plano,
  momento: { valor: number },
): Resposta[] {
  const curso = base.cursos.find((c) => c.id === cursoId)!;
  const respostas: Resposta[] = [];
  for (const [diasAtras, resultados] of plano) {
    for (const acertou of resultados) {
      const proxima = proximaQuestao(calcularEstado(curso, respostas), base.questoes, respostas);
      if (!proxima) return respostas;
      const q = proxima.questao;
      respostas.push({
        id: `r-${++momento.valor}`,
        alunoId,
        cursoId,
        topicoId: q.topicoId,
        questaoId: q.id,
        dificuldade: q.dificuldade,
        alternativa: acertou ? q.correta : (q.correta + 1) % q.alternativas.length,
        acertou,
        data: somarDias(DATA_INICIAL, -diasAtras),
        momento: momento.valor,
      });
    }
  }
  return respostas;
}

export function criarSeed(): Dados {
  const questoes = criarQuestoes();
  const base = { cursos, questoes };
  const momento = { valor: 0 };
  const respostas = [
    ...gerarHistorico(base, 'u-ana', 'c-mat', [[3, [V, V, V, V]], [2, [V, F, V, V, V]], [1, [V, V, F, F, V]]], momento),
    ...gerarHistorico(base, 'u-ana', 'c-ing', [[6, [V, F, V]], [1, [V, V]]], momento),
    ...gerarHistorico(base, 'u-bruno', 'c-mat', [[6, [V, V, F, V]], [4, [F, F, V, F]], [1, [F, V, F, F, V, F]]], momento),
    ...gerarHistorico(
      base,
      'u-carla',
      'c-log',
      [[9, [V, V]], [8, [V, V]], [7, [V, F]], [6, [V, V]], [5, [V]], [4, [V, V]], [3, [V, V]], [2, [F, V, V]], [1, [V, V]]],
      momento,
    ),
  ];

  return structuredClone({
    versaoSeed: SEED_VERSAO,
    dataVirtual: DATA_INICIAL,
    usuarios,
    cursos,
    questoes,
    matriculas: [
      { id: 'mt-1', alunoId: 'u-ana', cursoId: 'c-mat', data: somarDias(DATA_INICIAL, -3) },
      { id: 'mt-2', alunoId: 'u-ana', cursoId: 'c-ing', data: somarDias(DATA_INICIAL, -6) },
      { id: 'mt-3', alunoId: 'u-bruno', cursoId: 'c-mat', data: somarDias(DATA_INICIAL, -6) },
      { id: 'mt-4', alunoId: 'u-carla', cursoId: 'c-log', data: somarDias(DATA_INICIAL, -9) },
      { id: 'mt-5', alunoId: 'u-carla', cursoId: 'c-mat', data: somarDias(DATA_INICIAL, -1) },
    ],
    respostas,
    vinculosResponsavel: [
      { responsavelId: 'u-helena', alunoId: 'u-ana' },
      { responsavelId: 'u-roberto', alunoId: 'u-bruno' },
      { responsavelId: 'u-roberto', alunoId: 'u-carla' },
    ],
    vinculosProfessor: [
      { professorId: 'u-marcos', cursoId: 'c-mat' },
      { professorId: 'u-marcos', cursoId: 'c-log' },
      { professorId: 'u-marcos', cursoId: 'c-geo' },
      { professorId: 'u-julia', cursoId: 'c-ing' },
    ],
  });
}

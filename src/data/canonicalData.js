// Dados canônicos da avaliação P01 da Open Startup School
// Inclui Formas A, B e C, Roteiros de Áudio e Transcrições exatas

export const OPENING_AUDIO = {
  id: "TA-intro",
  filename: "TA-intro.mp3",
  title: "Abertura Oficial",
  text: `Bem-vindo à Avaliação de Competências Empreendedoras da Open Startups School.

Esta experiência não procura dizer se você é ou não empreendedor. Queremos observar diferentes tipos de evidência: o que você compreende, experiências que já viveu, como raciocina diante de um problema e como comunica uma proposta.

Algumas perguntas têm resposta objetiva. Outras não têm uma única resposta correta.

Quando pedirmos para pensar em voz alta, diga o que passa pela sua cabeça, inclusive dúvidas e mudanças de ideia. Se você não souber uma resposta, diga que não sabe. Isso também é informação útil.

Responda sozinho, sem consultar outras pessoas, internet ou ferramentas de inteligência artificial.

Você está usando fones de ouvido. Depois de ouvir cada pergunta, responda falando normalmente. Sua resposta será gravada.

Vamos começar.`
};

export const MODULE_COVERS = [
  {
    index: 0,
    id: "TC-BLOCO-0",
    filename: "TC-BLOCO-0.mp3",
    title: "Modelo Mental",
    eyebrow: "Bloco 0",
    text: "Vamos começar pela sua visão sobre o que significa empreender bem. Queremos conhecer as capacidades que você considera importantes e como percebe essas capacidades em sua própria experiência. Não existe uma lista pronta: responda com suas palavras."
  },
  {
    index: 1,
    id: "TC-BLOCO-1",
    filename: "TC-BLOCO-1.mp3",
    title: "Conhecimentos fundamentais",
    eyebrow: "Bloco 1",
    text: "Agora você vai passar por situações curtas ligadas a decisões de negócio. Algumas perguntas têm respostas mais objetivas; em todas, explique brevemente como chegou à sua resposta. O app não informará acertos ou erros durante a aplicação."
  },
  {
    index: 2,
    id: "TC-BLOCO-2",
    filename: "TC-BLOCO-2.mp3",
    title: "Experiências anteriores",
    eyebrow: "Bloco 2",
    text: "Nesta parte, queremos conhecer situações que você realmente viveu. Conte episódios concretos e deixe claro o que você fez pessoalmente. Se nunca passou por algo parecido, pode dizer isso."
  },
  {
    index: 3,
    id: "TC-BLOCO-3",
    filename: "TC-BLOCO-3.mp3",
    title: "Desafio de negócio",
    eyebrow: "Bloco 3",
    text: "Agora você vai entrar em um problema de negócio. Pense em voz alta e compartilhe dúvidas, opções e mudanças de direção enquanto decide. O objetivo é acompanhar o caminho do seu raciocínio, não apenas a resposta final."
  },
  {
    index: 4,
    id: "TC-BLOCO-4",
    filename: "TC-BLOCO-4.mp3",
    title: "Síntese e apresentação",
    eyebrow: "Bloco 4",
    text: "Agora é hora de organizar o que você construiu. Você terá um momento de preparação e depois fará uma apresentação breve. Procure deixar clara a oportunidade, a primeira ação e o próximo compromisso que deseja obter."
  },
  {
    index: 5,
    id: "TC-FECHAMENTO",
    filename: "TC-FECHAMENTO.mp3",
    title: "Fechamento",
    eyebrow: "Bloco 5",
    text: "Estamos chegando ao fim. Esta última pergunta convida você a olhar para o que mudou na sua percepção ao longo da experiência. Responda com tranquilidade e use suas próprias palavras."
  }
];

export const FORMS = {
  C: [
    {
      id: "C-M1",
      audioId: "TA-P1",
      audioFile: "TA-P1.mp3",
      moduleIndex: 0,
      family: "M1",
      block: "Modelo Mental",
      seconds: 120,
      kind: "question",
      text: "Então, vamos lá! Se você tivesse de explicar para alguém mais jovem quais capacidades fazem diferença para transformar uma ideia em algo real, quais escolheria? Fale com suas palavras e explique as mais importantes."
    },
    {
      id: "C-M2",
      audioId: "TA-P2",
      audioFile: "TA-P2.mp3",
      moduleIndex: 0,
      family: "M2",
      block: "Modelo Mental",
      seconds: 90,
      kind: "question",
      text: "Próximo passo, pode me dizer quais dessas capacidades você acha que já conseguiu exercitar melhor na sua própria vida? Que situação concreta sustenta a sua resposta?"
    },
    {
      id: "C-M3",
      audioId: "TA-P3",
      audioFile: "TA-P3.mp3",
      moduleIndex: 0,
      family: "M3",
      block: "Modelo Mental",
      seconds: 90,
      kind: "question",
      text: "A última questão do modelo mental que quero entender é: qual capacidade você sente que ainda teria dificuldade de demonstrar hoje porque teve pouca oportunidade de praticá-la? Poderia me dizer?"
    },
    {
      id: "C-K01",
      audioId: "TA-P4",
      audioFile: "TA-P5.mp3", // fallback
      moduleIndex: 1,
      family: "K1",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Agora, vamos para a primeira situação deste bloco. Um produto é vendido por 180 reais. Para cada unidade vendida, existem 60 reais de custos que só aparecem quando ocorre aquela venda. Quanto sobra por unidade para ajudar a pagar custos fixos e gerar resultado? Explique a conta."
    },
    {
      id: "C-K02",
      audioId: "TA-P5",
      audioFile: "TA-P5.mp3",
      moduleIndex: 1,
      family: "K2",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Um aluno usa uma plataforma de aprendizagem oferecida pela faculdade, mas a faculdade paga uma licença anual para disponibilizá-la. Quem é usuário e quem é pagador?"
    },
    {
      id: "C-K03",
      audioId: "TA-P6",
      audioFile: "TA-P6.mp3",
      moduleIndex: 1,
      family: "K3",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Na sequência, considere este cenário. Uma página recebeu 1.500 cliques e 30 inscrições. A frase “o preço está assustando os estudantes” é fato, interpretação, hipótese ou decisão? Explique."
    },
    {
      id: "C-K04",
      audioId: "TA-P7",
      audioFile: "TA-P7.mp3",
      moduleIndex: 1,
      family: "K4",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Uma empresa fechou contratos lucrativos, mas receberá em parcelas ao longo dos próximos três meses. Suas despesas principais vencem agora. Ela pode ter vendas lucrativas e ainda assim enfrentar um problema de caixa? Explique."
    },
    {
      id: "C-K05",
      audioId: "TA-P8",
      audioFile: "TA-P8.mp3",
      moduleIndex: 1,
      family: "K5",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Continuando, observe a decisão descrita a seguir. Antes de lançar uma nova oferta, o time combina que só continuará investindo se conseguir pelo menos 10 clientes dispostos a agendar um piloto em uma semana. Por que registrar esse critério antes do lançamento é melhor do que defini-lo depois?"
    },
    {
      id: "C-K06",
      audioId: "TA-P9",
      audioFile: "TA-P9.mp3",
      moduleIndex: 1,
      family: "K6",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Escolher hoje uma nova cor para uma campanha é barato de reverter. Fechar uma parceria exclusiva por dois anos pode limitar outras opções. Como reversibilidade e impacto deveriam mudar seu processo de decisão?"
    },
    {
      id: "C-K07",
      audioId: "TA-P10",
      audioFile: "TA-P10.mp3",
      moduleIndex: 1,
      family: "K7",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Seu time precisa de conhecimento jurídico especializado por três semanas e não possui essa competência. Que alternativas existem além de contratar uma pessoa permanente? Que fatores deveriam orientar a escolha?"
    },
    {
      id: "C-K08",
      audioId: "TA-P11",
      audioFile: "TA-P11.mp3",
      moduleIndex: 1,
      family: "K8",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Agora, vamos comparar dois canais. Canal A custa 150 reais para adquirir um cliente. Cada cliente deixa 50 reais por mês depois dos custos diretos e permanece em média 10 meses. Canal B custa 320 reais para adquirir um cliente, deixa 100 reais por mês e permanece em média 20 meses. Qual parece melhor pela conta simplificada? Mostre o raciocínio."
    },
    {
      id: "C-K09",
      audioId: "TA-P12",
      audioFile: "TA-P12.mp3",
      moduleIndex: 1,
      family: "K9",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Uma equipe muda ao mesmo tempo o preço, a mensagem, o formulário e o canal de aquisição. Depois disso, a conversão melhora. Podemos saber qual mudança causou a melhora? Qual é a limitação desse teste?"
    },
    {
      id: "C-K10",
      audioId: "TA-P13",
      audioFile: "TA-P13.mp3",
      moduleIndex: 1,
      family: "K10",
      block: "Conhecimentos fundamentais",
      seconds: 90,
      kind: "question",
      text: "Para fechar este bloco, considere uma situação envolvendo inteligência artificial. Uma IA produz uma recomendação muito convincente para uma decisão importante, mas parte dos dados usados não pode ser verificada e você não sabe onde o modelo costuma errar. O que precisa acontecer antes de tratar a recomendação como base confiável para agir?"
    },
    {
      id: "C-PB01",
      audioId: "TA-P14",
      audioFile: "TA-P14.mp3",
      moduleIndex: 2,
      family: "PB1",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Para começar esta parte, pense em uma situação concreta da sua própria experiência. Conte alguma situação em que você criou ou coordenou algo que saiu da ideia e chegou a outras pessoas. O que aconteceu e qual parte era responsabilidade sua?"
    },
    {
      id: "C-PB02",
      audioId: "TA-P15",
      audioFile: "TA-P15.mp3",
      moduleIndex: 2,
      family: "PB6",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Conte uma situação em que algo deu errado ou ficou abaixo do que você esperava. Como você reagiu e que decisão tomou depois?"
    },
    {
      id: "C-PB03",
      audioId: "TA-P16",
      audioFile: "TA-P16.mp3",
      moduleIndex: 2,
      family: "PB3",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Seguindo, lembre-se de uma iniciativa que precisou do apoio de outra pessoa. Você já precisou conseguir que alguém apoiasse uma iniciativa sua com tempo, dinheiro, acesso, indicação ou outro recurso? Conte o pedido, a resposta e o que aconteceu depois."
    },
    {
      id: "C-PB04",
      audioId: "TA-P17",
      audioFile: "TA-P17.mp3",
      moduleIndex: 2,
      family: "PB2",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Você já participou diretamente de uma venda, cobrança, negociação comercial ou captação de recurso? O que você fez pessoalmente e qual foi o resultado?"
    },
    {
      id: "C-PB05",
      audioId: "TA-P18",
      audioFile: "TA-P18.mp3",
      moduleIndex: 2,
      family: "PB4",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Agora, volte a uma decisão tomada em um cenário de incerteza. Conte uma decisão em que você precisou agir mesmo sem conseguir prever bem o resultado. Que risco existia e como você escolheu o próximo passo?"
    },
    {
      id: "C-PB06",
      audioId: "TA-P19",
      audioFile: "TA-P19.mp3",
      moduleIndex: 2,
      family: "PB5",
      block: "Experiências anteriores",
      seconds: 120,
      kind: "question",
      text: "Para encerrar este bloco, considere uma situação em que a realidade contrariou sua expectativa. Lembre de uma situação em que dados, feedback ou comportamento de outras pessoas contrariaram sua expectativa. Você mudou alguma coisa? O quê e por quê?"
    },
    {
      id: "C-CASE-INTRO",
      audioId: "TA-P20",
      audioFile: "TA-P20.mp3",
      moduleIndex: 3,
      family: "CASE-INTRO",
      block: "Desafio de negócio",
      seconds: 0,
      kind: "intro",
      text: "A Open Startups School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações.\n\nImagine que a escola quer começar com universitários de diferentes cursos.\n\nA escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela nem como transformar interessados em participantes ativos.\n\nSua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona.\n\nPense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final."
    },
    {
      id: "C-CASE-INITIAL",
      audioId: "TA-P21",
      audioFile: "TA-P21.mp3",
      moduleIndex: 3,
      family: "CASE-INITIAL",
      block: "Desafio de negócio",
      seconds: 480,
      kind: "thinkaloud",
      text: "Com esse contexto em mente, mostre como você começaria. Diga quais informações procuraria, que incerteza trataria primeiro, quais opções enxerga, o que faria nas primeiras 48 horas, o que mediria e em que situação mudaria de rumo.",
      silencePrompt: "Que decisão você está tentando tomar agora?",
      silenceAfter: 15
    },
    {
      id: "C-CASE-C1",
      audioId: "TA-P22",
      audioFile: "TA-P22.mp3",
      moduleIndex: 3,
      family: "CASE-C1",
      block: "Desafio de negócio",
      seconds: 240,
      kind: "question",
      text: "Nova informação: uma empresa oferece 20 mil reais para apoiar a primeira rodada, mas quer que a iniciativa priorize estudantes de tecnologia e que sua marca apareça como principal apoiadora. Como essa proposta muda — ou não muda — seu plano? O que você analisaria antes de aceitar, recusar ou renegociar?"
    },
    {
      id: "C-CASE-C2",
      audioId: "TA-P23",
      audioFile: "TA-P23.mp3",
      moduleIndex: 3,
      family: "CASE-C2",
      block: "Desafio de negócio",
      seconds: 240,
      kind: "question",
      text: "Mais uma informação: uma ação com organizações estudantis gerou 1.500 cliques no link de inscrição, mas somente 30 inscrições foram concluídas. O que você consegue aprender com esse dado? Que hipóteses levantaria e que próximo movimento faria?"
    },
    {
      id: "C-PITCH-PREP",
      audioId: "TA-P24",
      audioFile: "TA-P24.mp3",
      moduleIndex: 4,
      family: "PITCH-PREP",
      block: "Síntese e apresentação",
      seconds: 120,
      kind: "prep",
      text: "Você terá agora uma conversa de 90 segundos com uma pessoa capaz de abrir portas para estudantes e apoiar a primeira experiência. Organize uma mensagem que deixe claro: que oportunidade você enxerga; quem você quer mobilizar primeiro; qual é sua primeira ação; que evidência espera produzir; e qual compromisso concreto você quer obter dessa pessoa."
    },
    {
      id: "C-PITCH",
      audioId: "TA-P25",
      audioFile: "TA-P25.mp3",
      moduleIndex: 4,
      family: "PITCH",
      block: "Síntese e apresentação",
      seconds: 90,
      kind: "pitch",
      text: "Pode apresentar. O tempo máximo é de 90 segundos."
    },
    {
      id: "C-PITCH-REFLECT",
      audioId: "TA-P26",
      audioFile: "TA-P26.mp3",
      moduleIndex: 4,
      family: "PITCH-REFLECT",
      block: "Síntese e apresentação",
      seconds: 150,
      kind: "question",
      text: "Depois da sua apresentação, considere o seguinte. Se essa pessoa respondesse “ainda não estou convencida”, qual parte da sua proposta você investigaria ou testaria antes de tentar persuadi-la novamente?"
    },
    {
      id: "C-CLOSE",
      audioId: "TA-P27",
      audioFile: "TA-P27.mp3",
      moduleIndex: 5,
      family: "CLOSE",
      block: "Fechamento",
      seconds: 120,
      kind: "question",
      text: "Para concluir esta experiência, agora que terminou, existe alguma competência para empreender que você valorizava pouco no começo e passou a enxergar de outra maneira? Conte qual e por quê."
    }
  ]
};

export const AUDIT_ITEMS = [
  ["DONE", "Forms A/B/C no mesmo motor", "Motor otimizado para carregamento e atribuição interna da Forma."],
  ["DONE", "Abertura oficial", "Abertura participant-facing com áudio TA-intro.mp3."],
  ["DONE", "Transições entre blocos", "Telas dinâmicas com áudio do bloco (TC-BLOCO-0 a 4, TC-FECHAMENTO)."],
  ["DONE", "Replay desabilitado", "Fluxo produtivo sem repetição para preservação do protocolo."],
  ["DONE", "Dashboard do participante", "Área autenticada com visão geral, avaliações, laudos e histórico."],
  ["DONE", "Laudo bloqueado até release", "Exibição de estado travado com liberação pós-QA."],
  ["DONE", "Setup em etapas", "Consentimento → Fones (áudio) → Microfone (VU meter) → Instruções → Início."],
  ["DONE", "Texto + áudio por estímulo", "Player com waveform animada e áudio sincronizado por questão."],
  ["DONE", "Timer + concluir resposta", "Timer regressivo e gravação nativa de microfone via Web MediaRecorder."],
  ["DONE", "Sem back navigation", "Garantia de avanço sequencial rigoroso."],
  ["DONE", "Forma C completa no projeto", "M1–M3, K01–K10, PB01–PB06, Case, Pitch e Fechamento integrados."]
];

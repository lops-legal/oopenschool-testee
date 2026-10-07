import fs from "fs";

const targetCanonical = "C:/Users/100OS/Documents/oopenschool-testee/src/data/canonicalData.js";

const canonicalContent = `// Dados canônicos da avaliação P01 da Open Startup School — FORMA B PURA
// Todos os 27 estímulos, áudios oficiais TB e roteiro 100% fiel à Forma B

export const OPENING_AUDIO = {
  id: "TABERTURA",
  filename: "TABERTURA.mp3",
  title: "Abertura Oficial",
  text: \`Bem-vindo à Avaliação de Competências Empreendedoras da Open Startups School.

Esta experiência não procura dizer se você é ou não empreendedor. Queremos observar diferentes tipos de evidência: o que você compreende, experiências que já viveu, como raciocina diante de um problema e como comunica uma proposta.

Algumas perguntas têm resposta objetiva. Outras não têm uma única resposta correta.

Quando pedirmos para pensar em voz alta, diga o que passa pela sua cabeça, inclusive dúvidas e mudanças de ideia. Se você não souber uma resposta, diga que não sabe. Isso também é informação útil.

Responda sozinho, sem consultar outras pessoas, internet ou ferramentas de inteligência artificial.

Você está usando fones de ouvido. Depois de ouvir cada pergunta, responda falando normalmente. Sua resposta será gravada.

Vamos começar.\`
};

export const FINAL_AUDIO = {
  id: "TTELA-FINAL",
  filename: "TTELA FINAL.mp3",
  title: "Avaliação Concluída",
  text: \`Obrigado. Sua avaliação foi concluída.

Suas respostas serão processadas para gerar um laudo formativo. O laudo descreve evidências observadas nesta aplicação e não é um diagnóstico psicológico, certificação profissional ou previsão de sucesso empresarial.\`
};

export const MODULE_BLOCKS = [
  { index: 0, title: "Modelo Mental", eyebrow: "Bloco 0" },
  { index: 1, title: "Conhecimentos fundamentais", eyebrow: "Bloco 1" },
  { index: 2, title: "Experiências anteriores", eyebrow: "Bloco 2" },
  { index: 3, title: "Desafio de negócio", eyebrow: "Bloco 3" },
  { index: 4, title: "Síntese e apresentação", eyebrow: "Bloco 4" },
  { index: 5, title: "Fechamento", eyebrow: "Bloco 5" }
];

export const FORMA_B = [
  {
    id: "B-M1",
    audioId: "TB-M1",
    audioFile: "TB-M1.mp3",
    moduleIndex: 0,
    family: "M1",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: "Na sua visão, o que uma pessoa precisa saber ou conseguir fazer para empreender bem? Construa sua própria lista, sem se preocupar em usar termos técnicos, e explique o que considera mais importante."
  },
  {
    id: "B-M2",
    audioId: "TB-M2",
    audioFile: "TB-M2.mp3",
    moduleIndex: 0,
    family: "M2",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: "Pensando nessa lista, em quais dessas capacidades você acredita ter mais prática hoje? Que experiência sustenta essa percepção?"
  },
  {
    id: "B-M3",
    audioId: "TB-M3",
    audioFile: "TB-M3.mp3",
    moduleIndex: 0,
    family: "M3",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: "Qual dessas capacidades — ou alguma outra — você sente que ainda quase não teve oportunidade de testar na prática?"
  },
  {
    id: "B-K01",
    audioId: "TB-K01",
    audioFile: "TB-K01.mp3",
    moduleIndex: 1,
    family: "K1",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Um serviço é vendido por 300 reais. Para atender cada novo cliente, a empresa incorre em 110 reais de custos que só existem por causa daquele atendimento. Quanto sobra por cliente para ajudar a pagar a estrutura fixa e gerar resultado? Explique a conta."
  },
  {
    id: "B-K02",
    audioId: "TB-K02",
    audioFile: "TB-K02.mp3",
    moduleIndex: 1,
    family: "K2",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Um estudante utiliza diariamente uma plataforma de saúde mental oferecida pela universidade, mas quem paga a licença é a própria universidade. Quem é usuário e quem é pagador nesse caso?"
  },
  {
    id: "B-K03",
    audioId: "TB-K03",
    audioFile: "TB-K03.mp3",
    moduleIndex: 1,
    family: "K3",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Uma campanha recebeu 800 acessos e gerou 16 inscrições. A frase ‘os estudantes não confiaram na proposta’ é um fato, uma interpretação, uma hipótese ou uma decisão? Explique."
  },
  {
    id: "B-K04",
    audioId: "TB-K04",
    audioFile: "TB-K04.mp3",
    moduleIndex: 1,
    family: "K4",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Uma empresa vende bastante e registra resultado positivo, mas recebe dos clientes em 60 dias. Fornecedores e equipe precisam ser pagos nesta semana. É possível ter resultado positivo e enfrentar falta de caixa? Por quê?"
  },
  {
    id: "B-K05",
    audioId: "TB-K05",
    audioFile: "TB-K05.mp3",
    moduleIndex: 1,
    family: "K5",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Uma equipe decide, antes de começar um piloto, que só ampliará o projeto se pelo menos 5 de 20 organizações convidadas aceitarem testar a solução. Qual é a vantagem de definir esse critério antes de conhecer o resultado?"
  },
  {
    id: "B-K06",
    audioId: "TB-K06",
    audioFile: "TB-K06.mp3",
    moduleIndex: 1,
    family: "K6",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Trocar o texto de uma página pode ser desfeito no mesmo dia. Assinar um contrato anual caro é muito mais difícil de reverter. Como essa diferença deveria afetar a quantidade de informação que você busca antes de decidir?"
  },
  {
    id: "B-K07",
    audioId: "TB-K07",
    audioFile: "TB-K07.mp3",
    moduleIndex: 1,
    family: "K7",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Seu projeto precisa de análise de dados durante um mês, mas o time não tem essa competência. Que caminhos, além de uma contratação permanente, poderiam resolver a lacuna? Que critérios usaria para decidir?"
  },
  {
    id: "B-K08",
    audioId: "TB-K08",
    audioFile: "TB-K08.mp3",
    moduleIndex: 1,
    family: "K8",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Canal A custa 100 reais para adquirir um cliente, que deixa 35 reais por mês depois dos custos diretos e permanece em média 10 meses. Canal B custa 250 reais para adquirir um cliente, que deixa 80 reais por mês e permanece em média 20 meses. Qual parece melhor pela relação simplificada entre valor gerado e custo de aquisição? Mostre o raciocínio."
  },
  {
    id: "B-K09",
    audioId: "TB-K09",
    audioFile: "TB-K09.mp3",
    moduleIndex: 1,
    family: "K9",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Uma equipe percebe que clientes que usam determinada funcionalidade permanecem mais tempo no produto. Só essa correlação permite concluir que a funcionalidade causou a maior retenção? O que pode estar faltando?"
  },
  {
    id: "B-K10",
    audioId: "TB-K10",
    audioFile: "TB-K10.mp3",
    moduleIndex: 1,
    family: "K10",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: "Uma IA é usada para priorizar quais candidatos receberão uma oportunidade importante. O modelo é rápido, mas seus erros ainda não foram medidos. Que controles você colocaria antes de permitir que a recomendação influenciasse uma decisão de alto impacto?"
  },
  {
    id: "B-PB01",
    audioId: "TB-PB01",
    audioFile: "TB-PB01.mp3",
    moduleIndex: 2,
    family: "PB1",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Conte uma situação em que você tomou uma decisão relevante sem ter todas as informações que gostaria. Como pensou sobre a incerteza e qual decisão tomou?"
  },
  {
    id: "B-PB02",
    audioId: "TB-PB02",
    audioFile: "TB-PB02.mp3",
    moduleIndex: 2,
    family: "PB2",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Você já construiu, organizou ou lançou alguma iniciativa que outras pessoas realmente usaram, frequentaram ou receberam? O que era e qual era sua responsabilidade?"
  },
  {
    id: "B-PB03",
    audioId: "TB-PB03",
    audioFile: "TB-PB03.mp3",
    moduleIndex: 2,
    family: "PB3",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Conte uma experiência em que você precisou pedir algo concreto a outra pessoa — tempo, acesso, apoio, dinheiro, indicação ou reputação — para fazer um projeto avançar. O que aconteceu?"
  },
  {
    id: "B-PB04",
    audioId: "TB-PB04",
    audioFile: "TB-PB04.mp3",
    moduleIndex: 2,
    family: "PB4",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Você já recebeu dinheiro por algo que vendeu, prestou ou organizou, ou participou diretamente de uma negociação que resultou em pagamento? Conte o que você fez e qual foi o resultado?"
  },
  {
    id: "B-PB05",
    audioId: "TB-PB05",
    audioFile: "TB-PB05.mp3",
    moduleIndex: 2,
    family: "PB5",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Conte um momento em que você descobriu que uma premissa sua estava errada e precisou alterar uma decisão. Que evidência mudou sua visão?"
  },
  {
    id: "B-PB06",
    audioId: "TB-PB06",
    audioFile: "TB-PB06.mp3",
    moduleIndex: 2,
    family: "PB6",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 60,
    kind: "question",
    text: "Fale de algo que você tentou fazer e não saiu como esperado. Como percebeu o problema, o que assumiu como responsabilidade sua e o que fez depois?"
  },
  {
    id: "B-CASE-INTRO",
    audioId: "TB-CASE-INTRO",
    audioFile: "TB-CASE-INTRO.mp3",
    moduleIndex: 3,
    family: "CASE-INTRO",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 0,
    kind: "intro",
    text: "A Open Startups School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações.\\n\\nImagine que a escola quer começar com universitários de diferentes cursos.\\n\\nA escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela nem como transformar interessados em participantes ativos.\\n\\nSua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona.\\n\\nPense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final."
  },
  {
    id: "B-CASE-INITIAL",
    audioId: "TB-CASE-INITIAL",
    audioFile: "TB-CASE-INITIAL.mp3",
    moduleIndex: 3,
    family: "CASE-INITIAL",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 180,
    kind: "thinkaloud",
    text: "Explique o que você tentaria descobrir primeiro, como escolheria suas prioridades, o que colocaria em prática nas primeiras 48 horas, o que deixaria para depois, como mediria o resultado e o que faria você rever sua estratégia.",
    silencePrompt: "O que você está considerando neste momento?",
    silenceAfter: 15
  },
  {
    id: "B-CASE-C1",
    audioId: "TB-CASE-C1",
    audioFile: "TB-CASE-C1.mp3",
    moduleIndex: 3,
    family: "CASE-C1",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: "Nova informação: um founder conhecido nesse público, com grande audiência, oferece divulgar a iniciativa. Em troca, quer participar de uma live e pede que a mensagem seja adaptada para a linguagem e os temas que sua audiência costuma consumir.\\n\\nComo isso muda — ou não muda — seu plano? O que você avaliaria antes de aceitar?"
  },
  {
    id: "B-CASE-C2",
    audioId: "TB-CASE-C2",
    audioFile: "TB-CASE-C2.mp3",
    moduleIndex: 3,
    family: "CASE-C2",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: "Mais uma informação: um QR code divulgado na campanha recebeu 800 acessos e apenas 16 pessoas completaram a inscrição.\\n\\nO que esse resultado permite concluir? O que ele não permite concluir? Qual seria seu próximo teste ou decisão?"
  },
  {
    id: "B-PITCH-PREP",
    audioId: "TB-PITCH-PREP",
    audioFile: "TB-PITCH-PREP.mp3",
    moduleIndex: 4,
    family: "PITCH-PREP",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "prep",
    text: "Organize agora uma apresentação curta.\\n\\nVocê falará com uma pessoa que tem autoridade para abrir acesso a estudantes e viabilizar o primeiro experimento.\\n\\nPrepare-se para explicar:\\nqual problema vale a pena atacar;\\nquem é o primeiro público;\\nqual ação vem primeiro;\\npor que essa ação produz aprendizado;\\ne qual compromisso concreto você gostaria de obter."
  },
  {
    id: "B-PITCH",
    audioId: "TB-PITCH",
    audioFile: "TB-PITCH.mp3",
    moduleIndex: 4,
    family: "PITCH",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "pitch",
    text: "Comece quando quiser. Você tem até 90 segundos."
  },
  {
    id: "B-PITCH-REFLECT",
    audioId: "TB-PITCH-REFLECT",
    audioFile: "TB-PITCH-REFLECT.mp3",
    moduleIndex: 4,
    family: "PITCH-REFLECT",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 60,
    kind: "question",
    text: "Qual é hoje a parte mais frágil da sua própria proposta? O que você precisaria aprender para fortalecê-la?"
  },
  {
    id: "B-CLOSE",
    audioId: "TB-CLOSE",
    audioFile: "TB-CLOSE.mp3",
    moduleIndex: 5,
    family: "CLOSE",
    block: "Bloco 5 — Fechamento",
    seconds: 60,
    kind: "question",
    text: "Comparando o que você pensava no início com o que acabou de fazer, alguma capacidade empreendedora ganhou importância para você? Qual e o que aconteceu durante a prova para mudar sua visão?"
  }
];

export const FORMS = {
  B: FORMA_B
};
`;

fs.writeFileSync(targetCanonical, canonicalContent, "utf8");
console.log("canonicalData.js updated to 100% pure Forma B.");

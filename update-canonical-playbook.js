import fs from "fs";

const canonicalDataCode = `// Dados canônicos da avaliação P01 da Open Startup School — FORMA A
// Transcrito integralmente com alta precisão e revisado conforme Playbook Oficial

export const OPENING_AUDIO = {
  id: "TABERTURA",
  filename: "TABERTURA.mp3",
  title: "Abertura Oficial",
  text: \`Bem-vindo à avaliação de competências empreendedoras da Open Startup School. Esta experiência não procura dizer se você é ou não empreendedor. Queremos observar diferentes tipos de evidência. O que você compreende, experiências que já viveu, como raciocina diante de um problema e como comunica uma proposta. Algumas perguntas têm resposta objetiva, outras não têm uma única resposta correta. Quando pedirmos para pensar em voz alta, diga o que passa pela sua cabeça, inclusive dúvidas e mudanças de ideia. Se você não souber uma resposta, diga que não sabe. Isso também é informação útil. Responda sozinho, sem consultar outras pessoas, internet ou ferramentas de inteligência artificial. Você está usando fones de ouvido. Depois de ouvir cada pergunta, responda falando normalmente. Sua resposta será gravada. Vamos começar!\`
};

export const FINAL_AUDIO = {
  id: "TTELA-FINAL",
  filename: "TTELA FINAL.mp3",
  title: "Avaliação Concluída",
  text: \`Obrigado por participar! Sua avaliação foi concluída com sucesso.

Agora, suas respostas serão processadas para gerar um laudo formativo com base nas evidências observadas ao longo desta aplicação. Esse laudo foi pensado para apoiar seu desenvolvimento e não representa um diagnóstico psicológico, uma certificação profissional ou uma previsão de sucesso empresarial.

Esperamos que esse material contribua para o seu desenvolvimento daqui para frente.\`
};

export const MODULE_BLOCKS = [
  { index: 0, title: "Modelo Mental", eyebrow: "Bloco 0" },
  { index: 1, title: "Conhecimentos fundamentais", eyebrow: "Bloco 1" },
  { index: 2, title: "Experiências anteriores", eyebrow: "Bloco 2" },
  { index: 3, title: "Business Problem / Think-Aloud", eyebrow: "Bloco 3" },
  { index: 4, title: "Synthesis / Pitch", eyebrow: "Bloco 4" },
  { index: 5, title: "Fechamento", eyebrow: "Bloco 5" }
];

export const FORMA_A = [
  {
    id: "A-M1",
    audioId: "TA-M1",
    audioFile: "TA-M1.mp3",
    moduleIndex: 0,
    family: "M1",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`Primeiro, pense em alguém que você consideraria muito competente para empreender. Sem usar uma lista pronta, que conhecimentos, capacidades ou maneiras de agir essa pessoa precisaria ter? Fale tudo o que vier à cabeça e explique brevemente porquê.\`
  },
  {
    id: "A-M2",
    audioId: "TA-M2",
    audioFile: "TA-M2.mp3",
    moduleIndex: 0,
    family: "M2",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`Dessas capacidades que você acabou de citar, quais você acredita que já desenvolveu mais? Conte o que faz você pensar isso.\`
  },
  {
    id: "A-M3",
    audioId: "TA-M3",
    audioFile: "TA-M3.mp3",
    moduleIndex: 0,
    family: "M3",
    block: "Bloco 0 — Modelo Mental",
    seconds: 60,
    kind: "question",
    text: \`E agora, por último, qual capacidade empreendedora você acredita ter desenvolvido menos ou quase nunca ter colocado à prova? Explique.\`
  },
  {
    id: "A-K01",
    audioId: "TA-K01",
    audioFile: "TA-K01.mp3",
    moduleIndex: 1,
    family: "K1",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Entrando agora em Knowledge Fundamentals. Uma empresa vende um serviço por R$ 240. Cada venda gera R$ 90 de custos que só existem quando o serviço é prestado. Quanto sobra por venda para ajudar a pagar os custos fixos e gerar resultado? Explique rapidamente sua conta.\`
  },
  {
    id: "A-K02",
    audioId: "TA-K02",
    audioFile: "TA-K02.mp3",
    moduleIndex: 1,
    family: "K2",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Uma adolescente usa uma plataforma de preparação para vestibular todos os dias, mas a assinatura é paga pelos pais. Quem é o usuário e quem é o pagador? Pode haver mais de um papel envolvido?\`
  },
  {
    id: "A-K03",
    audioId: "TA-K03",
    audioFile: "TA-K03.mp3",
    moduleIndex: 1,
    family: "K3",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Uma landing page recebeu 1.200 visitas e 24 inscrições. A frase, as pessoas não entenderam a proposta, é um fato observado, uma interpretação, uma hipótese ou uma decisão? Explique.\`
  },
  {
    id: "A-K04",
    audioId: "TA-K04",
    audioFile: "TA-K04.mp3",
    moduleIndex: 1,
    family: "K4",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Uma empresa fechou vendas suficientes para mostrar lucro no mês, mas os clientes só pagarão daqui a 90 dias e os salários vencem amanhã. A empresa pode ter lucro e mesmo assim ficar sem dinheiro? Por quê?\`
  },
  {
    id: "A-K05",
    audioId: "TA-K05",
    audioFile: "TA-K05.mp3",
    moduleIndex: 1,
    family: "K5",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Antes de um teste, uma equipe decide que continuará a iniciativa somente se conseguir pelo menos 30 inscrições qualificadas em 48 horas. Por que definir esse critério antes de ver o resultado pode melhorar a qualidade da decisão?\`
  },
  {
    id: "A-K06",
    audioId: "TA-K06",
    audioFile: "TA-K06.mp3",
    moduleIndex: 1,
    family: "K6",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Agora você precisa tomar duas decisões. A primeira pode ser revertida amanhã com baixo custo. A segunda envolve um contrato de dois anos e alto impacto financeiro. Você deveria exigir o mesmo nível de análise para as duas? O que muda?\`
  },
  {
    id: "A-K07",
    audioId: "TA-K07",
    audioFile: "TA-K07.mp3",
    moduleIndex: 1,
    family: "K7",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`O que significa ter skin in the game em um projeto ou negócio? Dê um exemplo de alguém que tem e de alguém que não tem.\`
  },
  {
    id: "A-K08",
    audioId: "TA-K08",
    audioFile: "TA-K08.mp3",
    moduleIndex: 1,
    family: "K8",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Uma pessoa diz que quer criar uma plataforma para conectar pequenas empresas a fornecedores locais. Se você precisasse descobrir o principal gargalo antes de construir a tecnologia, o que você faria?\`
  },
  {
    id: "A-K09",
    audioId: "TA-K09",
    audioFile: "TA-K09.mp3",
    moduleIndex: 1,
    family: "K9",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Um grupo de clientes adora seu produto e pede mais três funcionalidades. Um outro grupo tentou usar e abandonou nos primeiros cinco minutos. Se o seu recurso for limitado, em qual dos dois grupos você colocaria mais atenção agora? Por quê?\`
  },
  {
    id: "A-K10",
    audioId: "TA-K10",
    audioFile: "TA-K10.mp3",
    moduleIndex: 1,
    family: "K10",
    block: "Bloco 1 — Conhecimentos fundamentais",
    seconds: 45,
    kind: "question",
    text: \`Qual é a diferença entre um negócio que cresce adicionando custos quase na mesma proporção da receita e um negócio escalável? Dê um exemplo curto.\`
  },
  {
    id: "A-PB01",
    audioId: "TA-PB01",
    audioFile: "TA-PB01.mp3",
    moduleIndex: 2,
    family: "PB1",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Entrando agora no bloco de experiências anteriores. Conte sobre uma iniciativa, projeto, negócio ou evento que você ajudou a começar praticamente do zero. Qual era o seu papel e qual foi o resultado?\`
  },
  {
    id: "A-PB02",
    audioId: "TA-PB02",
    audioFile: "TA-PB02.mp3",
    moduleIndex: 2,
    family: "PB2",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Conte sobre uma vez em que você precisou convencer alguém que não tinha obrigação nenhuma de te ajudar, a apoiar uma ideia, investir, comprar ou participar de algo seu. O que você fez?\`
  },
  {
    id: "A-PB03",
    audioId: "TA-PB03",
    audioFile: "TA-PB03.mp3",
    moduleIndex: 2,
    family: "PB3",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Descreva uma situação em que você precisou resolver um problema importante sem ter dinheiro, recursos suficientes ou ferramentas adequadas. O que você fez?\`
  },
  {
    id: "A-PB04",
    audioId: "TA-PB04",
    audioFile: "TA-PB04.mp3",
    moduleIndex: 2,
    family: "PB4",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Conte sobre uma decisão difícil que você precisou tomar com pouca informação e sem saber com certeza qual seria o resultado. Como você decidiu?\`
  },
  {
    id: "A-PB05",
    audioId: "TA-PB05",
    audioFile: "TA-PB05.mp3",
    moduleIndex: 2,
    family: "PB5",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Descreva um projeto ou meta que você manteve por vários meses, mesmo quando a motivação inicial diminuiu ou quando surgiram obstáculos chatos. O que te manteve em movimento?\`
  },
  {
    id: "A-PB06",
    audioId: "TA-PB06",
    audioFile: "TA-PB06.mp3",
    moduleIndex: 2,
    family: "PB6",
    block: "Bloco 2 — Experiências anteriores",
    seconds: 45,
    kind: "question",
    text: \`Conte um erro, tentativa ou iniciativa sua que não funcionou como você esperava. Qual foi a consequência concreta e o que você fez depois?\`
  },
  {
    id: "A-CASE-INTRO",
    audioId: "TA-CASE-INTRO",
    audioFile: "TA-CASE-INTRO.mp3",
    moduleIndex: 3,
    family: "CASE-INTRO",
    block: "Bloco 3 — Business Problem / Think-Aloud",
    seconds: 0,
    kind: "intro",
    text: \`A Open Startups School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações.

Imagine que a escola quer começar com universitários de diferentes cursos.

A escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela nem como transformar interessados em participantes ativos.

Sua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona.

Pense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final.\`
  },
  {
    id: "A-CASE-INITIAL",
    audioId: "TA-CASE-INITIAL",
    audioFile: "TA-CASE-INITIAL.mp3",
    moduleIndex: 3,
    family: "CASE-INITIAL",
    block: "Bloco 3 — Business Problem / Think-Aloud",
    seconds: 480,
    kind: "thinkaloud",
    text: \`Agora que você entendeu o desafio, queremos saber como você agiria diante dele.

Explique o que você precisa entender primeiro, quais decisões tomaria, o que faria nas primeiras 48 horas, o que não faria ainda, o que mediria e que evidência faria você mudar de direção.\`,
    silencePrompt: "O que você está pensando agora?",
    silenceAfter: 15
  },
  {
    id: "A-CASE-C1",
    audioId: "TA-CASE-C1",
    audioFile: "TA-CASE-C1.mp3",
    moduleIndex: 3,
    family: "CASE-C1",
    block: "Bloco 3 — Business Problem / Think-Aloud",
    seconds: 60,
    kind: "question",
    text: \`Você recebeu uma nova informação: uma universidade oferece acesso direto a 2.000 estudantes, mas pede duas atividades exclusivas para seus alunos e quer que a iniciativa apareça com a marca da universidade junto da marca da escola.

Como essa informação muda ou não muda o seu plano? Pense em voz alta e diga o que avaliaria antes de aceitar.\`
  },
  {
    id: "A-CASE-C2",
    audioId: "TA-CASE-C2",
    audioFile: "TA-CASE-C2.mp3",
    moduleIndex: 3,
    family: "CASE-C2",
    block: "Bloco 3 — Business Problem / Think-Aloud",
    seconds: 60,
    kind: "question",
    text: \`Mais uma informação: depois da primeira campanha, a página recebeu 1.000 visitas e apenas 20 pessoas se inscreveram.

O que esse resultado diz e o que ele ainda não diz? O que você faria em seguida?\`
  },
  {
    id: "A-PITCH-PREP",
    audioId: "TA-PITCH-PREP",
    audioFile: "TA-PITCH-PREP.mp3",
    moduleIndex: 4,
    family: "PITCH-PREP",
    block: "Bloco 4 — Synthesis / Pitch",
    seconds: 120,
    kind: "prep",
    text: \`Agora organize sua proposta.
Considere que você terá 90 segundos para conversar com uma pessoa que pode abrir acesso a estudantes e colocar o primeiro experimento em movimento.

Prepare-se para explicar:
qual é o desafio;
para quem isso importa;
o que você faria primeiro;
por que essa abordagem faz sentido;
e que próximo passo concreto você pediria.\`
  },
  {
    id: "A-PITCH",
    audioId: "TA-PITCH",
    audioFile: "TA-PITCH.mp3",
    moduleIndex: 4,
    family: "PITCH",
    block: "Bloco 4 — Synthesis / Pitch",
    seconds: 90,
    kind: "pitch",
    text: \`Pode começar. Você tem até 90 segundos.\`
  },
  {
    id: "A-PITCH-REFLECT",
    audioId: "TA-PITCH-REFLECT",
    audioFile: "TA-PITCH-REFLECT.mp3",
    moduleIndex: 4,
    family: "PITCH-REFLECT",
    block: "Bloco 4 — Synthesis / Pitch",
    seconds: 45,
    kind: "question",
    text: \`Boa! Se você pudesse melhorar apenas UMA coisa nessa proposta antes de agir amanhã, o que mudaria e por quê?\`
  },
  {
    id: "A-CLOSE",
    audioId: "TA-CLOSE",
    audioFile: "TA-CLOSE.mp3",
    moduleIndex: 5,
    family: "CLOSE",
    block: "Bloco 5 — Fechamento",
    seconds: 120,
    kind: "question",
    text: \`Para finalizar. Depois de passar por esta experiência, existe alguma capacidade empreendedora que passou a parecer mais importante para você do que parecia no começo? Qual e por quê?\`
  }
];

export const FORMS = {
  A: FORMA_A
};
`;

fs.writeFileSync("C:/Users/100OS/Documents/oopenschool-testee/src/data/canonicalData.js", canonicalDataCode, "utf8");
console.log("Updated canonicalData.js with pristine Playbook texts and exact nomenclatures!");

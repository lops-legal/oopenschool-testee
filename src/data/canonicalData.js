// Dados canônicos da avaliação P01 da Open Startup School — FORMA A
// Transcrito integralmente com alta precisão via Groq Whisper API (whisper-large-v3)

export const OPENING_AUDIO = {
  id: "TABERTURA",
  filename: "TABERTURA.mp3",
  title: "Abertura Oficial",
  text: `Bem-vindo à avaliação de competências empreendedoras da Open Startup School. Esta experiência não procura dizer se você é ou não empreendedor. Queremos observar diferentes tipos de evidência. O que você compreende, experiências que já viveu, como raciocina diante de um problema e como comunica uma proposta. Algumas perguntas têm resposta objetiva, outras não têm uma única resposta correta. Quando pedirmos para pensar em voz alta, diga o que passa pela sua cabeça, inclusive dúvidas e mudanças de ideia. Se você não souber uma resposta, diga que não sabe. Isso também é informação útil. Responda sozinho, sem consultar outras pessoas, internet ou ferramentas de inteligência artificial. Você está usando fones de ouvido. Depois de ouvir cada pergunta, responda falando normalmente. Sua resposta será gravada. Vamos começar!`
};

export const FINAL_AUDIO = {
  id: "TTELA-FINAL",
  filename: "TTELA FINAL.mp3",
  title: "Avaliação Concluída",
  text: `Obrigado por participar! Sua avaliação foi concluída com sucesso. Agora, suas respostas serão processadas para gerar um laudo formativo com base nas evidências observadas ao longo desta aplicação. Esse laudo foi pensado para apoiar seu desenvolvimento e não representa um diagnóstico psicológico, uma certificação profissional ou uma previsão de sucesso empresarial. Esperamos que esse material contribua para o seu desenvolvimento daqui para frente.`
};

export const MODULE_BLOCKS = [
  { index: 0, title: "Modelo Mental", eyebrow: "Bloco 0" },
  { index: 1, title: "Conhecimentos fundamentais", eyebrow: "Bloco 1" },
  { index: 2, title: "Experiências anteriores", eyebrow: "Bloco 2" },
  { index: 3, title: "Desafio de negócio", eyebrow: "Bloco 3" },
  { index: 4, title: "Síntese e apresentação", eyebrow: "Bloco 4" },
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
    text: `Primeiro, pense em alguém que você consideraria muito competente para empreender. Sem usar uma lista pronta, que conhecimentos, capacidades ou maneiras de agir essa pessoa precisaria ter? Fale tudo o que vier à cabeça e explique brevemente porquê.`
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
    text: `Dessas capacidades que você acabou de citar, quais você acredita que já desenvolveu mais? Conte o que faz você pensar isso.`
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
    text: `E agora, por último, qual capacidade empreendedora você acredita ter desenvolvido menos ou quase nunca ter colocado à prova? Explique.`
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
    text: `Entrando agora em Knowledge Fundamentals. Uma empresa vende um serviço por R$ 240. Cada venda gera R$ 90 de custos que só existem quando o serviço é prestado. Quanto sobra por venda para ajudar a pagar os custos fixos e gerar resultado? Explique rapidamente sua conta.`
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
    text: `Uma adolescente usa uma plataforma de preparação para vestibular todos os dias, mas a assinatura é paga pelos pais. Quem é o usuário e quem é o pagador? Pode haver mais de um papel envolvido?`
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
    text: `Uma landing page recebeu 1.200 visitas e 24 inscrições. A frase, as pessoas não entenderam a proposta, é um fato observado, uma interpretação, uma hipótese ou uma decisão? Explique.`
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
    text: `Uma empresa fechou vendas suficientes para mostrar lucro no mês, mas os clientes só pagarão daqui a 90 dias e os salários vencem amanhã. A empresa pode ter lucro e mesmo assim ficar sem dinheiro? Por quê?`
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
    text: `Antes de um teste, uma equipe decide que continuará a iniciativa somente se conseguir pelo menos 30 inscrições qualificadas em 48 horas. Por que definir esse critério antes de ver o resultado pode melhorar a qualidade da decisão?`
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
    text: `Agora você precisa tomar duas decisões. A primeira pode ser revertida amanhã com baixo custo. A segunda envolve um contrato de dois anos e alto impacto financeiro. Você deveria exigir o mesmo nível de análise para as duas? O que muda?`
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
    text: `Seu time precisa de uma competência de design por apenas duas semanas e ninguém domina isso internamente. Além de contratar uma pessoa em tempo integral, que outras rotas você consideraria? Como escolheria entre elas?`
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
    text: `O canal A custa R$ 120 para adquirir um cliente. Esse cliente deixa R$ 40 por mês depois dos custos diretos e permanece em média 10 meses. O canal B custa R$ 300 para adquirir um cliente, deixa R$ 90 por mês e permanece em média 20 meses. Qual canal parece economicamente melhor por essa conta simplificada? Explique.`
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
    text: `Bem, um experimento funciona muito bem em uma universidade onde o fundador já é conhecido e tem forte reputação. Podemos concluir que o mesmo resultado ocorrerá em outras universidades? O que ainda precisaríamos saber?`
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
    text: `Para finalizar este bloco, uma ferramenta de inteligência artificial acelera muito uma análise importante, mas ninguém sabe qual é sua taxa de erro, e os erros são difíceis de perceber. Se essa análise for usada em uma decisão de alto impacto, como você desenharia o uso dessa inteligência artificial?`
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
    text: `Entrando no bloco, Prior Behavior. Nos conte alguma coisa que você tenha criado, organizado ou colocado no mundo fora de uma obrigação puramente acadêmica. O que era e qual parte dependia diretamente de você?`
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
    text: `Você já vendeu alguma coisa, cobrou por um serviço, conseguiu uma contribuição financeira ou convenceu alguém a pagar por algo? Nos conte o episódio e o que você fez pessoalmente.`
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
    text: `Conta pra gente uma situação em que você precisou convencer alguém a colocar tempo, acesso, reputação, dinheiro ou outro recurso em algo que você estava propondo. O que você pediu e o que aconteceu?`
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
    text: `Consegue lembrar de alguma decisão importante que você precisou tomar sem ter todas as informações? O que estava incerto? Como decidiu? E o que aconteceu depois?`
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
    text: `Nos conte uma situação em que uma evidência fez você mudar de opinião, de plano ou de prioridade. O que você acreditava antes e o que mudou?`
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
    text: `Conte um erro, tentativa ou iniciativa sua que não funcionou como você esperava. Qual foi a consequência concreta e o que você fez depois?`
  },
  {
    id: "A-CASE-INTRO",
    audioId: "TA-CASE-INTRO",
    audioFile: "TA-CASE-INTRO.mp3",
    moduleIndex: 3,
    family: "CASE-INTRO",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 0,
    kind: "intro",
    text: `A Open Startup School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações. Imagine que a escola quer começar com universitários de diferentes cursos. A escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela, nem como transformar interessados em participantes ativos. Sua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona. Pense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final.`
  },
  {
    id: "A-CASE-INITIAL",
    audioId: "TA-CASE-INITIAL",
    audioFile: "TA-CASE-INITIAL.mp3",
    moduleIndex: 3,
    family: "CASE-INITIAL",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 180,
    kind: "thinkaloud",
    text: `Agora que você entendeu o desafio, queremos saber como você agiria diante dele. Explique o que você precisa entender primeiro. Quais decisões tomaria? O que faria nas primeiras 48 horas? O que não faria ainda? O que mediria? E que evidência faria você mudar de direção?`,
    silencePrompt: "O que você está considerando neste momento?",
    silenceAfter: 15
  },
  {
    id: "A-CASE-C1",
    audioId: "TA-CASE-C1",
    audioFile: "TA-CASE-C1.mp3",
    moduleIndex: 3,
    family: "CASE-C1",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: `Você recebeu uma nova informação. Uma universidade oferece acesso direto a 2 mil estudantes, mas pede duas atividades exclusivas para seus alunos e quer que a iniciativa apareça com a marca da universidade junto da marca da escola. Como essa informação muda ou não muda o seu plano? Pense em voz alta e diga o que avaliaria antes de aceitar.`
  },
  {
    id: "A-CASE-C2",
    audioId: "TA-CASE-C2",
    audioFile: "TA-CASE-C2.mp3",
    moduleIndex: 3,
    family: "CASE-C2",
    block: "Bloco 3 — Desafio de negócio",
    seconds: 60,
    kind: "question",
    text: `Mais uma informação. Depois da primeira campanha, a página recebeu mil visitas e apenas 20 pessoas se inscreveram. O que esse resultado diz e o que ele ainda não diz? O que você faria em seguida?`
  },
  {
    id: "A-PITCH-PREP",
    audioId: "TA-PITCH-PREP",
    audioFile: "TA-PITCH-PREP.mp3",
    moduleIndex: 4,
    family: "PITCH-PREP",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "prep",
    text: `Agora, organize sua proposta. Considere que você terá 90 segundos para conversar com uma pessoa que pode abrir acesso a estudantes e colocar o primeiro experimento em movimento. Prepare-se para explicar. Qual é o desafio? Para quem isso importa? O que você faria primeiro? Por que essa abordagem faz sentido? E que próximo passo concreto você pediria?`
  },
  {
    id: "A-PITCH",
    audioId: "TA-PITCH",
    audioFile: "TA-PITCH.mp3",
    moduleIndex: 4,
    family: "PITCH",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 90,
    kind: "pitch",
    text: `Fique à vontade para começar. Você tem até 90 segundos.`
  },
  {
    id: "A-PITCH-REFLECT",
    audioId: "TA-PITCH-REFLECT",
    audioFile: "TA-PITCH-REFLECT.mp3",
    moduleIndex: 4,
    family: "PITCH-REFLECT",
    block: "Bloco 4 — Síntese e apresentação",
    seconds: 45,
    kind: "question",
    text: `Boa! Se você pudesse melhorar apenas uma coisa nessa proposta antes de agir amanhã, o que mudaria e por quê?`
  },
  {
    id: "A-CLOSE",
    audioId: "TA-CLOSE",
    audioFile: "TA-CLOSE.mp3",
    moduleIndex: 5,
    family: "CLOSE",
    block: "Bloco 5 — Fechamento",
    seconds: 45,
    kind: "question",
    text: `Para finalizar, depois de passar por esta experiência, existe alguma capacidade empreendedora que passou a parecer mais importante para você do que parecia no começo? Qual e por quê?`
  }
];

export const FORMS = {
  A: FORMA_A
};

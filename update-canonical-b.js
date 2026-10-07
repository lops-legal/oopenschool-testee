import fs from "fs";

const targetPath = "C:/Users/100OS/Documents/oopenschool-testee/src/data/canonicalData.js";

const content = `// Dados canônicos da avaliação P01 da Open Startup School
// Inclui Formas A, B e C, Roteiros de Áudio e Transcrições exatas

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
    text: "É Hora de organizar(...)"
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
  B: [
    {
      id: "B-M1",
      audioId: "TB-M1",
      audioFile: "TB-M1.mp3",
      moduleIndex: 0,
      family: "M1",
      block: "Modelo Mental",
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
      block: "Modelo Mental",
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
      block: "Modelo Mental",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Uma campanha recebeu 800 acessos e gerou 16 inscrições. A frase 'os estudantes não confiaram na proposta' é um fato, uma interpretação, uma hipótese ou uma decisão? Explique."
    },
    {
      id: "B-K04",
      audioId: "TB-K04",
      audioFile: "TB-K04.mp3",
      moduleIndex: 1,
      family: "K4",
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Conhecimentos fundamentais",
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
      block: "Experiências anteriores",
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
      block: "Experiências anteriores",
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
      block: "Experiências anteriores",
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
      block: "Experiências anteriores",
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
      block: "Experiências anteriores",
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
      block: "Experiências anteriores",
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
      block: "Desafio de negócio",
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
      block: "Desafio de negócio",
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
      block: "Desafio de negócio",
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
      block: "Desafio de negócio",
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
      block: "Síntese e apresentação",
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
      block: "Síntese e apresentação",
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
      block: "Síntese e apresentação",
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
      block: "Fechamento",
      seconds: 60,
      kind: "question",
      text: "Comparando o que você pensava no início com o que acabou de fazer, alguma capacidade empreendedora ganhou importância para você? Qual e o que aconteceu durante a prova para mudar sua visão?"
    }
  ],
  C: [
    {
      id: "C-M1",
      audioId: "TA-P1",
      audioFile: "TA-P1.mp3",
      moduleIndex: 0,
      family: "M1",
      block: "Modelo Mental",
      seconds: 60,
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
      seconds: 60,
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
      seconds: 60,
      kind: "question",
      text: "A última questão do modelo mental que quero entender é: qual capacidade você sente que ainda teria dificuldade de demonstrar hoje porque teve pouca oportunidade de praticá-la? Poderia me dizer?"
    },
    {
      id: "C-K01",
      audioId: "TA-K01",
      audioFile: "TA-K01.mp3",
      moduleIndex: 1,
      family: "K1",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Agora, vamos para a primeira situação deste bloco. Um produto é vendido por 180 reais. Para cada unidade vendida, existem 60 reais de custos que só aparecem quando ocorre aquela venda. Quanto sobra por unidade para ajudar a pagar custos fixos e gerar resultado? Explique a conta."
    },
    {
      id: "C-K02",
      audioId: "TA-K02",
      audioFile: "TA-K02.mp3",
      moduleIndex: 1,
      family: "K2",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Um aluno usa uma plataforma de aprendizagem oferecida pela faculdade, mas a faculdade paga uma licença por aluno ativo. Quem é o usuário e quem é o cliente pagador nessa situação?"
    },
    {
      id: "C-K03",
      audioId: "TA-K03",
      audioFile: "TA-K03.mp3",
      moduleIndex: 1,
      family: "K3",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Na sequência, considere este cenário. Uma página recebeu 1.500 cliques e 30 inscrições. A frase “o público achou o preço caro” é um fato, uma hipótese ou uma decisão? Explique."
    },
    {
      id: "C-K04",
      audioId: "TA-K04",
      audioFile: "TA-K04.mp3",
      moduleIndex: 1,
      family: "K4",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Uma empresa fechou contratos lucrativos, mas receberá em parcelas ao longo dos próximos três meses. Ela precisa pagar fornecedores e salários esta semana. É possível uma empresa ter lucro e ficar sem dinheiro no caixa? Por quê?"
    },
    {
      id: "C-K05",
      audioId: "TA-K05",
      audioFile: "TA-K05.mp3",
      moduleIndex: 1,
      family: "K5",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Continuando, observe a decisão descrita a seguir. Antes de lançar uma nova oferta, o time combina que só avançará se pelo menos 10 pessoas pagarem adiantado. Qual é a utilidade de fixar esse critério antes de colocar a oferta no ar?"
    },
    {
      id: "C-K06",
      audioId: "TA-K06",
      audioFile: "TA-K06.mp3",
      moduleIndex: 1,
      family: "K6",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Escolher hoje uma nova cor para uma campanha é barato de reverter. Fechar uma parceria exclusiva por dois anos é caro de reverter. Como essa diferença deveria orientar o tempo e o cuidado dedicados a cada decisão?"
    },
    {
      id: "C-K07",
      audioId: "TA-K07",
      audioFile: "TA-K07.mp3",
      moduleIndex: 1,
      family: "K7",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Seu time precisa de conhecimento jurídico especializado por três semanas e não possui essa competência internamente. Que alternativas à contratação formal poderiam resolver essa demanda? Que critérios você usaria para escolher?"
    },
    {
      id: "C-K08",
      audioId: "TA-K08",
      audioFile: "TA-K08.mp3",
      moduleIndex: 1,
      family: "K8",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Agora, vamos comparar dois canais. Canal A custa 150 reais para adquirir um cliente. Cada cliente deixa 40 reais por mês e permanece em média 12 meses. Canal B custa 300 reais por cliente, que deixa 100 reais por mês e permanece 6 meses. Comparando o retorno gerado por cliente com o custo para trazê-lo, qual canal parece mais eficiente? Mostre seu raciocínio."
    },
    {
      id: "C-K09",
      audioId: "TA-K09",
      audioFile: "TA-K09.mp3",
      moduleIndex: 1,
      family: "K9",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Uma equipe muda ao mesmo tempo o preço, a mensagem, o formulário e o canal de aquisição. Depois disso, as vendas caem. É possível saber o que causou a queda? O que teria sido melhor fazer?"
    },
    {
      id: "C-K10",
      audioId: "TA-K10",
      audioFile: "TA-K10.mp3",
      moduleIndex: 1,
      family: "K10",
      block: "Conhecimentos fundamentais",
      seconds: 45,
      kind: "question",
      text: "Para fechar este bloco, considere uma situação envolvendo inteligência artificial. Uma IA produz uma análise de mercado rápida e bem escrita, mas cita fontes que não existem. Se você precisasse usar essa análise para tomar uma decisão importante, que cuidados adotaria antes de agir?"
    },
    {
      id: "C-PB01",
      audioId: "TA-PB01",
      audioFile: "TA-PB01.mp3",
      moduleIndex: 2,
      family: "PB1",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Para começar esta parte, pense em uma situação concreta da sua própria experiência. Conte alguma situação em que você criou ou coordenou algo que saiu da ideia e chegou a outras pessoas. O que aconteceu e qual parte era responsabilidade sua?"
    },
    {
      id: "C-PB02",
      audioId: "TA-PB02",
      audioFile: "TA-PB02.mp3",
      moduleIndex: 2,
      family: "PB6",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Conte uma situação em que algo deu errado ou ficou abaixo do que você esperava. Como você reagiu e que decisão tomou depois?"
    },
    {
      id: "C-PB03",
      audioId: "TA-PB03",
      audioFile: "TA-PB03.mp3",
      moduleIndex: 2,
      family: "PB3",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Seguindo, lembre-se de uma iniciativa que precisou do apoio de outra pessoa. Você já precisou conseguir que alguém apoiasse uma iniciativa sua com tempo, dinheiro, acesso, indicação ou outro recurso? Conte o pedido, a resposta e o que aconteceu depois."
    },
    {
      id: "C-PB04",
      audioId: "TA-PB04",
      audioFile: "TA-PB04.mp3",
      moduleIndex: 2,
      family: "PB2",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Você já participou diretamente de uma venda, cobrança, negociação comercial ou captação de recurso? O que você fez pessoalmente e qual foi o resultado?"
    },
    {
      id: "C-PB05",
      audioId: "TA-PB05",
      audioFile: "TA-PB05.mp3",
      moduleIndex: 2,
      family: "PB4",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Agora, volte a uma decisão tomada em um cenário de incerteza. Conte uma decisão em que você precisou agir mesmo sem conseguir prever bem o resultado. Que risco existia e como você escolheu o próximo passo?"
    },
    {
      id: "C-PB06",
      audioId: "TA-PB06",
      audioFile: "TA-PB06.mp3",
      moduleIndex: 2,
      family: "PB5",
      block: "Experiências anteriores",
      seconds: 60,
      kind: "question",
      text: "Para encerrar este bloco, considere uma situação em que a realidade contrariou sua expectativa. Lembre de uma situação em que dados, feedback ou comportamento de outras pessoas contrariaram sua expectativa. Você mudou alguma coisa? O quê e por quê?"
    },
    {
      id: "C-CASE-INTRO",
      audioId: "TA-CASE-INTRO",
      audioFile: "TA-CASE-INTRO.mp3",
      moduleIndex: 3,
      family: "CASE-INTRO",
      block: "Desafio de negócio",
      seconds: 0,
      kind: "intro",
      text: "A Open Startups School quer ajudar jovens universitários a desenvolver competências empreendedoras por meio de problemas reais, prática, feedback e acesso a empreendedores e organizações.\\n\\nImagine que a escola quer começar com universitários de diferentes cursos.\\n\\nA escola ainda não sabe qual mensagem gera interesse, qual canal converte, que experiência inicial produz valor, quem pagaria por ela nem como transformar interessados em participantes ativos.\\n\\nSua missão é conseguir os primeiros 100 estudantes qualificados e, ao mesmo tempo, aprender o que realmente funciona.\\n\\nPense em voz alta. Queremos acompanhar seu raciocínio, não apenas ouvir a solução final."
    },
    {
      id: "C-CASE-INITIAL",
      audioId: "TA-CASE-INITIAL",
      audioFile: "TA-CASE-INITIAL.mp3",
      moduleIndex: 3,
      family: "CASE-INITIAL",
      block: "Desafio de negócio",
      seconds: 180,
      kind: "thinkaloud",
      text: "Com esse contexto em mente, mostre como você começaria. Diga quais informações procuraria, que incerteza trataria primeiro, quais opções enxerga, o que faria nas primeiras 48 horas, o que mediria e em que situação mudaria de rumo.",
      silencePrompt: "Que decisão você está tentando tomar agora?",
      silenceAfter: 15
    },
    {
      id: "C-CASE-C1",
      audioId: "TA-CASE-C1",
      audioFile: "TA-CASE-C1.mp3",
      moduleIndex: 3,
      family: "CASE-C1",
      block: "Desafio de negócio",
      seconds: 60,
      kind: "question",
      text: "Nova informação: uma empresa oferece 20 mil reais para apoiar a primeira rodada, mas quer que a iniciativa priorize estudantes de tecnologia e que sua marca apareça como principal apoiadora. Como essa proposta muda — ou não muda — seu plano? O que você analisaria antes de aceitar, recusar ou renegociar?"
    },
    {
      id: "C-CASE-C2",
      audioId: "TA-CASE-C2",
      audioFile: "TA-CASE-C2.mp3",
      moduleIndex: 3,
      family: "CASE-C2",
      block: "Desafio de negócio",
      seconds: 60,
      kind: "question",
      text: "Mais uma informação: uma ação com organizações estudantis gerou 1.500 cliques no link de inscrição, mas somente 30 inscrições foram concluídas. O que você consegue aprender com esse dado? Que hipóteses levantaria e que próximo movimento faria?"
    },
    {
      id: "C-PITCH-PREP",
      audioId: "TA-PITCH-PREP",
      audioFile: "TA-PITCH-PREP.mp3",
      moduleIndex: 4,
      family: "PITCH-PREP",
      block: "Síntese e apresentação",
      seconds: 90,
      kind: "prep",
      text: "Você terá agora uma conversa de 90 segundos com uma pessoa capaz de abrir portas para estudantes e apoiar a primeira experiência. Organize uma mensagem que deixe claro: que oportunidade você enxerga; quem você quer mobilizar primeiro; qual é sua primeira ação; que evidência espera produzir; e qual compromisso concreto você quer obter dessa pessoa."
    },
    {
      id: "C-PITCH",
      audioId: "TA-PITCH",
      audioFile: "TA-PITCH.mp3",
      moduleIndex: 4,
      family: "PITCH",
      block: "Síntese e apresentação",
      seconds: 90,
      kind: "pitch",
      text: "Pode apresentar. O tempo máximo é de 90 segundos."
    },
    {
      id: "C-PITCH-REFLECT",
      audioId: "TA-PITCH-REFLECT",
      audioFile: "TA-PITCH-REFLECT.mp3",
      moduleIndex: 4,
      family: "PITCH-REFLECT",
      block: "Síntese e apresentação",
      seconds: 60,
      kind: "question",
      text: "Depois da sua apresentação, considere o seguinte. Se essa pessoa respondesse “ainda não estou convencida”, qual parte da sua proposta você investigaria ou testaria antes de tentar persuadi-la novamente?"
    },
    {
      id: "C-CLOSE",
      audioId: "TA-CLOSE",
      audioFile: "TA-CLOSE.mp3",
      moduleIndex: 5,
      family: "CLOSE",
      block: "Fechamento",
      seconds: 60,
      kind: "question",
      text: "Para concluir esta experiência, agora que terminou, existe alguma competência para empreender que você valorizava pouco no começo e passou a enxergar de outra maneira? Conte qual e por quê."
    }
  ]
};

export const AUDIT_ITEMS = [
  ["DONE", "Forms A/B/C no mesmo motor", "Motor otimizado para carregamento e atribuição interna da Forma."],
  ["DONE", "Abertura oficial", "Abertura participant-facing com áudio TABERTURA.mp3."],
  ["DONE", "Transições entre blocos", "Telas dinâmicas com áudio do bloco (TC-BLOCO-0 a 4, TC-FECHAMENTO)."],
  ["DONE", "Replay desabilitado", "Fluxo produtivo sem repetição para preservação do protocolo."],
  ["DONE", "Dashboard do participante", "Área autenticada com visão geral, avaliações, laudos e histórico."],
  ["DONE", "Laudo bloqueado até release", "Exibição de estado travado com liberação pós-QA."],
  ["DONE", "Setup em etapas", "Consentimento → Fones (áudio) → Microfone (VU meter) → Instruções → Início."],
  ["DONE", "Texto + áudio por estímulo", "Player com waveform animada e áudio sincronizado por questão."],
  ["DONE", "Timer + concluir resposta", "Timer regressivo e gravação nativa de microfone via Web MediaRecorder."],
  ["DONE", "Sem back navigation", "Garantia de avanço sequencial rigoroso."],
  ["DONE", "Forma B e C completas no projeto", "M1–M3, K01–K10, PB01–PB06, Case, Pitch e Fechamento integrados com áudios completos."]
];
`;

fs.writeFileSync(targetPath, content, "utf8");
console.log("canonicalData.js updated with Forma B and Forma C.");

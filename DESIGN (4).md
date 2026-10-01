# DESIGN.md — Open Startup School
Fonte: https://openstartups.net/events/open-startup-school/

## 0. Legenda de confiança
- **[V] Verificado**: aparece literalmente no conteúdo da página.
- **[I] Inferido**: dedução a partir da estrutura e do texto. Provável, mas não confirmada.
- **[P] Proposto**: sugestão minha, não extraída do site.

- **[M] Medido**: cor amostrada por pixel de um print do hero (desktop, 1360px). Valor exato, mas só do que aparece nesse print.

**Limitação:** não tive acesso ao CSS. As cores da seção 2 foram medidas do print do hero; fontes, tamanhos, espaçamentos e breakpoints continuam sem confirmação. **Correção:** a versão anterior destacava `#081D3A` (meta `theme-color`) como cor primária. Isso estava errado: o site real é preto com amarelo-limão.

---

## 1. Identidade
- [V] Marca: **Open Startup School**, parte da **100 Open Startups**.
- [V] Logo: `img/100s.png` (raster, acompanhado do texto "Open Startup School").
- [V] Idioma: pt-BR. Título: "Open Startup School | Competências Empreendedoras na Prática".
- [V] Público: universitários, pessoas que querem empreender, profissionais de inovação.
- [M] Tom visual: dark editorial, alto contraste. Fundo preto, tipografia grande e pesada, destaque em amarelo-limão, fotografia em preto e branco.

## 2. Tokens de cor (medidos do print do hero) [M]
| Token | Valor | Uso observado |
|---|---|---|
| `bg.nav` | `#000000` | Barra de navegação |
| `bg.hero` | `#0B0B0B` a `#141414` | Fundo do hero, gradiente/textura quase imperceptível com arcos concêntricos |
| `border.subtle` | `#292929` | Linha de 1px sob a navegação |
| `accent.lime` | `#E7EC5F` | CTA primário (fundo), palavras em destaque do H1, eyebrow, traço do eyebrow |
| `accent.lime.panel` | `#E6ED51` | Bloco sólido e listras diagonais atrás da foto (quase igual ao lime) |
| `brand.cyan` | `#00ABF8` | Círculo do logo "100 Open Startups" (único uso) |
| `text.primary` | branco (~`#FFFFFF`) | H1, links da nav, corpo |
| `text.on-accent` | preto (~`#000000`) | Texto dentro do botão lime |
| `btn.secondary.border` | branco, 1px | Botão "Conhecer o Laudo", sem preenchimento |

Regra de uso: **preto + branco como base, lime como único acento**. O ciano existe só no logo.

> Fora dos tokens: a meta `theme-color` da página é `#081D3A`, mas ela **não aparece** no visual do hero.

## 3. Outros tokens visuais (leitura do print) [M/I]
```json
{
  "color": {
    "bg.nav": "#000000",
    "bg.hero": "#0B0B0B",
    "border.subtle": "#292929",
    "accent.lime": "#E7EC5F",
    "brand.cyan": "#00ABF8",
    "text.primary": "#FFFFFF"
  },
  "font": {
    "family": "[I] sans-serif geométrica moderna (família exata não confirmada)",
    "display.weight": "[I] bold/extrabold, entrelinha apertada (~1.0)",
    "nav.style": "[I] semibold, ~14px, sentence case",
    "button.style": "[I] caixa alta, semibold, ~13-14px, seta ↗ à direita",
    "eyebrow.style": "[I] caixa alta, semibold, espaçamento entre letras, cor lime"
  },
  "radius": "0 (cantos retos em botões, foto e painéis)",
  "button": {
    "primary": "fundo #E7EC5F, texto preto, sem borda",
    "secondary": "transparente, borda 1px branca, texto branco"
  },
  "layout": {
    "hero": "2 colunas: texto à esquerda (~55%), foto à direita (~30%)",
    "nav.height": "~86px",
    "container": "conteúdo alinhado à esquerda com ~85px de margem em 1360px"
  }
}
```

### Assinatura visual do hero [M]
- **H1 em duas cores:** "Conheça suas" em branco, "competências empreendedoras" em lime, e o ponto final de volta em branco.
- **Eyebrow com traço:** linha curta lime + "OPEN STARTUP SCHOOL" em caixa alta.
- **Foto em preto e branco** (duotone) com **listras diagonais lime** ao fundo e um **bloco sólido lime** no canto superior direito, que quebra o retângulo da foto.
- **Botões retangulares** com seta ↗ em vez de ícone de biblioteca.
- **Corpo do texto** em branco, com o termo "Laudo de Competências Empreendedoras" em negrito.

## 4. Hierarquia tipográfica [V estrutura / I estilo]
| Nível | Uso | Exemplo |
|---|---|---|
| H1 | Promessa do hero, com parte em destaque | "Conheça suas competências empreendedoras." |
| H2 | Título de seção, sempre abaixo de um eyebrow | "As quatro dimensões do comportamento empreendedor…" |
| H3 | Card/dimensão/convidado/plano | "EU", "Oportunidade & Ação", nome do convidado |
| H4 | Itens de checklist e perguntas do hero | "Avaliação de Competências Empreendedoras" |
| Eyebrow | Rótulo curto acima do H2 | "Suas competências", "Como funciona", "Investimento" |
| Ênfase | Negrito inline para termos-chave | **Laudo de Competências Empreendedoras** |

Padrão: **eyebrow → H2 → parágrafo de apoio** se repete em todas as seções.

## 5. Estrutura da página (ordem) [V]
1. **Header/nav fixo?** [I]: logo + 4 âncoras (Suas competências, O Laudo, Edições especiais, FAQ) + CTA "Agendar minha avaliação".
2. **Hero**: eyebrow, H1, parágrafo, 2 CTAs (primário "Agendar minha avaliação", secundário "Conhecer o Laudo"), 3 selos de prova ("Avaliação estruturada", "16 competências avaliadas", "Laudo individual") e imagem `img-hero.png`.
3. **Provocação**: frase de abertura + 4 perguntas reflexivas (H4) + fechamento.
4. **Framework (#framework-strip)**: 4 cards de dimensão.
5. **Metodologia/prova social**: 5 números + texto longo.
6. **Como funciona**: 4 passos numerados.
7. **Datas**: lista de chips de data com indicação de "Edição Especial".
8. **Edições especiais / Convidados (#convidados)**: grade de 9 cards.
9. **O que você recebe**: 3 itens (2 com ✓, 1 com ★).
10. **Investimento**: card de preço único.
11. **Universitários (#condicoes-universitarios)**: mini formulário.
12. **Fundador**: foto + bio + link LinkedIn.
13. **Artigos**: 2 cards.
14. **FAQ (#faq)**: 10 perguntas.
15. **CTA final** e **footer**.

## 6. Componentes e padrões

### 6.1 Botões
- [V] Primário: "Agendar minha avaliação" (repetido **6 vezes**, nav, hero, datas, preço, universitários, CTA final). Leva a `#condicoes-universitarios` no topo e a `https://tally.so/r/5BRqPo` nas seções de conversão.
- [V] Secundário: "Conhecer o Laudo" (âncora `#competencias`).
- [V] Terciário/form: "Consultar condições disponíveis".
- Padrão: **um único verbo de ação, repetido** (consistência de CTA).

### 6.2 Card de dimensão [V]
Estrutura: imagem (Unsplash 800px) → rótulo "Dimensão 0X" → H3 curto → tagline em uma frase → lista numerada de 4 competências (numeração contínua 1–16).

| Dim. | Título | Tagline | Competências |
|---|---|---|---|
| 01 | EU | Construir a si mesmo. | 1–4 |
| 02 | Oportunidade & Ação | Ler o mundo e agir. | 5–8 |
| 03 | Pessoas & Relações | Construir com outros. | 9–12 |
| 04 | Recursos & Valor | Transformar recursos em valor. | 13–16 |

Padrão forte: **dimensão = taxonomia de cor/tag reutilizável** (aparece de novo nos cards de convidados).

### 6.3 Stat / prova numérica [V]
Número em destaque + rótulo + foto: **50 mil** startups, **10 mil** corporações, **270 mil** profissionais, **180 mil** contratos, **R$ 30.5 bi** em negócios. Fotos Unsplash 700px.

### 6.4 Passos numerados [V]
"01 → 04", cada um com H3 imperativo curto ("Escolha uma data", "Faça sua avaliação", "Descubra o que suas respostas revelam", "Receba seu Laudo") e 1 frase.

### 6.5 Chip de data [V]
`OUT 7` (mês abreviado em caixa alta + dia) + "Edição Especial com **Nome**". Datas repetem no mesmo dia (OUT 21 tem dois convidados).

### 6.6 Card de convidado [V]
Foto `img/foto-<nome>.png` → Nome (H3) → empresas separadas por " · " → **tag de dimensão** → título da palestra entre aspas.
Total: 9 convidados. Exceção: "Chicko Sousa" está sem aspas na palestra (inconsistência).

### 6.7 Card de preço [V]
Eyebrow "Investimento" → nome do produto → **R$ 385** → 4 bullets → CTA. Preço único, sem planos comparativos.

### 6.8 Formulário universitário [V]
2 campos (Instituição de ensino, E-mail acadêmico) + botão + nota de rodapé ("As condições podem variar…") + link alternativo "Já tenho voucher".

### 6.9 Bloco do fundador e artigos [V]
Foto `foto-bruno.jpg`, nome, cargo, bio longa, link externo com seta ↗. Artigos: imagem `.jpg` + título em forma de pergunta + link "» Ler artigo".

### 6.10 FAQ [V conteúdo / I interação]
10 perguntas em negrito seguidas de resposta. Provavelmente acordeão, mas o conteúdo chegou expandido.

### 6.11 Footer [V]
Logo, links (100 Open Startups, Congresso de Casos, Termos, Privacidade, Cookies), © 2026.

## 7. Padrões de conteúdo e UX
- **Copy em segunda pessoa** ("seu Laudo", "suas competências") e verbos no imperativo.
- **Perguntas retóricas** no hero e nos títulos de artigos.
- **Redução de ansiedade**: FAQ e microcopy insistem em "não é teste de personalidade", "não existem respostas certas", "mesmo quem nunca empreendeu".
- **Sistema de 4 + 16**: toda a informação se organiza por 4 dimensões e 16 competências.
- **Produto batizado com nome próprio e maiúscula**: "Laudo de Competências Empreendedoras".
- **Autoridade no meio da página**: números, bio do fundador (MIT, FGV, Unicamp), exits e IPO.
- **Conversão em âncora única**: quase tudo leva à mesma ação de agendar.
- **Escassez/calendário**: datas concretas em out/2026 como gatilho.
- **Ícones tipográficos**: ✓ e ★ em vez de biblioteca de ícones; ↗ e » como marcadores.

## 8. Imagens e assets
- [V] Locais: `/events/open-startup-school/img/` → `100s.png`, `img-hero.png`, `foto-*.png` (convidados), `foto-bruno.jpg`, `artigo-*.jpg`.
- [V] Stock: Unsplash com `auto=format&fit=crop&w=800&q=80` (dimensões) e `w=700` (stats). Temas: universitários, colaboração, equipes jovens.
- [I] Convenção de alt text: descritivo e em pt-BR nas imagens de stock; vazio em fotos de pessoas e hero.
- [V] Serviços externos: Tally (inscrição), Vercel (páginas legais), LinkedIn.

## 9. O que falta e como obter
As cores da seção 2 cobrem só o hero. Para **cores das demais seções (cards, preço, FAQ, footer, possíveis seções claras), fonte exata, escala tipográfica, espaçamento, sombras, breakpoints e animações**, preciso de uma destas opções:
1. O HTML completo (DevTools → Elements → copiar `<html>`), ou o arquivo CSS.
2. Prints de desktop e mobile de cada seção.
3. Uma lista de `:root { --* }` (variáveis CSS) copiada do DevTools.

Com qualquer uma, completo a seção 3 com tokens reais e gero o `tokens.json`/Tailwind config.

## 10. Observações
- Dados institucionais do rodapé citam "5º Congresso Latino-Americano de Casos de Open Innovation", o que sugere que o layout foi reaproveitado de outra página do mesmo ecossistema.
- Nome do convidado difere: "Francisco Ricardo Blagevitch" (datas) vs. "Ricardo Blaguevitch" (card). Vale padronizar.

# The Closet — Projeto Final da Disciplina

**Disciplina:** Desenvolvimento Web para Dispositivos Móveis
**Tipo de projeto:** Site de comércio eletrônico (front-end) — moda masculina: roupas, acessórios, calçados e perfumes
**Equipe (trio):** Fabiano Mello · Simon Tsui · Tiago Cassol

> Este é o **esboço** do projeto: estrutura completa, layout responsivo e funcionalidades já funcionando. Os textos são simulados e as imagens são *placeholders* em SVG que devem ser trocados por fotos reais (com créditos em `docs/CREDITOS.md`).

---

## 1. Como abrir

1. Abra a pasta no VS Code e use a extensão **Live Server** (recomendado), ou dê dois cliques em `index.html` no Google Chrome.
2. É preciso internet para carregar as fontes (Google Fonts), jQuery e os plugins (CDN).

## 2. Estrutura de arquivos

```
Projeto Final da Disciplina/
├── index.html          Página inicial (banner carousel, benefícios, departamentos, mais vendidos)
├── masculino.html      Vitrine masculina com filtro e ordenação
├── acessorios.html     Acessórios masculinos: vitrine com filtro/ordenação + guia (accordion)
├── calcados.html       Vitrine de calçados masculinos + accordion de dúvidas
├── perfumes.html       Vitrine de perfumes + accordion de famílias olfativas
├── sobre.html          História, vídeo, galeria (lookbook com lightbox), equipe, áudio
├── contato.html        Formulário com validação, mapa e FAQ (accordion)
├── checkout.html       Carrinho de compras e formulário de checkout demonstrativo
├── css/style.css       Único arquivo de estilos (mobile-first)
├── js/main.js          Scripts (jQuery + plugins + funções próprias)
├── img/                Imagens (trocar os SVG por fotos .webp otimizadas)
├── media/              (criar) vídeo .mp4 e áudio .mp3 usados em sobre.html
├── docs/CREDITOS.md    Créditos de imagens, textos e bibliotecas
└── README.md           Esta documentação
```

## 3. Atendimento aos requisitos do enunciado

### Requisitos de conteúdo (mínimos)

| Requisito | Onde está | Status |
|---|---|---|
| Navegação principal e checkout | 8 páginas: Início, Masculino, Acessórios, Calçados, Perfumes, Sobre, Contato e Checkout | ✅ |
| 1 formulário com ao menos 5 elementos | `contato.html`: nome, e-mail, telefone, CPF, CEP, assunto (select), data, radio, checkbox, textarea, aceite — 11 campos | ✅ |
| 1 galeria de fotos | `sobre.html#lookbook` (galeria em mosaico + lightbox) e vitrines de produtos | ✅ |
| Menu responsivo | Menu "hambúrguer" no celular, horizontal a partir de 52em | ✅ |
| Técnicas de otimização | Ver seção 5 | ✅ |
| Fontes externas | Google Fonts: *Playfair Display* (títulos) e *Inter* (textos) | ✅ |
| 2 plugins/bibliotecas JS | **Slick Carousel** (banner e mais vendidos) e **jQuery Mask** (máscaras CPF/telefone/CEP), ambos sobre **jQuery** | ✅ |

### Requisitos técnicos

**HTML5**
- Sectioning tags: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `address`
- Títulos hierárquicos (`h1` por página → `h2` por seção → `h3` por item)
- Navegação com links e âncoras (`sobre.html#lookbook`, `contato.html#faq`, link "Pular para o conteúdo")
- Imagens (`img` com `width/height/alt`), **vídeo** (`video`) e **áudio** (`audio`) em `sobre.html`
- Formulário com elementos novos (`email`, `tel`, `date`, `inputmode`, `required`, `maxlength`) e antigos (`select`, `radio`, `checkbox`, `textarea`, `fieldset/legend`)
- Nenhuma `table` é usada para layout

**CSS3**
- Seletores complexos: `.menu li > a[aria-current="page"]`, `.breadcrumb li + li::before`, `.hero__slides:not(.slick-initialized) .hero__slide + .hero__slide`, `.menu-toggle[aria-expanded="true"] span:nth-child(1)`
- Sombras (`box-shadow`, `text-shadow`), gradientes (`linear-gradient`), bordas arredondadas
- **Múltiplos backgrounds** (`.cabecalho-pagina`: gradiente + imagem)
- Transformações (`scale`, `rotate`, `translateY`) e transições
- Animações com `@keyframes` (`subir`, `aparecer`, `pulsar`)
- **Grid** (vitrine, galeria em mosaico, rodapé, formulário) e **Flexbox** (cabeçalho, categorias, cards, filtros)
- **Fluid grid** (`width: 92%`, `fr`, `minmax`, `clamp()`)
- **Media queries mobile-first** (`min-width`)

**JavaScript / jQuery**
- Eventos: `click` (menu, carrinho, accordion, galeria), `mouseover/mouseout` (selos dos produtos), `change` (filtro e ordenação), `blur/focus` (validação), `input`, `submit`, `scroll`, `keydown` (Esc fecha lightbox)
- Funções próprias: `paraNumero()`, `marcarCampo()`, `validarCampo()`, `validarCPF()`, `lerCarrinho()/gravarCarrinho()`, `fecharLightbox()`
- O carrinho salva os produtos escolhidos no navegador e apresenta o resumo e as opções de pagamento em `checkout.html`; pagamentos não são processados.
- Plug-ins/efeitos: carousel, accordion, lightbox, máscaras, botão voltar ao topo

## 4. Mobile-first e breakpoints baseados no conteúdo

O CSS base é o do celular; as media queries só **acrescentam** regras com `min-width`. Os pontos de quebra foram escolhidos onde o **conteúdo** pede mudança (redimensionando a janela no DevTools), e não por modelo de aparelho:

| Breakpoint | Motivo (conteúdo) | O que muda |
|---|---|---|
| `36em` (~576px) | Dois cards de produto cabem lado a lado sem quebrar preço e botão | Vitrine 2 colunas, galeria 3 colunas, formulário em duas colunas |
| `52em` (~832px) | Os 7 itens do menu cabem inteiros na barra | Menu horizontal, vitrine 3 colunas, galeria em mosaico, contato com mapa ao lado |
| `72em` (~1152px) | Sobra espaço lateral nos cards de 3 colunas | Vitrine 4 colunas, mais respiro nas seções |

Unidades em `em` para acompanhar o zoom/tamanho de fonte do usuário.

## 5. Técnicas de otimização aplicadas

- `loading="lazy"` e `decoding="async"` em imagens abaixo da dobra; `fetchpriority="high"` no 1º banner
- `width` e `height` em todas as imagens (evita *layout shift*)
- `preconnect` para Google Fonts e CDN; fontes com `display=swap`
- Scripts com `defer` no fim do `body` (não bloqueiam a renderização)
- Bibliotecas `.min` via CDN (cache compartilhado)
- Um único CSS e um único JS próprios (menos requisições)
- Vídeo e áudio com `preload="none"`; mapa (`iframe`) com `loading="lazy"`
- `prefers-reduced-motion` desativa animações para quem prefere
- **A fazer na versão final:** converter fotos para **WebP** (Squoosh/TinyPNG), largura máx. 1600px no banner e 600px nos produtos; gerar `css/style.min.css` e `js/main.min.js` e apontar as páginas para eles; testar no **Lighthouse** (meta ≥ 90 em Performance)

## 6. Validação (checklist antes da entrega)

- [ ] HTML de todas as páginas no validador W3C: <https://validator.w3.org/> (upload de arquivo)
- [ ] CSS no validador W3C: <https://jigsaw.w3.org/css-validator/>
- [ ] Testar no Chrome DevTools (modo dispositivo) em 360px, 768px, 1024px e 1440px
- [ ] Testar navegação só pelo teclado (Tab, Enter, Esc)
- [ ] Lighthouse: Performance, Acessibilidade, Boas práticas, SEO
- [ ] Conferir créditos em `docs/CREDITOS.md`

> O esboço já foi verificado com um validador automático de HTML (sem erros). Ainda assim, rodem o validador oficial da W3C antes da entrega.

## 7. Divisão de tarefas sugerida

| Integrante | Páginas | Componentes |
|---|---|---|
| Fabiano Mello | Início, Masculino, Acessórios | Cabeçalho/menu responsivo, carousel (Slick), cards de produto |
| Simon Tsui | Calçados, Perfumes | Filtro/ordenação da vitrine, accordion |
| Tiago Cassol | Sobre, Contato | Galeria + lightbox, vídeo/áudio, formulário, validação, máscaras |
| Todos | — | Fotos reais, textos, créditos, validação W3C, documentação |

## 8. Próximos passos

1. Definir nome e identidade visual definitivos (hoje: "The Closet", paleta vinho/azul-marinho).
2. Substituir os SVG de `img/` por fotos reais em WebP, mantendo os mesmos nomes de arquivo.
3. Adicionar `media/institucional.mp4` e `media/podcast.mp3`.
4. Fotos dos integrantes: trocar img/masc-3, fem-3 e inf-3 em `sobre.html`.
5. Pedir aprovação do professor para o uso de jQuery, Slick e jQuery Mask (o enunciado exige acordo prévio).
6. Rodar o checklist da seção 6.

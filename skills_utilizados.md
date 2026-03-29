# Padrões e Skills Utilizados - Espacinho da Coordenadora Quesia 🎀

Aqui estão as diretrizes, tecnologias e "skills" utilizados na criação deste aplicativo. Você pode usar este documento como uma referência futura para construir novas ferramentas com a mesma identidade visual e de código.

## 1. Stack Tecnológico (Skills Core)
- **Vite:** Ferramenta de build super rápida para inicializar o projeto.
- **React:** Biblioteca para construção da interface baseada em componentes.
- **React Router Dom:** Gerenciamento de rotas e navegação lateral (Sidebar e MainLayout).
- **Lucide React:** Biblioteca de ícones limpos e profissionais, que combinam com o design clean e amigável.
- **Vanilla CSS:** Uso de CSS puro com variáveis globais (CSS Variables) para controle total das cores e estilo flexível sem depender de frameworks complexos que ingessam o visual.

## 2. Padrões de Design UI/UX
O aplicativo usa uma estética *Soft & Cute* (focada no público da Educação/Coordenação), e as seguintes variáveis e padrões devem ser respeitados em projetos futuros:

### Tipografia
- **Fonte Principal:** `Nunito` (Google Fonts). Uma fonte arredondada que transmite proximidade, simpatia e leveza.
- **Pesos Utilizados:** `400` (normal), `600` (semi-bold para textos da interface), `700` (bold), `800/900` (black para títulos de destaque).

### Paleta de Cores (CSS Variables Globais)
```css
/* Core Colors */
--bg-color: #fcf4f9;        /* Fundo principal (rosa muito claro) */
--sidebar-bg: #fff8fc;      /* Fundo da barra lateral */
--primary-pink: #f4a6c8;    /* Rosa principal (destaques, ícones) */
--primary-purple: #c3b0f5;  /* Roxo principal (títulos, ícones de destaque) */

/* Text Colors */
--text-main: #5a455a;       /* Texto escuro com subtom rosado */
--text-muted: #8a758a;      /* Texto secundário */

/* Status Colors */
--success-green: #6bc27b;   /* Verde para status concluído/ok */
--danger-red: #ea7a8b;      /* Vermelho para alertas/pendências */
--warning-yellow: #fcd57e;  /* Amarelo para avisos/atenção */
```

### Componentização
Sempre quebre a interface nestes componentes principais:
1. **Sidebar:** Fixo à esquerda, usa links com "active state" na cor de destaque.
2. **Header:** Fixo no topo do container principal, carrega título, saudações e notificações (ex: Badges com número).
3. **Card:** O elemento central de "agrupamento". Fundo branco, bordos super arredondados (`border-radius: 20px` ou `24px`), sombra de cor pastel (`rgba(220, 190, 210, 0.15)`).
4. **Custom Tables:** Tabelas limpas, sem bordas verticais, com linhas pontilhadas (`dashed`) na cor rosa clara e espaçamento generoso.
5. **Badge/Status Dots:** Uso pequeno e vibrante de cores para mostrar status nas tabelas de sequências e calendários.

## 3. Micro-interações (Animações)
- Adicione classes `.animate-fade-in` nas páginas principais para suavizar a entrada da tela.
- Nos botões (`.btn`) e crachás de navegação, use a transição `transition: all 0.2s ease` combinada com um `transform: translateY(-2px)` no `:hover` para dar a sensação de que a interface está viva e reage ao toque/mouse.

## 4. Estrutura de Como Iniciar um Novo Projeto Similar
1. Rode: `npx create-vite meu-novo-app --template react`
2. Instale: `npm install react-router-dom lucide-react`
3. Crie os componentes padronizados (`Card`, `Sidebar`, `MainLayout`).
4. Copie o arquivo `index.css` global deste projeto, pois ele já contém toda a configuração de variáveis de sombra, arredondamentos (`radius-lg`) e animações.

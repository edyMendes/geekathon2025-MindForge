# Gestor de Ração — React + Vite + Tailwind (PostCSS)

Versão com Tailwind configurado a sério (PostCSS + `tailwind.config.js`), sem CDN.  
Inclui AOS, anime.js e react-feather.

## Como correr
```bash
# 1) Instalar deps
npm install

# 2) Dev server
npm run dev

# 3) Build de produção
npm run build && npm run preview
```

## Estrutura
```
.
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
└─ src
   ├─ index.css         # @tailwind base; components; utilities
   ├─ main.jsx          # importa index.css + AOS CSS
   ├─ App.jsx
   ├─ components
   │  ├─ ChickenForm.jsx
   │  └─ Recommendations.jsx
   └─ utils
      └─ calculate.js
```

## Rotas e Estrutura
- `/` — **Dashboard**: formulário + recomendações (usa as Configurações por baixo).
- `/relatorios` — **Relatórios**: cartões de exportação (placeholders prontos para ligar a dados).
- `/configuracoes` — **Configurações**: define preços por kg e razão água:ração; guardados em `localStorage`.
### Onde ligar a dados reais?
- Ajusta `src/hooks/useSettings.js` para vir de API.
- Em `src/utils/calculate.js` já aceito overrides de `settings` (preços e razão de água).
- O Dashboard passa `settings` para o cálculo.


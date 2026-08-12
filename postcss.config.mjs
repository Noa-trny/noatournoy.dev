// Tailwind v4 passe par PostCSS et non plus par un `tailwind.config.js` : la
// configuration vit desormais dans la feuille elle-meme, en `@theme`. C'est
// pourquoi ce fichier est le seul reglage necessaire.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

# noatournoy.dev

La page d'accueil de l'apex — une seule `index.html`, zéro requête externe, zéro build.

## Mise en ligne (une fois)

1. **vercel.com/new** → Import `Noa-trny/noatournoy.dev` → Framework « Other » → Deploy.
2. Dans le projet Vercel : **Settings → Domains → Add** → `noatournoy.dev`.
3. Chez name.com (`My Domains → noatournoy.dev → Manage DNS`) : ajouter l'enregistrement **A**
   que Vercel affiche (host `@`), TTL 300. Le certificat se provisionne tout seul.

Les mises à jour suivantes : éditer `index.html`, pousser sur `main`, c'est déployé.

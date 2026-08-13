import { NextResponse, type NextRequest } from "next/server";

// La CSP vit ici et nulle part ailleurs : elle porte un nonce different a chaque
// requete, ce qu'un en-tete statique dans next.config.ts ne peut pas faire.
//
// Next lit le nonce dans l'en-tete Content-Security-Policy de la *requete* et le
// repose sur ses propres <script> inline. C'est pour cela qu'on pose l'en-tete
// deux fois : sur la requete (pour que Next le trouve) et sur la reponse (pour
// que le navigateur l'applique).

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";

  const csp = [
    `default-src 'none'`,
    // `'wasm-unsafe-eval'` est exige par le decodeur Meshopt, qui appelle
    // WebAssembly.instantiate sur un module embarque en base64. C'est un
    // affaiblissement REEL mais etroit : il autorise la compilation WASM, jamais
    // eval() sur du JavaScript. Le modele de la maison est compresse en
    // EXT_meshopt_compression — 2,9 Mo au lieu de 9,7.
    //
    // Rien d'autre n'est ajoute : pas de worker-src blob:, parce que
    // MeshoptDecoder.useWorkers() n'est pas appele et que GLTFLoader ne le fait
    // pas de lui-meme. Et pas de decodeur Draco, qui aurait exige d'auto-heberger
    // quatre fichiers et d'ouvrir les workers depuis des blob:.
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ""}`,
    // En developpement, PAS de nonce sur style-src : l'overlay de Next injecte
    // des <style> inline, et la specification CSP fait ignorer 'unsafe-inline'
    // des qu'un nonce est present dans la meme directive. Les mettre tous les
    // deux revenait donc a tout bloquer.
    dev ? `style-src 'self' 'unsafe-inline'` : `style-src 'self' 'nonce-${nonce}'`,
    // <next-route-announcer> pose un style= inline que rien ne desactive.
    // Cela n'autorise que les attributs : les blocs <style> restent interdits.
    `style-src-attr 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    // `blob:` est exige par le decodeur Meshopt, qui recupere son module WASM
    // par une URL d'objet. Sans lui : « Fetch API cannot load blob:... Refused
    // to connect ». La portee reste etroite — un blob: ne peut venir que de
    // notre propre document.
    `connect-src 'self' blob:${dev ? " ws:" : ""}`,
    `manifest-src 'self'`,
    `base-uri 'none'`,
    `form-action 'none'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Les actifs statiques n'ont pas besoin de nonce et ne doivent pas payer
      // une invocation de fonction a chaque requete.
      source:
        "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|apple-touch-icon\\.png|og\\.png|robots\\.txt|fonts/|assets/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};


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
    // 'wasm-unsafe-eval' n'arrive qu'avec le decodeur Meshopt, en phase 7.
    `script-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-inline'" : ""}`,
    // <next-route-announcer> pose un style= inline que rien ne desactive.
    // Cela n'autorise que les attributs : les blocs <style> restent interdits.
    `style-src-attr 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'${dev ? " ws:" : ""}`,
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
        "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|apple-touch-icon\\.png|og\\.png|robots\\.txt|fonts/|assets/|models/|hdr/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};


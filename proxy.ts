import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PORTAL_PREFIX = "/portal";
const ADMIN_LOGIN = "/login";
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/portal/signup", "/portal/confirmar"];
const PUBLIC_PATHS = ["/", ADMIN_LOGIN, "/privacidade", "/pedido", "/hub"];
const COOKIE_LEMBRAR = "fiscalis-lembrar";

// Só verifica "há sessão válida?" aqui — não faz nenhuma query extra à tabela
// profiles a cada pedido (isso ficava caro: um pedido à Auth + um à base de
// dados em CADA navegação). O papel exato (admin/client) é confirmado uma
// única vez, já dentro do layout de cada área, que só corre quando essa
// área é mesmo visitada.
//
// Tudo aqui dentro está protegido por um try/catch total: se o Supabase
// estiver indisponível, a limitar pedidos, ou faltar alguma variável de
// ambiente, o pedido segue em frente sem sessão em vez de derrubar o site
// inteiro com um erro 500 — as páginas protegidas já sabem lidar com "sem
// sessão" (mandam para login), e essa falha aparece de forma normal em vez
// de um ecrã em branco.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error("proxy.ts: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY em falta no ambiente.");
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          // Se o utilizador escolheu não "manter-me ligado", cada renovação
          // de sessão continua a gravar os cookies só para esta sessão do
          // browser (sem maxAge), em vez de o Supabase os tornar persistentes
          // outra vez sozinho a cada refresh.
          const esquecerAoFechar = request.cookies.get(COOKIE_LEMBRAR)?.value === "0";
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(
              name,
              value,
              esquecerAoFechar ? { ...options, maxAge: undefined, expires: undefined } : options
            )
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPortalArea = pathname.startsWith(PORTAL_PREFIX);
    const isPortalPublic = PORTAL_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    const isAdminArea = !isPortalArea && !PUBLIC_PATHS.includes(pathname);

    if (isAdminArea && !user) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }

    if (isPortalArea && !isPortalPublic && !user) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }

    // Utilizador já autenticado a abrir um ecrã de login: manda para "/",
    // que faz UMA query para saber o papel e reencaminha para o sítio certo.
    if (user && (pathname === ADMIN_LOGIN || isPortalPublic)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (err) {
    console.error("proxy.ts: falha inesperada, a deixar o pedido seguir sem sessão.", err);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PORTAL_PREFIX = "/portal";
const ADMIN_LOGIN = "/login";
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/portal/signup", "/portal/confirmar"];
const PUBLIC_PATHS = ["/", ADMIN_LOGIN];

// Só verifica "há sessão válida?" aqui — não faz nenhuma query extra à tabela
// profiles a cada pedido (isso ficava caro: um pedido à Auth + um à base de
// dados em CADA navegação). O papel exato (admin/client) é confirmado uma
// única vez, já dentro do layout de cada área, que só corre quando essa
// área é mesmo visitada.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Se o Supabase estiver lento/indisponível/a limitar pedidos por instantes,
  // isto não pode deitar o site abaixo inteiro — trata-se como "sem sessão"
  // (as áreas protegidas mandam para login, o que é o comportamento seguro).
  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch {
    user = null;
  }

  const { pathname } = request.nextUrl;

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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

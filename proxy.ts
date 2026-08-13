import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PORTAL_PREFIX = "/portal";
const ADMIN_LOGIN = "/login";
const PORTAL_PUBLIC_PATHS = ["/portal/login", "/portal/signup", "/portal/confirmar"];
const PUBLIC_PATHS = ["/", ADMIN_LOGIN];

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  let role: "admin" | "client" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (profile?.role as "admin" | "client" | undefined) ?? null;
  }

  const isPortalArea = pathname.startsWith(PORTAL_PREFIX);
  const isPortalPublic = PORTAL_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAdminArea = !isPortalArea && !PUBLIC_PATHS.includes(pathname);

  if (isAdminArea && (!user || role !== "admin")) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
  }

  if (isPortalArea && !isPortalPublic && (!user || role !== "client")) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  if (pathname === ADMIN_LOGIN && user && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPortalPublic && user && role === "client") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

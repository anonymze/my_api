export const COOKIE_JWT_NAME = "jwt";

const parseCookies = (cookieHeader: string | null) => {
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies.set(name, value);
    }
  });

  return cookies;
};

export const getCookie = (headers: Bun.BunRequest["headers"], name: string) => {
  const cookieHeader = headers.get("cookie");
  const cookies = parseCookies(cookieHeader);
  return cookies.get(name);
};

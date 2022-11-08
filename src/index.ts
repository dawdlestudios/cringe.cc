import createPage from "./create.html";
import notFoundPage from "./404.html";
export interface Env {
  SHORT_URLS: KVNamespace;
  PASS: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    const ua = request.headers.get("user-agent") || "";
    const isBot = ua && (ua.includes("Discordbot") || ua.includes("Slackbot") || ua.includes("TelegramBot") || ua.includes("WhatsApp"));

    if (request.method === "POST" || request.method === "DELETE") {
      if (request.headers.get("Authorization") !== (env.PASS ?? "sus")) {
        return new Response("Unauthorized", { status: 401 });
      }

      const body = await request.text();
			if (request.method === "DELETE") {
				await env.SHORT_URLS.delete(pathname);
				return new Response("Deleted", { status: 200 });
			}

			await env.SHORT_URLS.put(pathname, body);
      return new Response(`${body}`, {
        status: 201,
      });
    }

    if (pathname === "/create") {
      return new Response(createPage, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
    }

    if (pathname === "/") {
      return Response.redirect("https://cringe.cc/create", 301);
    }

    let redirectURL = await env.SHORT_URLS.get(pathname);
    
    if (!redirectURL) {
      return new Response(notFoundPage, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
				status: 404,
      });
    }

    let fakeURL;
    if (redirectURL.includes("$$")) {
      [redirectURL, fakeURL] = redirectURL.split("$$");
    }

    if (isBot && fakeURL) return Response.redirect(fakeURL, 301);
    return Response.redirect(redirectURL, 301);
  },
};

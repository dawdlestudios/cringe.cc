import createPage from "./create.html";
import notFoundPage from "./404.html";

export interface Env {
  SHORT_URLS: KVNamespace;
  PASS: string;
}

const basePath = "https://cringe.cc";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "POST" || request.method === "DELETE") {
			console.log(request.headers.get("Authorization"));
			
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
      return Response.redirect("https://www.youtube.com/watch?v=6n3pFFPSlW4", 301);
    }

    console.log(await env.PASS);

    const redirectURL = await env.SHORT_URLS.get(pathname);
    console.log(redirectURL);

    if (!redirectURL) {
      return new Response(notFoundPage, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
				status: 404,
      });
    }

    return Response.redirect(redirectURL, 301);
  },
};

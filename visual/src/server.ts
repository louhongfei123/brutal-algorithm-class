import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";
import {
  Channel,
  sleep,
} from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import { default as graphql } from "https://creatcodebuild.github.io/graphql-projects/deno-graphql-port/dist/graphql.js";

import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "https://deno.land/std/ws/mod.js";

try {
  var schema = graphql.buildSchema(`
    schema {
        subscription: Subscription
        query: Query
    }
    type Query {
        x: String
    }
    type Subscription {
        hello: String
    }
  `);
} catch (e) {
  console.error(e.message, e.locations);
  Deno.exit(1);
}

var root = {
  hello: () => "Hello world!",
};

let x = await graphql.graphql(schema, `subscription {hello}`, root);
console.log(x);

/** websocket echo server */
const port = Deno.args[0] || "8081";
console.log(`websocket server is running on :${port}`);
let allConnections = [];
for await (const req of serve(`:${port}`)) {
  if (allConnections.length >= 2) {
    await req.respond({ status: 400 });
  }
  let conn = servePerRequest(req);
  allConnections.push(conn);
}

async function servePerRequest(req: ServerRequest) {
  const { conn, r: bufReader, w: bufWriter, headers } = req;

  try {
    const sock = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });

    console.log("socket connected!");

    try {
      for await (const ev of sock) {
        if (typeof ev === "string") {
          // text message
          console.log("ws:Text", ev);
          while (1) {
            await sleep(500);
            await sock.send(
              JSON.stringify(await graphql.graphql(schema, ev, root)),
            );
          }
        } else if (ev instanceof Uint8Array) {
          // binary message
          console.log("ws:Binary", ev);
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping
          console.log("ws:Ping", body);
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          console.log("ws:Close", code, reason);
        }
      }
    } catch (err) {
      console.error(`failed to receive frame: ${err}`);

      if (!sock.isClosed) {
        await sock.close(1000).catch(console.error);
      }
    }
  } catch (err) {
    console.error(`failed to accept websocket: ${err}`);
    await req.respond({ status: 400 });
  }
}

// Create WebSocket connection.
import {
  chan,
  SelectableChannel,
  // @ts-ignore
} from "https://creatcodebuild.github.io/csp/dist/csp.ts";

class WC<T> implements SelectableChannel<T> {
  constructor(
    private receive: SelectableChannel<T>,
    private readyChan: SelectableChannel<T>,
    private socket: WebSocket,
  ) {
  }

  async put(ele: T): Promise<void> {
    return this.socket.send(`${ele}`);
  }
  pop(): Promise<T> {
    return this.receive.pop();
  }
  close() {
    this.socket.close();
  }
  closed(): boolean {
    return this.socket.readyState === this.socket.CLOSED;
  }
  async ready(i: number): Promise<number> {
    if (this.closed()) {
      return i;
    }
    await this.readyChan.pop();
    return i;
  }
  // [Symbol.asyncIterator]() {
  //     return this;
  // }
}

export async function WebSocketClient(url: string): Promise<WC<any>> {
  const socket = new WebSocket(url);
  await new Promise((resolve) => {
    socket.onopen = (event) => {
      console.log(event);
      resolve();
    };
  });
  let receive = chan();
  let ready = chan();
  socket.addEventListener("message", async function (event) {
    ready.put(null);
    console.log("on message", event);
    await receive.put(event.data);
  });
  return new WC(receive, ready, socket);
}

export class GraphQLSubscriptionClient implements SelectableChannel {
  constructor(private webSocketClient: WC<string>) {}

  async pop() {
    return this.webSocketClient.pop();
  }
}

export async function GraphQLSubscription(
  document: string,
  webSocketClient: WC<string>,
): Promise<GraphQLSubscriptionClient> {
  await webSocketClient.put(document);
  return new GraphQLSubscriptionClient(webSocketClient);
}

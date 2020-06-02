// Create WebSocket connection.
import { chan, } from "https://creatcodebuild.github.io/csp/dist/csp.js";
class WC {
    constructor(receive, readyChan, socket) {
        this.receive = receive;
        this.readyChan = readyChan;
        this.socket = socket;
    }
    async put(ele) {
        return this.socket.send(`${ele}`);
    }
    pop() {
        return this.receive.pop();
    }
    close() {
        this.socket.close();
    }
    closed() {
        return this.socket.readyState === this.socket.CLOSED;
    }
    async ready(i) {
        if (this.closed()) {
            return i;
        }
        await this.readyChan.pop();
        return i;
    }
}
export async function WebSocketClient(url) {
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
export class GraphQLSubscriptionClient {
    constructor(webSocketClient) {
        this.webSocketClient = webSocketClient;
    }
    async pop() {
        return this.webSocketClient.pop();
    }
}
export async function GraphQLSubscription(document, webSocketClient) {
    await webSocketClient.put(document);
    return new GraphQLSubscriptionClient(webSocketClient);
}
//# sourceMappingURL=client.js.map
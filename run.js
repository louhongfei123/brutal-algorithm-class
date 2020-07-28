// async // a-synchronous


// Future

// let anonymous = async function (n, duration) {
//     for(i = 0; i < n; i++) {
//         try {
//             let ret = await wait(duration)
//             console.log(ret, n-i);
//         } catch (e) {
//             console.log(e)
//         }
//     }
// }
// anonymous(10, 1000);


function wait(duration) {
    let t1 = new Date()
    return new Promise((onResolveFunc, onErrorFunc)=>{
        setTimeout(()=>{
            onResolveFunc(new Date() - t1)
        }, duration)
    })
}


class Channel {

    constructor() {
        this.receivers = [];
        this.data = [];
    }

    send(data) {
        if(this.receivers.length === 0) {
            this.data.push(data); 
        } else {
            let onResolveFunc = this.receivers.pop()
            onResolveFunc(data);
        }
    }

    async receive() {
        return new Promise((onResolveFunc) => {
            if(this.data.length > 0) {
                onResolveFunc(this.data.pop())
            } else {
                this.receivers.push(onResolveFunc);
            }
        })
    }

}
channel = new Channel();

async function ping(n) {
    for(;;) {
        console.log('ping', n);
        await wait(1000)
        await channel.send(n)
        n = await channel.receive()
        if(n > 10) {
            // await channel.close()
            return;
        }
    }
}

async function pong() {
    for(;;) {
        await wait(1000)
        try {
            n = await channel.receive()
            console.log('pong', n);
            await channel.send(n+1);
        } catch (e) {
            return e;
        }
    }
}

let po = pong()
let pi = ping(1);

// console.log('ping exit', await pi)
// console.log('pong exit', await po)



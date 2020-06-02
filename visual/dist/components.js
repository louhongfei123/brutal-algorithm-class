// @ts-nocheck
import { chan, select, after, } from "https://creatcodebuild.github.io/csp/dist/csp.js";
export function SortVisualizationComponent(id, arrays) {
    let ele = document.getElementById(id);
    if (!ele || !ele.shadowRoot) {
        throw new Error("ele has no shadow root");
    }
    let stop = chan();
    let resume = chan();
    // Animation SVG
    let currentSpeed = {
        value: 1000,
    };
    let onclick = chan();
    CreateArrayAnimationSVGComponent(ele.shadowRoot, id + "animation", 0, 0)(arrays, stop, resume, currentSpeed, onclick);
    // Stop/Resume Button
    let button = ele.shadowRoot.querySelector("button");
    if (!button) {
        throw new Error();
    }
    let stopped = false;
    button.addEventListener("click", async () => {
        stopped = !stopped;
        if (stopped) {
            // @ts-ignore
            button.textContent = "resume";
            await stop.put(null);
        }
        else {
            // @ts-ignore
            button.textContent = "stop";
            await resume.put(null);
        }
    });
    // Input
    let input = ele.shadowRoot.querySelector("input");
    if (!input) {
        throw new Error();
    }
    // @ts-ignore
    input.addEventListener("input", (ele, event) => {
        currentSpeed.value = Number(ele.target.value);
        onclick.put("onclick");
        return 1;
    });
    // @ts-ignore
    input.value = currentSpeed.value;
}
function CreateArrayAnimationSVGComponent(parent, id, x, y) {
    let svg = parent.querySelector("svg");
    return async (arrays, stop, resume, changeSpeed, oninput) => {
        let waitToResume = await needToStop(stop, resume);
        let currentSpeed = changeSpeed.value;
        let i = 0;
        for await (let array of arrays) {
            await waitToResume.pop();
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }
            for (let [i, number] of Object.entries(array)) {
                let r = rect(x + Number(i) * 4, y, 3, number);
                svg.appendChild(r);
            }
            let wait = true;
            while (wait) {
                let a;
                try {
                    a = after(changeSpeed.value);
                    currentSpeed = changeSpeed.value;
                }
                catch (_a) {
                    a = after(currentSpeed);
                }
                await select([
                    [a, async (waitedTime) => {
                            wait = false;
                        }],
                    [oninput, async (x) => {
                        }],
                ]);
            }
        }
    };
    function rect(x, y, width, height) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS
        // https://stackoverflow.com/questions/12786797/draw-rectangles-dynamically-in-svg
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", width);
        // @ts-ignore
        rect.setAttribute("height", height);
        // @ts-ignore
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        // rect.classList.add(className);
        return rect;
    }
}
export function DataSourceComponent(id, data, resetChannel) {
    let ele = get(id);
    if (!ele.shadowRoot) {
        throw new Error(`element ${ele.id} does not have shadowRoot`);
    }
    let textarea = ele.shadowRoot.querySelector("textarea");
    if (!textarea) {
        throw new Error();
    }
    textarea.textContent = JSON.stringify(data);
    let resetButton = ele.shadowRoot.getElementById("reset");
    resetButton.addEventListener("click", async () => {
        console.log(textarea.value);
        let array = JSON.parse(textarea.value);
        console.log("current text area", array);
        await resetChannel.put(array);
    });
    resetChannel.put(data);
}
function get(id) {
    let ele = document.getElementById(id);
    if (!ele) {
        throw new Error(`element ${id} does not exist`);
    }
    return ele;
}
async function needToStop(stop, resume) {
    let stopResume = chan();
    let stopped = false;
    (async () => {
        while (1) {
            await select([
                [resume, async () => {
                        stopped = false;
                        await stopResume.put();
                    }],
                [stop, async () => {
                        stopped = true;
                    }],
            ], async () => {
                if (stopped) {
                    await resume.pop();
                    stopped = false;
                }
                else {
                    await stopResume.put();
                }
            });
        }
    })();
    return stopResume;
}
//# sourceMappingURL=components.js.map
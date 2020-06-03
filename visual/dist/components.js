// @ts-nocheck
import { chan, select, after, } from "https://creatcodebuild.github.io/csp/dist/csp.js";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.js";
import * as i18n from "./language.js";
export function SortVisualizationComponent(id, arrays, changeLanguage) {
    // init channels
    let stop = chan();
    let resume = chan();
    // Init The template
    let ele = document.getElementById(id);
    if (!ele || !ele.shadowRoot) {
        throw new Error("ele has no shadow root");
    }
    let shadowRoot = ele.shadowRoot;
    // Languages
    let div = shadowRoot.getElementById("sort-name");
    i18nStringComponent(div, id, changeLanguage.copy());
    let resumeString = i18nString("resume-button", changeLanguage.copy());
    let pauseString = i18nString("pause-button", changeLanguage.copy());
    // Animation SVG
    let currentSpeed = {
        value: 1000,
    };
    let onclick = chan();
    CreateArrayAnimationSVGComponent(ele.shadowRoot, id + "animation", 0, 0)(arrays, stop, resume, currentSpeed, onclick);
    // Stop/Resume Button
    console.log(ele.shadowRoot);
    let button = ele.shadowRoot.querySelector("button");
    if (!button) {
        throw new Error();
    }
    let stopped = false;
    let currentString = pauseString;
    button.addEventListener("click", async () => {
        stopped = !stopped;
        if (stopped) {
            currentString = resumeString;
            button.textContent = currentString.toString();
            await stop.put(null);
        }
        else {
            currentString = pauseString;
            button.textContent = currentString.toString();
            await resume.put(null);
        }
    });
    button.innerText = currentString.toString();
    (async () => {
        let listen = changeLanguage.copy();
        while (true) {
            console.log("wait for lang change xxx");
            let lang = await listen.pop();
            button.textContent = currentString.toString();
            console.log("on lang change", lang);
        }
    })();
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
}
export function languages(id) {
    let changeLanguage = csp.chan();
    let languages = document.getElementById(id);
    if (languages) {
        languages.addEventListener("change", function (event) {
            // @ts-ignore
            console.log(event.target.value);
            changeLanguage.put(event.target.value);
        });
    }
    // @ts-ignore
    return csp.multi(changeLanguage);
}
export async function i18nStringComponent(element, stringID, onLanguageChange) {
    element.innerText = i18n.default[stringID].cn;
    while (true) {
        // console.log("wait for lang change", stringID, element);
        let lang = await onLanguageChange.pop();
        // console.log("on lang change", lang);
        element.innerText = i18n.default[stringID][lang];
    }
}
export function i18nString(stringID, onLanguageChange) {
    let lang = "cn";
    (async () => {
        while (true) {
            console.log("wait for lang change", stringID);
            lang = await onLanguageChange.pop();
            console.log("on lang change", lang);
        }
    })();
    return {
        toString() {
            return i18n.default[stringID][lang];
        },
    };
}
//# sourceMappingURL=components.js.map
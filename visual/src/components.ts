// @ts-nocheck
import {
  chan,
  Channel,
  select,
  after,
} from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import * as i18n from "./language.ts";

export function SortVisualizationComponent(
  id: string,
  arrays: Channel<number[]>,
  changeLanguage: Channel<i18n.Language>,
) {
  // init channels
  let stop = chan<null>();
  let resume = chan<null>();

  // Init The template
  let ele: HTMLElement | null = document.getElementById(id);
  if (!ele || !ele.shadowRoot) {
    throw new Error("ele has no shadow root");
  }
  let shadowRoot = ele.shadowRoot;

  // Languages
  (async () => {
    let div = shadowRoot.getElementById("sort-name");
    if (div) {
      div.innerText = i18n.default[id].cn;
    }
    while (true) {
      let lang = await changeLanguage.pop();
      console.log("on lang change", lang);
      // @ts-ignore
      div.innerText = i18n.default[id][lang];
    }
  })();

  // Animation SVG
  let currentSpeed = {
    value: 1000,
  };
  let onclick = chan();
  CreateArrayAnimationSVGComponent(ele.shadowRoot, id + "animation", 0, 0)(
    arrays,
    stop,
    resume,
    currentSpeed,
    onclick,
  );

  // Stop/Resume Button
  console.log(ele.shadowRoot);
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
    } else {
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
  input.addEventListener("input", (ele, event): any => {
    currentSpeed.value = Number(ele.target.value);
    onclick.put("onclick");
    return 1;
  });
  // @ts-ignore
  input.value = currentSpeed.value;
}

function CreateArrayAnimationSVGComponent(
  parent: ShadowRoot,
  id: string,
  x: number,
  y: number,
) {
  let svg = parent.querySelector("svg");
  return async (
    arrays: Channel<number[]>,
    stop: Channel<any>,
    resume: Channel<any>,
    changeSpeed: { value: number },
    oninput: Channel<any>,
  ) => {
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
        } catch {
          a = after(currentSpeed);
        }
        await select(
          [
            [a, async (waitedTime) => {
              wait = false;
            }],
            [oninput, async (x) => {
            }],
          ],
        );
      }
    }
  };

  function rect(x, y, width, height): SVGElementTagNameMap["rect"] {
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

export function DataSourceComponent(
  id: string,
  data: number[],
  resetChannel: csp.PutChannel<number[]>,
) {
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

function get(id: string): HTMLElement {
  let ele = document.getElementById(id);
  if (!ele) {
    throw new Error(`element ${id} does not exist`);
  }
  return ele;
}

async function needToStop(stop: Channel<null>, resume: Channel<null>) {
  let stopResume = chan();
  let stopped = false;
  (async () => {
    while (1) {
      await select(
        [
          [resume, async () => {
            stopped = false;
            await stopResume.put();
          }],
          [stop, async () => {
            stopped = true;
          }],
        ],
        async () => {
          if (stopped) {
            await resume.pop();
            stopped = false;
          } else {
            await stopResume.put();
          }
        },
      );
    }
  })();
  return stopResume;
}

export function languages(id: string): csp.Multicaster<i18n.Language> {
  let changeLanguage = csp.chan<i18n.Language>();
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

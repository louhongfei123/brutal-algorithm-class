// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register(
  "https://creatcodebuild.github.io/csp/dist/csp",
  [],
  function (exports_1, context_1) {
    "use strict";
    var UnreachableError, UnbufferredChannel, MAX_INT_32, Multicaster;
    var __moduleName = context_1 && context_1.id;
    // A shorter name for UnbufferredChannel.
    function chan() {
      return new UnbufferredChannel();
    }
    exports_1("chan", chan);
    // select() is modelled after Go's select statement ( https://tour.golang.org/concurrency/5 )
    // and does the same thing and should have identical behavior.
    // https://stackoverflow.com/questions/37021194/how-are-golang-select-statements-implemented
    async function select(channels, defaultCase) {
      let promises = channels.map(([c, func], i) => {
        return c.ready(i);
      });
      if (defaultCase) {
        promises = promises.concat([
          new Promise((resolve) => {
            // Run it in the next tick of the event loop to prevent starvation.
            // Otherwise, if used in an infinite loop, select might always go to the default case.
            setTimeout(() => {
              resolve(promises.length - 1);
            }, 0);
          }),
        ]);
      }
      let i = await Promise.race(promises);
      if (defaultCase && i === promises.length - 1) {
        return await defaultCase();
      }
      let ele = await channels[i][0].pop();
      return await channels[i][1](ele);
    }
    exports_1("select", select);
    function after(ms) {
      if (0 > ms || ms > MAX_INT_32) {
        throw new Error(`${ms} is out of signed int32 bound or is negative`);
      }
      let c = new UnbufferredChannel();
      async function f() {
        await sleep(ms);
        await c.put(ms); // todo: should it close or put?
      }
      f();
      // @ts-ignore
      return c;
    }
    exports_1("after", after);
    // A promised setTimeout.
    function sleep(ms) {
      if (0 > ms || ms > MAX_INT_32) {
        throw Error(`${ms} is out of signed int32 bound or is negative`);
      }
      return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    }
    exports_1("sleep", sleep);
    function multi(c) {
      return new Multicaster(c);
    }
    exports_1("multi", multi);
    return {
      setters: [],
      execute: function () {
        UnreachableError = class UnreachableError extends Error {
          constructor(msg) {
            super(msg);
            this.name = UnreachableError.name;
          }
        };
        exports_1("UnreachableError", UnreachableError);
        // An unbufferred channel is a channel that has 0 buffer size which lets it blocks on pop() and put() methods.
        // Bufferred channel implementation will come later when you or I or we need it. GitHub Issues welcome.
        UnbufferredChannel = class UnbufferredChannel {
          constructor() {
            this._closed = false;
            this.popActions = [];
            this.putActions = [];
            this.readyListener = [];
          }
          put(ele) {
            if (this._closed) {
              throw new Error("can not put to a closed channel");
            }
            if (this.readyListener.length > 0) {
              for (let { resolve, i } of this.readyListener) {
                resolve(i);
              }
              this.readyListener = [];
            }
            // if no pop action awaiting
            if (this.popActions.length === 0) {
              // @ts-ignore
              return new Promise((resolve, reject) => {
                this.putActions.push({ resolve, reject, ele });
              });
            } else {
              return new Promise((resolve) => {
                let onPop = this.popActions.shift();
                if (onPop === undefined) {
                  throw new UnreachableError(
                    "should have a pending pop action",
                  );
                }
                onPop({ value: ele, done: false });
                resolve();
              });
            }
          }
          // checks if a channel is ready to be read but dooes not read it
          // it returns only after the channel is ready
          async ready(i) {
            if (this.putActions.length > 0 || this._closed) {
              return i;
            } else {
              return new Promise((resolve) => {
                this.readyListener.push({ resolve, i });
              });
            }
          }
          async pop() {
            let next = await this.next();
            return next.value;
          }
          next() {
            if (this._closed) {
              return Promise.resolve({ value: undefined, done: true });
            }
            if (this.putActions.length === 0) {
              return new Promise((resolve, reject) => {
                this.popActions.push(resolve);
              });
            } else {
              return new Promise((resolve) => {
                let putAction = this.putActions.shift();
                if (putAction === undefined) {
                  throw new UnreachableError(
                    "should have a pending put action",
                  );
                }
                let { resolve: resolver, ele } = putAction;
                resolver();
                resolve({ value: ele, done: false });
              });
            }
          }
          // put to a closed channel throws an error
          // pop from a closed channel returns undefined
          // close a closed channel throws an error
          async close() {
            if (this._closed) {
              throw Error("can not close a channel twice");
            }
            // A closed channel always pops { value: undefined, done: true }
            for (let pendingPopper of this.popActions) {
              pendingPopper({ value: undefined, done: true });
            }
            this.popActions = [];
            // A closed channel is always ready to be popped.
            for (let { resolve, i } of this.readyListener) {
              resolve(i);
            }
            this.readyListener = [];
            for (let pendingPutter of this.putActions) {
              pendingPutter.reject("A closed channel can never be put");
            }
            this._closed = true;
          }
          closed() {
            return this._closed;
          }
          // @ts-ignore
          [Symbol.asyncIterator]() {
            return this;
          }
        };
        exports_1("UnbufferredChannel", UnbufferredChannel);
        MAX_INT_32 = Math.pow(2, 32) / 2 - 1;
        Multicaster = class Multicaster {
          constructor(source) {
            this.source = source;
            this.listeners = [];
            (async () => {
              while (true) {
                if (source.closed()) {
                  for (let l of this.listeners) {
                    console.log("xxx");
                    l.close();
                  }
                  return;
                }
                let data = await source.pop();
                for (let l of this.listeners) {
                  if (l.closed()) {
                    continue;
                  }
                  l.put(data);
                }
              }
            })();
          }
          copy() {
            let c = new UnbufferredChannel();
            this.listeners.push(c);
            // @ts-ignore
            return c;
          }
        };
        exports_1("Multicaster", Multicaster);
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/sort",
  ["https://creatcodebuild.github.io/csp/dist/csp"],
  function (exports_2, context_2) {
    "use strict";
    var csp_ts_1;
    var __moduleName = context_2 && context_2.id;
    function InsertionSort(array) {
      function insert(array, number) {
        if (array.length === 0) {
          return [number];
        }
        let sorted = [];
        let inserted = false;
        for (let i = 0; i < array.length; i++) { // n
          if (!inserted) {
            if (number < array[i]) {
              inserted = true;
              sorted.push(number);
            }
          }
          sorted.push(array[i]);
        }
        if (!inserted) {
          sorted.push(number);
        }
        return sorted;
      }
      let resultChannel = csp_ts_1.chan();
      let sortedArray = [];
      (async () => {
        for (let i = 0; i < array.length; i++) { // n
          sortedArray = insert(sortedArray, array[i]);
          await resultChannel.put(sortedArray.concat(array.slice(i + 1)));
        }
        resultChannel.close();
      })();
      // @ts-ignore
      return resultChannel;
    }
    exports_2("InsertionSort", InsertionSort);
    function MergeSort(array) {
      let resultChannel = csp_ts_1.chan();
      function merge(l, r, startIndex) {
        if (l.length === 0) {
          return r;
        }
        if (r.length === 0) {
          return l;
        }
        let shifted = (function () {
          if (l[0] < r[0]) {
            return l.slice(0, 1).concat(merge(l.slice(1), r, startIndex + 1));
          } else {
            return r.slice(0, 1).concat(merge(l, r.slice(1), startIndex + 1));
          }
        })();
        return shifted;
      }
      async function sort(array, startIndex) {
        if (array.length <= 1) {
          return array;
        }
        let m = Math.floor(array.length / 2);
        let l = array.slice(0, m);
        let r = array.slice(m);
        let sortedL = await sort(l, startIndex);
        let sortedR = await sort(r, startIndex + m);
        let merged = merge(sortedL, sortedR, startIndex);
        await resultChannel.put(merged);
        return merged;
      }
      (async () => {
        let result = await sort(array, 0);
        resultChannel.close();
      })();
      // @ts-ignore
      return resultChannel;
    }
    exports_2("MergeSort", MergeSort);
    async function infinite(f, ...args) {
      while (true) {
        await f(...args);
      }
    }
    exports_2("infinite", infinite);
    async function Sorter2(sortFunc, resetChannel, renderChannel) {
      console.log("before");
      let arrayToSort = await resetChannel.pop();
      if (!arrayToSort) {
        throw new Error("array init failed");
      }
      console.log("after");
      let sorting = sortFunc(arrayToSort);
      while (true) {
        await csp_ts_1.select([
          [
            resetChannel,
            async (array) => {
              console.log("reset", array);
              arrayToSort = array;
              // @ts-ignore
              sorting = sortFunc(arrayToSort);
            },
          ],
        ], async () => {
          let array = await sorting.pop();
          console.log("next", array);
          if (array) {
            await renderChannel.put(array);
          } else {
            sorting = sortFunc(arrayToSort);
          }
        });
      }
    }
    exports_2("Sorter2", Sorter2);
    return {
      setters: [
        function (csp_ts_1_1) {
          csp_ts_1 = csp_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/language",
  [],
  function (exports_3, context_3) {
    "use strict";
    var words;
    var __moduleName = context_3 && context_3.id;
    // export default words;
    async function i18nStringComponent(element, stringID, onLanguageChange) {
      element.innerText = words[stringID].cn;
      while (true) {
        // console.log("wait for lang change", stringID, element);
        let lang = await onLanguageChange.pop();
        // console.log("on lang change", lang);
        element.innerText = words[stringID][lang];
      }
    }
    exports_3("i18nStringComponent", i18nStringComponent);
    function i18nString(stringID, onLanguageChange) {
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
          return words[stringID][lang];
        },
      };
    }
    exports_3("i18nString", i18nString);
    return {
      setters: [],
      execute: function () {
        words = {
          "merge-sort": {
            "cn": "归并排序",
            "en": "Merge Sort",
          },
          "insertion-sort": {
            "cn": "插入排序",
            "en": "Insertion Sort",
          },
          "reset-button": {
            "cn": "重置",
            "en": "reset",
          },
          "random": {
            "cn": "随机",
            "en": "random",
          },
          "ascend-button": {
            "cn": "升序",
            "en": "Ascend",
          },
          "desend-button": {
            "cn": "降序",
            "en": "Desend",
          },
          "ordered-shuffle-button": {
            "cn": "有序错位",
            "en": "Ordered Shuffle",
          },
          "heapify-button": {
            "cn": "堆化",
            "en": "Heapify",
          },
          "pause-button": {
            "cn": "暂停",
            "en": "Pause",
          },
          "resume-button": {
            "cn": "恢复",
            "en": "Resume",
          },
        };
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/components",
  [
    "https://creatcodebuild.github.io/csp/dist/csp",
    "file:///workspace/brutal-algorithm-class/visual/src/language",
  ],
  function (exports_4, context_4) {
    "use strict";
    var csp_ts_2, csp, i18n;
    var __moduleName = context_4 && context_4.id;
    function SortVisualizationComponent(id, arrays, changeLanguage) {
      // init channels
      let stop = csp_ts_2.chan();
      let resume = csp_ts_2.chan();
      // Init The template
      let ele = document.getElementById(id);
      if (!ele || !ele.shadowRoot) {
        throw new Error("ele has no shadow root");
      }
      let shadowRoot = ele.shadowRoot;
      // Languages
      let div = shadowRoot.getElementById("sort-name");
      i18n.i18nStringComponent(div, id, changeLanguage.copy());
      let resumeString = i18n.i18nString(
        "resume-button",
        changeLanguage.copy(),
      );
      let pauseString = i18n.i18nString("pause-button", changeLanguage.copy());
      // Animation SVG
      let currentSpeed = {
        value: 1000,
      };
      let onclick = csp_ts_2.chan();
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
      let currentString = pauseString;
      button.addEventListener("click", async () => {
        stopped = !stopped;
        if (stopped) {
          currentString = resumeString;
          button.textContent = currentString.toString();
          await stop.put(null);
        } else {
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
    exports_4("SortVisualizationComponent", SortVisualizationComponent);
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
              a = csp_ts_2.after(changeSpeed.value);
              currentSpeed = changeSpeed.value;
            } catch {
              a = csp_ts_2.after(currentSpeed);
            }
            await csp_ts_2.select([
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
        let rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
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
        let stopResume = csp_ts_2.chan();
        let stopped = false;
        (async () => {
          while (1) {
            await csp_ts_2.select([
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
              } else {
                await stopResume.put();
              }
            });
          }
        })();
        return stopResume;
      }
    }
    function languages(id) {
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
    exports_4("languages", languages);
    return {
      setters: [
        function (csp_ts_2_1) {
          csp_ts_2 = csp_ts_2_1;
          csp = csp_ts_2_1;
        },
        function (i18n_1) {
          i18n = i18n_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/data-source",
  ["file:///workspace/brutal-algorithm-class/visual/src/language"],
  function (exports_5, context_5) {
    "use strict";
    var i18n;
    var __moduleName = context_5 && context_5.id;
    function DataSourceComponent(id, data, resetChannel, onLanguageChange) {
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
      // Languages
      i18n.i18nStringComponent(
        resetButton,
        "reset-button",
        onLanguageChange.copy(),
      );
      i18n.i18nStringComponent(
        ele.shadowRoot.getElementById("random"),
        "random",
        onLanguageChange.copy(),
      );
      i18n.i18nStringComponent(
        ele.shadowRoot.getElementById("ascend"),
        "ascend-button",
        onLanguageChange.copy(),
      );
      i18n.i18nStringComponent(
        ele.shadowRoot.getElementById("desend"),
        "desend-button",
        onLanguageChange.copy(),
      );
      i18n.i18nStringComponent(
        ele.shadowRoot.getElementById("ordered-shuffle"),
        "ordered-shuffle-button",
        onLanguageChange.copy(),
      );
      i18n.i18nStringComponent(
        ele.shadowRoot.getElementById("heapify"),
        "heapify-button",
        onLanguageChange.copy(),
      );
    }
    exports_5("DataSourceComponent", DataSourceComponent);
    function get(id) {
      let ele = document.getElementById(id);
      if (!ele) {
        throw new Error(`element ${id} does not exist`);
      }
      return ele;
    }
    return {
      setters: [
        function (i18n_2) {
          i18n = i18n_2;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/common",
  [],
  function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    function randomArray(size, lower, upper) {
      let array = new Array(size);
      for (let i = 0; i < size; i++) {
        array[i] = Math.floor(Math.random() * (upper - lower) + lower);
      }
      return array;
    }
    exports_6("randomArray", randomArray);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "file:///workspace/brutal-algorithm-class/visual/src/main",
  [
    "https://creatcodebuild.github.io/csp/dist/csp",
    "file:///workspace/brutal-algorithm-class/visual/src/sort",
    "file:///workspace/brutal-algorithm-class/visual/src/components",
    "file:///workspace/brutal-algorithm-class/visual/src/data-source",
    "file:///workspace/brutal-algorithm-class/visual/src/common",
  ],
  function (exports_7, context_7) {
    "use strict";
    var csp_ts_3, csp, sort, component, data_source_ts_1, common;
    var __moduleName = context_7 && context_7.id;
    async function main() {
      DefineComponent();
      // init an array
      let array = common.randomArray(30, 0, 50);
      // event channels
      let insertQueue = csp_ts_3.chan();
      let mergeQueue = csp_ts_3.chan();
      let stop = csp_ts_3.chan();
      let resume = csp_ts_3.chan();
      let resetChannel = csp_ts_3.chan();
      // @ts-ignore
      let onReset = csp.multi(resetChannel);
      //   let mergeQueue2 = (() => {
      //     let c = chan();
      //     (async () => {
      //       let numebrsToRender = [].concat(array);
      //       await c.put(numebrsToRender);
      //       while (1) {
      //         let [numbers, startIndex] = await mergeQueue.pop();
      //         // console.log(numbers);
      //         for (let i = 0; i < numbers.length; i++) {
      //           numebrsToRender[i + startIndex] = numbers[i];
      //         }
      //         await c.put(numebrsToRender);
      //       }
      //     })();
      //     return c;
      //   })();
      // console.log(mergeQueue2);
      // Components
      let onLanguageChange = component.languages("languages");
      component.SortVisualizationComponent(
        "insertion-sort",
        insertQueue,
        onLanguageChange,
      );
      component.SortVisualizationComponent(
        "merge-sort",
        mergeQueue,
        onLanguageChange,
      );
      data_source_ts_1.DataSourceComponent(
        "data-source-1",
        array,
        resetChannel,
        onLanguageChange,
      );
      // Kick off
      console.log("begin sort", array);
      // @ts-ignore
      sort.Sorter2(sort.InsertionSort, onReset.copy(), insertQueue);
      // @ts-ignore
      sort.Sorter2(sort.MergeSort, onReset.copy(), mergeQueue);
    }
    function DefineComponent() {
      // Web Components
      customElements.define(
        "sort-visualization",
        class extends HTMLElement {
          constructor() {
            super();
            let template = document.getElementById("sort-visualization");
            let templateContent = template.content;
            const shadowRoot = this.attachShadow({ mode: "open" })
              .appendChild(templateContent.cloneNode(true));
          }
        },
      );
      customElements.define(
        "data-source",
        class extends HTMLElement {
          constructor() {
            super();
            let template = document.getElementById("data-source");
            let templateContent = template.content;
            const shadowRoot = this.attachShadow({ mode: "open" })
              .appendChild(templateContent.cloneNode(true));
          }
        },
      );
    }
    return {
      setters: [
        function (csp_ts_3_1) {
          csp_ts_3 = csp_ts_3_1;
          csp = csp_ts_3_1;
        },
        function (sort_1) {
          sort = sort_1;
        },
        function (component_1) {
          component = component_1;
        },
        function (data_source_ts_1_1) {
          data_source_ts_1 = data_source_ts_1_1;
        },
        function (common_1) {
          common = common_1;
        },
      ],
      execute: function () {
        main();
      },
    };
  },
);

__instantiate("file:///workspace/brutal-algorithm-class/visual/src/main");


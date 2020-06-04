import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";

export type Language = "cn" | "en";

// https://github.com/microsoft/TypeScript/issues/24220
type LanguageMap = {
  [lang in Language]?: string;
};

let words: { [id: string]: LanguageMap } = {
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

// export default words;

export async function i18nStringComponent(
  element: HTMLElement,
  stringID: string,
  onLanguageChange: csp.Channel<Language>,
) {
  element.innerText = words[stringID].cn;
  while (true) {
    // console.log("wait for lang change", stringID, element);
    let lang = await onLanguageChange.pop();
    // console.log("on lang change", lang);
    element.innerText = words[stringID][lang];
  }
}

export function i18nString(
  stringID: string,
  onLanguageChange: csp.Channel<Language>,
) {
  let lang: Language = "cn";
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

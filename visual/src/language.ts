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
};

export default words;

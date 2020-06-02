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
};

export default words;

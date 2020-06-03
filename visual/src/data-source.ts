// @ts-ignore
import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
// @ts-ignore
import * as i18n from "./language.ts";
// @ts-ignore
import * as component from "./components.ts";

export function DataSourceComponent(
  id: string,
  data: number[],
  resetChannel: csp.PutChannel<number[]>,
  onLanguageChange: csp.Multicaster<i18n.Language>,
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

  // Languages
  component.i18nStringComponent(
    resetButton,
    "reset-button",
    onLanguageChange.copy(),
  );
  component.i18nStringComponent(
    ele.shadowRoot.getElementById("random"),
    "random",
    onLanguageChange.copy(),
  );
  component.i18nStringComponent(
    ele.shadowRoot.getElementById("ascend"),
    "ascend-button",
    onLanguageChange.copy(),
  );
  component.i18nStringComponent(
    ele.shadowRoot.getElementById("desend"),
    "desend-button",
    onLanguageChange.copy(),
  );
  component.i18nStringComponent(
    ele.shadowRoot.getElementById("ordered-shuffle"),
    "ordered-shuffle-button",
    onLanguageChange.copy(),
  );
  component.i18nStringComponent(
    ele.shadowRoot.getElementById("heapify"),
    "heapify-button",
    onLanguageChange.copy(),
  );
}

function get(id: string): HTMLElement {
  let ele = document.getElementById(id);
  if (!ele) {
    throw new Error(`element ${id} does not exist`);
  }
  return ele;
}

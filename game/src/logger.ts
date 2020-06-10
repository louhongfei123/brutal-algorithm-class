import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import * as bufio from "https://deno.land/std/io/bufio.ts";

export const log = async function (...args: any[]) {
  await csp.sleep(233);
  console.log(...args);
};

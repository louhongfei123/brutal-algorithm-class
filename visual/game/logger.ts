import * as csp from "https://creatcodebuild.github.io/csp/dist/csp.ts";
import * as bufio from "https://deno.land/std/io/bufio.ts";

export const log = async function (...args: any[]) {
  //   for (let char of [...args].join(" ")) {
  //     const encoder = new TextEncoder();
  //     const data = encoder.encode(char);
  //     const bytesWritten = await Deno.writeAll(Deno.stdout, data);
  //     await csp.sleep(23);
  //   }
  await csp.sleep(233);
  console.log(...args);
};

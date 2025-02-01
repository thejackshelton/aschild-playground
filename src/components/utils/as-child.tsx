import { JSXChildren, JSXOutput } from "@builder.io/qwik";

export function useChild(allJsx: JSXChildren) {
  function asChild(jsx: JSXOutput) {
    console.log("comp jsx: ", jsx);
    console.log("all jsx: ", allJsx);

    return jsx;
  }

  return { asChild };
}

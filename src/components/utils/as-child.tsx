import {
  JSXChildren,
  JSXOutput,
  Slot,
  jsx,
  useId,
  useSignal,
} from "@builder.io/qwik";

export function useChild(allJsx: JSXChildren) {
  const id = useId();

  // we need to do this because of re-renders, and because signals and props can't hold inline component jsx due to serialization :/
  if (!globalThis.__AS_CHILD_RESULTS__) {
    globalThis.__AS_CHILD_RESULTS__ = new Map();
  }

  function asChild(fallbackJsx: JSXOutput) {
    if (globalThis.__AS_CHILD_RESULTS__.has(id)) {
      return globalThis.__AS_CHILD_RESULTS__.get(id);
    }

    const visited = new WeakSet();
    const queue = Array.isArray(allJsx) ? [...allJsx] : [allJsx];

    let asChildElement: JSXOutput | undefined;

    while (queue.length > 0) {
      const current = queue.shift();

      if (!current || visited.has(current)) continue;
      visited.add(current);

      if (current.props?.asChild === true) {
        asChildElement = current;
        break;
      }

      if (current.children) {
        const children = Array.isArray(current.children)
          ? current.children
          : [current.children];

        queue.push(...children.filter((child) => child && !visited.has(child)));
      }
    }

    if (asChildElement) {
      const children = asChildElement.props.children;

      const mergedProps = {
        ...asChildElement.props,
        ...fallbackJsx.props,
        asChild: undefined,
        children:
          typeof children.type === "string"
            ? children.props.children
            : children.props.children.props.children,
      };

      const result = {
        ...children,
        props: mergedProps,
      };

      globalThis.__AS_CHILD_RESULTS__.set(id, result);
      return result;
    } else {
      globalThis.__AS_CHILD_RESULTS__.set(id, fallbackJsx);
      return fallbackJsx;
    }
  }

  return { asChild };
}

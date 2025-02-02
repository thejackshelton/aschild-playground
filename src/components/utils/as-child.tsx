import { JSXChildren, JSXOutput, Slot, jsx } from "@builder.io/qwik";

export function useChild(allJsx: JSXChildren) {
  function asChild(fallbackJsx: JSXOutput) {
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

      // Return the children with merged props
      return {
        ...children,
        props: mergedProps,
      };
    } else {
      return fallbackJsx;
    }
  }

  return { asChild };
}

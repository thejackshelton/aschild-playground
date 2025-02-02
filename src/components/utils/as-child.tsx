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
      console.log("HELLO?");
      const children = asChildElement.props.children;

      if (children.length > 1) {
        throw new Error("Qwik Design System: asChild can only have one child.");
      }

      // If type is a string, it's an HTML element, otherwise it's a component
      const childType =
        typeof children.type === "string"
          ? children.type
          : children.props.children.type;

      console.log("child type: ", childType);

      const mergedProps = {
        ...asChildElement.props,
        ...fallbackJsx.props,
        asChild: undefined,
        children: <Slot />,
      };

      return jsx(childType, mergedProps);
    } else {
      return fallbackJsx;
    }
  }

  return { asChild };
}

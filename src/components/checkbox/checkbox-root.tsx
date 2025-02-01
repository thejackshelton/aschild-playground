import {
  $,
  JSXNode,
  JSXOutput,
  type PropsOf,
  type QRL,
  type Signal,
  Slot,
  component$,
  implicit$FirstArg,
  useComputed$,
  useContextProvider,
  useId,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { useBoundSignal } from "./bound-signal";
import { type CheckboxContext, checkboxContextId } from "./checkbox-context";
export type PublicCheckboxRootProps<T extends boolean | "mixed" = boolean> = {
  "bind:checked"?: Signal<boolean | "mixed">;
  /** Initial checked state of the checkbox */
  checked?: T;
  /** Event handler called when the checkbox state changes */
  onChange$?: QRL<(checked: T) => void>;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox has a description */
  isDescription?: boolean;
  /** Name attribute for the hidden input element */
  name?: string;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Value attribute for the hidden input element */
  value?: string;
} & PropsOf<"div">;

type InternalCheckboxRootProps = {
  getChildren$?: QRL<() => JSXOutput>;
};

export const CheckboxRoot = ({
  children,
  ...rest
}: PublicCheckboxRootProps) => {
  const processNode = (node: any): any => {
    if (!node || typeof node !== "object") return node;

    console.log("Processing node:", {
      type: node.type,
      isFunction: typeof node.type === "function",
      hasName: "name" in node.type,
      name: node.type?.name,
      children: node.children,
      props: node.props,
    });

    const processedNode = { ...node };

    if (
      typeof node.type === "function" &&
      (!("name" in node.type) || node.type.name !== "QwikComponent") &&
      !("serializable-data" in node.type)
    ) {
      const originalFn = node.type;
      console.log("Found inline component:", {
        originalFn,
        fnName: originalFn.name,
        fnString: originalFn.toString(),
        hasSerializableData: "serializable-data" in originalFn,
      });

      processedNode.type = implicit$FirstArg(originalFn);

      console.log("Wrapped inline component:", {
        originalType: originalFn,
        newType: processedNode.type,
        newTypeString: processedNode.type.toString(),
        hasSerializableData: "serializable-data" in processedNode.type,
      });
    }

    // Process children recursively
    if (processedNode.children) {
      if (Array.isArray(processedNode.children)) {
        processedNode.children = processedNode.children.map(processNode);
      } else {
        processedNode.children = processNode(processedNode.children);
      }
    }

    // Process props that might contain JSX
    if (processedNode.props) {
      const processedProps = { ...processedNode.props };
      Object.entries(processedProps).forEach(([key, value]) => {
        if (value && typeof value === "object" && "type" in value) {
          processedProps[key] = processNode(value);
        }
      });
      processedNode.props = processedProps;
    }

    const result = processedNode;
    console.log("Processed result:", result);
    return result;
  };

  processNode(children);

  return <CheckboxBase {...rest}>{children}</CheckboxBase>;
};

/** Root component that provides context and state management for the checkbox */
export const CheckboxBase = component$(
  (props: PublicCheckboxRootProps & InternalCheckboxRootProps) => {
    const {
      "bind:checked": givenCheckedSig,
      checked,
      onClick$,
      onChange$,
      isDescription,
      name,
      required,
      value,
      ...rest
    } = props;
    const isCheckedSig = useBoundSignal<boolean | "mixed">(
      givenCheckedSig,
      checked ?? false
    );
    const isInitialLoadSig = useSignal(true);
    const isDisabledSig = useComputed$(() => props.disabled);
    const isErrorSig = useSignal(false);
    const localId = useId();
    const triggerRef = useSignal<HTMLButtonElement>();
    const context: CheckboxContext = {
      isCheckedSig,
      isDisabledSig,
      localId,
      isDescription,
      name,
      required,
      value,
      isErrorSig,
      triggerRef,
    };
    useContextProvider(checkboxContextId, context);
    useTask$(async function handleChange({ track }) {
      track(() => isCheckedSig.value);
      if (isInitialLoadSig.value) {
        return;
      }
      await onChange$?.(isCheckedSig.value as boolean);
    });
    useTask$(() => {
      isInitialLoadSig.value = false;
    });
    return (
      <div
        {...rest}
        // Identifier for the root checkbox container
        data-qds-checkbox-root
        // Indicates whether the checkbox is disabled
        data-disabled={context.isDisabledSig.value ? "" : undefined}
        aria-disabled={context.isDisabledSig.value ? "true" : "false"}
        // Indicates whether the checkbox is checked
        data-checked={context.isCheckedSig.value ? "" : undefined}
        // Indicates whether the checkbox is in an indeterminate state
        data-mixed={context.isCheckedSig.value === "mixed" ? "" : undefined}
      >
        <Slot />
      </div>
    );
  }
);

import {
  type PropsOf,
  Slot,
  component$,
  useContext,
  useStyles$,
} from "@builder.io/qwik";
import { checkboxContextId } from "./checkbox-context";
import "./checkbox.css";
import styles from "./checkbox.css?inline";
import { useChild } from "../utils/as-child";
export type PublicCheckboxIndicatorProps = PropsOf<"span"> & {
  asChild: boolean;
};
/** Visual indicator component showing the checkbox state */
export const CheckboxIndicator = component$<PublicCheckboxIndicatorProps>(
  (props) => {
    useStyles$(styles);
    const context = useContext(checkboxContextId);

    const { asChild } = useChild(globalThis.checkboxChildren);

    return asChild(
      <span
        {...props}
        // Indicates whether the indicator should be hidden based on checkbox state
        data-hidden={!context.isCheckedSig.value}
        // Indicates whether the checkbox is in a checked state
        data-checked={context.isCheckedSig.value ? "" : undefined}
        // Indicates whether the checkbox is in an indeterminate state
        data-mixed={context.isCheckedSig.value === "mixed" ? "" : undefined}
        // Identifier for the checkbox indicator element
        data-qds-indicator
        aria-hidden="true"
      >
        <Slot />
      </span>
    );
  }
);

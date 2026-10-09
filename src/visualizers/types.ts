import type { ComponentType } from "react";

/** One frame of an algorithm run. `line` is a 0-based index into the pseudocode. */
export interface Step<S> {
  line: number;
  state: S;
  note: string;
}

export interface VisualizerDef<S = unknown> {
  title: string;
  pseudocode: string[];
  /** Text shown in the editable input box (format is defined per visualizer). */
  defaultInput: string;
  inputHelp: string;
  /** Pure step generator; throws Error with a friendly message on invalid input. */
  generate: (input: string) => Step<S>[];
  Render: ComponentType<{ state: S }>;
}

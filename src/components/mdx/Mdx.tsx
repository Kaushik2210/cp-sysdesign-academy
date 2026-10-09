import { Callout } from "./Callout";
import { MdxBase } from "./MdxBase";
import { Tab, Tabs } from "./Tabs";
import { Complexity, TradeOffs } from "./Tables";
import { CodeRunner, Diagram, Visualizer } from "./lazy";
import { Quiz } from "@/components/quiz/Quiz";
import { Problem } from "@/components/problem/Problem";

/** Components available inside every lesson MDX file. */
export const mdxComponents = {
  Callout,
  Tabs,
  Tab,
  Complexity,
  TradeOffs,
  CodeRunner,
  Visualizer,
  Diagram,
  Quiz,
  Problem,
};

export function Mdx({ source }: { source: string }) {
  return <MdxBase source={source} components={mdxComponents} />;
}

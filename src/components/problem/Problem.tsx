import { getProblem } from "@/lib/content/problems";
import { MdxBase as Mdx } from "@/components/mdx/MdxBase";
import { ProblemClient } from "./ProblemClient";

/** Server component: loads content/problems/<id>.json and renders statement/editorial to HTML.
 *  Reference solutions are deliberately NOT sent to the client. Hidden tests are (static site, no backend). */
export function Problem({ id }: { id: string }) {
  const p = getProblem(id);
  return (
    <ProblemClient
      id={p.id}
      title={p.title}
      rating={p.rating}
      tags={p.tags}
      source={p.source}
      constraints={p.constraints}
      timeLimitMs={p.timeLimitMs}
      tests={p.tests}
      hints={p.hints}
      complexityTime={p.complexity.time}
      starter={p.starter}
      statement={<Mdx source={p.statement} />}
      editorial={
        <>
          <Mdx source={p.editorial} />
          <p>
            Time <code>{p.complexity.time}</code>, space <code>{p.complexity.space}</code>.
            {p.source && (
              <>
                {" "}
                Inspired by{" "}
                {p.source.url ? <a href={p.source.url}>{p.source.name}</a> : p.source.name}.
              </>
            )}
          </p>
        </>
      }
    />
  );
}

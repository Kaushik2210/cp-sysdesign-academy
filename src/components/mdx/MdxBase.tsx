import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

function ScrollableTable(props: ComponentProps<"table">) {
  return (
    <div role="region" aria-label="Lesson table" tabIndex={0} className="overflow-x-auto print:overflow-visible">
      <table {...props} />
    </div>
  );
}

/** Plain markdown/MDX renderer with no custom components (safe to import from anywhere). */
export function MdxBase({ source, components }: { source: string; components?: MDXComponents }) {
  return (
    <MDXRemote
      source={source}
      components={{ table: ScrollableTable, ...components }}
      options={{
        // Content is authored in this repo and compiled at build time (trusted), and lessons pass
        // structured props like questions={[...]}; blockJS would silently strip them.
        blockJS: false,
        blockDangerousJS: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypePrettyCode,
              { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false },
            ],
          ],
        },
      }}
    />
  );
}

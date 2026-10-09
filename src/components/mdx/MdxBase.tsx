import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import type { MDXComponents } from "mdx/types";

/** Plain markdown/MDX renderer with no custom components (safe to import from anywhere). */
export function MdxBase({ source, components }: { source: string; components?: MDXComponents }) {
  return (
    <MDXRemote
      source={source}
      components={components}
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

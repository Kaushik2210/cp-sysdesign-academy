import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { Callout } from "./Callout";

/** Components available inside every MDX file. Phase 2 extends this map. */
export const mdxComponents = { Callout };

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
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

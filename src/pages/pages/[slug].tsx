import { getPageBySlug, getPagesSlugs } from "lib/api";

export default function Page({ page }: { page: string }) {
  const footnoteSection = page.slice(
    page.indexOf('<section data-footnotes class="footnotes">'),
    page.indexOf("</section>")
  );
  page = page.replace(footnoteSection, "");
  const textBlocks = page
    .split("\n")
    .map((paragraph) => {
      paragraph = '<div class="max-w-[65%] text-xl">' + paragraph + "</div>";
      if (paragraph.includes("<sup>")) {
        const allFootnotes = paragraph.split('<a href="#').map((item) => {
          const thisPartOfPage = paragraph.slice(paragraph.search(item));
          const link = thisPartOfPage.slice(
            0,
            thisPartOfPage.search(" id") - 1
          );
          if (!link) return "";
          const li = '<li id="' + link;
          console.log(li);
          const footnote = footnoteSection
            .slice(
              footnoteSection.search(li),
              footnoteSection.indexOf("</li>", footnoteSection.search(li))
            )
            .split("\n")[1];

          return (footnote ?? "").replace(
            "<p>",
            `<p><sup class="mr-1">${item.slice(
              item.search(">") + 1,
              item.search("</a>")
            )}</sup>`
          );
        });

        return (
          "<div class='flex justify-between'>" +
          paragraph +
          `<div class="max-w-[30%] w-full text-sm">${
            allFootnotes.join("") ?? ""
          }</div>` +
          "</div>"
        );
      }
      return paragraph;
    })
    .join("");

  return (
    <>
      <article className="flex h-full">
        <div
          className="flex h-fit min-h-full w-full flex-col flex-wrap items-start justify-center"
          dangerouslySetInnerHTML={{ __html: textBlocks }}
        ></div>
      </article>
    </>
  );
}

type Params = {
  params: {
    slug: string;
  };
};

export async function getStaticProps({ params }: Params) {
  const page = await getPageBySlug(params.slug);
  return {
    props: {
      page: page.contentHtml,
    },
  };
}

export function getStaticPaths() {
  const pages = getPagesSlugs();
  return {
    paths: pages.map((page) => {
      return {
        params: {
          slug: page,
        },
      };
    }),
    fallback: false,
  };
}

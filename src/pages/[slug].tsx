import { getPageBySlug, getPagesSlugs } from "lib/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page({
  page,
  lastPage,
}: {
  page: string;
  lastPage: boolean;
}) {
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
        const allFootnotes = paragraph.split('<a href="#')?.map((item) => {
          console.log(item, "lol");
          const thisPartOfPage = paragraph.slice(paragraph.indexOf(item));
          const link = thisPartOfPage.slice(
            0,
            thisPartOfPage.indexOf(" id") - 1
          );
          if (!link) return "";
          const li = '<li id="' + link;
          console.log(li);
          const footnote = footnoteSection
            .slice(
              footnoteSection.indexOf(li),
              footnoteSection.indexOf("</li>", footnoteSection.indexOf(li))
            )
            .split("\n")[1];

          return (footnote ?? "").replace(
            "<p>",
            `<p class="text-gray-400"><sup class="mr-1">${item.slice(
              item.indexOf(">") + 1,
              item.indexOf("</a>")
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

  const router = useRouter();

  useEffect(() => {
    const event = (e: KeyboardEvent) => {
      console.log(e.key);
      const slug = parseInt(router.query.slug?.toString() ?? "");
      if (e.key === "ArrowRight" && !lastPage) {
        void router.push("/" + (slug + 1).toString());
      }
      if (e.key === "ArrowLeft" && slug > 1) {
        void router.push("/" + (slug - 1).toString());
      }
    };
    document.addEventListener("keydown", event);

    return () => {
      document.removeEventListener("keydown", event);
    };
  }, [lastPage, router]);

  return (
    <>
      <article className="flex h-full py-10">
        <div
          className="items-between flex h-fit min-h-full w-full flex-col flex-wrap justify-center"
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
  const lastPage = getPagesSlugs().length === parseInt(params.slug);
  return {
    props: {
      page: page.contentHtml,
      lastPage,
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

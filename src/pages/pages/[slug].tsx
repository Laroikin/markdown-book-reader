import { getPageBySlug, getPagesSlugs } from "lib/api";

export default function Page({ page }: { page: string }) {
  console.log(page);
  return <div dangerouslySetInnerHTML={{ __html: page }}></div>;
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

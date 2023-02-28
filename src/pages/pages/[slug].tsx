import markdownToHtml from "lib/markdownToHtml";

export default function Page({ page }) {
  return (
    <Layout>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </Layout>
  );
}

export async function getStaticProps({ params }) {
  const page = await getPageBySlug(params.slug);
  const content = await markdownToHtml(page.content || "");

  return {
    props: {
      page: {
        ...page,
        content,
      },
    },
  };
}
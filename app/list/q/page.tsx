const QueryPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => (
  <h1>List, page {(await searchParams).page}</h1>
)

export default QueryPage

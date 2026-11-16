import Link from 'next/link'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

const ListLayout = ({ children }: { children: ReactNode }) => (
  <main>
    <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
    {/* Pushes the pagination link below the fold, so it is prefetched only once scrolled into view. */}
    <div style={{ height: '150vh' }} />
    <Link href="/list?page=2">Next page</Link>
  </main>
)

export default ListLayout

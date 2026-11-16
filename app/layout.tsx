import Link from 'next/link'
import type { ReactNode } from 'react'

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link href="/">Home</Link>
        <Link href="/a">A</Link>
        <Link href="/b">B</Link>
        <Link href="/c">C</Link>
        <Link href="/list">List</Link>
      </nav>
      {children}
    </body>
  </html>
)

export default RootLayout

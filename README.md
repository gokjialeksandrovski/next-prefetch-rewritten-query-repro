# Prefetched navigation to a query-based rewrite re-prefetches every visible link

Next.js 16.4.5, `cacheComponents: true`. Reproduces with `partialPrefetching` set to `true` and to `false`.

## Setup

Two rewrites send one pathname to two routes, depending on the query string (`next.config.ts`):

```ts
rewrites: async () => [
  { source: '/list', missing: [{ type: 'query', key: 'page' }], destination: '/list/first' },
  { source: '/list', destination: '/list/q' },
]
```

- `app/list/first/page.tsx` is static.
- `app/list/q/page.tsx` awaits `searchParams`.
- The root layout has five nav links. The list layout has a `<Link href="/list?page=2">` below the fold.

## Steps

```bash
pnpm install
pnpm build
pnpm start   # http://localhost:3200
```

1. Open `http://localhost:3200/list` with DevTools open on the Network tab, filtered to `_rsc`.
2. Scroll to the "Next page" link and wait for its two prefetches (`/_tree` and `/list/q/__PAGE__`).
3. Clear the Network tab and click "Next page".

## Expected

One navigation request for `/list?page=2`. No new prefetches: every visible link's route tree is already cached.

## Actual

Nine requests. After the navigation request, the `/_tree` of every visible link is prefetched again, and two addresses are fetched twice (once with the old `Next-Url`, once with the new one):

```
/list?page=2  navigation       next-url=/list/first
/list?page=2  segment=/_tree   next-url=/list/first
/list?page=2  segment=/_tree   next-url=/list/q
/list         segment=/_tree   next-url=/list/q
/             segment=/_tree   next-url=/list/first
/a            segment=/_tree   next-url=/list/first
/b            segment=/_tree   next-url=/list/first
/c            segment=/_tree   next-url=/list/first
/list         segment=/_tree   next-url=/list/first
```

The number of repeated prefetches grows with the number of links in view. On a listing page with a header, a footer and cards, each pagination click costs a dozen wasted requests.

## Cause

Every RSC response for `/list?page=2` carries an empty `x-nextjs-rewritten-query`:

```bash
curl -s -o /dev/null -D - -H "rsc: 1" "http://localhost:3200/list?page=2&_rsc=abc"
# x-nextjs-rewritten-path: /list/q
# x-nextjs-rewritten-query:
```

- `server/lib/router-utils/resolve-routes.js` sets the header to `parsedDestination.search.slice(1)` whenever `parsedUrl.search !== parsedDestination.search`. The destination string has no query, so its `search` is `""`, although the request's query is passed on to the page (`page=2` renders).
- `client/route-params.js` `getRenderedSearch` trusts the header, so the prefetched route entry for `/list?page=2` records a rendered search of `""`.
- On the click, the navigation response's page segment is keyed `?page=2`. `compareParams` in `render-tree.js` sees a mismatch with the prefetched entry, skips the data, and the navigation ends in a soft retry.
- The retry invalidates the route cache, so every visible link is prefetched again, first with the old `Next-Url`, and those still pending at the commit once more with the new one.

## Not affected

- A navigation to `/list?page=2` that was not prefetched first.
- A navigation into the static rewrite (`/list` → `/list/first`).

# dennisu.com

Source code for my personal website. Developed using [Sveltekit](https://svelte.dev/) and [Bun](https://bun.com/docs).

## bun

1. `bun install`.
2. `bun run dev`.
3. `bun run build`.
4. `bun run preview`.

## Cloudflare notes

Specific config and files for hosting on Cloudflare:

- [wrangler.jsonc](./wrangler.jsonc) configures the Workers deployment.
- [static/_headers](./static/_headers) enables long-term caching for hashed assets.
- `precompress` is disabled in [vite.config.ts](./vite.config.ts) because Cloudflare handles compression. Re-enable it if the new server uses the generated `.gz` and `.br` files.

# Blog social images

`bun run build` prerenders `/blog/<slug>/og.png` for every post using the existing
validated post metadata. Cloudflare deploys these PNGs as static files. Both
Open Graph and Twitter metadata use the same image. No additional build command
or runtime service is required. Images are regenerated on each build, so title,
description, date and design changes are included automatically.

Edit `social-image.ts` to change the fixed 1200 × 630 dark glass template. It
renders pixels and text directly with Sharp, using the repository's DM Serif
Display, Geist and Commit Mono fonts. `fontverter` converts those fonts to complete TrueType files under the ignored
`.svelte-kit/social-fonts` directory. Keeping them available avoids stale font
paths in the renderer’s process-wide cache.
The palette and glass treatment mirror the dark styles in `src/routes/layout.css`;
update the template too if those styles change.

Text wraps within fixed areas and shrinks down to 22 px when necessary. Metadata
that still does not fit fails the build instead of producing a clipped image.
Run `bun test src/lib/blog/server/social-image.test.ts` to check rendering and
oversized text handling. Preview the resulting PNG in `build/blog/<slug>/og.png`
or visit the image route during `bun run dev`.

Social platforms cache previews independently; an existing shared link may need
to be re-scraped after an image changes.

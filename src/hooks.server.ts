import type { Handle } from "@sveltejs/kit/hooks";

// Skip eager JS preloads so text can paint sooner; hydration still loads normally.
export const handle: Handle = ({ event, resolve }) =>
	resolve(event, { preload: ({ type }) => type === "css" });

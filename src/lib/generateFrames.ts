/**
 * Generates an array of strings by replacing each character in the given name
 * with the specified emoji, animating through each position, then reverses all but
 * the first and last frames for a seamless loop.
 *
 * @param name The string to animate. Default: "Welcome!"
 * @param emoji The emoji to insert in place of each char. Default: "🐈"
 * @returns Array of animated strings with emoji inserted at each position.
 */
export function generateFrames(name: string = "Welcome!", emoji: string = "🐈") {
	const frames: string[] = [];
	for (let i = 0; i < name.length; i++) {
		frames.push(name.slice(0, i) + emoji + name.slice(i + 1));
	}
	return [...frames, ...frames.slice(1, -1).reverse()];
}

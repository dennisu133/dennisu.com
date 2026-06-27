export type StackIcon = {
	name: string;
	src: string;
};

const iconFiles = import.meta.glob<string>("$lib/assets/icons/stack/*.svg", {
	eager: true,
	query: "?url",
	import: "default"
});

const iconsByName = new Map(
	Object.entries(iconFiles).map(([path, src]) => {
		const filename = path.split("/").at(-1);

		if (!filename) {
			throw new Error(`Could not infer a stack icon name from "${path}"`);
		}

		const name = filename.replace(/\.svg$/i, "");
		return [name.toLowerCase(), { name, src }] as const;
	})
);

export function getStackIcons(...names: string[]): StackIcon[] {
	return names.map((name) => {
		const icon = iconsByName.get(name.toLowerCase());

		if (!icon) {
			throw new Error(`No stack icon named "${name}" was found`);
		}

		return icon;
	});
}

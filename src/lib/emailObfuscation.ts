const OBFUSCATED_EMAIL = new Uint8Array([
	62, 26, 202, 167, 135, 96, 83, 60, 240, 201, 163, 134, 127, 79, 19, 230, 194, 143, 147, 116, 95,
	10, 228, 131, 177, 152, 113
]);

function maskAt(index: number) {
	return (0x5a + index * 37) & 0xff;
}

export const EMAIL_CHARACTER_COUNT = OBFUSCATED_EMAIL.length;
export const EMAIL_DISPLAY_WIDTH_EM = 14.4;

export function decodeEmail() {
	return Array.from(OBFUSCATED_EMAIL, (byte, index) =>
		String.fromCharCode(byte ^ maskAt(index))
	).join("");
}

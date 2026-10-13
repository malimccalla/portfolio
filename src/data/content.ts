import { getEntry } from "astro:content";

export async function getProfile() {
	const entry = await getEntry("profile", "main");
	if (!entry)
		throw new Error("Missing portfolio profile: src/content/profile/main.md");
	return entry.data;
}

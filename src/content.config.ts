import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const externalUrl = z
	.string()
	.url()
	.refine(
		(value) => ["https:", "http:"].includes(new URL(value).protocol),
		"Use an HTTP or HTTPS URL",
	);

const entrySchema = z.object({
	title: z.string(),
	order: z.number().int().default(0),
	eyebrow: z.string().optional(),
	summary: z.string().optional(),
	tools: z.array(z.string()).default([]),
	concepts: z.array(z.string()).default([]),
	linkLabel: z.string().optional(),
	href: externalUrl.optional(),
});

function entries(folder: string) {
	return defineCollection({
		loader: glob({ pattern: "**/*.md", base: `./src/content/${folder}` }),
		schema: entrySchema,
	});
}

export const collections = {
	windows: defineCollection({
		loader: glob({ pattern: "*.md", base: "./src/content/windows" }),
		schema: z.object({
			template: z.boolean().default(false),
			lead: z.string().optional(),
		}),
	}),
	profile: defineCollection({
		loader: glob({ pattern: "*.md", base: "./src/content/profile" }),
		schema: z.object({
			name: z.string(),
			role: z.string(),
			description: z.string(),
			github: externalUrl,
			linkedin: externalUrl,
			email: z.string().email().optional(),
			resume: z
				.string()
				.refine(
					(value) => /^\/(?!\/)/.test(value) || /^https?:\/\//.test(value),
					"Use a site-relative path or HTTP(S) URL",
				),
			resumeReady: z.boolean().default(false),
			location: z.string(),
		}),
	}),
	projects: entries("projects"),
	writeups: entries("writeups"),
	experience: entries("experience"),
	certifications: entries("certifications"),
};

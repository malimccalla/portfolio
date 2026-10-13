export const profile = {
	name: "[Your name]",
	role: "[Your role or area of focus]",
	description:
		"A workspace for security projects, practical investigations, and the person behind them.",
	github: "https://github.com/YOUR_USERNAME",
	linkedin: "https://www.linkedin.com/in/YOUR_USERNAME",
	email: "your.name@example.com",
	resume: "/resume.pdf",
	resumeReady: false,
};

export type SectionId =
	| "about"
	| "projects"
	| "experience"
	| "certifications"
	| "writeups"
	| "resume"
	| "contact";

export type IconKind = "folder" | "document";

export interface WindowDefinition {
	id: SectionId;
	title: string;
	icon: IconKind;
	description: string;
}

export const windowDefinitions: readonly WindowDefinition[] = [
	{
		id: "about",
		title: "About Me",
		icon: "folder",
		description: "The person behind the work",
	},
	{
		id: "projects",
		title: "Projects",
		icon: "folder",
		description: "Built to learn. Built to defend.",
	},
	{
		id: "experience",
		title: "Experience",
		icon: "folder",
		description: "A record of hands-on learning",
	},
	{
		id: "certifications",
		title: "Certifications",
		icon: "folder",
		description: "Learning and credentials",
	},
	{
		id: "writeups",
		title: "Cybersecurity Write-ups",
		icon: "folder",
		description: "Notes from the investigation",
	},
	{
		id: "resume",
		title: "Resume",
		icon: "document",
		description: "The short version",
	},
	{
		id: "contact",
		title: "Contact",
		icon: "folder",
		description: "Start a conversation",
	},
];

export type AppGlyph = "music" | "camera" | "gamepad" | "book";

export interface InterestApp {
	id: `interest-${string}`;
	title: string;
	glyph: AppGlyph;
	/** Two colours used for the app icon's gradient. */
	colors: readonly [string, string];
	summary: string;
}

// Placeholder dock apps for interests outside of work. Swap titles, glyphs,
// colours, and summaries for your own.
export const interests: readonly InterestApp[] = [
	{
		id: "interest-music",
		title: "Music",
		glyph: "music",
		colors: ["#ff6b8b", "#f5245a"],
		summary: "[What you listen to, play, or make]",
	},
	{
		id: "interest-photos",
		title: "Photography",
		glyph: "camera",
		colors: ["#ffd25e", "#ff9500"],
		summary: "[Places you shoot, gear you use, favourite shots]",
	},
	{
		id: "interest-games",
		title: "Games",
		glyph: "gamepad",
		colors: ["#7ee08a", "#28a745"],
		summary: "[Games you are playing or would recommend]",
	},
	{
		id: "interest-reading",
		title: "Reading",
		glyph: "book",
		colors: ["#7cc4ff", "#2f7cf6"],
		summary: "[Books on your desk right now]",
	},
];

export type WindowId = SectionId | InterestApp["id"];

export interface PortfolioEntry {
	title: string;
	summary: string;
	tools: readonly string[];
	concepts: readonly string[];
	linkLabel: string;
	href?: string;
}

export const projects: readonly PortfolioEntry[] = [
	{
		title: "[Project title] · Detection lab",
		summary:
			"[Replace with the problem, your approach, and what you learned. Include evidence rather than unverified results.]",
		tools: ["[SIEM]", "[Python]", "[Lab platform]"],
		concepts: ["Log analysis", "Detection engineering"],
		linkLabel: "Project repository",
	},
	{
		title: "[Project title] · Secure by design",
		summary:
			"[Describe a system you built or assessed, its threat model, and the mitigations you explored.]",
		tools: ["[Language]", "[Testing tools]"],
		concepts: ["Threat modeling", "Secure development"],
		linkLabel: "Project case study",
	},
];

export const writeups: readonly PortfolioEntry[] = [
	{
		title: "[Write-up title] · Following the evidence",
		summary:
			"[Add an authorized lab or investigation. Explain the question, evidence, methodology, and limitations.]",
		tools: ["[Wireshark]", "[Analysis tools]"],
		concepts: ["Network analysis", "Incident response"],
		linkLabel: "Read write-up",
	},
	{
		title: "[Write-up title] · Understanding a weakness",
		summary:
			"[Document an authorized exercise, the root cause of a weakness, and actionable defensive takeaways.]",
		tools: ["[Lab environment]", "[Research tools]"],
		concepts: ["Vulnerability assessment", "Remediation"],
		linkLabel: "Read write-up",
	},
];

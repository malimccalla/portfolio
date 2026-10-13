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

export interface DockApp {
	id: `app-${string}`;
	title: string;
	/**
	 * Icon served from `public/dock/`, for example "/dock/figma.webp".
	 * Falls back to the built-in `glyph` when absent.
	 */
	icon?: string;
	/**
	 * Set for bare logos that need a rounded tile behind them. Leave unset for
	 * icons that already include their own rounded-square background.
	 */
	tile?: boolean;
	glyph?: AppGlyph;
	/** Two colours used for the tile gradient. */
	colors: readonly [string, string];
	/** Short label shown above the title in the app's window. */
	category: string;
	summary: string;
}

// The dock holds the applications actually in daily use. Replace the bracketed
// summaries, and add an icon to `public/dock/` for each new entry.
export const apps: readonly DockApp[] = [
	{
		id: "app-vscode",
		title: "Visual Studio Code",
		icon: "/dock/vscode.webp",
		tile: true,
		colors: ["#ffffff", "#f1f3f5"],
		category: "WHERE THE WORK HAPPENS",
		summary: "[What you build here, and the extensions you rely on]",
	},
	{
		id: "app-iterm",
		title: "iTerm2",
		icon: "/dock/iterm2.svg",
		colors: ["#2b3a42", "#141b1f"],
		category: "SHELL AND TOOLING",
		summary: "[Your shell, dotfiles, and the commands you live in]",
	},
	{
		id: "app-figma",
		title: "Figma",
		icon: "/dock/figma.webp",
		tile: true,
		colors: ["#ffffff", "#f1f3f5"],
		category: "DESIGN AND DIAGRAMS",
		summary: "[What you design, diagram, or prototype here]",
	},
	{
		id: "app-music",
		title: "Music",
		icon: "/dock/apple-music.webp",
		colors: ["#fc5c7d", "#f02e4c"],
		category: "OUTSIDE OF WORK",
		summary: "[What you listen to while you work, or play yourself]",
	},
];

export type WindowId = SectionId | DockApp["id"];

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

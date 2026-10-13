export type SectionId =
	| "about"
	| "projects"
	| "experience"
	| "certifications"
	| "writeups"
	| "resume"
	| "contact"
	| "llms";

/**
 * Sections that hold several entries are folders. Single-document sections use
 * `markdown` (rendered as a `.md` file), `text` (rendered as a `.txt` file),
 * or `document` for the PDF resume.
 */
export type IconKind = "folder" | "markdown" | "text" | "document";

export interface WindowDefinition {
	id: SectionId;
	title: string;
	icon: IconKind;
	description: string;
}

export const windowDefinitions: readonly WindowDefinition[] = [
	{
		id: "about",
		title: "about-me.md",
		icon: "markdown",
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
		title: "contact.md",
		icon: "markdown",
		description: "Start a conversation",
	},
	{
		id: "llms",
		title: "llms.txt",
		icon: "text",
		description: "Context for ATS, LLMs, and agents",
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
}

// Window text lives in src/content/windows/app-*.md.
export const apps: readonly DockApp[] = [
	{
		id: "app-vscode",
		title: "Visual Studio Code",
		icon: "/dock/vscode.webp",
		tile: true,
		colors: ["#ffffff", "#f1f3f5"],
		category: "WHERE THE WORK HAPPENS",
	},
	{
		id: "app-iterm",
		title: "iTerm2",
		icon: "/dock/iterm2.svg",
		colors: ["#2b3a42", "#141b1f"],
		category: "SHELL AND TOOLING",
	},
	{
		id: "app-figma",
		title: "Figma",
		icon: "/dock/figma.webp",
		tile: true,
		colors: ["#ffffff", "#f1f3f5"],
		category: "DESIGN AND DIAGRAMS",
	},
	{
		id: "app-music",
		title: "Music",
		icon: "/dock/apple-music.webp",
		colors: ["#fc5c7d", "#f02e4c"],
		category: "OUTSIDE OF WORK",
	},
];

export type WindowId = SectionId | DockApp["id"];

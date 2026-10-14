import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apps, windowDefinitions } from "../../data/portfolio";
import DesktopIsland from "./Desktop";

let changeViewport: (matches: boolean) => void;

function Desktop() {
	const content = Object.fromEntries(
		[...windowDefinitions, ...apps].map(({ id, title }) => [
			id.replace(/^app-/, ""),
			<p key={id}>Markdown content for {title}</p>,
		]),
	);
	return <DesktopIsland {...content} />;
}

beforeEach(() => {
	const listeners = new Set<() => void>();
	const query = {
		matches: false,
		addEventListener: (_event: string, listener: () => void) =>
			listeners.add(listener),
		removeEventListener: (_event: string, listener: () => void) =>
			listeners.delete(listener),
	};
	changeViewport = (matches) => {
		query.matches = matches;
		for (const listener of listeners) listener();
	};
	vi.stubGlobal("matchMedia", () => query);
});

function open(title: string) {
	fireEvent.doubleClick(screen.getByRole("button", { name: `Open ${title}` }));
	return screen.getByRole("dialog", { name: title });
}

function dock() {
	return within(screen.getByRole("navigation", { name: "Open windows" }));
}

function stubLayout(element: HTMLElement, box: DOMRect) {
	const layer = element.parentElement as HTMLElement;
	vi.spyOn(element, "getBoundingClientRect").mockReturnValue(box);
	vi.spyOn(layer, "getBoundingClientRect").mockReturnValue(
		new DOMRect(0, 0, 1200, 800),
	);
}

describe("portfolio desktop", () => {
	it("renders all semantic desktop icon buttons and opens about-me.md", () => {
		render(<Desktop />);
		const icons = within(
			screen.getByRole("navigation", { name: "Portfolio sections" }),
		);
		expect(icons.getAllByRole("button")).toHaveLength(windowDefinitions.length);
		for (const definition of windowDefinitions) {
			expect(
				icons.getByRole("button", { name: `Open ${definition.title}` }),
			).toBeVisible();
		}
		expect(screen.getByRole("dialog", { name: "about-me.md" })).toBeVisible();
	});

	it("requires double click with a mouse and shows the matching content", () => {
		render(<Desktop />);
		fireEvent.click(screen.getByRole("button", { name: "Close about-me.md" }));
		fireEvent.click(screen.getByRole("button", { name: "Open Projects" }), {
			detail: 1,
		});
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		const window = open("Projects");
		expect(
			within(window).getByText("Markdown content for Projects"),
		).toBeVisible();
		expect(
			within(window).getByRole("heading", { name: "Projects" }),
		).toHaveFocus();
	});

	it("closes a window and returns focus to its desktop icon", () => {
		render(<Desktop />);
		open("about-me.md");
		fireEvent.click(screen.getByRole("button", { name: "Close about-me.md" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Open about-me.md" }),
		).toHaveFocus();
		expect(dock().queryByRole("button")).not.toBeInTheDocument();
	});

	it("minimizes and restores via the dock without losing the window", () => {
		render(<Desktop />);
		fireEvent.click(screen.getByRole("button", { name: "Close about-me.md" }));
		const window = open("Projects");
		fireEvent.click(
			within(window).getByRole("button", {
				name: "Minimize Projects",
				hidden: false,
			}),
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		fireEvent.click(dock().getByRole("button", { name: "Restore Projects" }));
		expect(screen.getByRole("dialog", { name: "Projects" })).toBeVisible();
		expect(screen.getByRole("heading", { name: "Projects" })).toHaveFocus();
		fireEvent.click(dock().getByRole("button", { name: "Minimize Projects" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("keeps one instance and brings a selected window to the front", () => {
		render(<Desktop />);
		const about = open("about-me.md");
		const projects = open("Projects");
		expect(Number(projects.style.zIndex)).toBeGreaterThan(
			Number(about.style.zIndex),
		);
		fireEvent.click(dock().getByRole("button", { name: "Show about-me.md" }));
		expect(Number(about.style.zIndex)).toBeGreaterThan(
			Number(projects.style.zIndex),
		);
		open("about-me.md");
		expect(screen.getAllByRole("dialog")).toHaveLength(2);
		expect(dock().getAllByRole("button")).toHaveLength(2);
	});

	it("activates a window by pointer interaction and keyboard focus", () => {
		render(<Desktop />);
		const about = open("about-me.md");
		const projects = open("Projects");
		fireEvent.pointerDown(
			within(about).getByText("Markdown content for about-me.md"),
		);
		expect(
			dock().getByRole("button", { name: "Minimize about-me.md" }),
		).toHaveAttribute("aria-pressed", "true");
		act(() =>
			within(projects).getByRole("button", { name: "Close Projects" }).focus(),
		);
		expect(Number(projects.style.zIndex)).toBeGreaterThan(
			Number(about.style.zIndex),
		);
	});

	it("supports keyboard-generated activation and Escape only within a window", () => {
		render(<Desktop />);
		fireEvent.click(screen.getByRole("button", { name: "Close about-me.md" }));
		const icon = screen.getByRole("button", { name: "Open contact.md" });
		act(() => icon.focus());
		// Native buttons generate a detail=0 click for Enter/Space activation.
		fireEvent.click(icon, { detail: 0 });
		const heading = screen.getByRole("heading", { name: "contact.md" });
		expect(heading).toHaveFocus();
		fireEvent.keyDown(icon, { key: "Escape" });
		expect(screen.getByRole("dialog", { name: "contact.md" })).toBeVisible();
		fireEvent.keyDown(heading, { key: "Escape" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(icon).toHaveFocus();
	});

	it("focuses the next visible window when closing or minimizing the active one", () => {
		render(<Desktop />);
		open("about-me.md");
		open("Projects");
		fireEvent.click(screen.getByRole("button", { name: "Close Projects" }));
		expect(screen.getByRole("heading", { name: "about-me.md" })).toHaveFocus();
		open("contact.md");
		fireEvent.click(
			within(screen.getByRole("dialog", { name: "contact.md" })).getByRole(
				"button",
				{ name: "Minimize contact.md" },
			),
		);
		expect(screen.getByRole("heading", { name: "about-me.md" })).toHaveFocus();
	});

	it("opens every content section with its supplied Astro slot", () => {
		render(<Desktop />);
		for (const definition of windowDefinitions) {
			const window = open(definition.title);
			expect(
				within(window).getByText(`Markdown content for ${definition.title}`),
			).toBeVisible();
			fireEvent.click(
				within(window).getByRole("button", {
					name: `Close ${definition.title}`,
				}),
			);
		}
	});

	it("reports a missing window slot instead of silently showing an empty window", () => {
		render(<DesktopIsland />);
		const window = open("Projects");
		expect(within(window).getByRole("alert")).toHaveTextContent(
			"Content is unavailable for this window.",
		);
	});

	it("shows one window on mobile and restores others using the dock", () => {
		render(<Desktop />);
		act(() => changeViewport(true));
		open("about-me.md");
		open("Projects");
		expect(screen.getAllByRole("dialog")).toHaveLength(1);
		expect(screen.getByRole("dialog", { name: "Projects" })).toBeVisible();
		fireEvent.click(dock().getByRole("button", { name: "Show about-me.md" }));
		expect(screen.getAllByRole("dialog")).toHaveLength(1);
		expect(screen.getByRole("heading", { name: "about-me.md" })).toHaveFocus();
		act(() => changeViewport(false));
		expect(screen.getAllByRole("dialog")).toHaveLength(2);
	});

	it("updates the clock and cleans up its timer", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-10-13T12:00:00Z"));
		const { unmount, container } = render(<Desktop />);
		const initialTime = container.querySelector("time")?.dateTime;
		act(() => vi.advanceTimersByTime(60_000));
		expect(container.querySelector("time")?.dateTime).not.toBe(initialTime);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});

	it("moves focus off the desktop when a viewport change makes it inert", () => {
		render(<Desktop />);
		open("about-me.md");
		act(() => screen.getByRole("button", { name: "Open Projects" }).focus());
		act(() => changeViewport(true));
		expect(screen.getByRole("heading", { name: "about-me.md" })).toHaveFocus();
	});

	it("selects a folder on single click like Finder", () => {
		render(<Desktop />);
		const icon = screen.getByRole("button", { name: "Open Projects" });
		fireEvent.click(icon, { detail: 1 });
		expect(icon).toHaveClass("is-selected");
		fireEvent.pointerDown(document.querySelector(".desktop-home") as Element);
		expect(icon).not.toHaveClass("is-selected");
	});

	it("opens, minimizes, and restores dock applications", () => {
		render(<Desktop />);
		fireEvent.click(screen.getByRole("button", { name: "Close about-me.md" }));
		const dockApps = within(
			screen.getByRole("navigation", { name: "Applications" }),
		);
		expect(dockApps.getAllByRole("button")).toHaveLength(apps.length);
		const [first] = apps;
		fireEvent.click(
			dockApps.getByRole("button", { name: `Open ${first.title}` }),
		);
		const window = screen.getByRole("dialog", { name: first.title });
		expect(
			within(window).getByText(`Markdown content for ${first.title}`),
		).toBeVisible();
		expect(dock().queryByRole("button")).not.toBeInTheDocument();
		fireEvent.click(
			dockApps.getByRole("button", { name: `Minimize ${first.title}` }),
		);
		expect(
			screen.queryByRole("dialog", { name: first.title }),
		).not.toBeInTheDocument();
		fireEvent.click(
			dockApps.getByRole("button", { name: `Restore ${first.title}` }),
		);
		fireEvent.click(
			screen.getByRole("button", { name: `Close ${first.title}` }),
		);
		expect(
			dockApps.getByRole("button", { name: `Open ${first.title}` }),
		).toHaveFocus();
	});

	it("toggles window zoom from the green traffic light", () => {
		render(<Desktop />);
		const window = open("contact.md");
		fireEvent.click(
			within(window).getByRole("button", { name: "Zoom contact.md" }),
		);
		expect(window).toHaveClass("is-zoomed");
		fireEvent.click(
			within(window).getByRole("button", {
				name: "Restore size of contact.md",
			}),
		);
		expect(window).not.toHaveClass("is-zoomed");
	});

	it("resizes a window by dragging the bottom-right corner", () => {
		render(<Desktop />);
		const window = screen.getByRole("dialog", { name: "about-me.md" });
		stubLayout(window, new DOMRect(100, 50, 700, 580));
		const grip = window.querySelector(".window-resize-se") as HTMLElement;

		fireEvent.pointerDown(grip, { button: 0, clientX: 800, clientY: 630 });
		fireEvent.pointerMove(grip, { clientX: 900, clientY: 700 });
		fireEvent.pointerUp(grip);

		expect(window.style.getPropertyValue("--w")).toBe("800px");
		expect(window.style.getPropertyValue("--h")).toBe("650px");
		// Growing must not move the window.
		expect(window.style.getPropertyValue("--window-x")).toBe("100px");
		expect(window.style.getPropertyValue("--window-y")).toBe("50px");
	});

	it("resizes from the top-left corner by moving the origin", () => {
		render(<Desktop />);
		const window = screen.getByRole("dialog", { name: "about-me.md" });
		stubLayout(window, new DOMRect(100, 50, 700, 580));
		const grip = window.querySelector(".window-resize-nw") as HTMLElement;

		fireEvent.pointerDown(grip, { button: 0, clientX: 100, clientY: 50 });
		fireEvent.pointerMove(grip, { clientX: 60, clientY: 30 });
		fireEvent.pointerUp(grip);

		expect(window.style.getPropertyValue("--w")).toBe("740px");
		expect(window.style.getPropertyValue("--h")).toBe("600px");
		// The bottom-right corner stays anchored.
		expect(window.style.getPropertyValue("--window-x")).toBe("60px");
		expect(window.style.getPropertyValue("--window-y")).toBe("30px");
	});

	it("keeps a resized window within its minimum size and the desktop bounds", () => {
		render(<Desktop />);
		const window = screen.getByRole("dialog", { name: "about-me.md" });
		stubLayout(window, new DOMRect(100, 50, 700, 580));
		const grip = window.querySelector(".window-resize-se") as HTMLElement;

		fireEvent.pointerDown(grip, { button: 0, clientX: 800, clientY: 630 });
		fireEvent.pointerMove(grip, { clientX: 0, clientY: 0 });
		expect(window.style.getPropertyValue("--w")).toBe("360px");
		expect(window.style.getPropertyValue("--h")).toBe("280px");

		fireEvent.pointerMove(grip, { clientX: 4000, clientY: 4000 });
		expect(window.style.getPropertyValue("--w")).toBe("1100px");
		expect(window.style.getPropertyValue("--h")).toBe("750px");
	});

	it("shows the active window title in the menu bar", () => {
		render(<Desktop />);
		const menuBar = document.querySelector(".menu-app-name");
		expect(menuBar).toHaveTextContent("about-me.md");
		open("Experience");
		expect(menuBar).toHaveTextContent("Experience");
	});
});

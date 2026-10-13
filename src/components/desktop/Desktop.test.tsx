import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apps, windowDefinitions } from "../../data/portfolio";
import Desktop from "./Desktop";

let changeViewport: (matches: boolean) => void;

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

describe("portfolio desktop", () => {
	it("renders all seven semantic desktop icon buttons", () => {
		render(<Desktop />);
		const icons = within(
			screen.getByRole("navigation", { name: "Portfolio sections" }),
		);
		expect(icons.getAllByRole("button")).toHaveLength(7);
		for (const definition of windowDefinitions) {
			expect(
				icons.getByRole("button", { name: `Open ${definition.title}` }),
			).toBeVisible();
		}
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("requires double click with a mouse and shows the matching content", () => {
		render(<Desktop />);
		fireEvent.click(screen.getByRole("button", { name: "Open Projects" }), {
			detail: 1,
		});
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		const window = open("Projects");
		expect(
			within(window).getByRole("heading", {
				name: "[Project title] · Detection lab",
			}),
		).toBeVisible();
		expect(
			within(window).getByRole("heading", { name: "Projects" }),
		).toHaveFocus();
	});

	it("closes a window and returns focus to its desktop icon", () => {
		render(<Desktop />);
		open("About Me");
		fireEvent.click(screen.getByRole("button", { name: "Close About Me" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Open About Me" })).toHaveFocus();
		expect(dock().queryByRole("button")).not.toBeInTheDocument();
	});

	it("minimizes and restores via the dock without losing the window", () => {
		render(<Desktop />);
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
		const about = open("About Me");
		const projects = open("Projects");
		expect(Number(projects.style.zIndex)).toBeGreaterThan(
			Number(about.style.zIndex),
		);
		fireEvent.click(dock().getByRole("button", { name: "Show About Me" }));
		expect(Number(about.style.zIndex)).toBeGreaterThan(
			Number(projects.style.zIndex),
		);
		open("About Me");
		expect(screen.getAllByRole("dialog")).toHaveLength(2);
		expect(dock().getAllByRole("button")).toHaveLength(2);
	});

	it("activates a window by pointer interaction and keyboard focus", () => {
		render(<Desktop />);
		const about = open("About Me");
		const projects = open("Projects");
		fireEvent.pointerDown(
			within(about).getByText("Curiosity, with a defensive mindset."),
		);
		expect(
			dock().getByRole("button", { name: "Minimize About Me" }),
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
		const icon = screen.getByRole("button", { name: "Open Contact" });
		act(() => icon.focus());
		// Native buttons generate a detail=0 click for Enter/Space activation.
		fireEvent.click(icon, { detail: 0 });
		const heading = screen.getByRole("heading", { name: "Contact" });
		expect(heading).toHaveFocus();
		fireEvent.keyDown(icon, { key: "Escape" });
		expect(screen.getByRole("dialog", { name: "Contact" })).toBeVisible();
		fireEvent.keyDown(heading, { key: "Escape" });
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(icon).toHaveFocus();
	});

	it("focuses the next visible window when closing or minimizing the active one", () => {
		render(<Desktop />);
		open("About Me");
		open("Projects");
		fireEvent.click(screen.getByRole("button", { name: "Close Projects" }));
		expect(screen.getByRole("heading", { name: "About Me" })).toHaveFocus();
		open("Contact");
		fireEvent.click(
			within(screen.getByRole("dialog", { name: "Contact" })).getByRole(
				"button",
				{ name: "Minimize Contact" },
			),
		);
		expect(screen.getByRole("heading", { name: "About Me" })).toHaveFocus();
	});

	it("opens every content section with clearly marked placeholders", () => {
		render(<Desktop />);
		for (const definition of windowDefinitions) {
			const window = open(definition.title);
			expect(within(window).getByText(/Template content/)).toBeVisible();
			fireEvent.click(
				within(window).getByRole("button", {
					name: `Close ${definition.title}`,
				}),
			);
		}
	});

	it("keeps the resume action disabled until a real PDF is configured", () => {
		render(<Desktop />);
		const window = open("Resume");
		expect(
			within(window).getByRole("button", { name: /Open resume PDF/ }),
		).toBeDisabled();
	});

	it("shows one window on mobile and restores others using the dock", () => {
		render(<Desktop />);
		act(() => changeViewport(true));
		open("About Me");
		open("Projects");
		expect(screen.getAllByRole("dialog")).toHaveLength(1);
		expect(screen.getByRole("dialog", { name: "Projects" })).toBeVisible();
		fireEvent.click(dock().getByRole("button", { name: "Show About Me" }));
		expect(screen.getAllByRole("dialog")).toHaveLength(1);
		expect(screen.getByRole("heading", { name: "About Me" })).toHaveFocus();
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
		open("About Me");
		act(() => screen.getByRole("button", { name: "Open Projects" }).focus());
		act(() => changeViewport(true));
		expect(screen.getByRole("heading", { name: "About Me" })).toHaveFocus();
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
		const dockApps = within(
			screen.getByRole("navigation", { name: "Applications" }),
		);
		expect(dockApps.getAllByRole("button")).toHaveLength(apps.length);
		const [first] = apps;
		fireEvent.click(
			dockApps.getByRole("button", { name: `Open ${first.title}` }),
		);
		const window = screen.getByRole("dialog", { name: first.title });
		expect(within(window).getByText(first.summary)).toBeVisible();
		expect(dock().queryByRole("button")).not.toBeInTheDocument();
		fireEvent.click(
			dockApps.getByRole("button", { name: `Minimize ${first.title}` }),
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
		const window = open("Contact");
		fireEvent.click(
			within(window).getByRole("button", { name: "Zoom Contact" }),
		);
		expect(window).toHaveClass("is-zoomed");
		fireEvent.click(
			within(window).getByRole("button", { name: "Restore size of Contact" }),
		);
		expect(window).not.toHaveClass("is-zoomed");
	});

	it("shows the active window title in the menu bar", () => {
		render(<Desktop />);
		const menuBar = document.querySelector(".menu-app-name");
		expect(menuBar).toHaveTextContent("Finder");
		open("Experience");
		expect(menuBar).toHaveTextContent("Experience");
	});
});

import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { apps, type WindowId, windowDefinitions } from "../../data/portfolio";
import DesktopIcon from "./DesktopIcon";
import DesktopWindow from "./DesktopWindow";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import WindowContent from "./WindowContent";
import {
	focusedWindow,
	type WindowAction,
	windowReducer,
} from "./windowManager";
import "../../styles/desktop.css";

const windowApplications = [
	...windowDefinitions.map((definition) => ({
		id: definition.id,
		title: definition.title,
	})),
	...apps.map((app) => ({
		id: app.id,
		title: app.title,
	})),
];

export default function Desktop({
	children,
	...content
}: { children?: ReactNode } & Record<string, ReactNode>) {
	const [windows, dispatch] = useReducer(windowReducer, []);
	const [mobile, setMobile] = useState(false);
	const [selected, setSelected] = useState<WindowId>();
	const root = useRef<HTMLElement>(null);
	const focusTarget = useRef<string | undefined>(undefined);
	const active = focusedWindow(windows);
	const activeTitle = windowApplications.find(
		(app) => app.id === active,
	)?.title;

	useEffect(() => {
		const query = matchMedia(
			"(max-width: 700px), (pointer: coarse) and (max-height: 500px)",
		);
		const update = () => setMobile(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (!focusTarget.current) return;
		root.current
			?.querySelector<HTMLElement>(`#${focusTarget.current}`)
			?.focus();
		focusTarget.current = undefined;
	});

	useEffect(() => {
		// Compact mode must not leave focus in a hidden window or the inert desktop.
		if (
			mobile &&
			active &&
			!document.activeElement?.closest(
				".desktop-window.is-active, .dock-container, .menu-bar",
			)
		) {
			root.current?.querySelector<HTMLElement>(`#title-${active}`)?.focus();
		}
	}, [mobile, active]);

	function transition(action: WindowAction) {
		const next = windowReducer(windows, action);
		const nextActive = focusedWindow(next);
		const isSection = windowDefinitions.some(
			(definition) => definition.id === action.id,
		);
		focusTarget.current = nextActive
			? `title-${nextActive}`
			: `${isSection ? "desktop" : "dock"}-${action.id}`;
		dispatch(action);
	}

	function open(id: WindowId) {
		setSelected(id);
		transition({ type: "open", id });
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is an intentional one-time startup action.
	useEffect(() => {
		open("about");
	}, []);

	return (
		<main
			className="desktop"
			ref={root}
			aria-label="Interactive portfolio workspace"
			onKeyDown={(event) => {
				if (event.key !== "Escape" || event.defaultPrevented || !active) return;
				if (
					!(event.target instanceof Element) ||
					!event.target.closest('[role="dialog"]') ||
					event.target.closest(
						"input, textarea, select, [contenteditable=true]",
					)
				)
					return;
				event.preventDefault();
				transition({ type: "close", id: active });
			}}
		>
			<MenuBar appName={activeTitle ?? "Finder"} />
			<div className="desktop-surface">
				<div
					className="desktop-home"
					inert={mobile && Boolean(active)}
					onPointerDown={(event) => {
						if (!(event.target as Element).closest(".desktop-icon"))
							setSelected(undefined);
					}}
				>
					{children && <div className="desktop-widgets">{children}</div>}
					<p id="desktop-instructions" className="sr-only">
						Double-click or tap to open. Keyboard: Tab, then Enter or Space.
					</p>
					<nav className="desktop-icons" aria-label="Portfolio sections">
						{windowDefinitions.map((definition) => (
							<DesktopIcon
								key={definition.id}
								definition={definition}
								isOpen={windows.some((window) => window.id === definition.id)}
								selected={selected === definition.id}
								onSelect={() => setSelected(definition.id)}
								onOpen={() => open(definition.id)}
							/>
						))}
					</nav>
				</div>
				<div className="window-layer">
					{windowApplications.map((app, position) => {
						const index = windows.findIndex((window) => window.id === app.id);
						const window = windows[index];
						if (!window) return null;
						return (
							<DesktopWindow
								key={window.id}
								id={app.id}
								title={app.title}
								active={active === window.id}
								hidden={window.minimized || (mobile && active !== window.id)}
								stack={index + 1}
								position={position % 5}
								onActivate={() => dispatch({ type: "activate", id: window.id })}
								onClose={() => transition({ type: "close", id: window.id })}
								onMinimize={() =>
									transition({ type: "minimize", id: window.id })
								}
							>
								<WindowContent
									content={content[window.id.replace(/^app-/, "")]}
								/>
							</DesktopWindow>
						);
					})}
				</div>
			</div>
			<Dock
				windows={windows}
				active={active}
				onSelect={(id) =>
					transition({ type: active === id ? "minimize" : "open", id })
				}
			/>
			<div className="sr-only" role="status">
				{activeTitle ? `${activeTitle} window active` : "Desktop ready"}
			</div>
		</main>
	);
}

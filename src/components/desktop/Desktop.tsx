import { type ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { type WindowId, windowDefinitions } from "../../data/portfolio";
import DesktopIcon from "./DesktopIcon";
import DesktopWindow from "./DesktopWindow";
import Taskbar from "./Taskbar";
import WindowContent from "./WindowContent";
import {
	focusedWindow,
	type WindowAction,
	windowReducer,
} from "./windowManager";
import "../../styles/desktop.css";

export default function Desktop({ children }: { children?: ReactNode }) {
	const [windows, dispatch] = useReducer(windowReducer, []);
	const [mobile, setMobile] = useState(false);
	const root = useRef<HTMLElement>(null);
	const focusTarget = useRef<string | undefined>(undefined);
	const active = focusedWindow(windows);

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
			!document.activeElement?.closest(".desktop-window.is-active, .taskbar")
		) {
			root.current?.querySelector<HTMLElement>(`#title-${active}`)?.focus();
		}
	}, [mobile, active]);

	function transition(action: WindowAction) {
		const next = windowReducer(windows, action);
		const nextActive = focusedWindow(next);
		focusTarget.current = nextActive
			? `title-${nextActive}`
			: `desktop-${action.id}`;
		dispatch(action);
	}

	function open(id: WindowId) {
		transition({ type: "open", id });
	}

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
			<div className="desktop-surface">
				<div className="desktop-home" inert={mobile && Boolean(active)}>
					{children}
					<div className="desktop-navigation">
						<div className="section-heading">
							<span className="eyebrow">EXPLORE THE WORKSPACE</span>
							<span className="file-count">07 items</span>
						</div>
						<p id="desktop-instructions" className="desktop-instructions">
							<span className="mouse-instructions">
								Double-click to open ·{" "}
							</span>
							<span className="touch-instructions">Tap to open · </span>
							Keyboard: Tab, then Enter or Space
						</p>
						<nav className="desktop-icons" aria-label="Portfolio sections">
							{windowDefinitions.map((definition) => (
								<DesktopIcon
									key={definition.id}
									definition={definition}
									isOpen={windows.some((window) => window.id === definition.id)}
									onOpen={() => open(definition.id)}
								/>
							))}
						</nav>
					</div>
					<div className="desktop-footnote">
						<span className="status-dot" />
						<span>Built with curiosity. Documented with care.</span>
						<span className="workspace-version">WORKSPACE / 01</span>
					</div>
				</div>
				<div className="window-layer">
					{windowDefinitions.map((definition, position) => {
						const index = windows.findIndex(
							(window) => window.id === definition.id,
						);
						const window = windows[index];
						if (!window) return null;
						return (
							<DesktopWindow
								key={window.id}
								definition={definition}
								active={active === window.id}
								hidden={window.minimized || (mobile && active !== window.id)}
								stack={index + 1}
								position={position % 4}
								onActivate={() => dispatch({ type: "activate", id: window.id })}
								onClose={() => transition({ type: "close", id: window.id })}
								onMinimize={() =>
									transition({ type: "minimize", id: window.id })
								}
							>
								<WindowContent id={window.id} onOpen={open} />
							</DesktopWindow>
						);
					})}
				</div>
			</div>
			<Taskbar
				windows={windows}
				active={active}
				onStart={() => open("about")}
				onSelect={(id) =>
					transition({ type: active === id ? "minimize" : "open", id })
				}
			/>
			<div className="sr-only" role="status">
				{active
					? `${windowDefinitions.find((definition) => definition.id === active)?.title} window active`
					: "Desktop ready"}
			</div>
		</main>
	);
}

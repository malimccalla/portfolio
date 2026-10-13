import type { WindowId } from "../../data/portfolio";

export interface OpenWindow {
	id: WindowId;
	minimized: boolean;
}

export type WindowState = readonly OpenWindow[];
export type WindowAction =
	| { type: "open" | "activate"; id: WindowId }
	| { type: "close" | "minimize"; id: WindowId };

export function focusedWindow(state: WindowState): WindowId | undefined {
	return state.findLast((window) => !window.minimized)?.id;
}

// Array order is the stacking order; reopening moves the existing instance.
export function windowReducer(
	state: WindowState,
	action: WindowAction,
): WindowState {
	const existing = state.find((window) => window.id === action.id);
	switch (action.type) {
		case "open":
			return [
				...state.filter((window) => window.id !== action.id),
				{ id: action.id, minimized: false },
			];
		case "activate":
			if (
				!existing ||
				(focusedWindow(state) === action.id && !existing.minimized)
			)
				return state;
			return [
				...state.filter((window) => window.id !== action.id),
				{ id: action.id, minimized: false },
			];
		case "close":
			return state.filter((window) => window.id !== action.id);
		case "minimize":
			return state.map((window) =>
				window.id === action.id ? { ...window, minimized: true } : window,
			);
	}
}

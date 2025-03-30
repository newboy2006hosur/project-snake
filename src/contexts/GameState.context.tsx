import { createContext, useContext, useEffect, useState } from "react";

type GameState = {
	screen: "menu" | "game" | "pause";
	setScreen: (screen: "menu" | "game" | "pause") => void;
};

const GameStateContext = createContext<GameState | undefined>(undefined);

export const GameStateProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [screen, setScreen] = useState<"menu" | "game" | "pause">("menu");

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setScreen((prev) =>
					prev === "game" ? "pause" : prev === "pause" ? "game" : prev
				);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<GameStateContext.Provider value={{ screen, setScreen }}>
			{children}
		</GameStateContext.Provider>
	);
};

export const useGameState = () => {
	const context = useContext(GameStateContext);
	if (!context)
		throw new Error("useGameState must be used within GameStateProvider");
	return context;
};

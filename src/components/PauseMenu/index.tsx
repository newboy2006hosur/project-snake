import { useEffect, useState } from "react";
import { useGameState } from "./../../contexts/GameContext";
import "./PauseMenu.css";

const pauseOptions = ["Resume", /*"Save",*/ "Return to Main Menu"];

const PauseMenu = () => {
	const { setScreen, setIsPaused } = useGameState();
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				setSelectedIndex(
					(prev) => (prev - 1 + pauseOptions.length) % pauseOptions.length
				);
			} else if (e.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % pauseOptions.length);
			} else if (e.key === "Enter") {
				handleSelect(pauseOptions[selectedIndex]);
			} else if (e.key === "Escape") {
				setIsPaused(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedIndex]);

	// Controller support
	useEffect(() => {
		let lastPress = 0;

		const updateGamepadInput = () => {
			const gamepads = navigator.getGamepads();
			if (!gamepads) return;

			const gp = gamepads[0]; // First connected controller
			if (gp) {
				const now = performance.now();
				const threshold = 0.5;

				if (gp.axes[1] < -threshold && now - lastPress > 200) {
					setSelectedIndex(
						(prev) => (prev - 1 + pauseOptions.length) % pauseOptions.length
					);
					lastPress = now;
				} else if (gp.axes[1] > threshold && now - lastPress > 200) {
					setSelectedIndex((prev) => (prev + 1) % pauseOptions.length);
					lastPress = now;
				} else if (gp.buttons[0].pressed && now - lastPress > 200) {
					handleSelect(pauseOptions[selectedIndex]);
					lastPress = now;
				} else if (gp.buttons[1].pressed || gp.buttons[9].pressed) {
					setIsPaused(false);
				}
			}

			requestAnimationFrame(updateGamepadInput);
		};

		updateGamepadInput();
	}, [selectedIndex]);

	const handleSelect = (option: string) => {
		if (option === "Resume") setIsPaused(false);
		if (option === "Save") {
			// Handle save logic here (if applicable)
		}
		if (option === "Return to Main Menu") {
			setIsPaused(false);
			setScreen("menu");
		}
	};

	return (
		<div className="pause-menu">
			<div className="pause-container">
				<ul>
					{pauseOptions.map((item, index) => (
						<li
							key={item}
							className={index === selectedIndex ? "selected" : ""}
							onClick={() => handleSelect(item)}
						>
							{item}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default PauseMenu;

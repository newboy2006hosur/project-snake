import { useState, useEffect, useCallback, useRef } from "react";
import { useGameState } from "./../contexts/GameContext";

const menuItems = ["New Game", /*"Continue", "Settings",*/ "Exit"];

const GameMenu = () => {
	const { setScreen, restoreGameState, resetState } = useGameState();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const selectedIndexRef = useRef(selectedIndex);

	// Keep the ref updated with the current selectedIndex
	useEffect(() => {
		selectedIndexRef.current = selectedIndex;
	}, [selectedIndex]);

	const handleSelect = useCallback(
		(selectedOption: string) => {
			if (selectedOption === "New Game") { resetState(); setScreen("game"); }
			if (selectedOption === "Continue") { restoreGameState(); setScreen("game"); }
			if (selectedOption === "Settings") setScreen("settings");
			if (selectedOption === "Exit") window.close();
		},
		[setScreen]
	);

	// Keyboard input
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowUp") {
				setSelectedIndex(
					(prev) => (prev - 1 + menuItems.length) % menuItems.length
				);
			} else if (e.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % menuItems.length);
			} else if (e.key === "Enter") {
				handleSelect(menuItems[selectedIndex]);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedIndex, handleSelect]);

	// Gamepad input
	useEffect(() => {
		let animationFrameId: number;
		let isAxisActive = false;
		let isButtonAPressed = false;

		const updateGamepadInput = () => {
			const gamepads = navigator.getGamepads();
			const gp = gamepads[0];

			if (gp) {
				const threshold = 0.5;
				const yAxis = gp.axes[1];

				// Handle vertical axis movement (up/down)
				if (yAxis < -threshold) {
					// Up
					if (!isAxisActive) {
						setSelectedIndex(
							(prev) => (prev - 1 + menuItems.length) % menuItems.length
						);
						isAxisActive = true;
					}
				} else if (yAxis > threshold) {
					// Down
					if (!isAxisActive) {
						setSelectedIndex((prev) => (prev + 1) % menuItems.length);
						isAxisActive = true;
					}
				} else {
					isAxisActive = false;
				}

				// Handle A button press (confirm selection)
				if (gp.buttons[0].pressed) {
					if (!isButtonAPressed) {
						handleSelect(menuItems[selectedIndexRef.current]);
						isButtonAPressed = true;
					}
				} else {
					isButtonAPressed = false;
				}
			}

			animationFrameId = requestAnimationFrame(updateGamepadInput);
		};

		animationFrameId = requestAnimationFrame(updateGamepadInput);

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [handleSelect]);

	return (
		<div className="menu">
			<h1 className="title">Project Snake</h1>
			<ul>
				{menuItems.map((item, index) => (
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
	);
};

export default GameMenu;

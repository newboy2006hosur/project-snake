import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faAppleAlt,
	faLemon,
	faCarrot,
	faPepperHot,
	faKiwiBird,
} from "@fortawesome/free-solid-svg-icons";
import Snake from "./Snake";
import { useGameState, Coords } from "../contexts/GameContext";
import PauseMenu from "./PauseMenu/index";

const foodIcons = [faAppleAlt, faLemon, faCarrot, faPepperHot, faKiwiBird];

const SnakeGame = () => {
	const { isPaused, gridSize, score, setScore, setScreen, snake, setSnake, direction, setDirection, food, setFood, highScore, setHighScore } = useGameState();
	const [cols, setCols] = useState(0);
	const [rows, setRows] = useState(0);
	const [cellSize, setCellSize] = useState(0);
	const [currentFoodIcon, setCurrentFoodIcon] = useState(foodIcons[0]);

	// Extracted functions
	const handleKeyDown = (event: KeyboardEvent) => {
		if (isPaused) return;
		switch (event.key) {
			case "ArrowUp":
				if (direction.y === 0) setDirection({ x: 0, y: -1 });
				break;
			case "ArrowDown":
				if (direction.y === 0) setDirection({ x: 0, y: 1 });
				break;
			case "ArrowLeft":
				if (direction.x === 0) setDirection({ x: -1, y: 0 });
				break;
			case "ArrowRight":
				if (direction.x === 0) setDirection({ x: 1, y: 0 });
				break;
		}
	};

	const handleTouchStart = (e: TouchEvent) => {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
	};

	const handleTouchEnd = (e: TouchEvent) => {
		if (isPaused) return;
		const endX = e.changedTouches[0].clientX;
		const endY = e.changedTouches[0].clientY;

		const deltaX = endX - startX;
		const deltaY = endY - startY;
		const absDeltaX = Math.abs(deltaX);
		const absDeltaY = Math.abs(deltaY);

		const minSwipeDistance = 30;

		if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
			if (deltaX > 0 && direction.x === 0) setDirection({ x: 1, y: 0 });
			else if (deltaX < 0 && direction.x === 0) setDirection({ x: -1, y: 0 });
		} else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
			if (deltaY > 0 && direction.y === 0) setDirection({ x: 0, y: 1 });
			else if (deltaY < 0 && direction.y === 0) setDirection({ x: 0, y: -1 });
		}
	};

	const getGamepadDirection = (axes: readonly number[], threshold: number): Coords => {
		if (axes[1] < -threshold && direction.y === 0) return { x: 0, y: -1 };
		if (axes[1] > threshold && direction.y === 0) return { x: 0, y: 1 };
		if (axes[0] < -threshold && direction.x === 0) return { x: -1, y: 0 };
		if (axes[0] > threshold && direction.x === 0) return { x: 1, y: 0 };
		return direction;
	};

	const updateGamepadInput = () => {
		if (isPaused) return;
		const gamepads = navigator.getGamepads();
		if (!gamepads) return;

		const gp = gamepads[0];
		if (gp) {
			const newDirection = getGamepadDirection(gp.axes, 0.5);
			if (newDirection !== direction) {
				setDirection(newDirection);
			}
		}

		requestAnimationFrame(updateGamepadInput);
	};

	const updateSnakePosition = () => {
		if (isPaused) return;

		setSnake((prevSnake: Coords[]): Coords[] => {
			const newHead: Coords = {
				x: (prevSnake[0].x + direction.x + cols) % cols,
				y: (prevSnake[0].y + direction.y + rows) % rows,
			};

			if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
				handleGameOver();
				return [{ x: 10, y: 10 }] as Coords[];
			}

			if (newHead.x === food.x && newHead.y === food.y) {
				setScore(score + 1);
				spawnFood();
				return [newHead, ...prevSnake];
			}

			return [newHead, ...prevSnake.slice(0, -1)];
		});
	};

	// Effects
	useEffect(() => {
		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight - 40;
		const size = Math.min(screenWidth, screenHeight) / gridSize;
		setCellSize(size);
		setCols(Math.floor(screenWidth / size));
		setRows(Math.floor(screenHeight / size));
	}, [gridSize]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [direction, isPaused]);

	useEffect(() => {
		updateGamepadInput();
	}, [direction, isPaused]);

	let startX = 0;
	let startY = 0;

	useEffect(() => {
		window.addEventListener("touchstart", handleTouchStart);
		window.addEventListener("touchend", handleTouchEnd);

		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [direction, isPaused]);

	useEffect(() => {
		const interval = setInterval(updateSnakePosition, 200);
		return () => clearInterval(interval);
	}, [direction, cols, rows, isPaused, food, score]);

	// Prevent food from spawning on the snake
	const spawnFood = () => {
		let newFood: { x: number; y: number };
		do {
			newFood = {
				x: Math.floor(Math.random() * cols),
				y: Math.floor(Math.random() * rows),
			};
		} while (
			snake.some(
				(segment) => segment.x === newFood.x && segment.y === newFood.y
			)
		);

		setFood(newFood);
		setCurrentFoodIcon(foodIcons[Math.floor(Math.random() * foodIcons.length)]);
	};

	// Handle game over
	const handleGameOver = () => {
		alert("Game Over!");
		if(highScore < score) setHighScore(score);
		setScore(0);
		setScreen("menu")
	};

	// Auto-save every 5 seconds
	/*useEffect(() => {
		if(screen !== "game") return;
		const gameState = {
			speed,
			gridSize,
			score,
			highScore,
			snake,
			direction,
			food
		};
		const interval = setInterval(() => autoSave(gameState), 5000);
		return () => clearInterval(interval);
	}, [screen]);*/

	return (
		<>
			<div className="score-card">Score - {score}</div>
			<div
				style={{
					position: "relative",
					width: "100dvw",
					height: "calc(100vh - 40px)",
					backgroundColor: "#222",
					overflow: "hidden",
				}}
			>
				{isPaused && <PauseMenu />}
				<Snake snake={snake} cellSize={cellSize} />

				{/* Food Icon */}
				<div
					style={{
						position: "absolute",
						left: food.x * cellSize,
						top: food.y * cellSize,
						width: cellSize,
						height: cellSize,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						color: "limegreen",
						filter: "drop-shadow(0px 0px 8px limegreen)",
					}}
				>
					<FontAwesomeIcon icon={currentFoodIcon} size="lg" />
				</div>
			</div>
		</>
	);
};

export default SnakeGame;

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	Dispatch,
	SetStateAction,
	useMemo
} from "react";

type Screen = "menu" | "game" | "settings";

interface GameStateContextProps {
	screen: Screen;
	setScreen: (screen: Screen) => void;
	isPaused: boolean;
	setIsPaused: (isPaused: boolean) => void;
	speed: number;
	setSpeed: (speed: number) => void;
	gridSize: number;
	setGridSize: (gridSize: number) => void;
	score: number;
	setScore: (score: number) => void;
	snake: Coords[];
	setSnake: Dispatch<SetStateAction<Coords[]>>;
	direction: Coords;
	setDirection: (direction: Coords) => void;
	food: Coords;
	setFood: (food: Coords) => void;
	highScore: number;
	setHighScore: (highScore: number) => void;
	autoSave: (gameState: any) => void;
	restoreGameState: () => void;
	resetState: () => void;
}

export interface Coords {
	x: number;
	y: number;
}

const GameStateContext = createContext<GameStateContextProps | undefined>(
	undefined
);

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
	const [screen, setScreen] = useState<Screen>("menu");
	const [isPaused, setIsPaused] = useState(false);
	const [speed, setSpeed] = useState(200);
	const [gridSize, setGridSize] = useState(45);
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
	const [direction, setDirection] = useState({ x: 1, y: 0 });
	const [food, setFood] = useState({ x: 5, y: 5 });

	const resetState = () => {
		setScore(0);
		setSnake([{ x: 10, y: 10 }]);
		setDirection({ x: 1, y: 0});
		setFood({ x: 5, y: 5});
	}

	// Function to save the game state to localStorage
	const autoSave = (gameState: any) => {
		console.log("here");
		console.log(gameState)
		localStorage.setItem("snakeGameState", JSON.stringify(gameState));
	};

	// Function to restore game state from localStorage
	const restoreGameState = () => {
		const savedState = localStorage.getItem("snakeGameState");
		if (savedState) {
			const {
				speed,
				gridSize,
				score,
				highScore,
				snake,
				direction,
				food
			} = JSON.parse(savedState);

			setSpeed(speed);
			setGridSize(gridSize);
			setScore(score);
			setHighScore(highScore);
			setSnake(snake);
			setDirection(direction);
			setFood(food);
		}
	};

	// Handle keyboard input for pausing (only in game screen)
	useEffect(() => {
		if (screen !== "game") return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" || e.key.toLowerCase() === "p") {
				setIsPaused((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [screen]);

	// Handle gamepad input for pausing (only in game screen)
	useEffect(() => {
		if (screen !== "game") return;
	
		let lastPress = -1;
		let animationFrameId: number;
	
		const updateGamepadInput = () => {
			const gamepads = navigator.getGamepads();
			if (!gamepads) return;
	
			const gp = gamepads[0]; // First connected controller
			if (gp) {
				// Log all button states
				gp.buttons.forEach((button, index) => {
					if (button.pressed) {
						console.log(`Button ${index} is pressed!`);
					}
				});
	
				// Find if any button is being pressed
				const pressedButtonIndex = gp.buttons.findIndex((b) => b.pressed);
	
				// Only toggle pause if a button was pressed and it's a new press
				if (pressedButtonIndex !== -1 && pressedButtonIndex !== lastPress) {
					console.log(`Detected button ${pressedButtonIndex} press.`);
					setIsPaused((prev) => !prev);
					lastPress = pressedButtonIndex;
				}
			}
	
			animationFrameId = requestAnimationFrame(updateGamepadInput);
		};
	
		animationFrameId = requestAnimationFrame(updateGamepadInput);
	
		return () => cancelAnimationFrame(animationFrameId);
	}, [screen]);
	
	
	

	const value = useMemo(() => ({
		screen,
		setScreen,
		isPaused,
		setIsPaused,
		speed,
		setSpeed,
		gridSize,
		setGridSize,
		score,
		setScore,
		snake,
		setSnake,
		direction,
		setDirection,
		food,
		setFood,
		highScore,
		setHighScore, 
	}), [screen, speed, gridSize, score, highScore, snake, direction, food, isPaused])

	return (
		<GameStateContext.Provider
			value={{ 
				...value,
				autoSave, 
				restoreGameState,
				resetState
			}}
		>
			{children}
		</GameStateContext.Provider>
	);
};

export const useGameState = () => {
	const context = useContext(GameStateContext);
	if (!context) {
		throw new Error("useGameState must be used within a GameStateProvider");
	}
	return context;
};

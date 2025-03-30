import { GameStateProvider, useGameState } from "./contexts/GameContext";
import GameMenu from "./components/GameMenu";
import SnakeGame from "./components/SnakeGame";

const AppContent = () => {
	const { screen } = useGameState();

	return (
		<div className="app">
			{screen === "menu" && <GameMenu />}
			{screen === "game" && <SnakeGame />}
		</div>
	);
};

const App = () => (
	<GameStateProvider>
		<AppContent />
	</GameStateProvider>
);

export default App;

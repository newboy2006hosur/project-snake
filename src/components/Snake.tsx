import React from "react";

interface SnakeProps {
	snake: { x: number; y: number }[];
	cellSize: number;
}

const Snake: React.FC<SnakeProps> = ({ snake, cellSize }) => {
	return (
		<>
			{snake.map((segment, index) => {
				const isHead = index === 0;
				const isTail = index === snake.length - 1;

				const baseStyle = {
					position: "absolute" as const,
					left: `${segment.x * cellSize}px`,
					top: `${segment.y * cellSize}px`,
					width: `${cellSize}px`,
					height: `${cellSize}px`,
					borderRadius: isTail ? "50%" : "4px",
					
				};

				const headStyle = {
					...baseStyle,
					backgroundColor: "cyan",
					boxShadow: "0 0 8px cyan",
				};

				const tailStyle = {
					...baseStyle,
					backgroundColor: "darkgreen",
					opacity: 0.6,
				};

				const bodyStyle = {
					...baseStyle,
					backgroundColor: "limegreen",
				};

				return (
					<div
						key={index}
						style={isHead ? headStyle : isTail ? tailStyle : bodyStyle}
					/>
				);
			})}
		</>
	);
};

export default Snake;

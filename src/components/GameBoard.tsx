// GameBoard.tsx
import React from 'react';
import {GameBoardProps} from '../types/types';

const GameBoard: React.FC<GameBoardProps> = ({grid}) => {
  return (
    <div className="inline-block border-2 border-gray-900 bg-gray-800">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`w-7 h-7 border border-gray-800 ${
                cell.filled ? cell.color : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;

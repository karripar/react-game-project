// App.tsx
import { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import { createGrid, ROWS, COLS } from './utils/constants';
import { TETROMINOS } from './lib/shapes';
import { Cell } from './types/types'; // If you have a separate type file


function App() {
  const [grid, setGrid] = useState<Cell[][]>(createGrid);
  const [position, setPosition] = useState({ row: 0, col: 3 }); // Start near top center
  const shape = TETROMINOS.I.shape;

  // Merge shape into grid at current position
  const drawPiece = () => {
    const newGrid = createGrid();
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const drawY = position.row + y;
          const drawX = position.col + x;
          if (drawY >= 0 && drawY < ROWS && drawX >= 0 && drawX < COLS) {
            newGrid[drawY][drawX] = {
              filled: true,
              color: TETROMINOS.I.color,
            };
          }
        }
      });
    });
    setGrid(newGrid);
  };

  // Piece falls every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({ ...prev, row: prev.row + 1 }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Redraw piece whenever position changes
  useEffect(() => {
    drawPiece();
  }, [position]);

  return (


    <div className="min-h-screen text-white flex items-center justify-center gap-8 p-4">
  {/* Stalin on the left side */}
  <div className="text-center">
    <audio id="tetris-audio" src="/media/tetris-main.mp3" loop autoPlay />
    <button
      onClick={() => {
        const audio = document.getElementById('tetris-audio') as HTMLAudioElement;
        if (audio?.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      }}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
    >
      Toggle Music
    </button>

    <h1 className="text-4xl font-bold mb-4 text-soviet-red">React Tetris</h1>
    <GameBoard grid={grid} />
    <img
    src="/media/stalin.png"
    alt="Stalin"
    className="h-[400px] w-auto object-contain"
  />
  </div>
</div>


  );
}

export default App;

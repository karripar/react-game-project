// App.tsx
import {useState, useEffect} from 'react';
import GameBoard from './components/GameBoard';
import {COLS, createGrid} from './utils/constants';
import {TETROMINOS} from './lib/shapes';
import {Cell} from './types/types'; // If you have a separate type file
import {checkCollision} from './utils/collision';
import {randomTetromino} from './lib/randomize';
import {useInterval} from './hooks/useInterval';

function App() {
  const [grid, setGrid] = useState<Cell[][]>(createGrid);
  const [position, setPosition] = useState({row: 0, col: 3}); // Start near top center
  const [tetromino, setTetromino] = useState(randomTetromino());
  const shape = tetromino.shape;
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Merge shape into grid at current position
  const getOverlayGrid = () => {
    const overlay = grid.map((row) => row.map((cell) => ({...cell})));

    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const drawY = position.row + y;
          const drawX = position.col + x;
          if (
            drawY >= 0 &&
            drawY < overlay.length &&
            drawX >= 0 &&
            drawX < overlay[0].length
          ) {
            overlay[drawY][drawX] = {
              filled: true,
              color: TETROMINOS.I.color,
            };
          }
        }
      });
    });

    return overlay;
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const clearLines = (
    grid: Cell[][],
  ): {newGrid: Cell[][]; linesCleared: number} => {
    const newGrid = grid.filter((row) => row.some((cell) => !cell.filled));
    const linesCleared = grid.length - newGrid.length;

    if (linesCleared > 0) {
      const emptyRow = Array(COLS).fill({filled: false, color: ''});
      for (let i = 0; i < linesCleared; i++) {
        newGrid.unshift(emptyRow);
      }
    }

    return {newGrid, linesCleared};
  };

  const handlePieceLock = () => {
    // Lock the current piece into the grid
    const newGridCopy = grid.map((row) => row.map((cell) => ({ ...cell })));

    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const lockY = position.row + y;
          const lockX = position.col + x;
          if (lockY >= 0) {
            newGridCopy[lockY][lockX] = {
              filled: true,
              color: tetromino.color,
            };
          }
        }
      });
    });

    // Clear lines and get the updated grid and lines cleared
    const { newGrid, linesCleared } = clearLines(newGridCopy);

    // Update the score immediately after line clearing
    setScore((prevScore) => prevScore + linesCleared * 100); // 100 points per line

    // Update the grid
    setGrid(newGrid);

    // Spawn a new random piece and reset its position
    setTetromino(randomTetromino());
    setPosition({ row: 0, col: 3 }); // Reset position for new shape
  };



  // Piece falls every 500ms
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = {...prev, row: prev.row + 1};

        if (!checkCollision(shape, grid, next)) {
          return next; // keep falling
        } else {
          // Lock current shape into the grid
          const newGrid = grid.map((row) => row.map((cell) => ({...cell})));

          shape.forEach((row, y) => {
            row.forEach((cell, x) => {
              if (cell) {
                const lockY = prev.row + y;
                const lockX = prev.col + x;
                if (lockY >= 0) {
                  newGrid[lockY][lockX] = {
                    filled: true,
                    color: tetromino.color,
                  };
                }
              }
            });
          });

          setGrid(newGrid); // Update grid with locked piece
          setTetromino(randomTetromino()); // Spawn new random shape
          setPosition({row: 0, col: 3}); // Reset position for new shape

          // ✅ Optional: check for Game Over
          if (checkCollision(shape, newGrid, {row: 0, col: 3})) {
            alert('Game Over');
            setGrid(createGrid());
          }

          return prev; // Prevent extra falling
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, [grid, shape, isPaused]);

  // Redraw piece whenever position changes
  useEffect(() => {
    getOverlayGrid();
  }, [position]);

  const move = (dir: number) => {
    if (isPaused) return;
    const newPos = {row: position.row, col: position.col + dir};
    if (!checkCollision(tetromino.shape, grid, newPos)) {
      setPosition(newPos);
    }
  };

  // drop function stays the same
  const drop = () => {
    if (isPaused) return;
    const newPos = {row: position.row + 1, col: position.col};
    if (!checkCollision(tetromino.shape, grid, newPos)) {
      setPosition(newPos); // Move the piece down
    } else {
      handlePieceLock(); // Lock the piece if it cannot move down
    }
  };

  // Gravity effect every 500ms
  useInterval(() => {
    drop();
  }, 500);

  const rotateMatrix = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, x) => matrix.map((row) => row[x])).reverse();
  };

  const rotate = () => {
    if (isPaused) return;
    const rotated = rotateMatrix(tetromino.shape);
    if (!checkCollision(rotated, grid, position)) {
      setTetromino({...tetromino, shape: rotated});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent the default action (scrolling) for arrow keys
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
      }

      // Handle movement and rotation
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        move(-1); // Move left
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        move(1); // Move right
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        drop(); // Drop piece
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        rotate(); // Rotate piece
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, tetromino, grid, isPaused]);

  return (
    <div className="min-h-screen text-white flex items-center justify-center gap-8 p-4">
      {/* Stalin on the left side */}
      <div className="text-center">
        <audio id="tetris-audio" src="/media/tetris-main.mp3" loop autoPlay />
        <div className="text-2xl font-bold mb-4 text-soviet-red">
          Score: {score}
        </div>
        <button
          onClick={() => {
            const audio = document.getElementById(
              'tetris-audio',
            ) as HTMLAudioElement;
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

        <h1 className="text-4xl font-bold mb-4 text-soviet-red">Dictris</h1>
        <GameBoard grid={getOverlayGrid()} />
        <div className="flex justify-center mt-4">
          <button
            onClick={togglePause}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
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

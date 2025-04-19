import { TETROMINOS } from './shapes';

const tetrominoKeys = Object.keys(TETROMINOS) as (keyof typeof TETROMINOS)[];

export const randomTetromino = () => {
  const randKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  return TETROMINOS[randKey];
};

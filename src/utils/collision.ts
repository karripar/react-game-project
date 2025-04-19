// utils/checkCollision.ts
import { Cell } from "../types/types";

export const checkCollision = (
  shape: number[][],
  grid: Cell[][],
  pos: { row: number; col: number }
): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newY = pos.row + y;
        const newX = pos.col + x;

        // Check boundaries
        if (
          newY >= grid.length || // bottom of grid
          newX < 0 || // left wall
          newX >= grid[0].length || // right wall
          (newY >= 0 && grid[newY][newX]?.filled) // collides with placed block
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

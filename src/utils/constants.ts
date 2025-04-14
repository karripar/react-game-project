import { Cell } from "../types/types";

export const ROWS = 20;
export const COLS = 10;

export const createGrid = (): Cell[][] =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ filled: false, color: '' }))
  );


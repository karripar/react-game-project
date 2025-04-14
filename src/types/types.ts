export type Cell = {
  filled: boolean;
  color: string;
};

export type GameBoardProps = {
  grid: Cell[][];
};

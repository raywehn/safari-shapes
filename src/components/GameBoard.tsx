
import React, { useState } from 'react';
import ShapeItem, { ShapeType, SizeType, SHAPE_POINTS } from './ShapeItem';
import { cn } from '@/lib/utils';

export type CellContent = {
  id: string;
  shape: ShapeType;
  size: SizeType;
} | null;

interface GameBoardProps {
  size: number;
  cellSize: number;
  cells: (CellContent)[][];
  onCellClick?: (row: number, col: number) => void;
  selectedShape: CellContent | null;
  readOnly?: boolean;
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  size,
  cellSize,
  cells,
  onCellClick,
  selectedShape,
  readOnly = false,
  className
}) => {
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const handleMouseEnter = (row: number, col: number) => {
    if (!readOnly && !cells[row][col]) {
      setHoverCell({ row, col });
    }
  };

  const handleMouseLeave = () => {
    setHoverCell(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!readOnly && onCellClick) {
      onCellClick(row, col);
    }
  };

  return (
    <div 
      className={cn('game-board', className)} 
      style={{ 
        gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
      }}
    >
      {cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              'board-cell',
              cell && 'occupied',
              hoverCell?.row === rowIndex && 
              hoverCell?.col === colIndex && 
              'hover',
              readOnly && 'cursor-default'
            )}
            style={{ width: cellSize, height: cellSize }}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          >
            {cell && (
              <ShapeItem shape={cell.shape} size={cell.size} preview={true} />
            )}
            {hoverCell?.row === rowIndex && 
             hoverCell?.col === colIndex && 
             selectedShape && (
              <ShapeItem 
                shape={selectedShape.shape} 
                size={selectedShape.size} 
                preview={true} 
                className="opacity-50" 
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GameBoard;

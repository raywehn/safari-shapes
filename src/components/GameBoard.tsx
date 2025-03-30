
import React, { useState } from 'react';
import ShapeItem, { ShapeType, SizeType, SHAPE_POINTS, SIZE_GRID_CELLS } from './ShapeItem';
import { cn } from '@/lib/utils';

export type CellContent = {
  id: string;
  shape: ShapeType;
  size: SizeType;
  name?: string;
  origin?: { row: number, col: number };
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

  const canPlaceShape = (row: number, col: number, shape: CellContent) => {
    if (!shape) return false;
    
    const gridSize = SIZE_GRID_CELLS[shape.size];
    
    // Check if shape fits within board boundaries
    if (row + gridSize.height > size || col + gridSize.width > size) {
      return false;
    }
    
    // Check if all required cells are empty
    for (let r = 0; r < gridSize.height; r++) {
      for (let c = 0; c < gridSize.width; c++) {
        if (cells[row + r][col + c] !== null) {
          return false;
        }
      }
    }
    
    return true;
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!readOnly && selectedShape) {
      setHoverCell({ row, col });
    }
  };

  const handleMouseLeave = () => {
    setHoverCell(null);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!readOnly && onCellClick && selectedShape && canPlaceShape(row, col, selectedShape)) {
      onCellClick(row, col);
    }
  };

  // Determine if a cell should show the hover effect
  const shouldShowHover = (row: number, col: number) => {
    if (!hoverCell || !selectedShape) return false;
    
    const { row: hoverRow, col: hoverCol } = hoverCell;
    const gridSize = SIZE_GRID_CELLS[selectedShape.size];
    
    return row >= hoverRow && 
           row < hoverRow + gridSize.height && 
           col >= hoverCol && 
           col < hoverCol + gridSize.width;
  };

  // Determine if a cell is part of a larger shape
  const isPartOfShape = (row: number, col: number) => {
    const cell = cells[row][col];
    if (!cell || !cell.origin) return false;
    
    return cell.origin.row !== row || cell.origin.col !== col;
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
        row.map((cell, colIndex) => {
          const isValidPlacement = selectedShape && 
                                  hoverCell?.row === rowIndex && 
                                  hoverCell?.col === colIndex && 
                                  canPlaceShape(rowIndex, colIndex, selectedShape);
          
          const isHovered = shouldShowHover(rowIndex, colIndex);
          const isOriginCell = cell && (!cell.origin || 
                               (cell.origin.row === rowIndex && cell.origin.col === colIndex));
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                'board-cell',
                cell && 'occupied',
                isHovered && (isValidPlacement ? 'hover' : 'invalid-hover'),
                readOnly && 'cursor-default'
              )}
              style={{ width: cellSize, height: cellSize }}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell && isOriginCell && (
                <ShapeItem 
                  shape={cell.shape} 
                  size={cell.size} 
                  preview={false}
                  gridPreview={true}
                  animalName={cell.name}
                />
              )}
              {isHovered && isValidPlacement && selectedShape && rowIndex === hoverCell?.row && colIndex === hoverCell?.col && (
                <ShapeItem 
                  shape={selectedShape.shape} 
                  size={selectedShape.size} 
                  preview={true} 
                  gridPreview={true}
                  className="opacity-50" 
                  animalName={selectedShape.name}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;

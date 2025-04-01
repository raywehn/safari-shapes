import React, { useState } from 'react';
import ShapeItem, { ShapeType, SizeType, SIZE_GRID_CELLS } from './ShapeItem';
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
  onRemoveShape?: (row: number, col: number) => void;
  selectedShape: CellContent | null;
  readOnly?: boolean;
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  size,
  cellSize,
  cells,
  onCellClick,
  onRemoveShape,
  selectedShape,
  readOnly = false,
  className
}) => {
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const canPlaceShape = (row: number, col: number, shape: CellContent) => {
    if (!shape) return false;
    
    const gridSize = SIZE_GRID_CELLS[shape.size];
    
    if (row + gridSize.height > size || col + gridSize.width > size) {
      return false;
    }
    
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
    if (readOnly) return;
    
    const cell = cells[row][col];
    if (cell) {
      if (onRemoveShape) {
        onRemoveShape(row, col);
      }
    } else if (onCellClick && selectedShape && canPlaceShape(row, col, selectedShape)) {
      onCellClick(row, col);
    }
  };

  const shouldShowHover = (row: number, col: number) => {
    if (!hoverCell || !selectedShape) return false;
    
    const { row: hoverRow, col: hoverCol } = hoverCell;
    const gridSize = SIZE_GRID_CELLS[selectedShape.size];
    
    return row >= hoverRow && 
           row < hoverRow + gridSize.height && 
           col >= hoverCol && 
           col < hoverCol + gridSize.width;
  };

  const getShapeAtCell = (row: number, col: number) => {
    const cell = cells[row][col];
    if (!cell) return null;
    return cell;
  };

  const getOriginCell = (row: number, col: number) => {
    const cell = cells[row][col];
    if (!cell || !cell.origin) return { row, col };
    return cell.origin;
  };

  const isOriginCell = (row: number, col: number) => {
    const cell = cells[row][col];
    if (!cell) return false;
    
    if (!cell.origin) return true;
    return cell.origin.row === row && cell.origin.col === col;
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
          const isOrigin = isOriginCell(rowIndex, colIndex);
          const canPlaceEntireShape = selectedShape && hoverCell && 
            canPlaceShape(hoverCell.row, hoverCell.col, selectedShape);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                'board-cell',
                cell && 'occupied',
                isHovered && (canPlaceEntireShape ? 'hover' : 'invalid-hover'),
                readOnly && 'cursor-default'
              )}
              style={{ width: cellSize, height: cellSize }}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {/* Render placed shape */}
              {cell && isOrigin && (
                <div className="w-full h-full flex items-center justify-center relative"
                     style={{
                       width: `${SIZE_GRID_CELLS[cell.size].width * 100}%`,
                       height: `${SIZE_GRID_CELLS[cell.size].height * 100}%`,
                       position: 'absolute',
                       left: 0,
                       top: 0
                     }}>
                  <ShapeItem 
                    shape={cell.shape} 
                    size={cell.size} 
                    gridPreview={true}
                    animalName={cell.name}
                  />
                </div>
              )}
              
              {/* Preview shape on hover */}
              {isHovered && isValidPlacement && selectedShape && rowIndex === hoverCell?.row && colIndex === hoverCell?.col && (
                <div className="w-full h-full flex items-center justify-center relative pointer-events-none"
                     style={{
                       width: `${SIZE_GRID_CELLS[selectedShape.size].width * 100}%`,
                       height: `${SIZE_GRID_CELLS[selectedShape.size].height * 100}%`,
                       position: 'absolute',
                       left: 0,
                       top: 0,
                       zIndex: 10
                     }}>
                  <ShapeItem 
                    shape={selectedShape.shape} 
                    size={selectedShape.size} 
                    gridPreview={true}
                    animalName={selectedShape.name}
                    preview={true}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;
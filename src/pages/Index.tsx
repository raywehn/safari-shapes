import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GameBoard, { CellContent } from '@/components/GameBoard';
import ShapePalette from '@/components/ShapePalette';
import GameScore from '@/components/GameScore';
import GameInstructions from '@/components/GameInstructions';
import { AnimalType, SHAPE_POINTS, SIZE_GRID_CELLS } from '@/components/ShapeItem';
import { toast } from '@/components/ui/use-toast';

// Define our animal enclosures
const ANIMALS: AnimalType[] = [
  { name: 'Mouse', shape: 'square', size: 'xs' },
  { name: 'Rabbit', shape: 'triangle', size: 'sm' },
  { name: 'Fox', shape: 'circle', size: 'md' },
  { name: 'Leopard', shape: 'square', size: 'lg' },
  { name: 'Elephant', shape: 'heart', size: 'xl' },
];

// Helper function to check if a shape can be placed at a position
const canPlaceShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number): boolean => {
  if (!shape) return false;
  
  const gridSize = SIZE_GRID_CELLS[shape.size];
  
  // Check boundaries
  if (row + gridSize.height > grid.length || col + gridSize.width > grid[0].length) {
    return false;
  }
  
  // Check if any cells are already occupied
  for (let r = 0; r < gridSize.height; r++) {
    for (let c = 0; c < gridSize.width; c++) {
      if (grid[row + r][col + c] !== null) {
        return false;
      }
    }
  }
  
  return true;
};

// Helper function to place a shape on the grid
const placeShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number): boolean => {
  if (!shape || !canPlaceShapeOnGrid(grid, shape, row, col)) return false;
  
  const gridSize = SIZE_GRID_CELLS[shape.size];
  
  // Fill all cells that the shape occupies
  for (let r = 0; r < gridSize.height; r++) {
    for (let c = 0; c < gridSize.width; c++) {
      // Copy the shape data to each cell
      grid[row + r][col + c] = {
        ...shape,
        origin: { row, col } // Store the origin coordinates
      };
    }
  }
  
  return true;
};

// Sample layout for guaranteed 50 points
const createSampleSolution = (): CellContent[][] => {
  // Create an empty 5x5 grid
  const grid: CellContent[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  // Place an Elephant (20 points, 3x3) in the bottom left
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'heart', size: 'xl', name: 'Elephant' }, 2, 0);
  
  // Place a Leopard (12 points, 2x2) in the top right
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'lg', name: 'Leopard' }, 0, 3);
  
  // Place a Fox (7 points, 2x2) in the middle right
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 3, 3);
  
  // Place a Fox (7 points, 2x2) in the top left
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 0, 0);
  
  // Place a Rabbit (3 points, 1x1) in the remaining space
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'triangle', size: 'sm', name: 'Rabbit' }, 0, 2);
  
  // Place a Mouse (1 point, 1x1) in the remaining space
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'xs', name: 'Mouse' }, 2, 3);
  
  // Total: 20 + 12 + 7 + 7 + 3 + 1 = 50 points
  return grid;
}

const Index: React.FC = () => {
  const BOARD_SIZE = 5;
  const CELL_SIZE = 80;
  
  const [sampleSolution, setSampleSolution] = useState<CellContent[][]>(createSampleSolution());
  const [playerBoard, setPlayerBoard] = useState<CellContent[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  
  // Calculate score based on shapes on the board
  const calculateScore = (board: CellContent[][]) => {
    // Create a Set to track which unique shapes we've already counted
    const countedShapes = new Set<string>();
    let score = 0;
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        if (cell && (!cell.origin || (cell.origin.row === row && cell.origin.col === col))) {
          // Only count origins of shapes to avoid double counting
          score += SHAPE_POINTS[cell.size];
          countedShapes.add(cell.id);
        }
      }
    }
    
    return score;
  };
  
  // Handle selecting an animal from the palette
  const handleSelectAnimal = (animal: AnimalType) => {
    setSelectedAnimal(animal);
  };
  
  // Handle placing a shape on the board
  const handleCellClick = (row: number, col: number) => {
    if (!selectedAnimal) return;
    
    // Check if we can place the shape here
    const gridSize = SIZE_GRID_CELLS[selectedAnimal.size];
    
    // Check boundaries
    if (row + gridSize.height > BOARD_SIZE || col + gridSize.width > BOARD_SIZE) {
      toast({
        title: "Can't place here",
        description: "The animal enclosure doesn't fit within the boundaries.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if any cells are already occupied
    for (let r = 0; r < gridSize.height; r++) {
      for (let c = 0; c < gridSize.width; c++) {
        if (playerBoard[row + r][col + c] !== null) {
          toast({
            title: "Can't place here",
            description: "Some cells are already occupied by another animal.",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    // Create a new board and place the shape
    const newBoard = [...playerBoard.map(row => [...row])];
    
    // Create the shape
    const newShape: CellContent = {
      id: uuidv4(),
      shape: selectedAnimal.shape,
      size: selectedAnimal.size,
      name: selectedAnimal.name
    };
    
    // Place the shape on the board
    placeShapeOnGrid(newBoard, newShape, row, col);
    setPlayerBoard(newBoard);
    
    // Update score
    const newScore = calculateScore(newBoard);
    setCurrentScore(newScore);
    
  };

  // Handle removing a shape from the board
  const handleRemoveShape = (row: number, col: number) => {
    const cell = playerBoard[row][col];
    if (!cell) return;

    // Get the origin coordinates of the shape
    const originRow = cell.origin?.row ?? row;
    const originCol = cell.origin?.col ?? col;
    
    // Get the size of the shape
    const gridSize = SIZE_GRID_CELLS[cell.size];
    
    // Create a new board
    const newBoard = [...playerBoard.map(row => [...row])];
    
    // Remove all cells that belong to this shape
    for (let r = 0; r < gridSize.height; r++) {
      for (let c = 0; c < gridSize.width; c++) {
        newBoard[originRow + r][originCol + c] = null;
      }
    }
    
    setPlayerBoard(newBoard);
    
    // Update score
    const newScore = calculateScore(newBoard);
    setCurrentScore(newScore);
  };
  
  // Start a new round
  const startNewRound = () => {
    setPlayerBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentScore(0);
    setSelectedAnimal(null);
    
    // Create a new sample solution
    setSampleSolution(createSampleSolution());
    
    toast({
      title: "New Round Started",
      description: "The board has been cleared. Try to maximize your score!",
    });
  };
  
  // Calculate score on initial load
  useEffect(() => {
    setCurrentScore(calculateScore(playerBoard));
  }, []);
  
  // Calculate the sample score to verify it's 50
  useEffect(() => {
    const sampleScore = calculateScore(sampleSolution);
    console.log(`Sample solution score: ${sampleScore}`);
  }, [sampleSolution]);
  
  // In the return statement, update the GameInstructions and GameScore props:
  return (
    <div className="min-h-screen bg-lime-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
          Safari Shapes
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Instructions, Score, and Palette */}
          <div className="space-y-6">
            <GameInstructions 
              onStartNewRound={startNewRound}
              currentScore={currentScore}
            />
            
            <GameScore 
              currentScore={currentScore}
            />
            
            <ShapePalette 
              shapes={ANIMALS} 
              onSelectShape={handleSelectAnimal}
              selectedAnimal={selectedAnimal}
            />
          </div>
          
          {/* Middle column: Player's Game Board */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-3 text-amber-900">Your Safari</h2>
            <GameBoard 
              size={BOARD_SIZE}
              cellSize={CELL_SIZE}
              cells={playerBoard}
              onCellClick={handleCellClick}
              onRemoveShape={handleRemoveShape}
              selectedShape={selectedAnimal ? {
                id: 'preview',
                shape: selectedAnimal.shape,
                size: selectedAnimal.size,
                name: selectedAnimal.name
              } : null}
            />
          </div>
          
          {/* Right column: Sample Solution */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-3 text-amber-900">Sample Layout (50 points)</h2>
            <GameBoard 
              size={BOARD_SIZE}
              cellSize={CELL_SIZE}
              cells={sampleSolution}
              selectedShape={null}
              readOnly={true}
              className="opacity-90"
            />
            <p className="mt-3 text-amber-700 text-center">
              This sample layout guarantees exactly 50 points
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
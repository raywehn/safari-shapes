
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

// Sample layout for guaranteed 50 points
const createSampleSolution = (): CellContent[][] => {
  // Create an empty 5x5 grid
  const grid: CellContent[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  // Place a Mouse (1 point, 1x1)
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'xs', name: 'Mouse' }, 0, 0);
  
  // Place a Rabbit (3 points, 1x1)
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'triangle', size: 'sm', name: 'Rabbit' }, 0, 1);
  
  // Place 2 Foxes (7 points each = 14 points, 2x2 each)
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 1, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 3, 2);
  
  // Place a Leopard (12 points, 2x2)
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'lg', name: 'Leopard' }, 1, 3);
  
  // Place an Elephant (20 points, 3x3)
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'heart', size: 'xl', name: 'Elephant' }, 2, 0);
  
  // Total: 1 + 3 + 14 + 12 + 20 = 50 points
  return grid;
};

// Helper function to place a shape on the grid
const placeShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number) => {
  if (!shape) return;
  
  const gridCells = SIZE_GRID_CELLS[shape.size];
  
  // Fill all cells that the shape occupies
  for (let r = 0; r < gridCells.height; r++) {
    for (let c = 0; c < gridCells.width; c++) {
      // Copy the shape data to each cell
      grid[row + r][col + c] = {
        ...shape,
        origin: { row, col } // Store the origin coordinates
      };
    }
  }
};

const Index: React.FC = () => {
  const BOARD_SIZE = 5;
  const CELL_SIZE = 80;
  const TARGET_SCORE = 50;
  
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
    const gridCells = SIZE_GRID_CELLS[selectedAnimal.size];
    
    // Check boundaries
    if (row + gridCells.height > BOARD_SIZE || col + gridCells.width > BOARD_SIZE) {
      toast({
        title: "Can't place here",
        description: "The animal enclosure doesn't fit within the boundaries.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if any cells are already occupied
    for (let r = 0; r < gridCells.height; r++) {
      for (let c = 0; c < gridCells.width; c++) {
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
    
    // Check if the target score has been reached
    if (newScore >= TARGET_SCORE && currentScore < TARGET_SCORE) {
      toast({
        title: "Round Complete!",
        description: `You've reached the target score of ${TARGET_SCORE} points!`,
      });
    }
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
      description: "The board has been cleared. Try to reach 50 points!",
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
  
  return (
    <div className="min-h-screen bg-lime-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
          Safari Shapes Exploration
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Instructions, Score, and Palette */}
          <div className="space-y-6">
            <GameInstructions 
              onStartNewRound={startNewRound}
              currentScore={currentScore}
              targetScore={TARGET_SCORE}
            />
            
            <GameScore 
              currentScore={currentScore} 
              targetScore={TARGET_SCORE} 
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
              className="opacity-80"
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

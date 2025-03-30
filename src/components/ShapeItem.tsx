
import React from 'react';
import { cn } from '@/lib/utils';

export type ShapeType = 'square' | 'triangle' | 'circle' | 'heart';
export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Points for each size
export const SHAPE_POINTS: Record<SizeType, number> = {
  'xs': 1,
  'sm': 3, 
  'md': 7,
  'lg': 12,
  'xl': 20
};

// Size dimensions in pixels
export const SIZE_DIMENSIONS: Record<SizeType, number> = {
  'xs': 32,
  'sm': 48,
  'md': 64,
  'lg': 80,
  'xl': 96
};

// Grid cell dimensions for each size (how many cells the shape takes up)
export const SIZE_GRID_CELLS: Record<SizeType, { width: number; height: number }> = {
  'xs': { width: 1, height: 1 },
  'sm': { width: 1, height: 1 },
  'md': { width: 2, height: 2 },
  'lg': { width: 2, height: 2 },
  'xl': { width: 3, height: 3 }
};

export type AnimalType = {
  name: string;
  shape: ShapeType;
  size: SizeType;
};

interface ShapeItemProps {
  shape: ShapeType;
  size: SizeType;
  className?: string;
  onClick?: () => void;
  preview?: boolean;
  animalName?: string;
  gridPreview?: boolean;
}

const ShapeItem: React.FC<ShapeItemProps> = ({ 
  shape, 
  size, 
  className,
  onClick,
  preview = false,
  animalName,
  gridPreview = false
}) => {
  const dimension = SIZE_DIMENSIONS[size];
  const gridCells = SIZE_GRID_CELLS[size];
  
  let shapeStyles: React.CSSProperties = {
    width: gridPreview ? '100%' : dimension,
    height: gridPreview ? '100%' : dimension,
  };
  
  if (shape === 'triangle' && !gridPreview) {
    shapeStyles = {
      ...shapeStyles,
      borderLeftWidth: dimension / 2,
      borderRightWidth: dimension / 2,
      borderBottomWidth: dimension,
      height: 0,
      width: 0
    };
  }
  
  const points = SHAPE_POINTS[size];

  // Create the class names for the shape with animal-specific styling
  const shapeClassName = cn(
    `shape-${shape}`,
    animalName && `animal-${animalName.toLowerCase()}`
  );
  
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        !preview && 'shape',
        className
      )}
      onClick={onClick}
    >
      <div 
        className={shapeClassName}
        style={shapeStyles}
      />
      {!preview && !gridPreview && (
        <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {points}
        </div>
      )}
    </div>
  );
};

export default ShapeItem;

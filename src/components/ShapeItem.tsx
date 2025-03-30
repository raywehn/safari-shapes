
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

// Animal color mapping
export const ANIMAL_COLORS: Record<string, string> = {
  'mouse': '#9ca3af',    // gray-400
  'rabbit': '#fbbf24',   // amber-400
  'fox': '#f97316',      // orange-500
  'leopard': '#ca8a04',  // yellow-600
  'elephant': '#a855f7'  // purple-500
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
  const animalNameLower = animalName?.toLowerCase() || '';
  
  // Get color based on animal
  let backgroundColor = '#10b981'; // Default color
  if (animalNameLower) {
    backgroundColor = ANIMAL_COLORS[animalNameLower] || backgroundColor;
  }
  
  // Set up styles based on display context and shape
  let shapeStyles: React.CSSProperties = {
    backgroundColor
  };

  // Add sizing based on context
  if (gridPreview) {
    shapeStyles = {
      ...shapeStyles,
      width: '100%',
      height: '100%'
    };
  } else {
    shapeStyles = {
      ...shapeStyles,
      width: dimension,
      height: dimension
    };
  }
  
  // Special styling for triangle shape
  if (shape === 'triangle') {
    if (!gridPreview) {
      // Stand-alone triangle (in palette)
      shapeStyles = {
        width: 0,
        height: 0,
        borderLeftWidth: dimension / 2,
        borderRightWidth: dimension / 2,
        borderBottomWidth: dimension,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: backgroundColor
      };
    } else {
      // Grid triangle
      shapeStyles = {
        ...shapeStyles,
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        backgroundColor
      };
    }
  }
  
  // For heart shape
  if (shape === 'heart') {
    // Reset background color as we'll apply it to the heart parts
    shapeStyles.backgroundColor = 'transparent';
  }
  
  const points = SHAPE_POINTS[size];
  
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center w-full h-full',
        !preview && 'shape',
        className
      )}
      onClick={onClick}
      data-animal={animalNameLower}
    >
      {/* For square and circle shapes */}
      {shape !== 'heart' && shape !== 'triangle' && (
        <div 
          className={cn(
            'shape-base',
            shape === 'circle' && 'rounded-full',
            shape === 'square' && 'rounded-md'
          )}
          style={shapeStyles}
        />
      )}
      
      {/* For triangle shape with special handling */}
      {shape === 'triangle' && (
        <div style={shapeStyles} />
      )}
      
      {/* Special handling for heart shape */}
      {shape === 'heart' && (
        <div className="heart-shape" style={{
          ...shapeStyles,
          position: 'relative',
          width: gridPreview ? '90%' : dimension,
          height: gridPreview ? '90%' : dimension,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: gridPreview ? 'translateY(-20%)' : 'none',
          margin: 'auto'
        }}>
          <div style={{
            position: 'absolute',
            width: '54%',
            height: '84%',
            left: '25%',
            top: '5%',
            borderRadius: '50%',
            backgroundColor,
            transform: 'rotate(-40deg)',
            transformOrigin: '100% 100%'
          }} />
          <div style={{
            position: 'absolute',
            width: '54%',
            height: '84%',
            right: '35%',
            top: '5%',
            borderRadius: '50%',
            backgroundColor,
            transform: 'rotate(40deg)',
            transformOrigin: '0% 100%'
          }} />
        </div>
      )}
      
      {/* Points indicator */}
      {!preview && !gridPreview && (
        <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {points}
        </div>
      )}
    </div>
  );
};

export default ShapeItem;

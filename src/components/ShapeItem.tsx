
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
}

const ShapeItem: React.FC<ShapeItemProps> = ({ 
  shape, 
  size, 
  className,
  onClick,
  preview = false,
  animalName
}) => {
  const dimension = SIZE_DIMENSIONS[size];
  
  let shapeStyles: React.CSSProperties = {
    width: dimension,
    height: dimension,
  };
  
  if (shape === 'triangle') {
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
        className={cn(
          `shape-${shape}`, 
          animalName && `animal-${animalName.toLowerCase()}`
        )} 
        style={shapeStyles}
      />
      {!preview && (
        <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {points}
        </div>
      )}
    </div>
  );
};

export default ShapeItem;

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BrailleCell } from '../../types/types';

interface BrailleModelViewerProps {
  cells: BrailleCell[][];
  dotHeight?: number;
  dotDiameter?: number;
  baseThickness?: number;
}

const BrailleModelViewer: React.FC<BrailleModelViewerProps> = ({
  cells,
  dotHeight = 0.48,
  dotDiameter = 1.44,
  baseThickness = 1.0
}) => {
  const groupRef = useRef();

  // Constants for braille dimensions (matching 2D version)
  const BRAILLE_DOT_SPACING = 2.34; // Same spacing as 2D
  const BRAILLE_CELL_SPACING = 6.2; // Same cell spacing as 2D

  // Calculate base dimensions with padding
  const PADDING = BRAILLE_CELL_SPACING * 2; // Add padding around the edges
  const baseWidth = cells.reduce((width, word) => 
    width + word.length * BRAILLE_CELL_SPACING, 0) + PADDING;
  const baseHeight = BRAILLE_CELL_SPACING * 3 + PADDING;

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 5, 20], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} />
        
        <group
          ref={groupRef}
          position={[-baseWidth/2, -baseHeight/2, 0]}
          rotation={[-Math.PI/6, 0, 0]}
        >
          {/* Base plate */}
          <mesh position={[baseWidth/2, baseHeight/2, baseThickness/2]}>
            <boxGeometry args={[baseWidth, baseHeight, baseThickness]} />
            <meshStandardMaterial 
              color="#f1f5f9" // Lighter gray for better contrast
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Braille dots */}
          {cells.map((word, wordIndex) => {
            let xOffset = PADDING/2; // Start with padding
            
            return word.map((cell, cellIndex) => {
              // Create dots only for raised positions
              const dots = cell.dots.map((dotNumber, dotIndex) => {
                const [dotX, dotY] = getDotPosition(dotNumber);
                const x = xOffset + (dotX * BRAILLE_DOT_SPACING);
                const y = PADDING/2 + BRAILLE_CELL_SPACING + (dotY * BRAILLE_DOT_SPACING);
                const z = baseThickness + dotHeight/2;

                return (
                  <mesh
                    key={`${wordIndex}-${cellIndex}-${dotIndex}`}
                    position={[x, y, z]}
                  >
                    <cylinderGeometry 
                      args={[dotDiameter/2, dotDiameter/2, dotHeight, 32]} 
                      rotation={[Math.PI/2, 0, 0]}
                    />
                    <meshStandardMaterial 
                      color="#1d4ed8" // Primary blue color matching 2D
                      roughness={0.5}
                      metalness={0.2}
                    />
                  </mesh>
                );
              });

              // Update offset for next cell
              xOffset += cellIndex === word.length - 1 ? 
                BRAILLE_CELL_SPACING * 1.5 : // Extra space between words
                BRAILLE_CELL_SPACING;

              return dots;
            });
          })}
        </group>

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
};

// Helper function to get dot positions (matching 2D layout)
const getDotPosition = (dot: number): [number, number] => {
  const positions: Record<number, [number, number]> = {
    1: [0, 2], // Top left
    2: [0, 1], // Middle left
    3: [0, 0], // Bottom left
    4: [1, 2], // Top right
    5: [1, 1], // Middle right
    6: [1, 0]  // Bottom right
  };
  return positions[dot];
};

export default BrailleModelViewer;
import { jsPDF } from 'jspdf';
import { BrailleCell } from '../types/types';

interface PdfOptions {
  title: string;
  includeText: boolean;
  doubleSided: boolean;
  paperSize: 'letter' | 'a4' | 'legal';
  is3D?: boolean;
  dotHeight?: number;
  dotDiameter?: number;
  baseThickness?: number;
  exportFormat?: '3mf' | 'stl';
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Triangle {
  v1: Point3D;
  v2: Point3D;
  v3: Point3D;
}

// Generate STL file content
const generateSTL = (brailleCells: BrailleCell[][], options: PdfOptions): string => {
  const vertices: Point3D[] = [];
  const triangles: Triangle[] = [];
  
  const BRAILLE_DOT_HEIGHT = options.dotHeight || 0.48;
  const BRAILLE_DOT_DIAMETER = options.dotDiameter || 1.44;
  const BRAILLE_DOT_SPACING = 2.34;
  const BRAILLE_CELL_SPACING = 6.2;
  const BASE_THICKNESS = options.baseThickness || 1.0;
  
  // Add base plate vertices
  const baseWidth = brailleCells.reduce((width, word) => 
    width + word.length * BRAILLE_CELL_SPACING, 0);
  const baseHeight = BRAILLE_CELL_SPACING * 3;
  
  // Base plate vertices
  const baseVertices = [
    { x: 0, y: 0, z: 0 },
    { x: baseWidth, y: 0, z: 0 },
    { x: baseWidth, y: baseHeight, z: 0 },
    { x: 0, y: baseHeight, z: 0 },
    { x: 0, y: 0, z: BASE_THICKNESS },
    { x: baseWidth, y: 0, z: BASE_THICKNESS },
    { x: baseWidth, y: baseHeight, z: BASE_THICKNESS },
    { x: 0, y: baseHeight, z: BASE_THICKNESS }
  ];
  
  vertices.push(...baseVertices);
  
  // Add base plate triangles
  triangles.push(
    // Bottom
    { v1: baseVertices[0], v2: baseVertices[1], v3: baseVertices[2] },
    { v1: baseVertices[0], v2: baseVertices[2], v3: baseVertices[3] },
    // Top
    { v1: baseVertices[4], v2: baseVertices[5], v3: baseVertices[6] },
    { v1: baseVertices[4], v2: baseVertices[6], v3: baseVertices[7] },
    // Sides
    { v1: baseVertices[0], v2: baseVertices[1], v3: baseVertices[5] },
    { v1: baseVertices[0], v2: baseVertices[5], v3: baseVertices[4] },
    { v1: baseVertices[1], v2: baseVertices[2], v3: baseVertices[6] },
    { v1: baseVertices[1], v2: baseVertices[6], v3: baseVertices[5] },
    { v1: baseVertices[2], v2: baseVertices[3], v3: baseVertices[7] },
    { v1: baseVertices[2], v2: baseVertices[7], v3: baseVertices[6] },
    { v1: baseVertices[3], v2: baseVertices[0], v3: baseVertices[4] },
    { v1: baseVertices[3], v2: baseVertices[4], v3: baseVertices[7] }
  );
  
  // Add braille dots
  let xOffset = BRAILLE_CELL_SPACING;
  
  brailleCells.forEach(word => {
    word.forEach(cell => {
      cell.dots.forEach(dotNumber => {
        const [dotX, dotY] = getDotPosition(dotNumber);
        const x = xOffset + (dotX * BRAILLE_DOT_SPACING);
        const y = BRAILLE_CELL_SPACING + (dotY * BRAILLE_DOT_SPACING);
        const z = BASE_THICKNESS;
        
        // Generate cylinder vertices for each dot
        const segments = 8;
        const dotVertices: Point3D[] = [];
        
        // Bottom circle
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          dotVertices.push({
            x: x + BRAILLE_DOT_DIAMETER/2 * Math.cos(angle),
            y: y + BRAILLE_DOT_DIAMETER/2 * Math.sin(angle),
            z
          });
        }
        
        // Top circle
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          dotVertices.push({
            x: x + BRAILLE_DOT_DIAMETER/2 * Math.cos(angle),
            y: y + BRAILLE_DOT_DIAMETER/2 * Math.sin(angle),
            z: z + BRAILLE_DOT_HEIGHT
          });
        }
        
        // Add dot vertices
        const startIndex = vertices.length;
        vertices.push(...dotVertices);
        
        // Add triangles for the dot
        for (let i = 0; i < segments; i++) {
          const next = (i + 1) % segments;
          
          // Bottom circle
          triangles.push({
            v1: vertices[startIndex + i],
            v2: vertices[startIndex + next],
            v3: vertices[startIndex + segments + i]
          });
          
          // Top circle
          triangles.push({
            v1: vertices[startIndex + segments + i],
            v2: vertices[startIndex + segments + next],
            v3: vertices[startIndex + next]
          });
        }
      });
      
      xOffset += BRAILLE_CELL_SPACING;
    });
    
    xOffset += BRAILLE_CELL_SPACING/2;
  });
  
  // Generate STL file content
  let stlContent = 'solid brailleDocument\n';
  
  triangles.forEach(triangle => {
    const normal = calculateNormal(triangle);
    stlContent += ` facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
    stlContent += '  outer loop\n';
    stlContent += `   vertex ${triangle.v1.x} ${triangle.v1.y} ${triangle.v1.z}\n`;
    stlContent += `   vertex ${triangle.v2.x} ${triangle.v2.y} ${triangle.v2.z}\n`;
    stlContent += `   vertex ${triangle.v3.x} ${triangle.v3.y} ${triangle.v3.z}\n`;
    stlContent += '  endloop\n';
    stlContent += ' endfacet\n';
  });
  
  stlContent += 'endsolid brailleDocument\n';
  
  return stlContent;
};

// Calculate normal vector for a triangle
const calculateNormal = (triangle: Triangle): Point3D => {
  const v1 = {
    x: triangle.v2.x - triangle.v1.x,
    y: triangle.v2.y - triangle.v1.y,
    z: triangle.v2.z - triangle.v1.z
  };
  
  const v2 = {
    x: triangle.v3.x - triangle.v1.x,
    y: triangle.v3.y - triangle.v1.y,
    z: triangle.v3.z - triangle.v1.z
  };
  
  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  };
  
  const length = Math.sqrt(
    normal.x * normal.x +
    normal.y * normal.y +
    normal.z * normal.z
  );
  
  return {
    x: normal.x / length,
    y: normal.y / length,
    z: normal.z / length
  };
};

export const generateBraillePdf = (brailleCells: BrailleCell[][], options: PdfOptions): string => {
  // If 3D export is requested, generate STL file
  if (options.is3D) {
    const stlContent = generateSTL(brailleCells, options);
    const blob = new Blob([stlContent], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }
  
  const doc = new jsPDF({
    format: options.paperSize,
    unit: 'mm'
  });

  // Standard braille dimensions (in mm)
  const BRAILLE_DOT_HEIGHT = options.dotHeight || 0.48; // Standard height for braille dots
  const BRAILLE_DOT_DIAMETER = options.dotDiameter || 1.44; // Standard diameter for braille dots
  const BRAILLE_DOT_SPACING = 2.34; // Horizontal and vertical spacing between dots in a cell
  const BRAILLE_CELL_SPACING = 6.2; // Spacing between braille cells
  const BASE_THICKNESS = options.baseThickness || 1.0; // Thickness of the base layer

  // Set document properties
  doc.setProperties({
    title: options.title,
    subject: '3D Printable Braille Document',
    creator: 'BrailleLearn'
  });

  // Add title and metadata
  doc.setFontSize(16);
  doc.text(options.title, 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated by BrailleLearn on ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text('3D Printing Specifications:', 20, 40);
  doc.text(`Dot Height: ${BRAILLE_DOT_HEIGHT}mm`, 20, 45);
  doc.text(`Dot Diameter: ${BRAILLE_DOT_DIAMETER}mm`, 20, 50);
  doc.text(`Base Thickness: ${BASE_THICKNESS}mm`, 20, 55);

  let yOffset = 70;
  const xStart = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - 40; // 20mm margins on each side

  // Process each word
  brailleCells.forEach((word, wordIndex) => {
    let xOffset = xStart;
    const wordWidth = word.length * (BRAILLE_CELL_SPACING + BRAILLE_DOT_DIAMETER);

    // Check if we need to start a new line or page
    if (xOffset + wordWidth > maxWidth) {
      yOffset += BRAILLE_CELL_SPACING * 2;
      xOffset = xStart;
    }

    // Check if we need a new page
    if (yOffset > pageHeight - 30) {
      doc.addPage();
      yOffset = 70;
    }

    // Process each cell in the word
    word.forEach((cell, cellIndex) => {
      // Draw cell boundary for reference (dotted line)
      if (options.is3D) {
        doc.setLineDashPattern([0.5, 0.5], 0);
        doc.rect(
          xOffset - BRAILLE_DOT_DIAMETER/2,
          yOffset - BRAILLE_DOT_DIAMETER/2,
          BRAILLE_CELL_SPACING + BRAILLE_DOT_DIAMETER,
          BRAILLE_CELL_SPACING * 1.5 + BRAILLE_DOT_DIAMETER,
          'S'
        );
      }

      // Process each dot in the cell
      cell.dots.forEach(dotNumber => {
        const [dotX, dotY] = getDotPosition(dotNumber);
        const x = xOffset + (dotX * BRAILLE_DOT_SPACING);
        const y = yOffset + (dotY * BRAILLE_DOT_SPACING);

        if (options.is3D) {
          // Add 3D printing instructions in comments
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(6);
          doc.text(`; Dot ${dotNumber} at (${x}, ${y})`, x + 3, y);
          doc.text(`; Height: ${BRAILLE_DOT_HEIGHT}mm`, x + 3, y + 1);
          
          // Draw dot representation
          doc.setFillColor(200, 200, 200);
          doc.circle(x, y, BRAILLE_DOT_DIAMETER/2, 'F');
        } else {
          // Standard 2D representation
          doc.circle(x, y, BRAILLE_DOT_DIAMETER/2, 'F');
        }
      });

      // Add text representation if enabled
      if (options.includeText && cell.char) {
        doc.setFontSize(8);
        doc.text(
          cell.char,
          xOffset + (BRAILLE_CELL_SPACING/2),
          yOffset + BRAILLE_CELL_SPACING * 2,
          { align: 'center' }
        );
      }

      xOffset += BRAILLE_CELL_SPACING;
    });

    // Add space between words
    xOffset += BRAILLE_CELL_SPACING/2;
  });

  // Add 3D printing instructions at the end
  if (options.is3D) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('3D Printing Instructions', 20, 30);
    doc.setFontSize(10);
    doc.text([
      '1. Base Layer:',
      `   - Print a base layer of ${BASE_THICKNESS}mm thickness`,
      '   - Use a solid infill for stability',
      '',
      '2. Braille Dots:',
      `   - Each dot should be ${BRAILLE_DOT_HEIGHT}mm in height`,
      `   - Dot diameter: ${BRAILLE_DOT_DIAMETER}mm`,
      '   - Use 100% infill for dots',
      '',
      '3. Print Settings:',
      '   - Layer height: 0.1mm for smooth dots',
      '   - Print speed: 30-40mm/s for precision',
      '   - Enable retraction to prevent stringing',
      '',
      '4. Material Recommendations:',
      '   - PLA or PETG recommended',
      '   - Avoid flexible materials',
      '',
      '5. Post-Processing:',
      '   - Light sanding if needed',
      '   - Verify dot height with calipers'
    ], 20, 50);
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }

  return doc.output('datauristring');
};

// Helper function to get dot positions
const getDotPosition = (dot: number): [number, number] => {
  const positions: Record<number, [number, number]> = {
    1: [0, 0], 2: [0, 1], 3: [0, 2],
    4: [1, 0], 5: [1, 1], 6: [1, 2]
  };
  return positions[dot];
};

// Download the file (PDF or STL)
export const downloadPdf = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up object URL if it was created
  if (dataUrl.startsWith('blob:')) {
    URL.revokeObjectURL(dataUrl);
  }
};
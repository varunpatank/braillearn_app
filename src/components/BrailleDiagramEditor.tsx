import { useState } from 'react';
import { motion } from '@/components/motion';
import { Plus, Trash2, Save, Grid, Eye, RotateCcw } from 'lucide-react';

interface BrailleCell {
  dots: number[];
  char: string;
  label?: string;
}

interface DiagramEditorProps {
  initialCells?: BrailleCell[];
  initialTitle?: string;
  initialDescription?: string;
  onSave: (data: { title: string; description: string; cells: BrailleCell[]; layout: Record<string, unknown> }) => void;
  onCancel: () => void;
}

const DOT_POSITIONS: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 0 }, 2: { row: 1, col: 0 }, 3: { row: 2, col: 0 },
  4: { row: 0, col: 1 }, 5: { row: 1, col: 1 }, 6: { row: 2, col: 1 },
};

function BrailleCellVisual({ dots, size = 'large', interactive = false, onToggleDot }: {
  dots: number[]; size?: 'small' | 'large'; interactive?: boolean; onToggleDot?: (dot: number) => void;
}) {
  const sz = size === 'large' ? 80 : 48;
  const dotSz = size === 'large' ? 14 : 8;
  const gap = size === 'large' ? 20 : 12;
  const pad = size === 'large' ? 12 : 8;

  return (
    <div
      className="rounded-xl border-2 border-blue-200 bg-white flex items-center justify-center relative"
      style={{ width: sz, height: sz * 1.4 }}
    >
      {[1, 2, 3, 4, 5, 6].map(d => {
        const pos = DOT_POSITIONS[d];
        const active = dots.includes(d);
        return (
          <button
            key={d}
            type="button"
            disabled={!interactive}
            onClick={() => onToggleDot?.(d)}
            className={`absolute rounded-full transition-all ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${active ? 'bg-blue-600 shadow-lg' : 'bg-gray-200'}`}
            style={{
              width: dotSz, height: dotSz,
              left: pad + pos.col * gap,
              top: pad + pos.row * gap,
            }}
          />
        );
      })}
      {size === 'large' && (
        <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-gray-400 font-mono">
          {dots.length > 0 ? dots.sort().join('-') : '·'}
        </span>
      )}
    </div>
  );
}

export default function BrailleDiagramEditor({ initialCells = [], initialTitle = '', initialDescription = '', onSave, onCancel }: DiagramEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [cells, setCells] = useState<BrailleCell[]>(initialCells.length > 0 ? initialCells : [{ dots: [], char: '', label: '' }]);
  const [selectedCell, setSelectedCell] = useState(0);
  const [columns, setColumns] = useState(4);
  const [showDotNumbers, setShowDotNumbers] = useState(true);
  const [preview, setPreview] = useState(false);

  const addCell = () => {
    setCells(p => [...p, { dots: [], char: '', label: '' }]);
    setSelectedCell(cells.length);
  };

  const removeCell = (i: number) => {
    if (cells.length <= 1) return;
    setCells(p => p.filter((_, idx) => idx !== i));
    if (selectedCell >= cells.length - 1) setSelectedCell(Math.max(0, cells.length - 2));
  };

  const toggleDot = (cellIdx: number, dot: number) => {
    setCells(p => p.map((c, i) => {
      if (i !== cellIdx) return c;
      const newDots = c.dots.includes(dot) ? c.dots.filter(d => d !== dot) : [...c.dots, dot].sort();
      return { ...c, dots: newDots };
    }));
  };

  const updateCellField = (idx: number, field: 'char' | 'label', value: string) => {
    setCells(p => p.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const clearAll = () => {
    setCells([{ dots: [], char: '', label: '' }]);
    setSelectedCell(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Diagram title..."
            className="w-full text-xl font-bold bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-900 placeholder-gray-400 shadow-sm"
          />
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full text-sm bg-white border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-700 placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={addCell} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Cell
        </button>
        <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
          <RotateCcw className="w-4 h-4" /> Clear
        </button>
        <button onClick={() => setPreview(!preview)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${preview ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          <Eye className="w-4 h-4" /> {preview ? 'Edit' : 'Preview'}
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <Grid className="w-4 h-4 text-gray-400" />
          <select value={columns} onChange={e => setColumns(Number(e.target.value))} className="text-sm bg-white border-2 border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:border-blue-500 outline-none shadow-sm">
            {[2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n} cols</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1 text-sm text-gray-600">
          <input type="checkbox" checked={showDotNumbers} onChange={e => setShowDotNumbers(e.target.checked)} className="rounded" />
          Dot #s
        </label>
      </div>

      <div className={`grid gap-3 ${preview ? '' : 'min-h-[200px]'}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {cells.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedCell === i && !preview ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            onClick={() => !preview && setSelectedCell(i)}
          >
            <BrailleCellVisual
              dots={cell.dots}
              size="large"
              interactive={selectedCell === i && !preview}
              onToggleDot={(d) => toggleDot(i, d)}
            />
            {!preview && selectedCell === i && (
              <div className="flex gap-1 w-full mt-1">
                <input
                  type="text"
                  value={cell.char}
                  onChange={e => updateCellField(i, 'char', e.target.value)}
                  placeholder="Char"
                  className="w-1/2 text-xs bg-white border-2 border-gray-200 rounded-lg px-2 py-1 text-center text-gray-700 placeholder-gray-400 focus:border-blue-500 outline-none shadow-sm"
                  maxLength={10}
                />
                <input
                  type="text"
                  value={cell.label || ''}
                  onChange={e => updateCellField(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="w-1/2 text-xs bg-white border-2 border-gray-200 rounded-lg px-2 py-1 text-center text-gray-700 placeholder-gray-400 focus:border-blue-500 outline-none shadow-sm"
                  maxLength={20}
                />
              </div>
            )}
            {preview && cell.char && (
              <span className="text-sm font-bold text-blue-700">{cell.char}</span>
            )}
            {preview && cell.label && (
              <span className="text-[10px] text-gray-500">{cell.label}</span>
            )}
            {!preview && cells.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); removeCell(i); }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {!preview && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Add</p>
          <div className="flex flex-wrap gap-1">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
              const patterns: Record<string, number[]> = {
                A: [1], B: [1,2], C: [1,4], D: [1,4,5], E: [1,5], F: [1,2,4], G: [1,2,4,5], H: [1,2,5],
                I: [2,4], J: [2,4,5], K: [1,3], L: [1,2,3], M: [1,3,4], N: [1,3,4,5], O: [1,3,5],
                P: [1,2,3,4], Q: [1,2,3,4,5], R: [1,2,3,5], S: [2,3,4], T: [2,3,4,5], U: [1,3,6],
                V: [1,2,3,6], W: [2,4,5,6], X: [1,3,4,6], Y: [1,3,4,5,6], Z: [1,3,5,6],
              };
              return (
                <button
                  key={letter}
                  onClick={() => setCells(p => [...p, { dots: patterns[letter], char: letter, label: letter }])}
                  className="w-7 h-7 text-xs font-bold bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={() => onSave({
            title, description, cells,
            layout: { columns, cellSize: 'large', showDotNumbers, showLabels: true, backgroundColor: '#ffffff' },
          })}
          disabled={!title.trim() || cells.every(c => c.dots.length === 0)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" /> Save Diagram
        </button>
      </div>
    </div>
  );
}

export { BrailleCellVisual };
export type { BrailleCell };
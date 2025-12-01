
import React, { useRef, useState, useEffect } from 'react';
import { DataPoint, ScoredDataPoint, ClassType, DatasetType } from '../types';
import { snapToGrid } from '../utils/knnLogic';

interface SimulationCanvasProps {
  dataset: DataPoint[];
  neighbors: ScoredDataPoint[];
  targetPoint: { x: number; y: number };
  onTargetMove: (x: number, y: number) => void;
  datasetType: DatasetType;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  dataset,
  neighbors,
  targetPoint,
  onTargetMove,
  datasetType
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper to handle coordinate conversion from mouse event to 0-100 scale
  const handleMove = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values
    let clampedX = Math.min(100, Math.max(0, x));
    let clampedY = Math.min(100, Math.max(0, y));
    
    // Snap to grid if Categorical
    if (datasetType === 'Categorical') {
        clampedX = snapToGrid(clampedX);
        clampedY = snapToGrid(clampedY);
        // Additional clamp to keep within bounds after snap
        clampedX = Math.min(95, Math.max(5, clampedX));
        clampedY = Math.min(95, Math.max(5, clampedY));
    }

    onTargetMove(clampedX, clampedY);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle touch events for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
       handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const getClassColor = (type: ClassType) => {
    switch (type) {
      case 'A': return '#ef4444'; // red-500
      case 'B': return '#3b82f6'; // blue-500
      case 'C': return '#22c55e'; // green-500
      default: return '#94a3b8';
    }
  };

  return (
    <div className="relative w-full aspect-square bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden cursor-crosshair touch-none select-none">
      {/* Grid Background */}
      <div className={`absolute inset-0 pointer-events-none ${datasetType === 'Categorical' ? 'opacity-30' : 'opacity-10'}`} 
           style={{ 
             backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
             backgroundSize: '10% 10%' 
           }}>
      </div>
      
      {/* Categorical Grid Highlights */}
      {datasetType === 'Categorical' && (
          <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="absolute text-[8px] text-slate-300 font-mono" style={{ left: '1%', top: `${i * 10 + 4}%` }}>
                      {i}
                  </div>
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="absolute text-[8px] text-slate-300 font-mono" style={{ top: '1%', left: `${i * 10 + 4}%` }}>
                      {i}
                  </div>
              ))}
          </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100 100"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        {/* Connection Lines to Nearest Neighbors */}
        {neighbors.map((n) => (
          <line
            key={`line-${n.id}`}
            x1={targetPoint.x}
            y1={targetPoint.y}
            x2={n.x}
            y2={n.y}
            stroke={getClassColor(n.label)}
            strokeWidth="0.5"
            strokeDasharray="2,1"
            opacity="0.6"
          />
        ))}

        {/* Dataset Points */}
        {dataset.map((p) => {
            const isNeighbor = neighbors.some(n => n.id === p.id);
            // In categorical mode, points align perfectly. 
            // In continuous, they are scattered.
            return (
                <circle
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    r={isNeighbor ? (datasetType === 'Categorical' ? 2.5 : 2) : 1.5}
                    fill={getClassColor(p.label)}
                    stroke={isNeighbor ? '#0f172a' : 'none'}
                    strokeWidth={isNeighbor ? 0.5 : 0}
                    opacity={isNeighbor ? 1 : 0.6}
                    className="transition-all duration-200"
                />
            );
        })}

        {/* Target Point */}
        <g 
            style={{ transform: `translate(${targetPoint.x}px, ${targetPoint.y}px)` }}
            className={`pointer-events-none ${isDragging ? 'scale-110' : 'scale-100'} transition-transform`}
        >
            <circle r={datasetType === 'Categorical' ? "5" : "4"} fill="rgba(15, 23, 42, 0.2)" className="animate-pulse" />
            <circle r="2" fill="#0f172a" stroke="#fff" strokeWidth="0.5" />
        </g>
      </svg>
      
      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-slate-500 pointer-events-none border border-slate-200">
        X: {Math.floor(targetPoint.x)}, Y: {Math.floor(targetPoint.y)}
      </div>
    </div>
  );
};

export default SimulationCanvas;

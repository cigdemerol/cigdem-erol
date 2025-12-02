
import React, { useMemo } from 'react';
import { DataPoint, DistanceMetric, VotingStrategy } from '../types';
import { calculateCrossValidationErrors } from '../utils/knnLogic';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ElbowMethodPanelProps {
  dataset: DataPoint[];
  metric: DistanceMetric;
  minkowskiP: number;
  useScaling: boolean;
  isUnbalanced: boolean;
  votingStrategy: VotingStrategy;
  currentK: number;
  onSelectK: (k: number) => void;
}

const ElbowMethodPanel: React.FC<ElbowMethodPanelProps> = ({
  dataset,
  metric,
  minkowskiP,
  useScaling,
  isUnbalanced,
  votingStrategy,
  currentK,
  onSelectK
}) => {
  
  // Calculate errors for K = 1, 3, 5, ... 15
  const errorData = useMemo(() => {
    return calculateCrossValidationErrors(
        dataset, 
        15, 
        metric, 
        minkowskiP, 
        useScaling, 
        isUnbalanced, 
        votingStrategy
    );
  }, [dataset, metric, minkowskiP, useScaling, isUnbalanced, votingStrategy]);

  // Find Optimal K (Lowest Error)
  const optimalK = useMemo(() => {
      let minError = 1.0;
      let bestK = 1;
      // Prefer smaller K in case of ties for simplicity, but avoid K=1 if possible due to overfitting
      errorData.forEach(d => {
          if (d.errorRate < minError) {
              minError = d.errorRate;
              bestK = d.k;
          }
      });
      return bestK;
  }, [errorData]);

  // Chart Dimensions
  const height = 150;
  const padding = 20;
  const widthPct = 100;
  
  const maxError = Math.max(...errorData.map(d => d.errorRate), 0.1); // Avoid div by zero

  const getX = (index: number) => {
     return (index / (errorData.length - 1)) * (100 - padding * 2) + padding;
  };

  const getY = (error: number) => {
      return height - padding - (error / maxError) * (height - padding * 2);
  };

  const pointsString = errorData.map((d, i) => `${getX(i)},${getY(d.errorRate)}`).join(" ");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} />
            Optimal K Analizi (Hata Oranı)
        </h3>
        <div className="flex items-center gap-2 text-sm bg-indigo-50 px-3 py-1.5 rounded-lg text-indigo-700 border border-indigo-100">
             <span>Önerilen K: <strong>{optimalK}</strong></span>
             {currentK !== optimalK && (
                 <button 
                    onClick={() => onSelectK(optimalK)}
                    className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded hover:bg-indigo-700 transition-colors"
                 >
                    Uygula
                 </button>
             )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Graph */}
        <div className="flex-1 relative h-[180px] w-full">
            <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                    <line 
                        key={pct} 
                        x1="0" 
                        y1={getY(maxError * pct)} 
                        x2="100" 
                        y2={getY(maxError * pct)} 
                        stroke="#e2e8f0" 
                        strokeWidth="0.5" 
                    />
                ))}

                {/* The Line */}
                <polyline 
                    points={pointsString} 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="2" 
                    strokeLinejoin="round" 
                    strokeLinecap="round"
                />

                {/* Data Points */}
                {errorData.map((d, i) => {
                    const isSelected = d.k === currentK;
                    const isOptimal = d.k === optimalK;
                    return (
                        <g key={d.k} onClick={() => onSelectK(d.k)} className="cursor-pointer group">
                            <circle 
                                cx={getX(i)} 
                                cy={getY(d.errorRate)} 
                                r={isSelected ? 4 : 2.5} 
                                fill={isOptimal ? '#22c55e' : (isSelected ? '#6366f1' : '#fff')} 
                                stroke={isOptimal ? '#22c55e' : '#6366f1'} 
                                strokeWidth="1.5"
                                className="transition-all duration-200"
                            />
                            
                            {/* Hover Tooltip (Simulated with absolute div below, but added invisible hit area here) */}
                            <rect 
                                x={getX(i) - 2} 
                                y={0} 
                                width="4" 
                                height={height} 
                                fill="transparent" 
                            />
                        </g>
                    );
                })}
            </svg>
            
            {/* X-Axis Labels */}
            <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-[20px]">
                 {errorData.map((d, i) => (
                     <div key={d.k} 
                          style={{ left: `${(i / (errorData.length - 1)) * 100}%` }}
                          className="absolute transform -translate-x-1/2 text-[10px] text-slate-500 font-mono">
                         K={d.k}
                     </div>
                 ))}
            </div>
            
            {/* Y-Axis Label (Rotated) */}
            <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 -rotate-90 text-[10px] text-slate-400 font-bold tracking-widest">
                HATA ORANI
            </div>
        </div>

        {/* Explanation / Legend */}
        <div className="w-full md:w-1/3 text-sm space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600">
                <p className="mb-2">
                    Bu grafik, farklı <strong>K</strong> değerleri için algoritmanın hata oranını gösterir.
                </p>
                <div className="flex items-start gap-2 text-xs">
                     <AlertCircle size={14} className="mt-0.5 shrink-0 text-slate-400" />
                     <span>
                        Genellikle hata oranının en düşük olduğu veya grafiğin "dirsek" yaptığı nokta (hızlı düşüşün durduğu yer) optimal değerdir.
                     </span>
                </div>
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-green-500 bg-green-500"></span>
                    <span>En Düşük Hata (Optimal)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-indigo-500 bg-indigo-500"></span>
                    <span>Seçili K Değeri</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ElbowMethodPanel;

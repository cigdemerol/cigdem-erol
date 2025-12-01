
import React from 'react';
import { ScoredDataPoint, DatasetStats, ClassType } from '../types';
import { Users, Trophy } from 'lucide-react';

interface InfoPanelProps {
  k: number;
  neighbors: ScoredDataPoint[];
  stats: DatasetStats;
  targetPoint: { x: number; y: number };
}

const InfoPanel: React.FC<InfoPanelProps> = ({ k, neighbors, stats, targetPoint }) => {
  const getClassColorBg = (type: ClassType | 'Tie' | null) => {
    switch (type) {
      case 'A': return 'bg-red-100 text-red-800 border-red-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-green-100 text-green-800 border-green-200';
      case 'Tie': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPercentage = (score: number) => {
    if (stats.totalScore === 0) return 0;
    return (score / stats.totalScore) * 100;
  };

  const formatScore = (score: number) => {
    // If it's an integer, return as is. If float, fixed to 2 decimals
    return score % 1 === 0 ? score : score.toFixed(2);
  };

  return (
    <div className="space-y-6">
      
      {/* Prediction Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Algoritma Sonucu
        </h3>
        
        <div className="flex items-center justify-between mb-6">
          <span className="text-slate-600">Tahmin Edilen Sınıf:</span>
          <span className={`px-4 py-2 rounded-lg font-bold border ${getClassColorBg(stats.winner)}`}>
            {stats.winner === 'Tie' ? 'Eşitlik (Tie)' : `Sınıf ${stats.winner}`}
          </span>
        </div>

        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        Sınıf A (Puan)
                    </span>
                    <span className="font-mono font-medium">{formatScore(stats.classCounts.A)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${getPercentage(stats.classCounts.A)}%` }}></div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Sınıf B (Puan)
                    </span>
                    <span className="font-mono font-medium">{formatScore(stats.classCounts.B)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${getPercentage(stats.classCounts.B)}%` }}></div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Sınıf C (Puan)
                    </span>
                    <span className="font-mono font-medium">{formatScore(stats.classCounts.C)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${getPercentage(stats.classCounts.C)}%` }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* Neighbors Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            En Yakın {k} Komşu
        </h3>
        <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-200 pr-2">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                    <tr>
                        <th className="px-3 py-2">Sınıf</th>
                        <th className="px-3 py-2 text-right">Mesafe</th>
                        <th className="px-3 py-2 text-right">Ağırlık (1/d)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {neighbors.map((n, i) => (
                        <tr key={n.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getClassColorBg(n.label)}`}>
                                    {n.label}
                                </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600">
                                {n.distance.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400 text-xs">
                                {(1 / (n.distance + 0.001)).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;

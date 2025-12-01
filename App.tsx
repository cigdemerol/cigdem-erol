
import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Info, Calculator, Database, Ruler, Settings2, Users, Scale, AlertTriangle, CheckCircle2, Grid3X3, Activity } from 'lucide-react';
import SimulationCanvas from './components/SimulationCanvas';
import InfoPanel from './components/InfoPanel';
import DatasetSection from './components/DatasetSection';
import { DataPoint, DistanceMetric, VotingStrategy, DatasetType } from './types';
import { findNearestNeighbors, classifyPoint, generateRandomDataset, snapToGrid } from './utils/knnLogic';

const App: React.FC = () => {
  // Application State
  const [datasetType, setDatasetType] = useState<DatasetType>('Continuous');
  const [k, setK] = useState<number>(3);
  const [metric, setMetric] = useState<DistanceMetric>('Euclidean');
  const [minkowskiP, setMinkowskiP] = useState<number>(3); // Default p=3 for Minkowski
  const [votingStrategy, setVotingStrategy] = useState<VotingStrategy>('Majority');
  const [targetPoint, setTargetPoint] = useState({ x: 50, y: 50 });
  const [dataset, setDataset] = useState<DataPoint[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Scaling & Distribution State
  const [isUnbalanced, setIsUnbalanced] = useState(false);
  const [useScaling, setUseScaling] = useState(false);

  // Initial Data Generation
  useEffect(() => {
    const initialData = generateRandomDataset(30, datasetType);
    setDataset(initialData);
    
    // Reset target point based on type
    if (datasetType === 'Categorical') {
        setTargetPoint({ x: 55, y: 55 }); // Snap to center
    }
  }, [datasetType]);

  // Logic to handle Dataset Type Switch
  const handleDatasetTypeChange = (type: DatasetType) => {
      setDatasetType(type);
      // Auto-switch metric based on suitable defaults
      if (type === 'Categorical') {
          setMetric('Hamming');
          setIsUnbalanced(false); // Disable unbalanced for simplified grid view
          setUseScaling(false);
      } else {
          setMetric('Euclidean');
      }
  };

  // Derived State (Calculations)
  const neighbors = useMemo(
    () => findNearestNeighbors(dataset, targetPoint, k, metric, minkowskiP, useScaling, isUnbalanced),
    [dataset, targetPoint, k, metric, minkowskiP, useScaling, isUnbalanced]
  );

  const stats = useMemo(
    () => classifyPoint(neighbors, votingStrategy),
    [neighbors, votingStrategy]
  );

  const handleGenerateData = () => {
    setDataset(generateRandomDataset(30, datasetType));
  };

  const handleKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setK(Number(e.target.value));
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(e.target.value as DistanceMetric);
  };
  
  const handlePChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinkowskiP(Number(e.target.value));
  };

  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVotingStrategy(e.target.value as VotingStrategy);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Calculator size={20} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">KNN Görselleştirici</h1>
                <h1 className="text-xl font-bold text-slate-800 sm:hidden">KNN</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showExplanation ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <Info size={18} />
                    <span className="hidden sm:inline">Nasıl Çalışır?</span>
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Explanation Section (Collapsible) */}
        {showExplanation && (
            <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                {/* General Description */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-indigo-900">
                    <h2 className="text-lg font-bold mb-3">K-En Yakın Komşu (KNN) Algoritması</h2>
                    <p className="mb-3 leading-relaxed text-sm">
                        KNN, yeni bir verinin sınıfını belirlemek için çevresindeki en yakın <strong>'K'</strong> adet veriye bakar.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Ölçekleme (Min-Max Scaling):</strong> Veri özellikleri (örneğin Yaş ve Maaş) farklı aralıklardaysa, büyük sayılı özellikler mesafeyi domine eder. <code className="bg-indigo-100 px-1 rounded text-xs font-mono">(x - min) / (max - min)</code> formülü ile tüm veriler [0,1] aralığına çekilir.</li>
                        </ul>
                        <ul className="list-disc list-inside space-y-1">
                             <li><strong>Hamming Mesafesi:</strong> Sadece kategorik (ızgara) verilerde kullanılır. İki nokta arasındaki farklı özellik sayısını sayar.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Controls & Canvas */}
            <div className="lg:col-span-7 space-y-6">
                
                {/* Controls Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                    
                    {/* Dataset Type Selector */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => handleDatasetTypeChange('Continuous')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${datasetType === 'Continuous' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Activity size={16} />
                            Sürekli (Continuous)
                        </button>
                        <button 
                            onClick={() => handleDatasetTypeChange('Categorical')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${datasetType === 'Categorical' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Grid3X3 size={16} />
                            Kategorik / Izgara (Grid)
                        </button>
                    </div>

                    {/* Top Row: K and Generate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                                Komşu (K):
                            </label>
                            <div className="flex-1 flex items-center gap-3">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="15" 
                                    step="2" 
                                    value={k} 
                                    onChange={handleKChange}
                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="15" 
                                    step="2" 
                                    value={k} 
                                    onChange={handleKChange}
                                    className="w-12 px-1 py-1 text-center text-sm font-bold text-indigo-600 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={handleGenerateData}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors border border-indigo-100"
                            >
                                <RefreshCw size={16} />
                                Veri Üret
                            </button>
                        </div>
                    </div>

                    {/* Middle Row: Metric and Voting */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[60px]">Mesafe:</label>
                            <select 
                                value={metric}
                                onChange={handleMetricChange}
                                className="flex-1 bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                            >
                                {datasetType === 'Continuous' ? (
                                    <>
                                        <option value="Euclidean">Öklid (Euclidean)</option>
                                        <option value="Manhattan">Manhattan</option>
                                        <option value="Chebyshev">Chebyshev</option>
                                        <option value="Minkowski">Minkowski</option>
                                        <option value="Cosine">Kosinüs (Cosine)</option>
                                        <option value="Jaccard">Jaccard</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Hamming">Hamming</option>
                                        <option value="Manhattan">Manhattan</option>
                                        <option value="Euclidean">Öklid (Euclidean)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[60px]">Oylama:</label>
                            <select 
                                value={votingStrategy}
                                onChange={handleStrategyChange}
                                className="flex-1 bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none"
                            >
                                <option value="Majority">Çoğunluk (Adet)</option>
                                <option value="Weighted">Mesafe Ağırlıklı (1/d)</option>
                            </select>
                        </div>
                    </div>

                    {/* Bottom Row: Scaling & Distribution (Only for Continuous) */}
                    {datasetType === 'Continuous' && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                            {/* Data Distribution Toggle */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <Database size={16} className="text-slate-400" />
                                    Veri Dağılımı:
                                </div>
                                <button 
                                    onClick={() => setIsUnbalanced(!isUnbalanced)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${isUnbalanced ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-200 text-slate-600 border-slate-300'}`}
                                >
                                    {isUnbalanced ? 'Dengesiz (Simüle)' : 'Dengeli'}
                                </button>
                            </div>

                            {/* Scaling Toggle */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <Scale size={16} className="text-slate-400" />
                                    Normalizasyon:
                                </div>
                                <button 
                                    onClick={() => setUseScaling(!useScaling)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${useScaling ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useScaling ? 'translate-x-5' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Continuous Mode Warnings */}
                    {datasetType === 'Continuous' && isUnbalanced && !useScaling && (
                        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 animate-in fade-in">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            <span>
                                <strong>Dikkat:</strong> Dengesiz veri aktif. Normalizasyon kapalı olduğu için mesafe hesaplamasında sadece büyük ölçekli eksen etkili oluyor.
                            </span>
                        </div>
                    )}


                    {/* Minkowski P Parameter */}
                    {metric === 'Minkowski' && (
                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-1">
                            <Settings2 size={16} className="text-slate-500" />
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                                Minkowski Üssü (p): <span className="text-indigo-600 font-bold ml-1">{minkowskiP}</span>
                            </label>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="10" 
                                step="0.1" 
                                value={minkowskiP} 
                                onChange={handlePChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    )}
                </div>

                {/* Simulation Canvas */}
                <div className="relative">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-medium text-slate-600 pointer-events-none">
                        Hedef noktayı sürükleyin {datasetType === 'Categorical' && '(Izgaraya yapışır)'}
                    </div>
                    <SimulationCanvas 
                        dataset={dataset} 
                        neighbors={neighbors}
                        targetPoint={targetPoint}
                        onTargetMove={(x, y) => setTargetPoint({ x, y })}
                        datasetType={datasetType}
                    />
                    
                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-sm text-slate-600 font-medium">Sınıf A</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-sm text-slate-600 font-medium">Sınıf B</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-sm text-slate-600 font-medium">Sınıf C</span>
                        </div>
                    </div>
                </div>

                {/* Example Problem Description */}
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-sm text-slate-700">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Database size={16} />
                        Simülasyon Detayı
                    </h3>
                    <p>
                        Şu anda <strong>{datasetType === 'Continuous' ? 'Sürekli (Continuous)' : 'Kategorik (Categorical)'}</strong> veri tipi üzerinde çalışıyorsunuz.
                        Kullanılan metrik: <strong>{metric}</strong> 
                        {metric === 'Minkowski' && <span> (p={minkowskiP})</span>}.
                        {datasetType === 'Categorical' && <span className="block mt-1 text-indigo-600">Bu modda veriler 10x10 ızgaraya oturtulmuştur. Hamming mesafesi için idealdir.</span>}
                        {metric === 'Cosine' && <span className="block mt-1 text-indigo-600">Kosinüs mesafesi açıyı ölçer. Merkeze (0,0) göre aynı yöndeki uzak noktalar birbirine yakın kabul edilir.</span>}
                    </p>
                </div>

            </div>

            {/* Right Column: Info Panel */}
            <div className="lg:col-span-5">
                <InfoPanel 
                    k={k}
                    neighbors={neighbors}
                    stats={stats}
                    targetPoint={targetPoint}
                />
            </div>

        </div>

        {/* Dataset and Problem Section */}
        <DatasetSection dataset={dataset} />

      </main>
    </div>
  );
};

export default App;

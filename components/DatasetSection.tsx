
import React from 'react';
import { DataPoint } from '../types';
import { Database, FileText, Target } from 'lucide-react';

interface DatasetSectionProps {
  dataset: DataPoint[];
}

const DatasetSection: React.FC<DatasetSectionProps> = ({ dataset }) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Problem Definition */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
         <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="text-indigo-600" size={20} />
            Problem Tanımı
         </h3>
         <div className="space-y-4 text-sm text-slate-600 leading-relaxed flex-1">
            <p>
                Bu simülasyon, bir <strong>Gözetimli Öğrenme (Supervised Learning)</strong> alt dalı olan <strong>Sınıflandırma (Classification)</strong> problemini ele almaktadır.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Target size={16} />
                    Amaç:
                </h4>
                <p className="mb-2">
                    Elimizdeki eğitim veri setinde yer alan noktaların özelliklerine (X ve Y koordinatları) bakarak, etiketi bilinmeyen yeni bir noktanın (Hedef Nokta) hangi sınıfa (A, B veya C) ait olduğunu tahmin etmek.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-indigo-50 rounded border border-indigo-100">
                    <strong className="block text-indigo-900 mb-1">Girdi (Features):</strong>
                    <ul className="list-disc list-inside text-indigo-800/80 text-xs">
                        <li>X Değeri (0-100)</li>
                        <li>Y Değeri (0-100)</li>
                    </ul>
                </div>
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                    <strong className="block text-emerald-900 mb-1">Çıktı (Labels):</strong>
                    <ul className="list-disc list-inside text-emerald-800/80 text-xs">
                        <li>Sınıf A (Kırmızı)</li>
                        <li>Sınıf B (Mavi)</li>
                        <li>Sınıf C (Yeşil)</li>
                    </ul>
                </div>
            </div>
            
            <p className="text-xs text-slate-400 italic mt-4">
                * Gerçek hayatta bu X ve Y değerleri; "Müşteri Yaşı ve Geliri", "Tümör Boyutu ve Yoğunluğu" veya "Motor Sıcaklığı ve Titreşimi" gibi ölçülebilir özellikleri temsil edebilir.
            </p>
         </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database className="text-indigo-600" size={20} />
                Eğitim Veri Seti
            </h3>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                {dataset.length} Kayıt
            </span>
         </div>
         
         <div className="flex-1 overflow-hidden border border-slate-200 rounded-lg bg-slate-50 flex flex-col">
             <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-xs uppercase text-slate-500 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 border-b border-slate-200 font-semibold">ID</th>
                            <th className="px-4 py-3 border-b border-slate-200 font-semibold">X Özelliği</th>
                            <th className="px-4 py-3 border-b border-slate-200 font-semibold">Y Özelliği</th>
                            <th className="px-4 py-3 border-b border-slate-200 font-semibold">Gerçek Sınıf</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {dataset.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2 font-mono text-slate-500 text-xs">#{row.id + 1}</td>
                                <td className="px-4 py-2 font-mono text-slate-600">{row.x.toFixed(1)}</td>
                                <td className="px-4 py-2 font-mono text-slate-600">{row.y.toFixed(1)}</td>
                                <td className="px-4 py-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${row.label === 'A' ? 'bg-red-50 text-red-700 border-red-100' : 
                                          row.label === 'B' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                          'bg-green-50 text-green-700 border-green-100'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full 
                                            ${row.label === 'A' ? 'bg-red-500' : 
                                              row.label === 'B' ? 'bg-blue-500' : 
                                              'bg-green-500'}`}></span>
                                        Sınıf {row.label}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         </div>
      </div>
    </div>
  );
};

export default DatasetSection;


import React, { useState, useMemo } from 'react';
import { UserSettings } from '../types';
import { Crown, Zap, Shield, ChevronRight, Plus, Trash2, Check, X } from 'lucide-react';

interface Props {
  settings: UserSettings;
}

const SettingsView: React.FC<Props> = ({ settings }) => {
  const [monitoredBrands, setMonitoredBrands] = useState([
     { id: 1, name: 'Lululemon', active: true },
     { id: 2, name: 'Nike', active: false },
     { id: 3, name: 'Apple', active: true },
  ]);

  // State for Adding New Brand
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // Local state for the budget table
  // Converted to array to support dynamic addition/removal
  const [budgetRows, setBudgetRows] = useState([
      { id: 1, category: 'Fashion', amount: 200 },
      { id: 2, category: 'Beauty', amount: 80 },
      { id: 3, category: 'Electronics', amount: 300 },
      { id: 4, category: 'Groceries', amount: 200 }
  ]);

  // Calculate total dynamically based on table inputs
  const totalBudget = useMemo(() => {
      return budgetRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }, [budgetRows]);

  const handleBudgetChange = (id: number, field: 'category' | 'amount', value: string) => {
      setBudgetRows(prev => prev.map(row => {
          if (row.id === id) {
              return { 
                  ...row, 
                  [field]: field === 'amount' ? (parseFloat(value) || 0) : value 
              };
          }
          return row;
      }));
  };

  const handleAddCategory = () => {
      const newId = Math.max(...budgetRows.map(r => r.id), 0) + 1;
      setBudgetRows([...budgetRows, { id: newId, category: '', amount: 0 }]);
  };

  const handleDeleteCategory = (id: number) => {
      setBudgetRows(prev => prev.filter(r => r.id !== id));
  };

  const toggleBrand = (id: number) => {
      setMonitoredBrands(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const handleAddBrand = () => {
      if (newBrandName.trim()) {
          const newId = Math.max(...monitoredBrands.map(b => b.id), 0) + 1;
          setMonitoredBrands([...monitoredBrands, { id: newId, name: newBrandName.trim(), active: true }]);
          setNewBrandName('');
          setIsAddingBrand(false);
      }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 pt-12 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Me</h1>

      {/* Budget Section */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Monthly Budget</h2>
        
        {/* Dynamic Total Display */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200/50 mb-6">
            <span className="text-gray-500 text-sm">Total limit</span>
            <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800 tracking-tight">${totalBudget}</span>
                <span className="ml-2 text-xs text-gray-400 font-medium">/ month</span>
            </div>
        </div>

        {/* Budget Allocation Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             {/* Header */}
             <div className="grid grid-cols-[1fr_90px_30px] bg-gray-100/50 p-3 border-b border-gray-200 gap-2">
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right pr-2">Budget</span>
                 <span></span>
             </div>
             
             {/* Rows */}
             <div className="divide-y divide-gray-100 bg-white">
                 {budgetRows.map((row) => (
                     <div key={row.id} className="grid grid-cols-[1fr_90px_30px] p-3 items-center hover:bg-gray-50 transition-colors group gap-2">
                         {/* Category Input */}
                         <input 
                             type="text" 
                             value={row.category}
                             onChange={(e) => handleBudgetChange(row.id, 'category', e.target.value)}
                             className="bg-transparent border-none text-sm font-medium text-gray-700 font-serif focus:ring-0 p-0 placeholder-gray-300 w-full"
                             placeholder="Category Name"
                         />
                         
                         {/* Amount Input */}
                         <div className="flex justify-end">
                             <div className="relative w-full">
                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                                 <input 
                                     type="number" 
                                     value={row.amount || ''}
                                     onChange={(e) => handleBudgetChange(row.id, 'amount', e.target.value)}
                                     className="w-full bg-gray-50 group-hover:bg-white border border-transparent focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 rounded-lg py-1 pl-5 pr-1 text-right text-sm font-bold text-gray-900 outline-none transition-all placeholder-gray-300"
                                     placeholder="0"
                                 />
                             </div>
                         </div>

                         {/* Delete Action (visible on hover or if empty) */}
                         <div className="flex justify-center">
                             <button 
                                onClick={() => handleDeleteCategory(row.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Delete Category"
                             >
                                 <Trash2 size={14} />
                             </button>
                         </div>
                     </div>
                 ))}
                 
                 {/* Add Row Button */}
                 <button 
                    onClick={handleAddCategory}
                    className="w-full p-3 flex items-center justify-center space-x-2 text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-colors text-xs font-medium border-t border-transparent hover:border-orange-100"
                 >
                     <Plus size={14} />
                     <span>Add Category</span>
                 </button>
             </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-3 text-center italic">
           Budget resets on the 1st of every month
        </p>
      </div>

      {/* Priority Monitoring Categories (Sketch 4) */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Priority Monitoring</h2>
        <div className="space-y-3">
            {[
                { rank: 1, name: 'Fashion', icon: <Crown size={14} className="text-yellow-500" /> },
                { rank: 2, name: 'Electronics', icon: <Zap size={14} className="text-blue-500" /> },
                { rank: 3, name: 'Outdoor', icon: <Shield size={14} className="text-green-500" /> }
            ].map((cat) => (
                <div key={cat.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">
                            {cat.rank}
                        </div>
                        <span className="font-medium text-gray-700">{cat.name}</span>
                    </div>
                    {cat.icon}
                </div>
            ))}
        </div>
      </div>

      {/* Monitored Brands (Sketch 4) */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 border border-gray-100">
        <div className="flex justify-between items-end mb-4">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Monitored Brands</h2>
             <span className="text-[10px] text-gray-400">Swipe to toggle</span>
        </div>
        
        <div className="space-y-0 divide-y divide-gray-100">
            {monitoredBrands.map((brand) => (
                <div key={brand.id} className="flex justify-between items-center py-4">
                    <span className="font-medium text-gray-800">{brand.name}</span>
                    <button 
                        onClick={() => toggleBrand(brand.id)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${brand.active ? 'bg-black' : 'bg-gray-200'}`}
                    >
                         <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${brand.active ? 'translate-x-5' : ''}`}></div>
                    </button>
                </div>
            ))}
            
            {/* Add New Brand Logic */}
            {isAddingBrand ? (
                <div className="flex items-center space-x-2 py-3">
                    <input 
                        type="text" 
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="Brand name"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddBrand();
                            if (e.key === 'Escape') setIsAddingBrand(false);
                        }}
                    />
                    <button 
                        onClick={handleAddBrand}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Check size={14} />
                    </button>
                    <button 
                        onClick={() => setIsAddingBrand(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => setIsAddingBrand(true)}
                    className="py-3 text-center text-xs text-gray-400 font-medium cursor-pointer hover:text-orange-500 transition-colors border-t border-transparent hover:border-orange-50"
                >
                    + Add New Brand
                </div>
            )}
        </div>
      </div>

      {/* Interventions */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-5">Intervention Controls</h2>
        
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <span className="block text-sm font-medium text-gray-800">Front Camera Monitoring</span>
                    <span className="text-xs text-gray-400">Detect pupil dilation & gaze</span>
                </div>
                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${settings.enableCamera ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${settings.enableCamera ? 'translate-x-5' : ''}`}></div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <span className="block text-sm font-medium text-gray-800">Vibration Alerts</span>
                    <span className="text-xs text-gray-400">Haptic feedback for Level 3+</span>
                </div>
                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${settings.enableVibration ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${settings.enableVibration ? 'translate-x-5' : ''}`}></div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <span className="block text-sm font-medium text-gray-800">Safety Lock</span>
                    <span className="text-xs text-gray-400">Force lockout at max arousal</span>
                </div>
                <div className="w-11 h-6 rounded-full p-1 bg-green-500">
                     <div className="w-4 h-4 rounded-full bg-white shadow-md transform translate-x-5"></div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-10 mb-4 text-center">
        <button className="text-red-500 text-xs font-bold uppercase tracking-wider border border-red-100 px-4 py-2 rounded-full hover:bg-red-50">Reset All Data</button>
      </div>
    </div>
  );
};

export default SettingsView;

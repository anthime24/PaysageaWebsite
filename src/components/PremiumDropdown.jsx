import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PremiumDropdown = ({ label, options, value, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-2xl hover:border-[var(--color-nature)]/50 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={20} className="text-[var(--color-nature)]" />}
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</p>
                        <p className="font-medium text-[var(--color-structure)]">{selectedOption ? selectedOption.label : 'Sélectionner...'}</p>
                    </div>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => {
                                onChange(option.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left p-4 hover:bg-[var(--color-nature)]/5 transition-colors flex items-center gap-3 ${value === option.id ? 'text-[var(--color-nature)] bg-[var(--color-nature)]/5 font-semibold' : 'text-[var(--color-structure)]'}`}
                        >
                            {option.icon && <option.icon size={18} />}
                            <div>
                                <p className="font-medium">{option.label}</p>
                                {option.desc && <p className="text-xs text-gray-400 font-normal">{option.desc}</p>}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PremiumDropdown;

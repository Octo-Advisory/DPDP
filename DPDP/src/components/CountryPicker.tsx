
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Country {
    name: string;
    code?: string;
}

interface CountryPickerProps {
    countries: Country[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function CountryPicker({ countries, value, onChange, placeholder = "Select Country", disabled = false }: CountryPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countries.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCountry = countries.find(c => c.name === value);

    const getFlagUrl = (code?: string) => {
        if (!code) return null;
        return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between transition-all cursor-pointer ${
                    disabled ? 'opacity-60 cursor-not-allowed bg-stone-100' : 'hover:border-amber-300 focus-within:ring-2 focus-within:ring-amber-500'
                } ${isOpen ? 'ring-2 ring-amber-500 border-amber-500' : ''}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedCountry && selectedCountry.code && (
                        <img 
                            src={getFlagUrl(selectedCountry.code) || ''} 
                            className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0"
                            alt=""
                        />
                    )}
                    <span className={`truncate ${!value ? 'text-slate-400' : 'text-slate-900 font-medium'}`}>
                        {value || placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-[1000] w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
                    <div className="p-3 border-b border-stone-100 bg-stone-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search countries..."
                                className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto scrollbar-thin">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <div
                                    key={country.name}
                                    onClick={() => {
                                        onChange(country.name);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                    className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                                        value === country.name ? 'bg-amber-50' : 'hover:bg-stone-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {country.code && (
                                            <img 
                                                src={getFlagUrl(country.code) || ''} 
                                                className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                                alt=""
                                            />
                                        )}
                                        <span className={`text-sm ${value === country.name ? 'font-bold text-amber-900' : 'text-slate-700'}`}>
                                            {country.name}
                                        </span>
                                    </div>
                                    {value === country.name && <Check className="w-4 h-4 text-amber-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-400 text-sm italic font-serif">
                                No countries found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

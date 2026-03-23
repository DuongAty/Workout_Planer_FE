import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function FormSelect({ 
  label, 
  icon: Icon, 
  options, 
  value, 
  onChange, 
  disabled, 
  placeholder = "Select option" ,
  labelClassName = "text-blue-600 text-[11px] font-black uppercase tracking-widest"
  
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {/* Label: Giữ nguyên font-black và uppercase theo style của bạn */}
      {label && (
        <label className={`flex items-center gap-2 not-italic transition-all ${labelClassName}`}>
          {Icon && <Icon size={14} />} {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between outline-none transition-all
            ${isOpen ? 'border-blue-400 bg-white ring-4 ring-blue-50' : 'hover:border-blue-200'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {/* Font giá trị: Chỉnh thành font-medium và italic để khớp với các input khác */}
          <span className={`text-sm italic ${!value ? 'text-gray-400 not-italic' : 'text-gray-700 font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-blue-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-blue-900/10">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left flex items-center justify-between transition-colors
                    ${value === option.value ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Font Option: Sử dụng font-bold, uppercase và tracking-widest giống style menu */}
                  <span className={`font-bold uppercase text-[11px] tracking-widest 
                    ${value === option.value ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {option.label}
                  </span>
                  {value === option.value && <Check size={14} className="text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
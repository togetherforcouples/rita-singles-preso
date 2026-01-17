/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { ProfileSection } from '../types';

interface GameDialogProps {
  isOpen: boolean;
  data: ProfileSection | null;
  onClose: () => void;
}

export const GameDialog: React.FC<GameDialogProps> = ({ isOpen, data, onClose }) => {
  
  useEffect(() => {
    if (isOpen) {
        // Add keyboard listener
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !data || !data.slides) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#f4e4bc] border-[6px] border-[#5c3a1e] rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="bg-[#5c3a1e] px-6 py-4 flex justify-between items-center text-[#f4e4bc] shrink-0 shadow-md z-10">
            <h2 className="text-3xl font-bold tracking-wider uppercase font-vt323">{data.title}</h2>
            <button onClick={onClose} className="hover:text-red-400 transition-colors p-1">
                <X size={32} />
            </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto bg-[#f4e4bc]">
            <div className="space-y-12">
                {data.slides.map((slide, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        
                        {/* Image Section */}
                        <div className="w-full md:w-48 bg-[#dcc096] border-4 border-[#8b5a2b] rounded-sm flex items-center justify-center relative overflow-hidden shrink-0 h-48 shadow-inner">
                            {slide.image ? (
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                            ) : slide.imagePlaceholder ? (
                                <div className="text-center p-2 text-[#5c3a1e]/60 flex flex-col items-center gap-2">
                                    <ImageIcon size={32} />
                                    <span className="font-bold text-sm uppercase tracking-wide leading-tight">
                                        {slide.imagePlaceholder}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-[#5c3a1e]/40 font-bold text-4xl">?</div>
                            )}
                        </div>

                        {/* Text Section */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-2xl font-bold text-[#5c3a1e] mb-3 border-b-4 border-[#8b5a2b]/30 pb-2 inline-block self-start">
                                {slide.title}
                            </h3>
                            <div className="space-y-3 text-xl text-[#4a3525] font-medium leading-relaxed font-vt323">
                                {slide.text.map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* End of content decoration */}
            <div className="mt-12 flex justify-center opacity-50">
                <div className="w-16 h-1 bg-[#8b5a2b] rounded-full"></div>
            </div>
        </div>

      </div>
    </div>
  );
};
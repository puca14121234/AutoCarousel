'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { useCarouselStore, getCanvasSize } from '@/store/useCarouselStore';
import { captureElement, downloadImage } from '@/utils/export-utils';
import { motion } from 'framer-motion';

export const Timeline: React.FC = () => {
    const { slides, currentSlideIndex, setCurrentSlideIndex } = useCarouselStore();

    const handleDownloadSingle = async (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        setCurrentSlideIndex(index);

        // Đợi Canvas render slide mới
        setTimeout(async () => {
            const el = document.getElementById('canvas-export-area');
            if (el) {
                const { settings } = useCarouselStore.getState();
                const canvasSize = getCanvasSize(settings.aspectRatio);
                const dataUrl = await captureElement(el, 2, canvasSize.width, canvasSize.height);
                downloadImage(dataUrl, `slide-${index + 1}.png`);
            }
        }, 500);
    };

    return (
        <div className="h-48 w-full bg-black/40 backdrop-blur-2xl border-t border-white/5 flex flex-col">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Timeline / Slides</span>
                <span className="text-[10px] text-gray-600">{slides.length} slides</span>
            </div>

            <div className="flex-1 p-4 flex gap-4 overflow-x-auto items-center">
                {slides.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-600 text-xs italic">
                        Chưa có slide nào được tạo...
                    </div>
                ) : (
                    slides.map((slide, index) => (
                        <motion.div
                            key={slide.id}
                            className="relative group outline-none"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <motion.button
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCurrentSlideIndex(index)}
                                className={`relative flex-shrink-0 w-28 aspect-square rounded-lg border-2 transition-all overflow-hidden ${currentSlideIndex === index
                                    ? 'border-blue-500 shadow-xl shadow-blue-500/40 bg-blue-500/5'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center p-2 text-[6px] leading-[8px] text-gray-400 select-none pointer-events-none">
                                    {slide.content.substring(0, 100)}...
                                </div>
                                <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    #{index + 1}
                                </div>
                            </motion.button>

                            <button
                                onClick={(e) => handleDownloadSingle(e, index)}
                                className="absolute top-2 right-2 p-2 bg-blue-600 rounded-lg shadow-lg z-10 active:scale-90 transition-transform"
                                title="Tải ảnh này"
                            >
                                <Download className="w-4 h-4 text-white" />
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

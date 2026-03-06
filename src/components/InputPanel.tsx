'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore } from '@/store/useCarouselStore';
import { splitTextIntoSlides } from '@/utils/text-utils';
import { LayoutGrid, Type, Image as ImageIcon } from 'lucide-react';

interface InputPanelProps {
    isMobile?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ isMobile }) => {
    const { rawText, setRawText, slides, setSlides, settings } = useCarouselStore();
    const [inputValue, setInputValue] = useState(rawText);

    const handleGenerate = () => {
        // Tách câu đầu tiên ra làm Title cho Slide Bìa
        const parts = inputValue.split('\n');
        let coverTitle = inputValue;
        let remainingContent = '';

        if (parts.length > 1) {
            coverTitle = parts[0].trim();
            remainingContent = parts.slice(1).join('\n').trim();
        }

        const slideContents = remainingContent ? splitTextIntoSlides(remainingContent, 1080 - settings.padding * 2, {
            width: 1080,
            fontSize: settings.fontSizeContent,
            fontFamily: settings.contentFontFamily,
            lineHeight: settings.contentLineHeight,
            padding: settings.padding,
        }) : [];

        const newSlides: typeof slides = [];

        // 1. Tạo slide Cover (Slide 0) với Heading text
        newSlides.push({
            id: `slide-${Date.now()}-cover`,
            title: coverTitle || "Tiêu đề Carousel",
            content: "", // Trang bìa ưu tiên làm nổi bật Tiêu đề
        });

        // 2. Tạo các slide Nội dung (Slide > 0)
        slideContents.forEach((content, index) => {
            newSlides.push({
                id: `slide-${Date.now()}-${index + 1}`,
                title: "",
                content: content,
            });
        });

        setSlides(newSlides);
        setRawText(inputValue);
    };

    useEffect(() => {
        if (isMobile) {
            handleGenerate();
        }
    }, [inputValue, isMobile]);

    return (
        <div className={isMobile ? "w-full h-full p-4 flex flex-col gap-4" : "w-96 h-full bg-black/40 backdrop-blur-md border-r border-white/10 p-6 flex flex-col gap-6"}>
            {!isMobile && (
                <div className="flex items-center gap-2 mb-2">
                    <LayoutGrid className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold">Nội dung</h2>
                </div>
            )}

            <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest">Văn bản Carousel</label>
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white resize-none focus:outline-none focus:border-blue-500 transition-all text-sm leading-relaxed"
                    placeholder="Nhập nội dung bài viết của bạn tại đây để tự động tách thành slides..."
                />
            </div>

            {!isMobile && (
                <button
                    onClick={handleGenerate}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                    <Type className="w-4 h-4" />
                    Tự động tách Slide
                </button>
            )}

            <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-orange-400">
                    <ImageIcon className="w-3 h-3 inline mr-1 mb-1" />
                    Tip: Sử dụng dấu xuống dòng đôi `\n\n` để gợi ý điểm ngắt slide thủ công.
                </p>
            </div>
        </div>
    );
};

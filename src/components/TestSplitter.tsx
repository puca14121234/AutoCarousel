'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore } from '@/store/useCarouselStore';
import { splitTextIntoSlides } from '@/utils/text-utils';

export default function TestSplitter() {
    const { rawText, setRawText, settings, slides, setSlides } = useCarouselStore();
    const [testText, setTestText] = useState(rawText || "Văn bản mẫu để kiểm tra thuật toán tách slide. \n\nĐoạn thứ hai rất dài để xem nó có tự động ngắt trang khi vượt quá giới hạn chiều cao hay không. Chúng ta cần đảm bảo rằng chữ hiển thị sắc nét và mượt mà trên mọi thiết bị. \n\nThêm một đoạn nữa để kích hoạt cơ chế Orphan Cleanup nếu đoạn này quá ngắn.");

    const handleSplit = () => {
        // Giả lập kích thước Slide là 1080x1080
        const slidesResult = splitTextIntoSlides(testText, 1080, {
            width: 1080,
            fontSize: settings.fontSizeContent,
            fontFamily: settings.fontFamily,
            lineHeight: settings.lineHeight,
            padding: settings.padding,
        });

        const mappedSlides = slidesResult.map((content, index) => ({
            id: `slide-${index}`,
            title: index === 0 ? "Tiêu đề Slide" : "",
            content: content,
        }));

        setSlides(mappedSlides);
        setRawText(testText);
    };

    return (
        <div className="flex flex-col gap-6 p-8 bg-white/5 rounded-2xl border border-white/10 w-full max-w-4xl">
            <h2 className="text-2xl font-bold">🧪 Test Text Splitting</h2>

            <textarea
                className="w-full h-40 p-4 bg-black/50 border border-white/10 rounded-lg text-white"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Nhập văn bản dài ở đây..."
            />

            <button
                onClick={handleSplit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
            >
                Tách Slide Ngay
            </button>

            {slides.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-bold mb-4">Kết quả: {slides.length} slides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slides.map((slide, i) => (
                            <div key={slide.id} className="p-4 bg-white/10 rounded-lg border border-white/5">
                                <span className="text-xs text-blue-400 font-mono">Slide {i + 1}</span>
                                <p className="mt-2 text-sm text-gray-200">{slide.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

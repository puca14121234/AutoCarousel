'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore, getCanvasSize } from '@/store/useCarouselStore';
import { InputPanel } from '@/components/InputPanel';
import { CanvasEditor } from '@/components/CanvasEditor';
import { DesignSidebar } from '@/components/DesignSidebar';
import { Timeline } from '@/components/Timeline';
import { MobileWizard } from '@/components/MobileWizard';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { captureElement, bulkDownloadToDirectory } from '@/utils/export-utils';

export default function Home() {
    const { slides, currentSlideIndex, setCurrentSlideIndex, settings } = useCarouselStore();
    const [isExporting, setIsExporting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return <MobileWizard />;
    }
    const currentSlide = slides[currentSlideIndex] || null;

    const handleExport = async () => {
        if (slides.length === 0) return;
        setIsExporting(true);

        const images: { dataUrl: string, name: string }[] = [];
        const canvasSize = getCanvasSize(settings.aspectRatio);

        try {
            // Thử lấy directory handle TRƯỚC khi chạy loop để tránh SecurityError
            let directoryHandle: any = null;
            // @ts-ignore
            if (typeof window.showDirectoryPicker === 'function') {
                try {
                    // @ts-ignore
                    directoryHandle = await window.showDirectoryPicker();
                } catch (e) {
                    console.log('User cancelled directory picker or it failed');
                }
            }

            for (let i = 0; i < slides.length; i++) {
                setCurrentSlideIndex(i);
                await new Promise(resolve => setTimeout(resolve, 800));

                const el = document.getElementById('canvas-export-area');
                if (el) {
                    const dataUrl = await captureElement(el, 2, canvasSize.width, canvasSize.height);
                    images.push({ dataUrl, name: `carousel-slide-${i + 1}.png` });

                    // Nếu có directory handle thì lưu trực tiếp luôn
                    if (directoryHandle) {
                        // @ts-ignore
                        const fileHandle = await directoryHandle.getFileHandle(`slide-${i + 1}.png`, { create: true });
                        // @ts-ignore
                        const writable = await fileHandle.createWritable();
                        const response = await fetch(dataUrl);
                        const blob = await response.blob();
                        await writable.write(blob);
                        await writable.close();
                    } else if (
                        // @ts-ignore
                        typeof window.showDirectoryPicker !== 'function'
                    ) {
                        // Fallback cho trình duyệt không hỗ trợ Picker: tải lẻ từng file (legacy mode)
                        const link = document.createElement('a');
                        link.download = `slide-${i + 1}.png`;
                        link.href = dataUrl;
                        link.click();
                    }
                }
            }

            // Nếu không có directory handle và không hỗ trợ Picker, tiến trình download lẻ đã chạy trong loop.
            // Không còn fallback ZIP theo yêu cầu.

            setCurrentSlideIndex(0);
        } catch (err) {
            console.error('Export failed:', err);
            alert("Có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans">
            {/* Sidebar Trái - Input */}
            <InputPanel />

            {/* Khu vực trung tâm - Canvas */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header App */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h1 className="font-bold tracking-tight">Auto Carousel</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all text-gray-400">
                            Chế độ tối
                        </button>
                        <button
                            disabled={isExporting || slides.length === 0}
                            onClick={handleExport}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xuất...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Xuất bản
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Canvas Area */}
                <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent overflow-hidden">
                    {slides.length > 0 ? (
                        <CanvasEditor slide={currentSlide} />
                    ) : (
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Bắt đầu sáng tạo</h2>
                            <p className="text-gray-500">
                                Hãy nhập nội dung vào bảng bên trái để tôi tự động tách thành bộ slide chuyên nghiệp cho bạn.
                            </p>
                        </div>
                    )}
                </div>

                {/* Timeline Dưới */}
                <div className="flex-shrink-0">
                    <Timeline />
                </div>
            </div>

            {/* Sidebar Phải - Design Settings */}
            <DesignSidebar />
        </div>
    );
}

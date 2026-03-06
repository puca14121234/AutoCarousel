'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore, getCanvasSize } from '@/store/useCarouselStore';
import { InputPanel } from '@/components/InputPanel';
import { CanvasEditor } from '@/components/CanvasEditor';
import { DesignSidebar } from '@/components/DesignSidebar';
import { Timeline } from '@/components/Timeline';
import { MobileWizard } from '@/components/MobileWizard';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { captureElement, bulkDownloadToDirectory, shareImages, downloadImage } from '@/utils/export-utils';

export default function Home() {
    const { slides, currentSlideIndex, setCurrentSlideIndex, settings, processedImages, setProcessedImages } = useCarouselStore();
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

        // Bước 2: Share thực sự (Cần user click trực tiếp)
        if (processedImages && processedImages.length > 0 && typeof navigator !== 'undefined' && !!navigator.share) {
            await shareImages(processedImages);
            setProcessedImages(null);
            return;
        }

        setIsExporting(true);
        setProcessedImages(null);
        try {
            const images: { dataUrl: string, name: string }[] = [];
            // @ts-ignore
            const directoryHandle = await window.showDirectoryPicker().catch(() => null);

            for (let i = 0; i < slides.length; i++) {
                setCurrentSlideIndex(i);
                await new Promise(resolve => setTimeout(resolve, 800));
                const el = document.getElementById('canvas-export-area');
                if (el) {
                    const canvasSize = getCanvasSize(settings.aspectRatio);
                    // Dùng 2x để ổn định hơn cho Safari
                    const dataUrl = await captureElement(el, 2, canvasSize.width, canvasSize.height);
                    const fileName = `carousel-slide-${i + 1}.png`;

                    if (directoryHandle) {
                        try {
                            const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
                            const writable = await fileHandle.createWritable();
                            const response = await fetch(dataUrl);
                            const blob = await response.blob();
                            await writable.write(blob);
                            await writable.close();
                        } catch (e) {
                            console.error('File write failed:', e);
                        }
                    } else if (typeof window !== 'undefined' && !navigator.share) {
                        // Chỉ tải lẻ tự động nếu KHÔNG hỗ trợ Share (để tránh spam popup trên mobile)
                        downloadImage(dataUrl, fileName);
                    }
                    images.push({ dataUrl, name: fileName });
                }
            }

            // Nếu hỗ trợ Share, nhắc người dùng click lần 2
            if (images.length > 0 && typeof navigator !== 'undefined' && !!navigator.share) {
                setProcessedImages(images);
                alert("Đã xong bước chuẩn bị. Vui lòng nhấn nút 'Lưu vào máy' một lần nữa để hoàn tất!");
            }

            setCurrentSlideIndex(0);
        } catch (err) {
            console.error('Export failed:', err);
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
                        <button
                            disabled={isExporting || slides.length === 0}
                            onClick={handleExport}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${processedImages ? 'bg-green-600 hover:bg-green-500 animate-bounce' : 'bg-purple-600 hover:bg-purple-500'
                                }`}
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang chuẩn bị...
                                </>
                            ) : processedImages ? (
                                <>
                                    <Download className="w-4 h-4" />
                                    Lưu {processedImages.length} ảnh vào máy
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

'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore, getCanvasSize } from '@/store/useCarouselStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Upload, CheckCircle2, Settings, Download, Palette, ChevronLeft, Loader2 } from 'lucide-react';
import { InputPanel } from './InputPanel';
import { CanvasEditor } from './CanvasEditor';
import { Timeline } from './Timeline';
import { DesignSidebar } from './DesignSidebar';
import { captureElement, bulkDownloadToDirectory } from '@/utils/export-utils';

export const MobileWizard: React.FC = () => {
    const {
        currentStep, nextStep, prevStep, slides, currentSlideIndex,
        setStep, settings, setCurrentSlideIndex, processedImages, setProcessedImages
    } = useCarouselStore();
    const [showSettings, setShowSettings] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (slides.length === 0) return;

        // Nếu đã có ảnh đã xử lý, thực hiện Share
        if (processedImages && processedImages.length > 0 && typeof navigator !== 'undefined' && !!navigator.share) {
            const { shareImages } = await import('@/utils/export-utils');
            await shareImages(processedImages);
            setProcessedImages(null);
            return;
        }

        setIsExporting(true);
        setProcessedImages(null);
        try {
            const imageData: { dataUrl: string, name: string }[] = [];
            for (let i = 0; i < slides.length; i++) {
                setCurrentSlideIndex(i);
                await new Promise(resolve => setTimeout(resolve, 800));
                const el = document.getElementById('canvas-export-area');
                if (el) {
                    const canvasSize = getCanvasSize(settings.aspectRatio);
                    const dataUrl = await captureElement(el, 3, canvasSize.width, canvasSize.height);
                    imageData.push({ dataUrl, name: `carousel-slide-${i + 1}.png` });
                }
            }

            if (imageData.length > 0) {
                if (typeof navigator !== 'undefined' && !!navigator.share) {
                    setProcessedImages(imageData);
                } else {
                    // Fallback PC download lẻ
                    imageData.forEach(img => {
                        const link = document.createElement('a');
                        link.download = img.name;
                        link.href = img.dataUrl;
                        link.click();
                    });
                }
            }

            setCurrentSlideIndex(0);
        } catch (err) {
            console.error('Download all failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    // Step 1: Splash Screen
    const renderSplash = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-900/20 to-black h-full"
        >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
                <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Auto Carousel
            </h1>
            <p className="text-gray-400 mb-12 max-w-xs">
                Tạo bộ ảnh cuộn chuyên nghiệp chỉ trong vài giây
            </p>
            <button
                onClick={nextStep}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40"
            >
                Tạo ảnh cuộn ngay
                <ArrowRight className="w-5 h-5" />
            </button>
        </motion.div>
    );

    // Step 2: Content Input
    const renderInput = () => (
        <motion.div
            initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            className="flex flex-col h-full bg-[#050505]"
        >
            <div className="p-4 border-b border-white/5 flex items-center gap-4">
                <button onClick={prevStep} className="p-2 hover:bg-white/5 rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="font-bold">Bước 1: Nhập nội dung</h2>
            </div>
            <div className="flex-1 overflow-hidden">
                <InputPanel isMobile />
            </div>
            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
                <button
                    onClick={nextStep}
                    disabled={slides.length === 0}
                    className="w-full py-4 bg-blue-600 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40"
                >
                    Tiếp tục
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );

    // Step 3: Image Upload & Logo
    const renderUpload = () => (
        <motion.div
            initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}
            className="flex flex-col h-full bg-[#050505]"
        >
            <div className="p-4 border-b border-white/5 flex items-center gap-4">
                <button onClick={prevStep} className="p-2 hover:bg-white/5 rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="font-bold">Bước 2: Tải ảnh & Logo</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <DesignSidebar isMobile mode="upload-only" />
            </div>
            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
                <button
                    onClick={() => {
                        nextStep();
                        // Automatically go to preview after a delay in Step 4
                        setTimeout(() => nextStep(), 2000);
                    }}
                    className="w-full py-4 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/40"
                >
                    Tạo Ngay
                    <CheckCircle2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );

    // Step 4: AI Processing (Fake Loader)
    const renderProcessing = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-8 text-center h-full bg-[#050505]"
        >
            <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-4">Đang tạo slide...</h2>
        </motion.div>
    );

    // Step 5: Preview & Final Polish
    const renderPreview = () => (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col h-full bg-[#050505]"
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <button onClick={() => setStep(2)} className="p-2 hover:bg-white/5 rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-sm">Preview Ảnh Cuộn</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`p-2 rounded-xl text-white disabled:opacity-50 transition-all ${processedImages ? 'bg-green-600 animate-bounce' : 'bg-purple-600'
                            }`}
                    >
                        {isExporting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : processedImages ? (
                            <div className="flex items-center gap-1 text-xs px-1">
                                <Download className="w-4 h-4" />
                                Lưu {processedImages.length}
                            </div>
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-2 bg-white/5 rounded-xl text-blue-400">
                        <Palette className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent overflow-hidden">
                <CanvasEditor slide={slides[currentSlideIndex]} />
            </div>

            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
                <Timeline />
            </div>

            {/* Bottom Sheet for Settings */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="fixed inset-0 bg-black z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 h-[80vh] bg-[#111] rounded-t-[32px] z-50 p-6 flex flex-col border-t border-white/10"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 flex-shrink-0" />
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Cài đặt thiết kế</h3>
                                <button onClick={() => setShowSettings(false)} className="text-sm text-blue-500 font-medium">Xong</button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                                <DesignSidebar isMobile />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );

    return (
        <div className="h-screen w-full overflow-hidden safe-area-inset">
            <AnimatePresence mode="wait">
                {currentStep === 1 && renderSplash()}
                {currentStep === 2 && renderInput()}
                {currentStep === 3 && renderUpload()}
                {currentStep === 4 && renderProcessing()}
                {currentStep === 5 && renderPreview()}
            </AnimatePresence>
        </div>
    );
};

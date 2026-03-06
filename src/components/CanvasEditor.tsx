'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useCarouselStore, Slide, AspectRatio, getCanvasSize } from '@/store/useCarouselStore';
import { motion, AnimatePresence } from 'framer-motion';

const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface CanvasEditorProps {
    slide: Slide | null;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ slide }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [scale, setScale] = useState(0.5);
    const [textRect, setTextRect] = useState<{ width: number, height: number, left: number, top: number, angle: number } | null>(null);
    const { settings, slides } = useCarouselStore();

    const slideIndex = slide ? slides.findIndex(s => s.id === slide.id) : 0;
    const isCover = slideIndex === 0;
    const currentBgImage = isCover ? settings.coverImage : settings.contentImage;

    // 1. Khởi tạo Fabric Canvas 1 lần duy nhất
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: 'transparent',
            preserveObjectStacking: true,
        });

        fabricRef.current = canvas;

        // Snap logic
        canvas.on('object:moving', (options) => {
            const obj = options.target;
            if (!obj) return;
            const cX = canvas.width! / 2;
            const cY = canvas.height! / 2;
            const snapThreshold = 10;
            if (Math.abs(obj.left! + obj.getScaledWidth() / 2 - cX) < snapThreshold) {
                obj.set({ left: cX - obj.getScaledWidth() / 2 });
            }
            if (Math.abs(obj.top! + obj.getScaledHeight() / 2 - cY) < snapThreshold) {
                obj.set({ top: cY - obj.getScaledHeight() / 2 });
            }
        });

        return () => {
            canvas.dispose();
            fabricRef.current = null;
        };
    }, []);

    // 2. Cập nhật Kích thước và Nội dung khi slide/settings thay đổi
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas || !slide) return;

        const { updateSettings } = useCarouselStore.getState();

        // Cập nhật Kích thước theo tỷ lệ mới
        const size = getCanvasSize(settings.aspectRatio);
        if (canvas.width !== size.width || canvas.height !== size.height) {
            canvas.setDimensions({ width: size.width, height: size.height });
        }

        canvas.clear();
        canvas.backgroundColor = 'transparent';

        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;

        const isCover = slideIndex === 0;
        const textToRender = isCover ? slide.title : slide.content;

        // Vị trí: Nếu là cover thì ưu tiên lấy từ store, nếu không thì mặc định giữa
        const initialPos = (isCover && settings.coverContentPosition)
            ? settings.coverContentPosition
            : { left: centerX, top: centerY };

        const contentText = new fabric.Textbox(textToRender, {
            width: canvas.width! - settings.padding * 2,
            fontSize: isCover ? (settings.coverTitleFontSize ?? 72) : settings.fontSizeContent,
            fontWeight: isCover ? (settings.coverTitleFontWeight ?? 'bold') : 'normal',
            fontFamily: isCover ? (settings.coverTitleFontFamily ?? settings.contentFontFamily) : settings.contentFontFamily,
            fill: settings.textColor,
            lineHeight: isCover ? (settings.coverTitleLineHeight ?? 1.2) : (settings.contentLineHeight ?? 1.5),
            textAlign: isCover ? (settings.coverTitleAlign ?? 'center') : (settings.contentTextAlign ?? 'center'),
            originX: 'center',
            originY: 'center',
            left: initialPos.left,
            top: initialPos.top,
            selectable: isCover, // Chỉ cho kéo ở trang bìa
            evented: isCover,    // Chỉ nhận sự kiện ở trang bìa
            hasControls: false,  // Không hiện nút resize
            hasBorders: false,   // Ẩn viền xanh dương khi click/kéo
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            splitByGrapheme: false,
            padding: 40,
        });

        const updateRect = () => {
            setTextRect({
                left: contentText.left || centerX,
                top: contentText.top || centerY,
                width: contentText.getScaledWidth(),
                height: contentText.getScaledHeight(),
                angle: contentText.angle || 0,
            });
        };

        // Snap logic mạnh mẽ cho Cover
        if (isCover) {
            contentText.on('moving', (e) => {
                const obj = contentText;
                const canvasWidth = canvas.width!;
                const canvasHeight = canvas.height!;
                const snapThreshold = 25; // Tăng độ nhạy snap

                const midX = canvasWidth / 2;
                const midY = canvasHeight / 2;

                // Snap X
                if (Math.abs(obj.left! - midX) < snapThreshold) {
                    obj.set({ left: midX });
                }
                // Snap Y
                if (Math.abs(obj.top! - midY) < snapThreshold) {
                    obj.set({ top: midY });
                }

                updateRect();
            });

            // Lưu vị trí khi kết thúc di chuyển
            contentText.on('modified', () => {
                updateSettings({
                    coverContentPosition: {
                        left: contentText.left!,
                        top: contentText.top!
                    }
                });
            });
        }

        contentText.on('scaling', updateRect);
        contentText.on('rotating', updateRect);
        contentText.on('modified', updateRect);
        contentText.on('changed', updateRect);
        canvas.on('text:changed', updateRect);

        canvas.add(contentText);
        canvas.renderAll();
        updateRect();

    }, [slide, settings.aspectRatio, settings.coverTitleFontSize, settings.fontSizeContent, settings.textColor, settings.padding, slides.length]);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current;
                const maxWidth = parent.clientWidth - 40;
                const maxHeight = parent.clientHeight - 40;

                const size = getCanvasSize(settings.aspectRatio);
                const scaleW = maxWidth / size.width;
                const scaleH = maxHeight / size.height;

                setScale(Math.min(scaleW, scaleH, 1));
            }
        };

        const timeoutId = setTimeout(updateScale, 50);
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [settings.aspectRatio]);

    const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);

    // Effect: Convert Background Image to DataURL for stable Safari capture
    useEffect(() => {
        if (!currentBgImage) {
            setBgDataUrl(null);
            return;
        }

        const convertToDataUrl = async () => {
            try {
                const response = await fetch(currentBgImage, { cache: 'no-cache' });
                const blob = await response.blob();
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error('DataURL conversion failed:', e);
                return currentBgImage; // Fallback to original
            }
        };

        convertToDataUrl().then(url => setBgDataUrl(url as string));
    }, [currentBgImage]);

    const currentSize = getCanvasSize(settings.aspectRatio);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative shadow-2xl rounded-lg"
                    style={{
                        width: currentSize.width * scale,
                        height: currentSize.height * scale,
                        flexShrink: 0
                    }}
                >
                    <div
                        id="canvas-export-area"
                        className="absolute top-0 left-0 bg-[#0b0b0b] rounded-lg shadow-inner origin-top-left flex items-center justify-center"
                        style={{
                            width: currentSize.width,
                            height: currentSize.height,
                            transform: `scale(${scale})`,
                        }}
                    >
                        {/* 1. DOM: Background Image thật sự đằng sau (Dùng DataURL cho Safari) */}
                        {bgDataUrl && (
                            <img
                                src={bgDataUrl}
                                alt="bg"
                                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
                            />
                        )}

                        {/* 2. DOM: Shadow & Glass Layers (Gộp Text vào trong để Safari capture đồng nhất) */}
                        {textRect && (
                            <>
                                {/* Shadow Layer */}
                                <div style={{
                                    position: 'absolute',
                                    left: textRect.left,
                                    top: textRect.top + (settings.footerSpacing ?? 40) / 2,
                                    transform: `translate(-50%, -50%) rotate(${textRect.angle}deg)`,
                                    width: textRect.width + 280,
                                    height: textRect.height + 280 + (settings.footerSpacing ?? 40),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                    zIndex: 9
                                }}>
                                    <div style={{
                                        width: textRect.width + 80,
                                        height: textRect.height + 80 + (settings.footerSpacing ?? 40),
                                        borderRadius: `${settings.borderRadius}px`,
                                        boxShadow: '0 30px 90px rgba(0,0,0,0.3)',
                                        backgroundColor: 'transparent'
                                    }} />
                                </div>

                                {/* Glass Layer (Hạt nhân của render) */}
                                <div style={{
                                    position: 'absolute',
                                    left: textRect.left,
                                    top: textRect.top + (settings.footerSpacing ?? 40) / 2,
                                    transform: `translate(-50%, -50%) rotate(${textRect.angle}deg)`,
                                    width: textRect.width + 80,
                                    height: textRect.height + 80 + (settings.footerSpacing ?? 40),
                                    borderRadius: `${settings.borderRadius}px`,
                                    overflow: 'hidden',
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}>
                                    {/* Stable Blur Layer (Dùng DataURL) */}
                                    {bgDataUrl && (
                                        <div style={{
                                            position: 'absolute',
                                            left: -(textRect.left - (textRect.width + 80) / 2),
                                            top: -(textRect.top + (settings.footerSpacing ?? 40) / 2 - (textRect.height + 80 + (settings.footerSpacing ?? 40)) / 2),
                                            width: currentSize.width,
                                            height: currentSize.height,
                                            filter: `blur(${settings.blur}px)`,
                                            transform: `rotate(${-textRect.angle}deg)`,
                                            zIndex: -1
                                        }}>
                                            <img
                                                src={bgDataUrl}
                                                alt="bg-blur"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Inner Color & Content Wrapper */}
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: hexToRgba(settings.backgroundColor, settings.opacity),
                                        borderRadius: 'inherit',
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {/* 4. DOM: Text Overlay (Đã đưa vào TRONG Glass để Safari chụp đồng nhất) */}
                                        <div style={{
                                            width: textRect.width,
                                            textAlign: isCover ? (settings.coverTitleAlign ?? 'center') : (settings.contentTextAlign ?? 'center'),
                                            color: settings.textColor,
                                            fontFamily: isCover ? (settings.coverTitleFontFamily ?? settings.contentFontFamily) : settings.contentFontFamily,
                                            fontSize: isCover ? (settings.coverTitleFontSize ?? 72) : settings.fontSizeContent,
                                            fontWeight: isCover ? (settings.coverTitleFontWeight ?? 'bold') : 'normal',
                                            lineHeight: isCover ? (settings.coverTitleLineHeight ?? 1.2) : (settings.contentLineHeight ?? 1.5),
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            padding: '0 40px',
                                            marginBottom: (settings.footerSpacing ?? 40), // Tạo khoảng trống cho branding
                                        }}>
                                            {slide ? (isCover ? slide.title : slide.content) : ''}
                                        </div>

                                        {/* Branding */}
                                        <div
                                            className={`absolute bottom-6 flex items-center gap-3 opacity-80 ${isCover ? 'left-1/2 -translate-x-1/2' : 'left-10'}`}
                                            style={{ color: settings.textColor }}
                                        >
                                            {settings.watermarkLogo && (
                                                <img src={settings.watermarkLogo} alt="logo" className="w-8 h-8 object-contain" style={{ filter: 'brightness(0) invert(1)', ...((settings.textColor === '#ffffff' || settings.textColor === 'white') ? {} : { filter: 'none' }) }} />
                                            )}
                                            {settings.watermark && (
                                                <span className="text-base font-semibold tracking-wide" style={{ color: settings.textColor }}>
                                                    {settings.watermark}
                                                </span>
                                            )}
                                        </div>

                                        {/* Page Number */}
                                        {slideIndex > 0 && slides.length > 0 && (
                                            <div className="absolute bottom-6 right-8 text-base font-medium font-mono opacity-60" style={{ color: settings.textColor }}>
                                                {slideIndex + 1}/{slides.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 3. FabricJS: Lớp Text trong suốt (data-export-ignore: quan trọng để Safari không capture thừa) */}
                        <div
                            className="absolute inset-0 z-20 print:hidden"
                            style={{ opacity: 1 }}
                            data-export-ignore="true"
                        >
                            <canvas ref={canvasRef} />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

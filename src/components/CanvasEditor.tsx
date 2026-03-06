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
    const { settings, slides, isExporting } = useCarouselStore();

    const slideIndex = slide ? slides.findIndex(s => s.id === slide.id) : 0;
    const isCover = slideIndex === 0;
    const currentBgImage = isCover ? settings.coverImage : settings.contentImage;

    const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);

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
        if (!canvas || !slide || !bgDataUrl) return;

        const { updateSettings } = useCarouselStore.getState();

        // Cập nhật Kích thước theo tỷ lệ mới
        const size = getCanvasSize(settings.aspectRatio);
        if (canvas.width !== size.width || canvas.height !== size.height) {
            canvas.setDimensions({ width: size.width, height: size.height });
        }

        canvas.clear();

        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;

        const isCover = slideIndex === 0;
        const textToRender = isCover ? slide.title : slide.content;

        // Vị trí: Nếu là cover thì ưu tiên lấy từ store, nếu không thì mặc định giữa
        const initialPos = (isCover && settings.coverContentPosition)
            ? settings.coverContentPosition
            : { left: centerX, top: centerY };

        // 1. Fabric: Background Image thật sự (Dùng DataURL cho Safari)
        fabric.Image.fromURL(bgDataUrl, { crossOrigin: 'anonymous' }).then((bgImg) => {
            bgImg.set({
                selectable: false,
                evented: false,
                originX: 'left',
                originY: 'top',
                left: 0,
                top: 0
            });
            // Tỷ lệ ảnh phủ kín canvas
            const scaleX = canvas.width! / bgImg.width!;
            const scaleY = canvas.height! / bgImg.height!;
            const bgScale = Math.max(scaleX, scaleY);
            bgImg.scale(bgScale);
            // Căn giữa ảnh nền
            bgImg.set({
                left: (canvas.width! - bgImg.width! * bgScale) / 2,
                top: (canvas.height! - bgImg.height! * bgScale) / 2,
            });

            canvas.add(bgImg);
            canvas.sendObjectToBack(bgImg);

            // 2. Fabric: Text Layer (Textbox)
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
                selectable: isCover,
                evented: isCover,
                hasControls: false,
                hasBorders: false,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                splitByGrapheme: false,
                padding: 40,
            });

            // 3. Fabric: Shadow & Glass & Blur Layer
            const updateGlassEffect = async () => {
                // Xóa các object cũ của glass (trừ main background và text)
                canvas.getObjects().forEach(obj => {
                    if (obj !== bgImg && obj !== contentText) {
                        canvas.remove(obj);
                    }
                });

                const tW = contentText.getScaledWidth();
                const tH = contentText.getScaledHeight();
                const glassW = tW + 80;
                const glassH = tH + 80 + (settings.footerSpacing ?? 40);
                const gL = contentText.left!;
                const gT = contentText.top! + (settings.footerSpacing ?? 40) / 2;

                // A. Shadow Rect
                const shadowRect = new fabric.Rect({
                    left: gL,
                    top: gT,
                    width: glassW,
                    height: glassH,
                    rx: settings.borderRadius,
                    ry: settings.borderRadius,
                    fill: 'transparent',
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false,
                    shadow: new fabric.Shadow({
                        color: 'rgba(0,0,0,0.3)',
                        blur: 90,
                        offsetX: 0,
                        offsetY: 30
                    })
                });

                // B. Blur Image Layer
                const blurImg = await fabric.Image.fromURL(bgDataUrl, { crossOrigin: 'anonymous' });
                blurImg.set({
                    left: bgImg.left,
                    top: bgImg.top,
                    selectable: false,
                    evented: false,
                    originX: 'left',
                    originY: 'top'
                });
                blurImg.scale(bgScale);

                // Clip Path for Blur
                const clipRect = new fabric.Rect({
                    left: gL,
                    top: gT,
                    width: glassW,
                    height: glassH,
                    rx: settings.borderRadius,
                    ry: settings.borderRadius,
                    originX: 'center',
                    originY: 'center',
                    absolutePositioned: true
                });
                blurImg.clipPath = clipRect;

                if (settings.blur > 0) {
                    const blurFilter = new fabric.filters.Blur({ blur: settings.blur / 20 }); // Fabric blur scale khác DOM
                    blurImg.filters.push(blurFilter);
                    blurImg.applyFilters();
                }

                // C. Glass Tint Rect
                const glassTint = new fabric.Rect({
                    left: gL,
                    top: gT,
                    width: glassW,
                    height: glassH,
                    rx: settings.borderRadius,
                    ry: settings.borderRadius,
                    fill: hexToRgba(settings.backgroundColor, settings.opacity),
                    stroke: 'rgba(255,255,255,0.2)',
                    strokeWidth: 1,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    evented: false
                });

                // D. Branding & Page Number (Tiếng trong Fabric)
                // Watermark Logo
                if (settings.watermarkLogo) {
                    const logoImg = await fabric.Image.fromURL(settings.watermarkLogo);
                    const logoScale = 32 / logoImg.height!;
                    logoImg.set({
                        scaleX: logoScale,
                        scaleY: logoScale,
                        originX: isCover ? 'center' : 'left',
                        originY: 'bottom',
                        left: isCover ? gL : gL - glassW / 2 + 40,
                        top: gT + glassH / 2 - 24,
                        selectable: false,
                        evented: false
                    });
                    // Invert filter if text is white (để logo trắng)
                    if (settings.textColor === '#ffffff' || settings.textColor === 'white') {
                        logoImg.filters.push(new fabric.filters.Invert());
                        logoImg.applyFilters();
                    }
                    canvas.add(logoImg);
                }

                // Watermark Text
                if (settings.watermark) {
                    const watermarkText = new fabric.Text(settings.watermark, {
                        fontSize: 16,
                        fontFamily: settings.contentFontFamily,
                        fontWeight: '600',
                        fill: settings.textColor,
                        opacity: 0.8,
                        originX: isCover ? 'center' : 'left',
                        originY: 'bottom',
                        left: isCover ? gL : gL - glassW / 2 + (settings.watermarkLogo ? 85 : 40),
                        top: gT + glassH / 2 - 24,
                        selectable: false,
                        evented: false
                    });
                    canvas.add(watermarkText);
                }

                // Page Number
                if (slideIndex > 0 && slides.length > 0) {
                    const pageText = new fabric.Text(`${slideIndex + 1}/${slides.length}`, {
                        fontSize: 16,
                        fontFamily: 'monospace',
                        fontWeight: '500',
                        fill: settings.textColor,
                        opacity: 0.6,
                        originX: 'right',
                        originY: 'bottom',
                        left: gL + glassW / 2 - 32,
                        top: gT + glassH / 2 - 24,
                        selectable: false,
                        evented: false
                    });
                    canvas.add(pageText);
                }

                // Thêm các lớp vào canvas theo thứ tự z-index
                canvas.add(shadowRect);
                canvas.add(blurImg);
                canvas.add(glassTint);

                // Đẩy text lên trên cùng
                canvas.bringObjectToFront(contentText);
                canvas.renderAll();
            };

            // Event listener cho việc di chuyển text (chỉ ở trang bìa)
            if (isCover) {
                contentText.on('moving', () => {
                    updateGlassEffect();
                    // Snap logic (giữ nguyên)
                    const midX = canvas.width! / 2;
                    const midY = canvas.height! / 2;
                    const snapThreshold = 25;
                    if (Math.abs(contentText.left! - midX) < snapThreshold) contentText.set({ left: midX });
                    if (Math.abs(contentText.top! - midY) < snapThreshold) contentText.set({ top: midY });
                });

                contentText.on('modified', () => {
                    updateSettings({
                        coverContentPosition: {
                            left: contentText.left!,
                            top: contentText.top!
                        }
                    });
                });
            }

            canvas.add(contentText);
            updateGlassEffect();
        });

    }, [slide, settings.aspectRatio, settings.coverTitleFontSize, settings.fontSizeContent, settings.textColor, settings.padding, slides.length, bgDataUrl, settings.blur, settings.backgroundColor, settings.opacity, settings.borderRadius, settings.watermark, settings.watermarkLogo, settings.footerSpacing]);

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
                    key={slide?.id || 'none'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative shadow-2xl rounded-lg overflow-hidden"
                    style={{
                        width: currentSize.width * scale,
                        height: currentSize.height * scale,
                        flexShrink: 0
                    }}
                >
                    <div
                        id="canvas-export-area"
                        className="absolute top-0 left-0 bg-[#0b0b0b] rounded-lg shadow-inner origin-top-left"
                        style={{
                            width: currentSize.width,
                            height: currentSize.height,
                            transform: `scale(${scale})`,
                        }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

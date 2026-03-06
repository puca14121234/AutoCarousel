'use client';

import React, { useState, useEffect } from 'react';
import { useCarouselStore, AspectRatio } from '@/store/useCarouselStore';

interface DesignSidebarProps {
    isMobile?: boolean;
    mode?: 'full' | 'upload-only';
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({ isMobile, mode = 'full' }) => {
    const { settings, updateSettings } = useCarouselStore();
    const ratios: AspectRatio[] = ['1:1', '4:5', '9:16', '3:4'];

    const [textColor, setTextColor] = useState(settings.textColor);
    const [bgColor, setBgColor] = useState(settings.backgroundColor);

    useEffect(() => { setTextColor(settings.textColor); }, [settings.textColor]);
    useEffect(() => { setBgColor(settings.backgroundColor); }, [settings.backgroundColor]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (textColor !== settings.textColor) updateSettings({ textColor });
        }, 150);
        return () => clearTimeout(t);
    }, [textColor]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (bgColor !== settings.backgroundColor) updateSettings({ backgroundColor: bgColor });
        }, 150);
        return () => clearTimeout(t);
    }, [bgColor]);

    return (
        <div className={isMobile ? "w-full flex-1 flex flex-col gap-8" : "w-80 h-full bg-black/40 backdrop-blur-md border-l border-white/10 p-6 flex flex-col gap-8 overflow-y-auto"}>
            {/* 1. Mô hình Slide */}
            {(mode === 'full') && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">1. Mô hình Slide</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {ratios.map((r) => (
                            <button
                                key={r}
                                onClick={() => updateSettings({ aspectRatio: r })}
                                className={`py-2 px-3 rounded-md text-sm transition-all ${settings.aspectRatio === r
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Upload ảnh nền */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">2. Ảnh nền (Background)</h3>
                <div className="flex flex-col gap-4">
                    {/* Cover Background */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Ảnh trang bìa (Mở đầu)</label>
                        {!!settings.coverImage && (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 mb-2 group shadow-inner bg-black/20">
                                <img
                                    src={settings.coverImage ?? undefined}
                                    className="w-full h-full object-cover"
                                    alt="Cover preview"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        updateSettings({ coverImage: null });
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => updateSettings({ coverImage: null })} className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        <input
                            type="file" id="bg-cover-upload" accept="image/*" className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        updateSettings({ coverImage: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="bg-cover-upload" className="flex items-center justify-center py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 cursor-pointer transition-all">
                            {settings.coverImage ? 'Thay ảnh Bìa' : 'Tải ảnh Bìa'}
                        </label>
                    </div>

                    {/* Content Background */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Ảnh trang nội dung</label>
                        {!!settings.contentImage && (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 mb-2 group shadow-inner bg-black/20">
                                <img
                                    src={settings.contentImage ?? undefined}
                                    className="w-full h-full object-cover"
                                    alt="Content preview"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        updateSettings({ contentImage: null });
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => updateSettings({ contentImage: null })} className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        <input
                            type="file" id="bg-content-upload" accept="image/*" className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        updateSettings({ contentImage: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="bg-content-upload" className="flex items-center justify-center py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-400 cursor-pointer transition-all">
                            {settings.contentImage ? 'Thay ảnh Nội dung' : 'Tải ảnh Nội dung'}
                        </label>
                    </div>
                </div>
            </div>

            {/* 3. Cài đặt text tiêu đề */}
            {(mode === 'full') && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">3. Cài đặt Tiêu đề Bìa</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Phông chữ Tiêu đề</label>
                            <select
                                value={settings.coverTitleFontFamily ?? 'Inter, sans-serif'}
                                onChange={(e) => updateSettings({ coverTitleFontFamily: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="'SF Pro Display', sans-serif" className="bg-gray-900">SF Pro Display</option>
                                <option value="Inter, sans-serif" className="bg-gray-900">Inter</option>
                                <option value="'Roboto', sans-serif" className="bg-gray-900">Roboto</option>
                                <option value="'Playfair Display', serif" className="bg-gray-900">Playfair Display</option>
                                <option value="'Montserrat', sans-serif" className="bg-gray-900">Montserrat</option>
                                <option value="'Lexend', sans-serif" className="bg-gray-900">Lexend</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Cỡ chữ</label>
                                <span className="text-xs text-gray-400">{(settings.coverTitleFontSize ?? 72)}px</span>
                            </div>
                            <input
                                type="range" min="40" max="150"
                                value={settings.coverTitleFontSize ?? 72}
                                onChange={(e) => updateSettings({ coverTitleFontSize: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Căn lề</label>
                            <div className="flex rounded bg-white/5 p-1 border border-white/10">
                                {(['left', 'center', 'right'] as const).map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateSettings({ coverTitleAlign: align })}
                                        className={`flex-1 py-1 text-xs capitalize rounded transition-colors ${(settings.coverTitleAlign ?? 'center') === align ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Khoảng cách dòng</label>
                                <span className="text-xs text-gray-400">{settings.coverTitleLineHeight ?? 1.2}</span>
                            </div>
                            <input
                                type="range" min="0.8" max="2" step="0.1"
                                value={settings.coverTitleLineHeight ?? 1.2}
                                onChange={(e) => updateSettings({ coverTitleLineHeight: parseFloat(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Cài đặt text nội dung */}
            {(mode === 'full') && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">4. Cài đặt Nội dung</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Phông chữ Nội dung</label>
                            <select
                                value={settings.contentFontFamily ?? 'Inter, sans-serif'}
                                onChange={(e) => updateSettings({ contentFontFamily: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="'SF Pro Display', sans-serif" className="bg-gray-900">SF Pro Display</option>
                                <option value="Inter, sans-serif" className="bg-gray-900">Inter</option>
                                <option value="'Roboto', sans-serif" className="bg-gray-900">Roboto</option>
                                <option value="'Playfair Display', serif" className="bg-gray-900">Playfair Display</option>
                                <option value="'Montserrat', sans-serif" className="bg-gray-900">Montserrat</option>
                                <option value="'Lexend', sans-serif" className="bg-gray-900">Lexend</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Cỡ chữ nội dung</label>
                                <span className="text-xs text-gray-400">{settings.fontSizeContent}px</span>
                            </div>
                            <input
                                type="range" min="20" max="100"
                                value={settings.fontSizeContent}
                                onChange={(e) => updateSettings({ fontSizeContent: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Căn lề</label>
                            <div className="flex rounded bg-white/5 p-1 border border-white/10">
                                {(['left', 'center', 'right'] as const).map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateSettings({ contentTextAlign: align })}
                                        className={`flex-1 py-1 text-xs capitalize rounded transition-colors ${(settings.contentTextAlign ?? 'center') === align ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Khoảng cách dòng</label>
                                <span className="text-xs text-gray-400">{settings.contentLineHeight ?? 1.5}</span>
                            </div>
                            <input
                                type="range" min="1" max="2.5" step="0.1"
                                value={settings.contentLineHeight ?? 1.5}
                                onChange={(e) => updateSettings({ contentLineHeight: parseFloat(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Hiệu ứng Glassmorphism */}
            {(mode === 'full') && (
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">5. Hiệu ứng Glassmorphism</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Màu chữ (Dùng chung)</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-10 h-10 bg-transparent rounded cursor-pointer border-none"
                                />
                                <div className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-400">
                                    {textColor}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500">Màu nền Glass</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={bgColor}
                                    onChange={(e) => setBgColor(e.target.value)}
                                    className="w-10 h-10 bg-transparent rounded cursor-pointer border-none"
                                />
                                <div className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-400">
                                    {bgColor}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Khoảng cách lề khung (Padding)</label>
                                <span className="text-xs text-gray-400">{settings.padding}px</span>
                            </div>
                            <input
                                type="range" min="40" max="200" step="10"
                                value={settings.padding}
                                onChange={(e) => updateSettings({ padding: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Độ nhòe (Blur)</label>
                                <span className="text-xs text-gray-400">{settings.blur}px</span>
                            </div>
                            <input
                                type="range" min="0" max="40"
                                value={settings.blur}
                                onChange={(e) => updateSettings({ blur: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Độ trong suốt (Opacity)</label>
                                <span className="text-xs text-gray-400">{settings.opacity}</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.1"
                                value={settings.opacity}
                                onChange={(e) => updateSettings({ opacity: parseFloat(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Bo góc (Radius)</label>
                                <span className="text-xs text-gray-400">{settings.borderRadius}px</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={settings.borderRadius}
                                onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500">Khoảng cách Branding (Footer Spacing)</label>
                                <span className="text-xs text-gray-400">{(settings.footerSpacing ?? 40)}px</span>
                            </div>
                            <input
                                type="range" min="20" max="100" step="5"
                                value={settings.footerSpacing ?? 40}
                                onChange={(e) => updateSettings({ footerSpacing: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Logo / Bản quyền */}
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">6. Logo / Bản quyền</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Logo thương hiệu</label>
                        {!!settings.watermarkLogo && (
                            <div className="relative w-16 h-16 rounded overflow-hidden border border-white/10 mb-2 bg-white/5 flex items-center justify-center p-2 group shadow-inner">
                                <img
                                    src={settings.watermarkLogo ?? undefined}
                                    className="max-w-full max-h-full object-contain"
                                    alt="Logo preview"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        updateSettings({ watermarkLogo: null });
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => updateSettings({ watermarkLogo: null })} className="p-1 bg-red-600 rounded-full text-white shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        <input
                            type="file" id="logo-upload" accept="image/*" className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        updateSettings({ watermarkLogo: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="logo-upload" className="flex items-center justify-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 cursor-pointer transition-all">
                            Tải Logo lên
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Văn bản đóng dấu góc dưới</label>
                        <input
                            type="text"
                            placeholder="@ Tên thương hiệu..."
                            value={settings.watermark}
                            onChange={(e) => updateSettings({ watermark: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div >
    );
};

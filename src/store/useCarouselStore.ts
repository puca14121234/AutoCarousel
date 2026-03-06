import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Slide {
    id: string;
    title: string;
    content: string;
}

export type AspectRatio = '1:1' | '4:5' | '9:16' | '3:4';

/**
 * Lấy kích thước chuẩn của canvas theo tỷ lệ
 */
export const getCanvasSize = (ratio: AspectRatio) => {
    switch (ratio) {
        case '4:5': return { width: 1080, height: 1350 };
        case '9:16': return { width: 1080, height: 1920 };
        case '3:4': return { width: 1080, height: 1440 };
        case '1:1':
        default: return { width: 1080, height: 1080 };
    }
};

export interface DesignSettings {
    aspectRatio: AspectRatio;
    fontSizeTitle: number;
    backgroundColor: string;
    coverImage: string | null;
    contentImage: string | null;
    textColor: string;

    // Content Typography
    fontSizeContent: number;
    contentFontFamily: string;
    contentTextAlign: 'left' | 'center' | 'right';
    contentLineHeight: number;

    // Cover Typography
    coverTitleFontSize: number;
    coverTitleFontWeight: string;
    coverTitleFontFamily: string;
    coverTitleAlign: 'left' | 'center' | 'right';
    coverTitleLineHeight: number;

    padding: number;
    borderRadius: number;
    blur: number;
    opacity: number;
    watermark: string;
    watermarkLogo: string | null;
    footerSpacing: number;
}

interface CarouselState {
    rawText: string;
    slides: Slide[];
    currentSlideIndex: number;
    settings: DesignSettings;
    currentStep: number;

    // Actions
    setRawText: (text: string) => void;
    setSlides: (slides: Slide[]) => void;
    setCurrentSlideIndex: (index: number) => void;
    updateSettings: (settings: Partial<DesignSettings>) => void;
    applyPreset: (presetName: string) => void;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export const presets: Record<string, Partial<DesignSettings>> = {
    'Tối giản': {
        backgroundColor: '#000000',
        textColor: '#ffffff',
        fontSizeContent: 36,
        blur: 0,
        opacity: 1,
        borderRadius: 0,
    },
    'Glass Modern': {
        backgroundColor: '#1e40af',
        textColor: '#ffffff',
        fontSizeContent: 32,
        blur: 20,
        opacity: 0.6,
        borderRadius: 24,
    },
    'Hồng Pastel': {
        backgroundColor: '#fce7f3',
        textColor: '#831843',
        fontSizeContent: 34,
        blur: 5,
        opacity: 0.9,
        borderRadius: 30,
    },
    'Cyberpunk': {
        backgroundColor: '#000000',
        textColor: '#00ff41',
        fontSizeContent: 40,
        blur: 0,
        opacity: 1,
        borderRadius: 4,
    }
};

const defaultSettings: DesignSettings = {
    aspectRatio: '3:4',
    fontSizeTitle: 48,
    backgroundColor: '#ffffff',
    coverImage: null,
    contentImage: null,
    textColor: '#1f1f1f',

    // Content Typography
    fontSizeContent: 32,
    contentFontFamily: "'SF Pro Display', sans-serif",
    contentTextAlign: 'left',
    contentLineHeight: 1.5,

    // Cover Typography
    coverTitleFontSize: 72,
    coverTitleFontWeight: 'bold',
    coverTitleFontFamily: "'SF Pro Display', sans-serif",
    coverTitleAlign: 'center',
    coverTitleLineHeight: 1.2,

    padding: 140,
    borderRadius: 50,
    blur: 20,
    opacity: 0.6,
    watermark: 'Mẹ Zin Review',
    watermarkLogo: null,
    footerSpacing: 60,
};

export const useCarouselStore = create<CarouselState>()(
    persist(
        (set) => ({
            rawText: '',
            slides: [],
            currentSlideIndex: 0,
            currentStep: 1,
            settings: defaultSettings,

            setRawText: (text) => set({ rawText: text }),
            setSlides: (slides) => set({ slides }),
            setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
            updateSettings: (newSettings) =>
                set((state) => ({ settings: { ...state.settings, ...newSettings } })),
            applyPreset: (name) =>
                set((state) => ({ settings: { ...state.settings, ...presets[name] } })),
            setStep: (step) => set({ currentStep: step }),
            nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
            prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
        }),
        {
            name: 'autocarousel-settings', // key lưu vào localStorage
            merge: (persistedState, currentState) => {
                const persisted = persistedState as any;
                return {
                    ...currentState,
                    ...(persisted || {}),
                    settings: {
                        ...currentState.settings,
                        ...(persisted?.settings || {}),
                    }
                };
            },
            partialize: (state) => ({
                ...state,
                rawText: '', // Không lưu nội dung nhập để clear khi load lại trang
                slides: [],
                currentSlideIndex: 0,
                currentStep: 1,
                settings: {
                    ...state.settings,
                    coverImage: null,
                    contentImage: null,
                    // Giữ lại watermarkLogo trong persist
                }
            })
        }
    )
);

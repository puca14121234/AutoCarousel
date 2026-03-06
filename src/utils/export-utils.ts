import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Render một DOM element thành ảnh PNG với độ phân giải cao
 */
export const captureElement = async (
    element: HTMLElement,
    pixelRatio: number = 2,
    width?: number,
    height?: number
): Promise<string> => {
    return await toPng(element, {
        pixelRatio: pixelRatio,
        cacheBust: true,
        width: width,
        height: height,
        filter: (node: any) => {
            // Loại bỏ các node có attribute data-export-ignore
            if (node.hasAttribute && node.hasAttribute('data-export-ignore')) {
                return false;
            }
            return true;
        },
        style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            margin: '0',
            padding: '0',
        },
        backgroundColor: 'transparent'
    });
};

/**
 * Tải một ảnh đơn lẻ
 */
export const downloadImage = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
};

/**
 * Tải hàng loạt ảnh vào một thư mục cụ thể (Sử dụng File System Access API)
 */
export const bulkDownloadToDirectory = async (images: { dataUrl: string, name: string }[]) => {
    try {
        // @ts-ignore
        if (typeof window.showDirectoryPicker !== 'function') {
            return false;
        }

        // @ts-ignore - File System Access API is still experimental in some types
        const directoryHandle = await window.showDirectoryPicker();

        for (const img of images) {
            // @ts-ignore
            const fileHandle = await directoryHandle.getFileHandle(img.name, { create: true });
            // @ts-ignore
            const writable = await fileHandle.createWritable();

            // Convert DataURL to Blob
            const response = await fetch(img.dataUrl);
            const blob = await response.blob();

            await writable.write(blob);
            await writable.close();
        }
        return true;
    } catch (err) {
        console.error('File System Access API failed or cancelled:', err);
        return false;
    }
};

/**
 * Chia sẻ/Lưu ảnh vào Library thông qua Web Share API (Dành cho iOS/Android)
 */
export const shareImages = async (imageData: { dataUrl: string, name: string }[]): Promise<boolean> => {
    if (!navigator.share || !navigator.canShare) {
        return false;
    }

    try {
        const files: File[] = [];
        for (const img of imageData) {
            const res = await fetch(img.dataUrl);
            const blob = await res.blob();
            files.push(new File([blob], img.name, { type: 'image/png' }));
        }

        if (navigator.canShare({ files })) {
            await navigator.share({
                files: files,
                title: 'Auto Carousel Slides',
                text: 'Bộ ảnh cuộn được tạo từ Auto Carousel'
            });
            return true;
        }
        return false;
    } catch (err) {
        console.error('Web Share API failed:', err);
        return false;
    }
};

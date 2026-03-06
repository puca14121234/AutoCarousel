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
        style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            borderRadius: '0',
            left: '0',
            top: '0'
        }
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
            const fileHandle = await directoryHandle.getFileHandle(img.name, { create: true });
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


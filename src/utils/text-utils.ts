/**
 * Tiện ích đo lường và tách chữ cho AutoCarouselV3
 */

export interface MeasurementOptions {
    width: number;
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    padding: number;
}

/**
 * Đo chiều cao của văn bản trong một khung có chiều rộng cố định (DOM ẩn)
 */
export const measureTextHeight = (text: string, options: MeasurementOptions): number => {
    if (typeof document === 'undefined') return 0;

    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = `${options.width - options.padding * 2}px`;
    div.style.fontSize = `${options.fontSize}px`;
    div.style.fontFamily = options.fontFamily;
    div.style.lineHeight = `${options.lineHeight}`;
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.innerText = text;

    document.body.appendChild(div);
    const height = div.offsetHeight;
    document.body.removeChild(div);

    return height + options.padding * 2;
};

/**
 * Thuật toán tách chữ thành các Slide dựa trên chiều cao tối đa cho phép
 */
export const splitTextIntoSlides = (
    text: string,
    maxHeight: number,
    options: MeasurementOptions
): string[] => {
    const slides: string[] = [];
    const paragraphs = text.split(/\n\n+/);

    let currentContent = '';

    for (const paragraph of paragraphs) {
        const testContent = currentContent ? `${currentContent}\n\n${paragraph}` : paragraph;
        const height = measureTextHeight(testContent, options);

        if (height <= maxHeight) {
            currentContent = testContent;
        } else {
            // Paragraph quá dài, thử tách theo câu
            if (currentContent) {
                slides.push(currentContent);
                currentContent = '';
            }

            // Tách câu: Match các chuỗi kết thúc bằng dấu câu HOẶC là phần còn lại của đoạn văn
            const sentences = paragraph.match(/[^\.!\?]+[\.!\?]* ?/g) || [paragraph];
            for (const sentence of sentences) {
                const testSentence = currentContent ? `${currentContent} ${sentence}` : sentence;
                const sHeight = measureTextHeight(testSentence, options);

                if (sHeight <= maxHeight) {
                    currentContent = testSentence;
                } else {
                    // Câu vẫn quá dài, tách theo từ
                    if (currentContent) {
                        slides.push(currentContent);
                        currentContent = '';
                    }

                    const words = sentence.split(' ');
                    for (const word of words) {
                        const testWord = currentContent ? `${currentContent} ${word}` : word;
                        const wHeight = measureTextHeight(testWord, options);

                        if (wHeight <= maxHeight) {
                            currentContent = testWord;
                        } else {
                            slides.push(currentContent);
                            currentContent = word;
                        }
                    }
                }
            }
        }
    }

    if (currentContent) {
        slides.push(currentContent);
    }

    return orphanCleanup(slides);
};

/**
 * Cơ chế "Cứu mồ côi" - Tránh slide cuối quá ngắn
 */
const orphanCleanup = (slides: string[]): string[] => {
    if (slides.length < 2) return slides;

    const lastSlide = slides[slides.length - 1];
    const lastWords = lastSlide.split(' ').length;

    if (lastWords < 10) {
        const prevSlide = slides[slides.length - 2];
        const prevWords = prevSlide.split(' ');

        // Mượn khoảng 1/3 số từ từ slide trước
        const moveCount = Math.floor(prevWords.length / 3);
        const movedText = prevWords.slice(-moveCount).join(' ');
        const newPrevSlide = prevWords.slice(0, -moveCount).join(' ');

        slides[slides.length - 2] = newPrevSlide;
        slides[slides.length - 1] = `${movedText} ${lastSlide}`;
    }

    return slides;
};

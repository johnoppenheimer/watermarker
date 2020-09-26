import { degrees, PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

export type WatermarkOptions = {
    font: StandardFonts;
    fontSize: number;
};

const defaultOptions: WatermarkOptions = {
    font: StandardFonts.Helvetica,
    fontSize: 50,
};

/**
 *
 * @param text Text to put as watermark
 * @param file PDF File to add the watermark to
 */
export async function addWatermarkToFile(
    text: string,
    file: File,
    options?: Partial<WatermarkOptions>,
): Promise<PDFDocument> {
    const optionsWithDefault: WatermarkOptions = {
        ...defaultOptions,
        ...options,
    };

    const buffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(buffer);
    const font = await pdf.embedFont(optionsWithDefault.font);

    const pages = pdf.getPages();

    for (const page of pages) {
        addWatermarkToPage(text, page, {
            ...optionsWithDefault,
            font,
        });
    }

    return pdf;
}

type PageWatermarkOptions = Omit<WatermarkOptions, 'font'> & { font: PDFFont };

export async function addWatermarkToPage(text: string, page: PDFPage, options: PageWatermarkOptions) {
    const { width, height } = page.getSize();

    const { font, fontSize } = options;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    const angle = -45;
    const deg = angle * (Math.PI / 180);
    const newWidth = textWidth * Math.abs(Math.cos(deg)) + textHeight * Math.abs(Math.sin(deg));
    const newHeight = textHeight * Math.abs(Math.cos(deg)) + textWidth * Math.abs(Math.sin(deg));

    const x = width / 2 - newWidth / 2;
    const y = height / 2 + newHeight / 2;

    page.drawText(text, {
        x,
        y,
        size: fontSize,
        font: options.font,
        color: rgb(0, 0, 0),
        rotate: degrees(angle),
        opacity: 0.2,
    });
}

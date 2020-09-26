import { degrees, PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

/**
 *
 * @param text Text to put as watermark
 * @param file PDF File to add the watermark to
 */
export async function addWatermarkToFile(text: string, file: File): Promise<PDFDocument> {
    const buffer = await file.arrayBuffer();

    const pdf = await PDFDocument.load(buffer);
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const textWidth = font.widthOfTextAtSize(text, 50);
    const textHeight = font.heightAtSize(50);

    const pages = pdf.getPages();

    for (const page of pages) {
        addWatermarkToPage(text, page, {
            font,
            textWidth,
            textHeight,
        });
    }

    return pdf;
}

type WatermarkOptions = {
    font: PDFFont;
    textWidth: number;
    textHeight: number;
};

export async function addWatermarkToPage(text: string, page: PDFPage, options: WatermarkOptions) {
    const { width, height } = page.getSize();

    const angle = -45;
    const deg = angle * (Math.PI / 180);
    const newWidth = options.textWidth * Math.abs(Math.cos(deg)) + options.textHeight * Math.abs(Math.sin(deg));
    const newHeight = options.textHeight * Math.abs(Math.cos(deg)) + options.textWidth * Math.abs(Math.sin(deg));

    const x = width / 2 - newWidth / 2;
    const y = height / 2 + newHeight / 2;

    page.drawText(text, {
        x,
        y,
        size: 50,
        font: options.font,
        color: rgb(0, 0, 0),
        rotate: degrees(angle),
        opacity: 0.2,
    });
}

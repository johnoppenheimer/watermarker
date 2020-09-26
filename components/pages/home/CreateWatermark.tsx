import type { FileWithPath } from 'react-dropzone';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import classnames from 'classnames';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { PDFDocument, StandardFonts, StandardFontValues } from 'pdf-lib';
import { addWatermarkToFile, WatermarkOptions } from '../../../utils/pdf';

function renderFiles(files: FileWithPath[]) {
    return files.map((file) => (
        <li key={file.name} className="text-md">
            {file.path}
        </li>
    ));
}

async function addWatermarkAndGetURI(text: string, file: File, options?: Partial<WatermarkOptions>) {
    const pdf = await addWatermarkToFile(text, file, options);
    return await pdf.saveAsBase64({ dataUri: true });
}
const debounceAddWatermarkAndGetURI = AwesomeDebouncePromise(addWatermarkAndGetURI, 500);

export type CreateWatermarkProps = {
    files: FileWithPath[];
    onReset: () => void;
};

export default function CreateWatermark({ files, onReset }: CreateWatermarkProps) {
    const [watermarkText, setWatermarkText] = useState<string>('');
    const [watermarkFont, setWatermarkFont] = useState(StandardFonts.Helvetica);
    const [watermarkFontSize, setWatermarkFontSize] = useState(50);
    const [loading, setLoading] = useState(false);
    const [pdfPreviewFile, setPDFPreviewFile] = useState<File | null>(null);
    const pdfPreviewRef = useRef<HTMLEmbedElement>();

    const displayPreview = (dataURI: string) => {
        pdfPreviewRef.current.src = dataURI;
    };

    useEffect(() => {
        const loadPreview = async () => {
            if (files.length > 0) {
                const firstFile = files[0];
                setPDFPreviewFile(firstFile);
                const fileBuffer = await firstFile.arrayBuffer();
                const pdfFile = await PDFDocument.load(fileBuffer);
                const dataURI = await pdfFile.saveAsBase64({ dataUri: true });
                displayPreview(dataURI);
            }
        };

        loadPreview();
    }, [files]);

    useEffect(() => {
        const updatePreview = async () => {
            if (pdfPreviewFile != null) {
                if (watermarkText.length > 0) {
                    const dataURI = await debounceAddWatermarkAndGetURI(watermarkText, pdfPreviewFile, {
                        fontSize: watermarkFontSize,
                        font: watermarkFont,
                    });
                    displayPreview(dataURI);
                } else {
                    const buffer = await pdfPreviewFile.arrayBuffer();
                    const pdfFile = await PDFDocument.load(buffer);
                    const dataURI = await pdfFile.saveAsBase64({ dataUri: true });
                    displayPreview(dataURI);
                }
            }
        };

        updatePreview();
    }, [watermarkText, pdfPreviewFile, watermarkFontSize, watermarkFont]);

    const reset = () => {
        setWatermarkText('');
        onReset();
    };

    const onTextChange = (value: ChangeEvent<HTMLInputElement>) => {
        setWatermarkText(value.target.value);
    };

    const download = async () => {
        setLoading(true);
        const { addWatermarkToFile } = await import('../../../utils/pdf');
        const zip = new JSZip();

        for (const file of files) {
            const pdfWithWatermark = await addWatermarkToFile(watermarkText, file);
            const pdfBytes = await pdfWithWatermark.save();
            zip.file(file.path, pdfBytes);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        setLoading(false);
        saveAs(blob, 'pdfwatermarked.zip');
    };

    return (
        <div className="w-full h-full flex flex-row p-5">
            <div className="w-1/2">
                <div className="w-1/2">
                    <input
                        id="watermark-text"
                        type="text"
                        className={classnames('w-full shadow-md border border-grey-300 rounded p-2 text-md', {
                            'cursor-not-allowed': loading,
                        })}
                        value={watermarkText}
                        onChange={onTextChange}
                        placeholder="watermark"
                        disabled={loading}
                    />
                    <div className="mt-6">
                        <p className="mb-2">
                            <span className="text-gray-600">Font size:</span> {watermarkFontSize}
                        </p>
                        <input
                            id="watermark-font-size"
                            type="range"
                            min={10}
                            max={100}
                            step={1}
                            value={watermarkFontSize}
                            onChange={(event) => setWatermarkFontSize(parseInt(event.target.value))}
                        />
                    </div>
                    <div className="mt-6">
                        <p className="mb-2">
                            <span className="text-gray-600">Font family:</span>
                        </p>
                        <div className="inline-block relative w-full">
                            <select
                                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                value={watermarkFont}
                                onChange={(event) => {
                                    setWatermarkFont(event.target.value as StandardFonts);
                                }}
                            >
                                {StandardFontValues.filter(
                                    (fontName) =>
                                        fontName !== StandardFonts.Symbol && fontName !== StandardFonts.ZapfDingbats,
                                ).map((fontName) => (
                                    <option key={fontName} value={fontName}>
                                        {fontName}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg
                                    className="fill-current h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <ul className="font-mono my-8">{renderFiles(files)}</ul>
                <div>
                    <button
                        className={classnames(
                            'py-2 px-4 border border-red-600 rounded text-red-600 shadow-md transition-colors duration-300 mx-2 w-24 h-10',
                            { 'cursor-not-allowed': loading },
                            { 'hover:bg-red-600 hover:text-white': !loading },
                        )}
                        onClick={reset}
                        disabled={loading}
                    >
                        Reset
                    </button>
                    <button
                        className={classnames(
                            'py-2 px-4 text-white bg-gradient-to-t from-green-500 to-green-400 rounded shadow-md transition-shadow duration-300 mx-2 w-24 h-10 inline-flex justify-center',
                            { 'cursor-not-allowed': loading },
                            { 'hover:shadow-xl': !loading },
                        )}
                        onClick={download}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            'Generate'
                        )}
                    </button>
                </div>
            </div>
            <div className="w-1/2">
                <embed ref={pdfPreviewRef} id="pdf-preview" className="w-full h-full" type="application/pdf" />
            </div>
        </div>
    );
}

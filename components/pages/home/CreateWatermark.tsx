import type { FileWithPath } from 'react-dropzone';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import classnames from 'classnames';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { PDFDocument } from 'pdf-lib';

function renderFiles(files: FileWithPath[]) {
    return files.map((file) => (
        <li key={file.name} className="text-md">
            {file.path}
        </li>
    ));
}

export type CreateWatermarkProps = {
    files: FileWithPath[];
    onReset: () => void;
};

export default function CreateWatermark({ files, onReset }: CreateWatermarkProps) {
    const [watermarkText, setWatermarkText] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const pdfPreviewRef = useRef<HTMLObjectElement>();

    useEffect(() => {
        const loadPreview = async () => {
            if (files.length > 0) {
                const firstFile = files[0];
                const fileBuffer = await firstFile.arrayBuffer();
                const pdfFile = await PDFDocument.load(fileBuffer);
                const dataURI = await pdfFile.saveAsBase64({ dataUri: true });
                pdfPreviewRef.current.data = dataURI;
            }
        };

        loadPreview();
    }, [files]);

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
            zip.file(file.path, pdfWithWatermark);
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
                <object ref={pdfPreviewRef} id="pdf-preview" className="w-full h-full" />
            </div>
        </div>
    );
}

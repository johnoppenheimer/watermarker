import Head from 'next/head';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { ChangeEvent, useCallback, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import classnames from 'classnames';

function renderFiles(files: FileWithPath[]) {
    return files.map((file) => (
        <li key={file.name} className="text-md">
            {file.path}
        </li>
    ));
}

export default function Home() {
    const [watermarkText, setWatermarkText] = useState<string>('');
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((files: FileWithPath[]) => {
        setFiles(files.filter((file) => file.type.endsWith('pdf')));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: 'application/pdf',
    });

    const onTextChange = (value: ChangeEvent<HTMLInputElement>) => {
        setWatermarkText(value.target.value);
    };

    const resetFiles = () => {
        setFiles([]);
        setWatermarkText('');
    };

    const download = async () => {
        setLoading(true);
        const { addWatermarkToFile } = await import('../utils/pdf');
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
        <div className="container mx-auto h-screen flex flex-col">
            <Head>
                <title>Watermarker</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content="Watermarker is a tool to add a watermark in bulk to PDF files" />
                <meta property="og:title" content="Watermarker" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:description"
                    content="Watermarker is a tool to add a watermark in bulk to PDF files"
                />
                <meta property="og:url" content="https://watermarker.oppenheimer.vercel.app" />
            </Head>

            <main className="flex flex-1 flex-col justify-center items-center">
                {files.length <= 0 ? (
                    <div
                        className={classnames('w-full h-full flex flex-1 flex-col justify-center items-center', {
                            'bg-blue-300 border-dashed border-8': isDragActive,
                        })}
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <h3 className="text-4xl font-extrabold">Drop the files</h3>
                        ) : (
                            <div className="text-center">
                                <h1 className="text-5xl font-extrabold">Welcome to Watermarker!</h1>
                                <p className="text-lg">
                                    Add quickly a watermark on all of your files.
                                    <br />
                                    {"Just drag'n'drop any PDFs files here."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="w-1/3">
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
                                onClick={resetFiles}
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
                    </>
                )}
            </main>

            <footer className="h-20 flex justify-center items-center text-md font-light">
                Everything happen and stays in your browser
            </footer>
        </div>
    );
}

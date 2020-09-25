import Head from 'next/head';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { ChangeEvent, useCallback, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { addWatermarkToFile } from '../utils/pdf';

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
        const zip = new JSZip();

        for (const file of files) {
            const pdfWithWatermark = await addWatermarkToFile(watermarkText, file);
            zip.file(file.path, pdfWithWatermark);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
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
                        className={`w-full h-full flex flex-1 flex-col justify-center items-center ${
                            isDragActive ? 'bg-blue-300 border-dashed border-8' : ''
                        }`}
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
                                className="w-full shadow-md border border-grey-300 rounded p-2 text-md"
                                value={watermarkText}
                                onChange={onTextChange}
                                placeholder="watermark"
                            />
                        </div>
                        <ul className="font-mono my-8">{renderFiles(files)}</ul>
                        <div>
                            <button
                                className="py-2 px-4 border border-red-600 rounded text-red-600 hover:bg-red-600 hover:text-white shadow-md transition-colors duration-300 mx-2"
                                onClick={resetFiles}
                            >
                                Reset
                            </button>
                            <button
                                className="py-2 px-4 text-white bg-gradient-to-t from-green-500 to-green-400 rounded shadow-md hover:shadow-xl transition-shadow duration-300 mx-2"
                                onClick={download}
                            >
                                Generate
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

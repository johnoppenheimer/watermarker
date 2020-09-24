import Head from 'next/head';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { ChangeEvent, useCallback, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { addWatermarkToFile } from '../utils/pdf';

function renderFiles(files: FileWithPath[]) {
    return files.map((file) => <li key={file.name}>{file.path}</li>);
}

export default function Home() {
    const [watermarkText, setWatermarkText] = useState<string>('');
    const [files, setFiles] = useState<FileWithPath[]>([]);

    const onDrop = useCallback((files: FileWithPath[]) => {
        setFiles(files.filter((file) => file.type.endsWith('pdf')));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
        <div className="container">
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className="title">Welcome to Watermarker!</h1>

                <p className="description">Add quickly a watermark on all of your files</p>

                {files.length <= 0 ? (
                    <div className="drop-container" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <p>{isDragActive ? 'Drop the files here' : 'Drag files here for watermarking them'}</p>
                    </div>
                ) : (
                    <>
                        <input type="text" value={watermarkText} onChange={onTextChange} />
                        <ul>{renderFiles(files)}</ul>
                        <div>
                            <button onClick={resetFiles}>Reset</button>
                            <button onClick={download}>Generate</button>
                        </div>
                    </>
                )}
            </main>

            <footer>Everything happen in your browser</footer>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    padding: 0 0.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                main {
                    padding: 5rem 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                footer {
                    width: 100%;
                    height: 100px;
                    border-top: 1px solid #eaeaea;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .title a {
                    color: #0070f3;
                    text-decoration: none;
                }

                .title a:hover,
                .title a:focus,
                .title a:active {
                    text-decoration: underline;
                }

                .title {
                    margin: 0;
                    line-height: 1.15;
                    font-size: 4rem;
                }

                .title,
                .description {
                    text-align: center;
                }

                .description {
                    line-height: 1.5;
                    font-size: 1.5rem;
                }

                .drop-container {
                    height: 150px;
                    width: 300px;
                    background-color: grey;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>

            <style jsx global>{`
                html,
                body {
                    padding: 0;
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
                        Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
                }

                * {
                    box-sizing: border-box;
                }
            `}</style>
        </div>
    );
}

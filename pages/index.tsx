import Head from 'next/head';
import type { FileWithPath } from 'react-dropzone';
import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

import Dropzone from '../components/pages/home/Dropzone';
const CreateWatermark = dynamic(() => import('../components/pages/home/CreateWatermark'), { ssr: false });

export default function Home() {
    const [files, setFiles] = useState<FileWithPath[]>([]);

    const onDrop = useCallback((files: FileWithPath[]) => {
        setFiles(files.filter((file) => file.type.endsWith('pdf')));
    }, []);

    const resetFiles = () => {
        setFiles([]);
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
                    <Dropzone onDrop={onDrop} />
                ) : (
                    <CreateWatermark files={files} onReset={resetFiles} />
                )}
            </main>

            <footer className="h-20 flex justify-center items-center text-md font-light">
                Everything happen and stays in your browser
            </footer>
        </div>
    );
}

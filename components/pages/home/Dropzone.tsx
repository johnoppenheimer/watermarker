import { useDropzone, FileWithPath } from 'react-dropzone';
import classnames from 'classnames';

type DropzoneProps = {
    onDrop: (files: FileWithPath[]) => void;
};

export default function Dropzone({ onDrop }: DropzoneProps) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: 'application/pdf',
    });

    return (
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
    );
}

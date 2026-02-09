import React, { useState } from 'react'
import tus from 'tus-js-client'
import {console} from "next/dist/compiled/@edge-runtime/primitives"

const FileUpload = () => {
    const [file, setFile] = useState(null)
    const [uploadPercentage, setUploadPercentage] = useState(0)

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = () => {
        if (!file) return

        const upload = new tus.Upload(file, {
            endpoint: 'http://localhost:3000/api/upload',
            metadata: {
                filename: file.name,
                filetype: file.type,
            },
            onError: (error) => {
                console.error('Upload failed:', error)
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentage = (bytesUploaded / bytesTotal) * 100
                setUploadPercentage(percentage)
            },
            onSuccess: () => {
                console.log('Upload finished:', upload.url)
            },
        })

        upload.start()
    }

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {uploadPercentage > 0 && (
                <div>
                    <progress value={uploadPercentage} max="100" />
                    <span>{uploadPercentage.toFixed(2)}%</span>
                </div>
            )}
        </div>
    )
}

export default FileUpload

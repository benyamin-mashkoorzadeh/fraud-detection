"use client"

import {useEffect, useState} from "react"

const FileUploader = () => {
    const [uploading, setUploading] = useState(false) // وضعیت آپلود
    const [progress, setProgress] = useState(0) // پیشرفت آپلود
    const [uploadComplete, setUploadComplete] = useState(false) // آپلود تمام شده؟
    const [processing, setProcessing] = useState(false) // وضعیت پردازش
    const [processingProgress, setProcessingProgress] = useState(0) // پیشرفت پردازش
    const [fileName, setFileName] = useState(""); // state برای ذخیره نام فایل


    // بررسی پیشرفت پردازش
    const checkProgress = async (fileName) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/progress?fileName=${fileName}`)
            const data = await response.json()

            console.log('Progress Response:', data) // اضافه کردن این خط برای مشاهده داده‌های برگشتی

            // به‌روزرسانی وضعیت پردازش در UI
            setProcessingProgress(data.progress || 0)

            // زمانی که پردازش کامل شد
            if (data.progress === 100) {
                setProcessing(false) // متوقف کردن پردازش
            }
        } catch (error) {
            console.error("Failed to fetch progress:", error)
        }
    };

    // تایمر برای به‌روزرسانی پیشرفت
    useEffect(() => {
        if (processing) {
            const interval = setInterval(() => {
                checkProgress(fileName); // اطمینان حاصل کنید که fileName از state دریافت شود
            }, 1000) // هر ثانیه درخواست جدید
            return () => clearInterval(interval) // پاکسازی تایمر
        }
    }, [processing])  // اضافه کردن dependency برای پردازش

    // ارسال درخواست آپلود فایل
    const uploadFile = async (file) => {
        const chunkSize = 1 * 1024 * 1024 // 1MB
        const totalChunks = Math.ceil(file.size / chunkSize)
        let uploadedChunks = 0

        setUploading(true)
        setUploadComplete(false)
        setProcessing(false)

        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
            const start = chunkNumber * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)

            const formData = new FormData()
            formData.append("file", chunk)
            formData.append("chunkNumber", chunkNumber)
            formData.append("fileName", file.name)

            await fetch("http://127.0.0.1:8000/api/upload-chunk", {
                method: "POST",
                body: formData,
            })

            uploadedChunks++
            setProgress(Math.round((uploadedChunks / totalChunks) * 100))
        }

        // Merge chunks
        const mergeData = new FormData()
        mergeData.append("fileName", file.name)
        mergeData.append("totalChunks", totalChunks)

        const response = await fetch("http://127.0.0.1:8000/api/merge-chunks", {
            method: "POST",
            body: mergeData,
        })

        const data = await response.json()
        setUploading(false)
        setUploadComplete(true)

        if (response.ok) {
            // وقتی درخواست موفقیت‌آمیز بود
            setProcessing(true); // پردازش شروع شد
            checkProgress(file.name); // وضعیت پردازش را با فرستادن نام فایل چک کن
        } else {
            console.error("Failed to start processing.");
            setUploading(false);
        }
    }

    return (
        <div>
            <label
                className={`block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer ${
                    uploading ? "bg-gray-400 cursor-not-allowed" : ""
                }`}
            >
                {uploading ? "Uploading..." : "Select File to Upload"}
                <input
                    type="file"
                    onChange={(e) => uploadFile(e.target.files[0])}
                    disabled={uploading}
                    className="hidden"
                />
            </label>

            {/* نمایش پیشرفت آپلود */}
            {uploading && (
                <div className="mt-4">
                    <p>Uploading... {progress}%</p>
                    <div className="w-full bg-gray-200 rounded h-6 overflow-hidden mt-2">
                        <div
                            className="bg-blue-500 h-6"
                            style={{ width: `${progress}%`, transition: "width 0.3s" }}
                        ></div>
                    </div>
                </div>
            )}

            {/* پیام آپلود کامل */}
            {uploadComplete && (
                <p className="text-green-500 mt-4">Upload complete! Starting processing...</p>
            )}

            {/* نمایش پیشرفت پردازش */}
            {processing && (
                <div className="mt-6">
                    <p>Processing... {processingProgress}%</p>
                    <div className="w-full bg-gray-200 rounded h-6 overflow-hidden mt-2">
                        <div
                            className="bg-green-500 h-6"
                            style={{ width: `${processingProgress}%`, transition: "width 0.3s" }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FileUploader

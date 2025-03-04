<?php

namespace App\Http\Controllers;

use App\Jobs\RunPythonJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function uploadChunk(Request $request)
    {
        $chunkNumber = $request->input('chunkNumber');
        $totalChunks = $request->input('totalChunks');
        $fileName = $request->input('fileName');
        $chunk = $request->file('file');

        if (!$chunk || !$chunk->isValid()) {
            return response()->json([
                'error' => 'File upload failed'
            ], 400);
        }


        $chunkDir = storage_path('app/chunks'); // از پوشه 'chunks' برای ذخیره استفاده نمی‌کنیم.


        if (!is_dir($chunkDir)) {
            mkdir($chunkDir, 0777, true);  // ایجاد پوشه اگر وجود نداشته باشد
        }

        $chunkPath = $chunkDir . '/' . $fileName . '.' . $chunkNumber; // مسیر قطعه

        // ذخیره قطعه
        $chunk->move($chunkDir, $fileName . '.' . $chunkNumber); // ذخیره در public/uploads

        return response()->json([
            'message' => 'Chunk uploaded successfully',
        ], 200);
    }

    public function mergeChunks(Request $request)
    {
        if (!file_exists(public_path('uploads'))) {
            mkdir(public_path('uploads'), 0777, true);
        }

        $fileName = $request->input('fileName');
        $totalChunks = $request->input('totalChunks');

        $finalFilePath = public_path('uploads/' . $fileName);
        $finalFile = fopen($finalFilePath, 'wb');


        // مسیر فایل پیشرفت
        $progressFilePath = public_path('python_scripts/progress.json');


        // اگر فایل پیشرفت وجود ندارد، آن را ایجاد کنید
        if (!file_exists($progressFilePath)) {
            file_put_contents($progressFilePath, json_encode(['progress' => 0]));
        }


        if ($finalFile === false) {
            return response()->json([
                'message' => 'Failed to open the final file for writing.',
            ], 500);
        }

        // ترکیب تمام قطعات
        for ($i = 0; $i < $totalChunks; $i++) {
            $chunkPath = storage_path('app/chunks/' . $fileName . '.' . $i); // قطعات در پوشه chunks

            if (file_exists($chunkPath)) {
                $chunk = fopen($chunkPath, 'rb');

                while ($data = fread($chunk, 1024)) {
                    fwrite($finalFile, $data);
                }

                fclose($chunk);
                unlink($chunkPath); // حذف قطعه بعد از ترکیب
            }
        }

        fclose($finalFile);

        return response()->json(['success' => true, 'message' => 'Chunks merged successfully']);
    }

    public function runPython()
    {
        // ارسال Job به صف
        RunPythonJob::dispatch();

        return response()->json(['success' => true, 'message' => 'Processing started']);
    }

    public function getProgress()
    {
        $progress = json_decode(file_get_contents(storage_path('app/progress.json')), true);
        return response()->json($progress);
    }

//    public function jsonData(Request $request)
//    {
//        // ورودی‌های لازم از درخواست
////        $fileName = $request->input('fileName');
//        $filePath = public_path('uploads/data_VC.json'); // مسیر فایل در سرور
//
//        // بررسی وجود فایل در سرور
//        if (!file_exists($filePath)) {
//            return response()->json([
//                'error' => 'File not found'
//            ], 404);
//        }
//
//        // خواندن داده‌های فایل
//        $fileContent = file_get_contents($filePath);
//
//        // ارسال داده‌ها به فرانت‌اند (می‌توانید از Base64 یا فرمت دیگر استفاده کنید)
//        return response()->json([
//            'success' => true,
//            'data' => base64_encode($fileContent), // داده‌ها به فرمت Base64 ارسال می‌شود
//            'message' => 'File sent successfully'
//        ]);
//    }

    public function jsonData()
    {
        $path_score = public_path('reports/score.json');
        $data_score = File::get($path_score);
        $json_score = json_decode($data_score, true);

        $path_CM = public_path('reports/data_cm.json');
        $data_CM = File::get($path_CM);
        $json_CM = json_decode($data_CM, true);

        return response()->json([
            'scoreData' => $json_score,
            'cmData' => $json_CM
        ]);
    }
}

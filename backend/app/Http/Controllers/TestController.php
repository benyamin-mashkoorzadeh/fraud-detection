<?php

namespace App\Http\Controllers;

use App\Events\ProgressUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use TusPhp\Tus\Server;

class testController extends Controller
{
    public function handleTus(Request $request)
    {
        $server = new Server();
        $server->setApiPath('/upload'); // مسیر API برای آپلود
        $server->setUploadDir(storage_path('app/uploads')); // مسیر ذخیره‌سازی فایل‌ها

        $response = $server->serve();
//        dd($response);

        // در صورتی که پاسخ موفقیت‌آمیز باشد، هدر Location را اضافه کنید
//        if ($response->getStatusCode() == 201) {
        // آدرس آپلود

        // اضافه کردن هدر Location به پاسخ 201
        if ($response->getStatusCode() === 201) {
            $location = $response->headers->get('Location');
            $response->headers->set('Location', $location);
        }
//        }
        return $response->send();
    }

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


            // به‌روزرسانی پیشرفت پردازش در فایل JSON
            $progress = (($i + 1) / $totalChunks) * 100; // محاسبه درصد پیشرفت
            file_put_contents($progressFilePath, json_encode(['progress' => $progress])); // ذخیره پیشرفت در فایل JSON
        }

        fclose($finalFile);


        // وضعیت ابتدایی پردازش را در Cache ذخیره می‌کنیم
//        Cache::put("processing_progress_$fileName", 0);


        // مسیر فایل Jupyter Notebook
        $notebookPath = public_path('python_scripts/testController.ipynb');
        $executedNotebookPath = public_path('python_scripts/executed_notebook.ipynb');
        $outputJsonPath = public_path('python_scripts/output.json');

        // اجرای Jupyter Notebook با jupyter nbconvert
        $command = "/System/Volumes/Data/Users/benyamin/Library/Python/3.13/bin/jupyter nbconvert --to notebook --execute " . escapeshellarg($notebookPath) .
            " --output " . escapeshellarg($executedNotebookPath) .
            " --ExecutePreprocessor.kernel_name=python3 --NotebookApp.file_to_run=" . escapeshellarg($finalFilePath) . " 2>&1";

        //  $output = shell_exec($command);

        // اجرای فرمان در پس‌زمینه با استفاده از proc_open
        $process = proc_open($command, [], $pipes);

        // بررسی و پردازش خروجی
        if (!$process) {
            return response()->json([
                'message' => 'Failed to execute Jupyter Notebook.',
            ], 500);
        }


        // شبیه‌سازی به‌روزرسانی وضعیت پردازش (این بخش باید دقیقاً بر اساس نیاز واقعی شما باشد)
        // فرض می‌کنیم که در طی این مرحله پیشرفت پردازش افزایش پیدا می‌کند.
        for ($i = 0; $i <= 100; $i += 10) {
            sleep(1); // شبیه‌سازی پردازش
            // به‌روزرسانی پیشرفت در فایل JSON
            file_put_contents($progressFilePath, json_encode(['progress' => $i]));
        }

//        // شبیه‌سازی به‌روزرسانی وضعیت پردازش (این بخش باید دقیقاً بر اساس نیاز واقعی شما باشد)
//        // فرض می‌کنیم که در طی این مرحله پیشرفت پردازش افزایش پیدا می‌کند.
//        $step = 100 / $totalChunks;
//        for ($i = 0; $i < $totalChunks; $i++) {
//            sleep(1); // شبیه‌سازی پردازش
//            $progress = ($i + 1) * $step;
//            Cache::put("processing_progress_$fileName", $progress); // به‌روزرسانی درصد پیشرفت
//        }


//        // پاک کردن Cache بعد از پایان
//        Cache::forget("processing_progress_$fileName");


        // بعد از پایان، فایل پیشرفت را پاک می‌کنیم
//        unlink($progressFilePath);

        return response()->json([
            'message' => 'File merged and Jupyter Notebook executed successfully.',
        ]);
    }

//    public function getProgress()
//    {
//        $progress = Redis::get('processing_progress') ?? 0;
//        return response()->json(['progress' => $progress]);
//    }

    public function getProgress(Request $request)
    {
        $fileName = $request->input('fileName');  // دریافت نام فایل از درخواست
        $progressFilePath = public_path('python_scripts/progress.json');


        // اگر فایل progress.json وجود داشته باشد
        if (file_exists($progressFilePath)) {
            $progressData = json_decode(file_get_contents($progressFilePath), true);

            // بررسی وجود پیشرفت برای فایل خاص
            if (isset($progressData[$fileName])) {
                $progress = $progressData[$fileName];  // دریافت پیشرفت فایل خاص
            } else {
                $progress = 0;  // اگر پیشرفت برای فایل وجود ندارد، مقدار پیشرفت 0
            }
        } else {
            // اگر فایل progress.json وجود نداشته باشد، پیشرفت 0
            $progress = 0;
        }

        return response()->json([
            'progress' => $progress,
        ]);
    }

//    public function getProgress()
//    {
//        // پیشرفت آپلود و پردازش را از Cache یا دیتابیس بخوانید
//        $progress = Cache::get('processing_progress', 0);
//
//        return response()->json([
//            'processing_progress' => $progress,
//        ]);
//    }

    public function updateProgress()
    {
        $uploadProgress = Redis::get('upload_progress') ?? 0;
        $processingProgress = Redis::get('processing_progress') ?? 0;

        // ارسال Event به فرانت‌اند
        broadcast(new ProgressUpdated($uploadProgress, $processingProgress));

        return response()->json([
            'upload_progress' => $uploadProgress,
            'processing_progress' => $processingProgress,
        ]);
    }

    // متدی برای بازگرداندن مقدار پیشرفت
    public function gettingProgress()
    {
        $progress = Cache::get('progress', 0); // مقدار پیش‌فرض 0
        return response()->json(['progress' => $progress]);
    }

    // متدی برای تنظیم مقدار پیشرفت
    public function settingProgress(Request $request)
    {
        $progress = $request->input('progress'); // مقدار پیشرفت از درخواست دریافت می‌شود
        Cache::put('progress', $progress); // مقدار در کش ذخیره می‌شود
        return response()->json(['message' => 'Progress updated']);
    }


    public function runNotebook()
    {
        // مسیر فایل Jupyter Notebook
        $notebookPath = public_path('python_scripts/process.ipynb');

        // مسیر ذخیره خروجی (یک فایل HTML یا JSON برای ذخیره خروجی)
        $outputPath = public_path('python_scripts/output.html');

        // اجرای دستور برای اجرای نوت‌بوک
        $command = "/System/Volumes/Data/Users/benyamin/Library/Python/3.13/bin/jupyter nbconvert --to html --execute $notebookPath --output $outputPath";

        // اجرای دستور با shell_exec
        $output = shell_exec($command . ' 2>&1'); // گرفتن خروجی و خطاها

        // بررسی موفقیت یا خطای اجرا
        if (strpos($output, 'Error') !== false) {
            return response()->json([
                'message' => 'Error executing the notebook',
                'output' => $output,
            ], 500);
        }

        return response()->json([
            'message' => 'Notebook executed successfully',
            'output' => $output,
            'result_file' => url('scripts/output.html'), // لینک خروجی برای مشاهده
        ]);
    }

}

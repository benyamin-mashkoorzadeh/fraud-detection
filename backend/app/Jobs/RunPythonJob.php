<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class RunPythonJob implements ShouldQueue
{
    use Queueable;

    public $file;
    /**
     * Create a new job instance.
     */
    public function __construct()
    {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $file = public_path('uploads/creditcard.csv');


        // اجرای اسکریپت پایتون
        $pythonFile = public_path('python_scripts/process.ipynb');

        $command = "FILE_PATH=" . escapeshellarg($file) . " /System/Volumes/Data/Users/benyamin/Library/Python/3.13/bin/jupyter nbconvert --to notebook --execute $pythonFile --ExecutePreprocessor.kernel_name=python3 --ExecutePreprocessor.allow_errors=True --output executed_notebook.ipynb 2>&1";
        $output = shell_exec($command);
        // فایل progress.json رو بروزرسانی کنید
        file_put_contents(storage_path('app/progress.json'), json_encode(['progress' => 100]));
    }
}

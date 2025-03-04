<?php

use App\Events\TestEvent;
use App\Http\Controllers\testController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

//Route::any('/upload', [testController::class, 'handleTus']);

Route::post('/upload-chunk', [UploadController::class, 'uploadChunk']);
Route::post('/merge-chunks', [UploadController::class, 'mergeChunks']);
//Route::get('/progress', [UploadController::class, 'getProgress']);


//Route::get('/progress', [testController::class, 'gettingProgress']);
//Route::post('/set-progress', [testController::class, 'settingProgress']); // اگر بخواهید دستی پیشرفت را ست کنید

//Route::get('/progress', [testController::class, 'gettingProgress']); // گرفتن مقدار پیشرفت
//Route::post('/progress', [testController::class, 'settingProgress']); // به‌روزرسانی مقدار پیشرفت

//Route::get('/run-notebook', [testController::class, 'runNotebook']);


Route::post('/run-python', [UploadController::class, 'runPython']); // اجرای جوپیتر
Route::get('/progress', [UploadController::class, 'getProgress']); // دریافت پیشرفت

Route::get('/show-data', [UploadController::class, 'jsonData']);

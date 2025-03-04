<?php

use App\Http\Controllers\testController;
use Illuminate\Support\Facades\Route;



Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';

Route::any('/upload', [testController::class, 'handleTus']);

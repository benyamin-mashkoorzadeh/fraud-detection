<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProgressUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $uploadProgress;
    public $processingProgress;

    // زمانی که پیشرفت پردازش تغییر می‌کند، این داده‌ها ارسال خواهند شد
    public function __construct($uploadProgress, $processingProgress)
    {
        $this->uploadProgress = $uploadProgress;
        $this->processingProgress = $processingProgress;
    }

    // مسیر کانال برای ارسال داده‌ها
    public function broadcastOn()
    {
        return new Channel('file-upload-channel');
    }
}

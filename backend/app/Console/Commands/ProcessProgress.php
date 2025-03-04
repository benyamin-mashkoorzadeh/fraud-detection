<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class ProcessProgress extends Command
{

    protected $signature = 'process:progress';
    protected $description = 'Receive progress updates from RabbitMQ';

    public function handle()
    {
        $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
        $channel = $connection->channel();
        $channel->queue_declare('progress', false, true, false, false);

        $callback = function ($msg) {
            // ارسال پیام به API برای ری‌اکت
            $progress = $msg->body;
            $this->sendProgressToReact($progress);
        };

        $channel->basic_consume('progress', '', false, true, false, false, $callback);

        while($channel->is_consuming()) {
            $channel->wait();
        }

        $channel->close();
        $connection->close();
    }

    public function sendProgressToReact($progress)
    {
        // اینجا می‌توانید وضعیت پردازش را به API ارسال کنید
        Http::post('http://localhost:8000/api/progress', [
            'progress' => $progress
        ]);
    }
}

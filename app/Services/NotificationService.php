<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use App\Mail\CourseNotificationMail;

class NotificationService
{
    public static function send($user, $message)
    {
        Mail::to($user->email)->send(
            new CourseNotificationMail($message)
        );
    }
}
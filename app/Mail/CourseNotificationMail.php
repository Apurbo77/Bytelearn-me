<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CourseNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $messageText;

    public function __construct($messageText)
    {
        $this->messageText = $messageText;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ByteLearn Course Notification',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.course_notification',
            with: [
                'messageText' => $this->messageText,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
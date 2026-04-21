<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'issue_date',
        'certificate_url',
        'verification_code',
    ];

    protected $casts = [
        'issue_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the certificate.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the course that the certificate was issued for.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function generateVerificationCode()
    {
        return strtoupper('CERT-' . date('YmdHis') . '-' . uniqid());
    }
}

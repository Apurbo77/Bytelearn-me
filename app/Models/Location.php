<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'user_id',
        'location_string',
        'latitude',
        'longitude',
        'share_email',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

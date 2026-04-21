<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if (!$user) {
    echo "No user found to anchor locations on.\n";
    exit;
}
$loc = $user->locationRecord;
if (!$loc || !$loc->latitude || !$loc->longitude) {
    echo "User has no formal location yet. Please go set it via Map Pin, and click Update Location.\n";
    exit;
}

$lat = $loc->latitude;
$lon = $loc->longitude;

// Create dummy students
$dummies = [
    ['name' => 'Alice Near', 'email' => 'alice@test.com', 'lat_offset' => 0.005, 'lon_offset' => 0.005, 'loc_name' => 'North East Side'],
    ['name' => 'Bob Close', 'email' => 'bob@test.com', 'lat_offset' => -0.008, 'lon_offset' => -0.002, 'loc_name' => 'South Side Walk'],
    ['name' => 'Charlie Far', 'email' => 'charlie@test.com', 'lat_offset' => 0.060, 'lon_offset' => 0.060, 'loc_name' => 'Outskirts Area'], // Outside 5km radius
];

foreach ($dummies as $d) {
    $u = \App\Models\User::firstOrCreate(
        ['email' => $d['email']],
        ['name' => $d['name'], 'password' => bcrypt('password'), 'role' => 'student', 'location' => $d['loc_name']]
    );
    
    \App\Models\Location::updateOrCreate(
        ['user_id' => $u->id],
        ['location_string' => $d['loc_name'], 'latitude' => $lat + $d['lat_offset'], 'longitude' => $lon + $d['lon_offset']]
    );
}

echo "Seeded dummy study buddies successfully.\n";

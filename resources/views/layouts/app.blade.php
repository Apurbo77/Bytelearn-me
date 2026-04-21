<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'ByteLearn - Peer-Led Micro Learning Platform')</title>

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Leaflet Map API -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Vite enabled -->
@viteReactRefresh
@vite(['resources/css/app.css', 'resources/js/app.tsx'])

@yield('styles')

</head>

<body>

<!-- React App Mount Point -->
<div id="app"></div>

<!-- Blade Content -->
@yield('content')

<!-- Initial Data from Laravel -->
<script id="app-data" type="application/json">
    @json($data ?? $reactData ?? ['page' => 'home', 'user' => null])
</script>

@yield('scripts')

</body>
</html>

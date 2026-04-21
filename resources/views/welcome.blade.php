@extends('layouts.app')

@section('title', 'ByteLearn - Learn Smarter, Not Harder')

@section('scripts')
@php
    $userData = auth()->user() ? [
        'id' => auth()->user()->id,
        'name' => auth()->user()->name,
        'email' => auth()->user()->email,
        'role' => auth()->user()->role
    ] : null;
@endphp
<script>
    // Override initial data for homepage
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'home',
        user: @json($userData)
    });
</script>
@endsection

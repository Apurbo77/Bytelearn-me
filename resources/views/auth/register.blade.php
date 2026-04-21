@extends('layouts.app')

@section('title', 'Register - ByteLearn')

@section('scripts')
<script>
    // Override initial data for register page
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'register',
        user: null,
        errors: @json($errors->all()),
        old: @json(session()->getOldInput())
    });
</script>
@endsection

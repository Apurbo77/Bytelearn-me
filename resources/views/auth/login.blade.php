@extends('layouts.app')

@section('title', 'Login - ByteLearn')

@section('scripts')
<script>
    // Override initial data for login page
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'login',
        user: null,
        error: {!! json_encode($errors->first('email') ?: $errors->first('password') ?: '') !!}
    });
</script>
@endsection

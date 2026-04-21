@extends('layouts.app')

@section('title', 'Edit Course - ByteLearn')

@section('scripts')
<script>
    // Pass Laravel data to React for Course Editor
    document.getElementById('app-data').textContent = JSON.stringify(@json($data));
</script>
@endsection

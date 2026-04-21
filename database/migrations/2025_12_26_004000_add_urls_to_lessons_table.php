<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('content_type');
            $table->string('pdf_url')->nullable()->after('video_url');
            $table->string('external_link')->nullable()->after('pdf_url');
            $table->string('external_link_label')->nullable()->after('external_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'pdf_url', 'external_link', 'external_link_label']);
        });
    }
};

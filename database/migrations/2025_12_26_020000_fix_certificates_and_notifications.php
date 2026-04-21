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
        // Add timestamps to certificates table if not present
        if (!Schema::hasColumn('certificates', 'created_at')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->timestamps();
            });

            // Update existing records
            \DB::table('certificates')->whereNull('created_at')->update([
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create notifications table if it doesn't exist
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->text('message');
                $table->string('type')->default('info');
                $table->timestamp('read_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at']);
        });
        
        Schema::dropIfExists('notifications');
    }
};

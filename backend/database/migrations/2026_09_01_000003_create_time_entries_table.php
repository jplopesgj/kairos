<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->restrictOnDelete();
            $table->date('work_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->index(['work_date', 'project_id']);
        });
        DB::statement("CREATE UNIQUE INDEX one_active_timer ON time_entries ((end_time IS NULL)) WHERE end_time IS NULL");
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS one_active_timer');
        Schema::dropIfExists('time_entries');
    }
};

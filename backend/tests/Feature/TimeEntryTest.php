<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Project;
use App\Models\TimeEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimeEntryTest extends TestCase
{
    use RefreshDatabase;

    private function project(): Project
    {
        return Project::create(['client_id' => Client::create(['name' => 'Acme'])->id, 'name' => 'Site', 'hourly_rate' => 100]);
    }

    public function test_manual_entry_returns_duration_and_amount(): void
    {
        $response = $this->postJson('/api/time-entries', [
            'project_id' => $this->project()->id, 'work_date' => '2026-09-01',
            'start_time' => '09:00', 'end_time' => '10:30', 'description' => 'Implementação',
        ]);
        $response->assertCreated()->assertJsonPath('duration_minutes', 90)->assertJsonPath('amount', 150);
    }

    public function test_invalid_period_is_rejected(): void
    {
        $response = $this->postJson('/api/time-entries', [
            'project_id' => $this->project()->id, 'work_date' => '2026-09-01',
            'start_time' => '11:00', 'end_time' => '10:00',
        ]);
        $response->assertStatus(422);
    }

    public function test_only_one_active_timer_can_exist(): void
    {
        $project = $this->project();
        $this->postJson('/api/timer/start', ['project_id' => $project->id])->assertCreated();
        $this->postJson('/api/timer/start', ['project_id' => $project->id])->assertStatus(422);
    }

    public function test_stop_closes_a_timer(): void
    {
        $project = $this->project();
        TimeEntry::create(['project_id' => $project->id, 'work_date' => now()->toDateString(), 'start_time' => now()->subHour()->format('H:i:s')]);
        $this->postJson('/api/timer/stop')->assertOk()->assertJsonPath('duration_minutes', 60);
        $this->assertDatabaseMissing('time_entries', ['end_time' => null]);
    }
}

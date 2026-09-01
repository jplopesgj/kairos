<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeEntry extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'work_date', 'start_time', 'end_time', 'description'];

    protected $casts = ['work_date' => 'date:Y-m-d', 'start_time' => 'datetime:H:i:s', 'end_time' => 'datetime:H:i:s'];

    protected $appends = ['duration_minutes', 'amount'];

    protected $with = ['project.client'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getDurationMinutesAttribute(): ?int
    {
        if (!$this->start_time || !$this->end_time) return null;
        return max(0, $this->start_time->diffInMinutes($this->end_time, false));
    }

    public function getAmountAttribute(): ?float
    {
        if ($this->duration_minutes === null || !$this->project) return null;
        return round(($this->duration_minutes / 60) * (float) $this->project->hourly_rate, 2);
    }
}

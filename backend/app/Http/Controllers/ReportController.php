<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $from = $request->date('from')?->startOfDay() ?? now()->startOfMonth();
        $to = $request->date('to')?->endOfDay() ?? now()->endOfDay();
        $entries = TimeEntry::with('project.client')
            ->whereBetween('work_date', [$from->toDateString(), $to->toDateString()])->get();

        $completed = $entries->filter(fn ($entry) => $entry->duration_minutes !== null);
        $minutes = $completed->sum('duration_minutes');
        $amount = $completed->sum('amount');
        $byProject = $completed->groupBy('project_id')->map(function ($items) {
            $project = $items->first()->project;
            return [
                'project_id' => $project->id, 'project' => $project->name,
                'client' => $project->client?->name, 'minutes' => $items->sum('duration_minutes'),
                'amount' => round($items->sum('amount'), 2),
            ];
        })->values();

        return response()->json([
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
            'total_minutes' => $minutes, 'total_amount' => round($amount, 2),
            'active_timer' => $entries->contains(fn ($entry) => $entry->end_time === null),
            'by_project' => $byProject,
        ]);
    }
}

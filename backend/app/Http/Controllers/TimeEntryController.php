<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\TimeEntry;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TimeEntryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TimeEntry::query()->with('project.client')->orderByDesc('work_date')->orderByDesc('start_time');
        $this->applyFilters($query, $request);
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $this->ensureValidPeriod($data['start_time'], $data['end_time'] ?? null);
        return response()->json(TimeEntry::create($data)->load('project.client'), 201);
    }

    public function show(TimeEntry $timeEntry): JsonResponse
    {
        return response()->json($timeEntry->load('project.client'));
    }

    public function update(Request $request, TimeEntry $timeEntry): JsonResponse
    {
        $data = $this->validated($request, true);
        $start = $data['start_time'] ?? $timeEntry->start_time?->format('H:i');
        $end = array_key_exists('end_time', $data) ? $data['end_time'] : $timeEntry->end_time?->format('H:i');
        $this->ensureValidPeriod($start, $end);
        $timeEntry->update($data);
        return response()->json($timeEntry->fresh()->load('project.client'));
    }

    public function destroy(TimeEntry $timeEntry): JsonResponse
    {
        if (!$timeEntry->end_time) {
            return response()->json(['message' => 'Pare o timer antes de excluir este lançamento.'], 422);
        }
        $timeEntry->delete();
        return response()->json(null, 204);
    }

    public function active(): JsonResponse
    {
        return response()->json(TimeEntry::whereNull('end_time')->with('project.client')->latest('id')->first());
    }

    public function start(Request $request): JsonResponse
    {
        $data = $request->validate(['project_id' => ['required', 'integer', 'exists:projects,id']]);
        if (TimeEntry::whereNull('end_time')->exists()) {
            return response()->json(['message' => 'Já existe um timer em andamento.'], 422);
        }
        $project = Project::findOrFail($data['project_id']);
        if (!$project->is_active) {
            return response()->json(['message' => 'Escolha um projeto ativo.'], 422);
        }
        $now = Carbon::now();
        return response()->json(TimeEntry::create([
            'project_id' => $project->id,
            'work_date' => $now->toDateString(),
            'start_time' => $now->format('H:i:s'),
        ])->load('project.client'), 201);
    }

    public function stop(): JsonResponse
    {
        $entry = TimeEntry::whereNull('end_time')->latest('id')->first();
        if (!$entry) return response()->json(['message' => 'Não há timer em andamento.'], 422);
        $now = Carbon::now();
        // Um lançamento sempre pertence a um único dia. Se ficou aberto até
        // depois da meia-noite, encerramos no último segundo do dia original.
        $entry->end_time = $entry->work_date->isSameDay($now)
            ? $now->format('H:i:s')
            : '23:59:59';
        $entry->save();
        return response()->json($entry->fresh()->load('project.client'));
    }

    public function export(Request $request): StreamedResponse
    {
        $query = TimeEntry::with('project.client')->orderBy('work_date')->orderBy('start_time');
        $this->applyFilters($query, $request);
        $entries = $query->get();
        return response()->streamDownload(function () use ($entries) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Data', 'Cliente', 'Projeto', 'Início', 'Fim', 'Duração (min)', 'Valor', 'Descrição']);
            foreach ($entries as $entry) {
                fputcsv($handle, [
                    $entry->work_date?->format('d/m/Y'), $entry->project?->client?->name,
                    $entry->project?->name, $entry->start_time?->format('H:i'),
                    $entry->end_time?->format('H:i'), $entry->duration_minutes,
                    number_format((float) $entry->amount, 2, ',', '.'), $entry->description,
                ]);
            }
            fclose($handle);
        }, 'kairos.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'project_id' => [$partial ? 'sometimes' : 'required', 'integer', 'exists:projects,id'],
            'work_date' => [$partial ? 'sometimes' : 'required', 'date_format:Y-m-d'],
            'start_time' => [$partial ? 'sometimes' : 'required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
        return $request->validate($rules);
    }

    private function ensureValidPeriod(?string $start, ?string $end): void
    {
        if ($end !== null && Carbon::createFromFormat('H:i', $end)->lessThanOrEqualTo(Carbon::createFromFormat('H:i', $start))) {
            abort(422, 'O horário final deve ser posterior ao horário inicial.');
        }
    }

    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('from')) $query->whereDate('work_date', '>=', $request->date('from'));
        if ($request->filled('to')) $query->whereDate('work_date', '<=', $request->date('to'));
        if ($request->filled('project_id')) $query->where('project_id', $request->integer('project_id'));
    }
}

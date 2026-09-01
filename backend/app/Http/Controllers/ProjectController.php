<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Project::with('client')->withCount('timeEntries')->orderByDesc('is_active')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'hourly_rate' => ['required', 'numeric', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        return response()->json(Project::create($data)->load('client'), 201);
    }

    public function show(Project $project): JsonResponse
    {
        return response()->json($project->load('client'));
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['sometimes', 'required', 'integer', 'exists:clients,id'],
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'hourly_rate' => ['sometimes', 'required', 'numeric', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $project->update($data);
        return response()->json($project->fresh()->load('client'));
    }

    public function destroy(Project $project): JsonResponse
    {
        if ($project->timeEntries()->exists()) {
            return response()->json(['message' => 'Não é possível excluir um projeto que possui lançamentos.'], 422);
        }
        $project->delete();
        return response()->json(null, 204);
    }
}

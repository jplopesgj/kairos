<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Client::withCount('projects')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['nullable', 'email', 'max:160'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        return response()->json(Client::create($data), 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client->loadCount('projects'));
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'email' => ['nullable', 'email', 'max:160'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $client->update($data);
        return response()->json($client->fresh()->loadCount('projects'));
    }

    public function destroy(Client $client): JsonResponse
    {
        if ($client->projects()->exists()) {
            return response()->json(['message' => 'Não é possível excluir um cliente com projetos.'], 422);
        }
        $client->delete();
        return response()->json(null, 204);
    }
}

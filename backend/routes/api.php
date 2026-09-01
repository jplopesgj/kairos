<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TimeEntryController;
use Illuminate\Support\Facades\Route;

Route::apiResource('clients', ClientController::class);
Route::apiResource('projects', ProjectController::class);

Route::get('timer/active', [TimeEntryController::class, 'active']);
Route::post('timer/start', [TimeEntryController::class, 'start']);
Route::post('timer/stop', [TimeEntryController::class, 'stop']);
Route::get('time-entries/export', [TimeEntryController::class, 'export']);
Route::apiResource('time-entries', TimeEntryController::class);

Route::get('reports/summary', [ReportController::class, 'summary']);

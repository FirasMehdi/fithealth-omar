<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Patient\CheckInController;
use App\Http\Controllers\Patient\DashboardController as PatientDashboardController;
use App\Http\Controllers\Patient\MessageController as PatientMessageController;
use App\Http\Controllers\Patient\ProtocolController as PatientProtocolController;
use App\Http\Controllers\Patient\ProtocolLogController;
use App\Http\Controllers\Praticien\DashboardController;
use App\Http\Controllers\Praticien\MessageController;
use App\Http\Controllers\Praticien\PatientsController;
use App\Http\Controllers\Praticien\PlaceholderController;
use App\Http\Controllers\Praticien\ProtocolController;
use App\Http\Controllers\Praticien\ProtocolItemController;
use App\Http\Controllers\Praticien\ProtocolTemplatesController;
use App\Http\Controllers\Praticien\VitaliteItemController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/Accueil'))->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
});

Route::middleware(['auth', 'role:praticien'])->prefix('praticien')->name('praticien.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/patients', [PatientsController::class, 'index'])->name('patients.index');
    Route::post('/patients', [PatientsController::class, 'store'])->name('patients.store');
    Route::get('/patients/{patient}', [PatientsController::class, 'show'])->name('patients.show');
    Route::post('/patients/{patient}/protocol', [ProtocolController::class, 'store'])->name('patients.protocol.store');
    Route::post('/protocols/{protocol}/items', [ProtocolItemController::class, 'store'])->name('protocols.items.store');
    Route::post('/patients/{patient}/vitalite-items', [VitaliteItemController::class, 'store'])->name('patients.vitalite-items.store');
    Route::get('/protocoles', [ProtocolTemplatesController::class, 'index'])->name('protocoles');
    Route::post('/protocoles', [ProtocolTemplatesController::class, 'store'])->name('protocoles.store');
    Route::put('/protocoles/{template}', [ProtocolTemplatesController::class, 'update'])->name('protocoles.update');
    Route::delete('/protocoles/{template}', [ProtocolTemplatesController::class, 'destroy'])->name('protocoles.destroy');
    Route::get('/messages/{patient?}', [MessageController::class, 'index'])->name('messages');
    Route::post('/messages/{patient}', [MessageController::class, 'store'])->name('messages.store');
    Route::get('/reglages', [PlaceholderController::class, 'reglages'])->name('reglages');
});

Route::middleware(['auth', 'role:patient'])->prefix('patient')->name('patient.')->group(function () {
    Route::get('/dashboard', [PatientDashboardController::class, 'index'])->name('dashboard');
    Route::post('/protocol-items/{item}/toggle', [ProtocolLogController::class, 'toggle'])->name('protocol-items.toggle');
    Route::get('/protocole', [PatientProtocolController::class, 'index'])->name('protocole');
    Route::get('/checkin', [CheckInController::class, 'create'])->name('checkin');
    Route::post('/checkin', [CheckInController::class, 'store'])->name('checkin.store');
    Route::get('/messages', [PatientMessageController::class, 'index'])->name('messages');
    Route::post('/messages', [PatientMessageController::class, 'store'])->name('messages.store');
});

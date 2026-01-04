<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\UsersController;
use App\Http\Controllers\RolesPermissionsController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


Route::get('/users', [UsersController::class, 'index'])
    ->middleware(['auth', 'permission:view users'])
    ->name('users');

Route::post('/users', [UsersController::class, 'create'])
    ->middleware(['auth', 'permission:create users'])
    ->name('users.store');

Route::post('/users/{user}/roles', [UsersController::class, 'assignRole'])
    ->middleware(['auth', 'permission:edit users'])
    ->name('users.roles.store');

Route::put('/users/{user}', [UsersController::class, 'update'])
    ->middleware(['auth', 'permission:edit users'])
    ->name('users.update');

Route::delete('/users/{user}/roles/{role:name}', [UsersController::class, 'removeRole'])
    ->middleware(['auth', 'permission:edit users'])
    ->name('users.roles.remove');

Route::delete('/users/{user}', [UsersController::class, 'destroy'])
    ->middleware(['auth', 'permission:delete users'])
    ->name('users.destroy');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('partners', function () {
        return Inertia::render('partners');
    })->name('partners');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('bookings', function () {
        return Inertia::render('bookings');
    })->name('bookings');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('products', function () {
        return Inertia::render('products');
    })->name('products');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('orders', function () {
        return Inertia::render('orders');
    })->name('orders');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports', function () {
        return Inertia::render('reports');
    })->name('reports');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('withdraw', function () {
        return Inertia::render('withdraw');
    })->name('withdraw');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('announcement', function () {
        return Inertia::render('announcement');
    })->name('announcement');
});


Route::get('/roles-permissions', [RolesPermissionsController::class, 'index'])
    ->middleware(['auth', 'permission:view role/permissions'])
    ->name('roles_permissions');

Route::post('/roles-permissions', [RolesPermissionsController::class, 'create'])
    ->middleware(['auth', 'permission:create role/permissions'])
    ->name('roles.store');

Route::post('/roles/{role}/permissions', [RolesPermissionsController::class, 'assignPermissions'])
    ->middleware(['auth', 'permission:edit role/permissions'])
    ->name('roles.permissions.assign');

Route::put('/roles/{role}', [RolesPermissionsController::class, 'updateRoleName'])
    ->middleware(['auth', 'permission:edit role/permissions'])
    ->name('roles.update');

Route::delete('/roles/{role}/permissions/{permission}', [RolesPermissionsController::class, 'revokePermissions'])
    ->middleware(['auth', 'permission:edit role/permissions'])
    ->name('roles.permissions.revoke');

Route::delete('/roles/{role}', [RolesPermissionsController::class, 'destroy'])
    ->middleware(['auth', 'permission:delete role/permissions'])
    ->name('roles.destroy');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('chat', function () {
        return Inertia::render('chat');
    })->name('chat');
});

require __DIR__.'/settings.php';

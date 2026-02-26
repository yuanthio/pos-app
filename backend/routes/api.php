<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MakananController;
use App\Http\Controllers\Api\PelayanController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Public makanan routes (for pelayan to view menu - no auth required)
Route::get('/menu', [MakananController::class, 'index']);
Route::get('/menu/{id}', [MakananController::class, 'show']);
Route::get('/menu/categories', [MakananController::class, 'categories']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Pelayan routes
    Route::middleware('pelayan')->group(function () {
        Route::get('/pelayan/tables', [PelayanController::class, 'getTables']);
        Route::post('/pelayan/orders', [PelayanController::class, 'createOrder']);
        Route::put('/pelayan/tables/{meja}/book', [PelayanController::class, 'bookTable']);
        Route::get('/pelayan/orders', [PelayanController::class, 'getOrders']);
        Route::get('/pelayan/orders/{pesanan}', [PelayanController::class, 'getOrderDetail']);
        Route::delete('/pelayan/orders/{pesanan}', [PelayanController::class, 'deleteOrder']);
        Route::post('/pelayan/orders/{pesanan}/items', [PelayanController::class, 'addItemToOrder']);
        Route::put('/pelayan/orders/{pesanan}/items/{detailPesanan}', [PelayanController::class, 'updateItemQuantity']);
        Route::delete('/pelayan/orders/{pesanan}/items/{detailPesanan}', [PelayanController::class, 'removeItemFromOrder']);
        Route::put('/pelayan/tables/{meja}', [PelayanController::class, 'updateTableStatus']);
    });
    
    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        
        // Makanan CRUD routes
        Route::get('/makanans', [MakananController::class, 'index']);
        Route::post('/makanans', [MakananController::class, 'store']);
        Route::get('/makanans/categories', [MakananController::class, 'categories']);
        Route::get('/makanans/{id}', [MakananController::class, 'show']);
        Route::put('/makanans/{id}', [MakananController::class, 'update']);
        Route::delete('/makanans/{id}', [MakananController::class, 'destroy']);
        Route::patch('/makanans/{id}/toggle-availability', [MakananController::class, 'toggleAvailability']);
    });
});

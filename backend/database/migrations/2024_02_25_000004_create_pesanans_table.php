<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pesanans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meja_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nama_pelanggan')->nullable();
            $table->enum('status', ['menunggu', 'diproses', 'selesai', 'dibatalkan'])->default('menunggu');
            $table->decimal('total_harga', 10, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['meja_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesanans');
    }
};

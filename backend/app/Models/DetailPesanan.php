<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPesanan extends Model
{
    use HasFactory;

    protected $fillable = [
        'pesanan_id',
        'makanan_id',
        'jumlah',
        'harga_satuan',
        'subtotal',
        'catatan'
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'harga_satuan' => 'decimal:2',
        'subtotal' => 'decimal:2'
    ];

    /**
     * Get pesanan relationship
     */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class);
    }

    /**
     * Get makanan relationship
     */
    public function makanan(): BelongsTo
    {
        return $this->belongsTo(Makanan::class);
    }

    /**
     * Calculate subtotal automatically
     */
    public function calculateSubtotal(): void
    {
        $this->subtotal = $this->jumlah * $this->harga_satuan;
        $this->save();
    }

    /**
     * Boot method to handle events
     */
    protected static function boot()
    {
        parent::boot();

        // Update pesanan total when detail pesanan is created, updated, or deleted
        static::created(function ($detailPesanan) {
            $detailPesanan->pesanan->updateTotalHarga();
        });

        static::updated(function ($detailPesanan) {
            $detailPesanan->pesanan->updateTotalHarga();
        });

        static::deleted(function ($detailPesanan) {
            $detailPesanan->pesanan->updateTotalHarga();
        });
    }
}

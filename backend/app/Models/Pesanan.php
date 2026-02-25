<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pesanan extends Model
{
    use HasFactory;

    protected $fillable = [
        'meja_id',
        'user_id',
        'nama_pelanggan',
        'status',
        'total_harga',
        'catatan'
    ];

    protected $casts = [
        'total_harga' => 'decimal:2'
    ];

    /**
     * Get status dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'menunggu' => 'Menunggu',
            'diproses' => 'Diproses',
            'selesai' => 'Selesai',
            'dibatalkan' => 'Dibatalkan'
        };
    }

    /**
     * Get meja relationship
     */
    public function meja(): BelongsTo
    {
        return $this->belongsTo(Meja::class);
    }

    /**
     * Get user (pelayan) relationship
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get detail pesanan items
     */
    public function detailPesanans(): HasMany
    {
        return $this->hasMany(DetailPesanan::class);
    }

    /**
     * Check if pesanan can be modified
     */
    public function canBeModified(): bool
    {
        return in_array($this->status, ['menunggu', 'diproses']);
    }
}

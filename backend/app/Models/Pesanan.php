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
        'total_harga' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
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
            'dibayar' => 'Dibayar',
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

    /**
     * Check if pesanan can be completed
     */
    public function canBeCompleted(): bool
    {
        $allowedStatuses = ['menunggu', 'diproses'];
        $statusAllowed = in_array($this->status, $allowedStatuses);
        // Use relation instead of query to avoid N+1
        $hasItems = $this->detailPesanans->count() > 0;
        
        return $statusAllowed && $hasItems;
    }

    /**
     * Check if pesanan can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['menunggu', 'diproses']);
    }

    /**
     * Check if pesanan can be closed by kasir
     */
    public function canBeClosed(): bool
    {
        return in_array($this->status, ['diproses', 'selesai']);
    }

    /**
     * Calculate and update total harga
     */
    public function updateTotalHarga(): void
    {
        $this->total_harga = (float) $this->detailPesanans()->sum('subtotal');
        $this->save();
    }

    /**
     * Boot method to handle events
     */
    protected static function boot()
    {
        parent::boot();

        // Tidak ada event listeners untuk menghindari infinite loop
        // Total harga akan diupdate manual di controller
    }
}

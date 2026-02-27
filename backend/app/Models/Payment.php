<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'pesanan_id',
        'payment_method',
        'payment_amount',
        'subtotal',
        'tax',
        'service',
        'total',
        'change',
        'customer_name',
        'notes',
        'paid_at'
    ];

    protected $casts = [
        'payment_amount' => 'float',
        'subtotal' => 'float',
        'tax' => 'float',
        'service' => 'float',
        'total' => 'float',
        'change' => 'float',
        'paid_at' => 'datetime'
    ];

    /**
     * Get pesanan relationship
     */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class);
    }
}

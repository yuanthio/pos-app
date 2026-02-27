<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meja extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_meja',
        'status',
        'kapasitas',
        'catatan'
    ];

    protected $casts = [
        'status' => 'string',
        'kapasitas' => 'integer'
    ];

    /**
     * Get customer name from booking catatan
     */
    public function getNamaPelangganAttribute()
    {
        if ($this->status !== 'dipesan' || !$this->catatan) {
            return null;
        }

        // Parse customer name from booking catatan
        // Format: "Booking untuk: {nama} - {catatan}"
        if (strpos($this->catatan, 'Booking untuk:') === 0) {
            $bookingText = substr($this->catatan, 14); // Remove "Booking untuk: "
            $parts = explode(' - ', $bookingText, 2);
            $customerName = trim($parts[0]);
            
            // Debug log
            \Log::info("Parsing nama_pelanggan: catatan='{$this->catatan}' -> nama='{$customerName}'");
            
            return $customerName ?: null;
        }

        return null;
    }

    /**
     * Get booking notes from catatan
     */
    public function getBookingNotesAttribute()
    {
        if ($this->status !== 'dipesan' || !$this->catatan) {
            return null;
        }

        // Parse booking notes from catatan
        // Format: "Booking untuk: {nama} - {catatan}"
        if (strpos($this->catatan, 'Booking untuk:') === 0) {
            $bookingText = substr($this->catatan, 14); // Remove "Booking untuk: "
            $parts = explode(' - ', $bookingText, 2);
            $notes = isset($parts[1]) ? trim($parts[1]) : null;
            
            // Debug log
            \Log::info("Parsing booking_notes: catatan='{$this->catatan}' -> notes='{$notes}'");
            
            return $notes;
        }

        return null;
    }

    /**
     * Get status dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'tersedia' => 'Tersedia',
            'terisi' => 'Terisi',
            'dipesan' => 'Sedang Dipesan',
            'tidak_aktif' => 'Tidak Aktif'
        };
    }

    /**
     * Check if meja is available for new order
     */
    public function isAvailable(): bool
    {
        return in_array($this->status, ['tersedia']);
    }

    /**
     * Get active orders for this table
     */
    public function pesanans()
    {
        return $this->hasMany(Pesanan::class);
    }
}

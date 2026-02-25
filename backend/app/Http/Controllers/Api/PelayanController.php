<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meja;
use App\Models\Pesanan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PelayanController extends Controller
{
    /**
     * Get all tables with status summary
     */
    public function getTables(): JsonResponse
    {
        $mejas = Meja::all();
        
        // Group by status
        $statusCount = [
            'tersedia' => $mejas->where('status', 'tersedia')->count(),
            'terisi' => $mejas->where('status', 'terisi')->count(),
            'dipesan' => $mejas->where('status', 'dipesan')->count(),
            'tidak_aktif' => $mejas->where('status', 'tidak_aktif')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'mejas' => $mejas,
                'status_count' => $statusCount,
                'total_meja' => $mejas->count()
            ]
        ]);
    }

    /**
     * Create new order for table
     */
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'meja_id' => 'required|exists:mejas,id',
            'nama_pelanggan' => 'nullable|string|max:255',
            'catatan' => 'nullable|string'
        ]);

        $meja = Meja::findOrFail($request->meja_id);

        if (!$meja->isAvailable()) {
            return response()->json([
                'success' => false,
                'message' => 'Meja tidak tersedia untuk pesanan baru'
            ], 400);
        }

        // Update table status to terisi
        $meja->update(['status' => 'terisi']);

        // Create new order
        $pesanan = Pesanan::create([
            'meja_id' => $request->meja_id,
            'user_id' => $request->user()->id,
            'nama_pelanggan' => $request->nama_pelanggan,
            'status' => 'menunggu',
            'total_harga' => 0,
            'catatan' => $request->catatan
        ]);

        return response()->json([
            'success' => true,
            'data' => $pesanan->load(['meja', 'user']),
            'message' => 'Pesanan berhasil dibuat'
        ]);
    }

    /**
     * Get orders for pelayan
     */
    public function getOrders(): JsonResponse
    {
        $user = request()->user();
        $pesanans = Pesanan::with(['meja', 'detailPesanans.makanan'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pesanans
        ]);
    }

    /**
     * Update table status
     */
    public function updateTableStatus(Request $request, Meja $meja): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:tersedia,terisi,dipesan,tidak_aktif'
        ]);

        $meja->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'data' => $meja,
            'message' => 'Status meja berhasil diperbarui'
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Makanan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MakananController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Makanan::query();

        // Filter by kategori
        if ($request->has('kategori') && $request->kategori !== '') {
            $query->kategori($request->kategori);
        }

        // Filter by availability
        if ($request->has('tersedia') && $request->tersedia !== '') {
            $query->where('tersedia', $request->boolean('tersedia'));
        }

        // Search by name or description
        if ($request->has('search') && $request->search !== '') {
            $query->search($request->search);
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $makanans = $query->paginate($request->get('per_page', 10));

        // Add full image URLs to makanan items
        $makanans->getCollection()->transform(function ($makanan) {
            if ($makanan->gambar) {
                $makanan->gambar = url('/storage/' . $makanan->gambar);
            }
            return $makanan;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'makanans' => $makanans->items(),
                'pagination' => [
                    'current_page' => $makanans->currentPage(),
                    'last_page' => $makanans->lastPage(),
                    'per_page' => $makanans->perPage(),
                    'total' => $makanans->total(),
                ]
            ]
        ]);
    }

    /**
     * Store a newly created resource.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori' => 'required|in:makanan,minuman,snack',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tersedia' => 'boolean',
            'stok' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Handle image upload
        if ($request->hasFile('gambar')) {
            $image = $request->file('gambar');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('makanans', $imageName, 'public');
            $data['gambar'] = 'makanans/' . $imageName;
        }

        $makanan = Makanan::create($data);

        // Add full image URL to response
        if ($makanan->gambar) {
            $makanan->gambar = url('/storage/' . $makanan->gambar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Makanan created successfully',
            'data' => $makanan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $makanan = Makanan::find($id);

        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan not found'
            ], 404);
        }

        // Add full image URL
        if ($makanan->gambar) {
            $makanan->gambar = url('/storage/' . $makanan->gambar);
        }

        return response()->json([
            'success' => true,
            'data' => $makanan
        ]);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $makanan = Makanan::find($id);

        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'sometimes|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'sometimes|numeric|min:0',
            'kategori' => 'sometimes|in:makanan,minuman,snack',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tersedia' => 'boolean',
            'stok' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        
        // Handle image upload
        if ($request->hasFile('gambar')) {
            // Delete old image
            if ($makanan->gambar) {
                Storage::disk('public')->delete($makanan->gambar);
            }
            
            $image = $request->file('gambar');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('makanans', $imageName, 'public');
            $data['gambar'] = 'makanans/' . $imageName;
        }

        $makanan->update($data);

        // Add full image URL
        if ($makanan->gambar) {
            $makanan->gambar = url('/storage/' . $makanan->gambar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Makanan updated successfully',
            'data' => $makanan
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $makanan = Makanan::find($id);

        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan not found'
            ], 404);
        }

        // Delete image if exists
        if ($makanan->gambar) {
            Storage::disk('public')->delete($makanan->gambar);
        }

        $makanan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Makanan deleted successfully'
        ]);
    }

    /**
     * Get categories
     */
    public function categories(): JsonResponse
    {
        $categories = [
            ['value' => 'makanan', 'label' => 'Makanan'],
            ['value' => 'minuman', 'label' => 'Minuman'],
            ['value' => 'snack', 'label' => 'Snack'],
        ];

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Toggle availability status
     */
    public function toggleAvailability(string $id): JsonResponse
    {
        $makanan = Makanan::find($id);

        if (!$makanan) {
            return response()->json([
                'success' => false,
                'message' => 'Makanan not found'
            ], 404);
        }

        $makanan->tersedia = !$makanan->tersedia;
        $makanan->save();

        return response()->json([
            'success' => true,
            'message' => 'Makanan availability updated',
            'data' => $makanan
        ]);
    }
}

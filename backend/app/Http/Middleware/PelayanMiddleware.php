<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PelayanMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Please login.'
            ], 401);
        }
        
        if ($user->role !== 'pelayan') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Pelayan access required.'
            ], 403);
        }

        return $next($request);
    }
}

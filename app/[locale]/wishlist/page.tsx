"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import WishlistPage from "@/views/WishlistPage";

export default function WishlistPageWrapper() {
    return (
        <ProtectedRoute>
            <WishlistPage />
        </ProtectedRoute>
    );
}

"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import AccountPage from "@/views/AccountPage";

export default function AccountPageWrapper() {
    return (
        <ProtectedRoute>
            <AccountPage />
        </ProtectedRoute>
    );
}

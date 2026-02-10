import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// USER APP
import App from "./App";

// ADMIN APP
const AdminApp = lazy(() => import("./Admin/App"));

import LoadingOverlay from "./components/LoadingOverlay";

export default function RootApp() {
    return (
        <Suspense fallback={<p>Loading application...</p>}>
            <LoadingOverlay />
            <Routes>
                {/* ✅ ADMIN SIDE FIRST */}
                <Route path="/admin/*" element={<AdminApp />} />

                {/* ✅ USER SIDE LAST */}
                <Route path="/*" element={<App />} />
            </Routes>
        </Suspense>
    );
}

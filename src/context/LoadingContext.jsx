import { createContext, useState, useContext, useCallback, useMemo } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);
    const [isActuallyLoading, setIsActuallyLoading] = useState(false);

    const startLoading = useCallback(() => {
        setLoadingCount((prev) => prev + 1);
        setIsActuallyLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setLoadingCount((prev) => {
            const next = Math.max(0, prev - 1);
            if (next === 0) {
                // Introduce an artificial delay to simulate real ecommerce app feel 
                // and ensure the modern spinner is visible
                setTimeout(() => {
                    setLoadingCount(current => {
                        if (current === 0) setIsActuallyLoading(false);
                        return current;
                    });
                }, 800); // 800ms delay
            }
            return next;
        });
    }, []);

    const isLoading = isActuallyLoading;

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        isLoading,
        startLoading,
        stopLoading
    }), [isLoading, startLoading, stopLoading]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);

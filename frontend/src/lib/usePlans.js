import { useEffect, useState } from "react";
import api from "./api";

export function usePlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get("/plans");

                console.log("Plans API Response:", response.data);

                let plansData = [];

                if (Array.isArray(response.data)) {
                    plansData = response.data;
                } else if (
                    response.data &&
                    Array.isArray(response.data.plans)
                ) {
                    plansData = response.data.plans;
                } else if (
                    response.data &&
                    Array.isArray(response.data.data)
                ) {
                    plansData = response.data.data;
                }

                if (mounted) {
                    setPlans(plansData);
                }
            } catch (err) {
                console.error("Failed to load plans:", err);

                if (mounted) {
                    setError(err);
                    setPlans([]);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchPlans();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        plans,
        loading,
        error,
    };
}
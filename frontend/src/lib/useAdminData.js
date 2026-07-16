import { useEffect, useState } from "react";
import { api } from "./api";

export function useAdminData() {
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [plans, setPlans] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [kyc, setKyc] = useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [
                usersRes,
                paymentsRes,
                plansRes,
                stocksRes,
                kycRes,
                emailsRes
            ] = await Promise.all([
                api.get("/admin/users"),
                api.get("/admin/payments"),
                api.get("/admin/plans"),
                api.get("/admin/stocks"),
                api.get("/admin/kyc"),
                api.get("/admin/emails"),
            ]);

            setUsers(usersRes.data || []);
            setPayments(paymentsRes.data || []);
            setPlans(plansRes.data || []);
            setStocks(stocksRes.data || []);
            setKyc(kycRes.data || []);
            setEmails(emailsRes.data || []);

        } catch (error) {
            console.error("Admin data error:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);


    return {
        users,
        payments,
        plans,
        stocks,
        kyc,
        emails,
        loading,
        refresh: fetchData
    };
}
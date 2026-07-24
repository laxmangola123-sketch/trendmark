import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function Portfolio() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPortfolio = async () => {
        try {
            const res = await api.get("/stocks");

            const portfolio = (res.data.stocks || []).slice(0, 6).map((stock) => ({
                ...stock,
                shares: Math.floor(Math.random() * 20) + 1,
            }));

            setStocks(portfolio);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPortfolio();

        const interval = setInterval(loadPortfolio, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="text-center py-16 text-white/50">
                Loading Portfolio...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <div className="tag-uppercase text-volt">
                    My Portfolio
                </div>

                <h1 className="font-heading text-4xl font-black">
                    Live Holdings
                </h1>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

                {stocks.map((stock) => {

                    const value = stock.price * stock.shares;

                    return (
                        <div
                            key={stock.symbol}
                            className="card-tactical rounded-xl p-5"
                        >
                            <div className="flex justify-between">

                                <div>
                                    <div className="text-2xl font-bold">
                                        {stock.symbol}
                                    </div>

                                    <div className="text-white/50 text-sm">
                                        {stock.name}
                                    </div>
                                </div>

                                {stock.change_pct >= 0 ? (
                                    <TrendingUp className="text-laser" />
                                ) : (
                                    <TrendingDown className="text-blaze" />
                                )}

                            </div>

                            <div className="mt-5">

                                <div className="text-white/40 text-xs">
                                    Shares
                                </div>

                                <div className="text-2xl font-bold">
                                    {stock.shares}
                                </div>

                            </div>

                            <div className="mt-5">

                                <div className="text-white/40 text-xs">
                                    Market Value
                                </div>

                                <div className="text-3xl font-black flex items-center gap-2">
                                    <DollarSign size={22} />
                                    {value.toFixed(2)}
                                </div>

                            </div>

                            <div
                                className={`mt-5 font-bold ${stock.change_pct >= 0
                                        ? "text-laser"
                                        : "text-blaze"
                                    }`}
                            >
                                {stock.change_pct.toFixed(2)}%
                            </div>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}
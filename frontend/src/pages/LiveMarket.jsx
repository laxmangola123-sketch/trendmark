import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export default function LiveMarkets() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("");

    const loadStocks = async () => {
        try {
            const res = await api.get("/stocks");

            setStocks(res.data.stocks || []);
            setSource(res.data.source || "");
        } catch (err) {
            console.error("Failed to load stocks", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStocks();

        const interval = setInterval(loadStocks, 30000);

        return () => clearInterval(interval);
    }, []);

    const filteredStocks = useMemo(() => {
        return stocks.filter(
            (s) =>
                s.symbol.toLowerCase().includes(search.toLowerCase()) ||
                s.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [stocks, search]);
    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                    <div className="tag-uppercase text-volt">
                        US Stock Market
                    </div>

                    <h1 className="font-heading font-black text-4xl">
                        Live Markets
                    </h1>

                    <p className="text-white/50 mt-2">
                        Real-time US market data powered by Finnhub
                    </p>
                </div>

                <button
                    onClick={loadStocks}
                    className="btn-outline px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>

            </div>

            <div className="card-tactical rounded-xl p-4">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-white/40"
                    />

                    <input
                        className="w-full bg-transparent border border-white/10 rounded-lg pl-10 pr-4 py-3 outline-none"
                        placeholder="Search AAPL, TSLA, NVDA..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </div>

            <div className="text-xs text-white/50">
                Source : {source}
            </div>

            {loading ? (

                <div className="text-center py-16 text-white/50">
                    Loading Live Market...
                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {filteredStocks.map((stock) => (

                        <div
                            key={stock.symbol}
                            className="card-tactical rounded-xl p-5 hover:border-volt transition"
                        >

                            <div className="flex justify-between items-start">

                                <div>

                                    <div className="font-heading text-2xl font-bold">
                                        {stock.symbol}
                                    </div>

                                    <div className="text-white/50 text-sm">
                                        {stock.name}
                                    </div>

                                </div>

                                {stock.direction === "up" ? (
                                    <TrendingUp
                                        className="text-laser"
                                        size={28}
                                    />
                                ) : (
                                    <TrendingDown
                                        className="text-blaze"
                                        size={28}
                                    />
                                )}

                            </div>

                            <div className="mt-6">

                                <div className="text-white/40 text-xs">
                                    Current Price
                                </div>

                                <div className="font-heading text-4xl font-black mt-1">
                                    ${Number(stock.price).toFixed(2)}
                                </div>

                            </div>

                            <div className="mt-5 flex justify-between items-center">

                                <div>

                                    <div className="text-white/40 text-xs">
                                        Change
                                    </div>

                                    <div
                                        className={`font-bold ${stock.change_pct >= 0
                                                ? "text-laser"
                                                : "text-blaze"
                                            }`}
                                    >
                                        {Number(stock.change_pct).toFixed(2)}%
                                    </div>

                                </div>

                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${stock.direction === "up"
                                            ? "bg-green-500/20 text-laser"
                                            : "bg-red-500/20 text-blaze"
                                        }`}
                                >
                                    {stock.direction === "up"
                                        ? "BUY"
                                        : "SELL"}
                                </div>

                            </div>

                            <div className="mt-5 text-[11px] text-white/40">
                                Updated :
                                {" "}
                                {new Date(
                                    stock.updated_at
                                ).toLocaleTimeString()}
                            </div>

                        </div>

                    ))}

                </div>

            )}
            {!loading && filteredStocks.length === 0 && (
                <div className="card-tactical rounded-xl p-10 text-center">
                    <h3 className="font-heading text-2xl font-bold">
                        No Stocks Found
                    </h3>

                    <p className="text-white/50 mt-2">
                        Try searching with another symbol.
                    </p>
                </div>
            )}

        </div>
    );
}
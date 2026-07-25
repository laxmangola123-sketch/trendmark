import React, { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import {
    Search,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
} from "lucide-react";

export default function LiveMarkets() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [source, setSource] = useState("");

    const marketOverview = [
        {
            name: "S&P 500",
            symbol: "^GSPC",
            value: "6,410.31",
            change: "+0.84%",
            up: true,
        },
        {
            name: "NASDAQ",
            symbol: "^IXIC",
            value: "23,845.12",
            change: "+1.16%",
            up: true,
        },
        {
            name: "DOW JONES",
            symbol: "^DJI",
            value: "45,173.52",
            change: "+0.48%",
            up: true,
        },
        {
            name: "VIX",
            symbol: "^VIX",
            value: "15.32",
            change: "-2.12%",
            up: false,
        },
    ];

    const topGainers = [
        { symbol: "NVDA", change: "+5.41%" },
        { symbol: "AMD", change: "+4.22%" },
        { symbol: "PLTR", change: "+3.87%" },
        { symbol: "META", change: "+2.91%" },
    ];

    const topLosers = [
        { symbol: "TSLA", change: "-3.84%" },
        { symbol: "INTC", change: "-2.90%" },
        { symbol: "BA", change: "-2.34%" },
        { symbol: "DIS", change: "-1.85%" },
    ];

    const loadStocks = async () => {
        try {
            const res = await api.get("/stocks");

            setStocks(res.data.stocks || []);
            setSource(res.data.source || "");
        } catch (err) {
            console.error(err);
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

            <div className="flex flex-col lg:flex-row justify-between gap-4">

                <div>

                    <div className="tag-uppercase text-volt">
                        US MARKET OVERVIEW
                    </div>

                    <h1 className="font-heading text-4xl font-black">
                        Live Markets
                    </h1>

                    <p className="text-white/50 mt-2">
                        Real-time US equities, indices and technical overview.
                    </p>

                </div>

                <button
                    onClick={loadStocks}
                    className="btn-outline px-5 py-3 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

                {marketOverview.map((item) => (

                    <div
                        key={item.symbol}
                        className="card-tactical rounded-xl p-5"
                    >

                        <div className="flex justify-between">

                            <div>

                                <div className="text-white/50 text-xs">
                                    {item.name}
                                </div>

                                <div className="font-heading text-3xl font-black mt-2">
                                    {item.value}
                                </div>

                            </div>

                            <BarChart3
                                size={30}
                                className="text-volt"
                            />

                        </div>

                        <div
                            className={`mt-4 font-bold ${item.up
                                    ? "text-laser"
                                    : "text-blaze"
                                }`}
                        >
                            {item.change}
                        </div>

                    </div>

                ))}

            </div>

            <div className="grid lg:grid-cols-2 gap-5">

                <div className="card-tactical rounded-xl p-5">

                    <div className="flex items-center gap-2 mb-4">

                        <ArrowUpRight className="text-laser" />

                        <h3 className="font-bold text-lg">
                            Top Gainers
                        </h3>

                    </div>

                    <div className="space-y-3">

                        {topGainers.map((stock) => (

                            <div
                                key={stock.symbol}
                                className="flex justify-between border-b border-white/10 pb-2"
                            >

                                <span>{stock.symbol}</span>

                                <span className="text-laser font-bold">
                                    {stock.change}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="card-tactical rounded-xl p-5">

                    <div className="flex items-center gap-2 mb-4">

                        <ArrowDownRight className="text-blaze" />

                        <h3 className="font-bold text-lg">
                            Top Losers
                        </h3>

                    </div>

                    <div className="space-y-3">

                        {topLosers.map((stock) => (

                            <div
                                key={stock.symbol}
                                className="flex justify-between border-b border-white/10 pb-2"
                            >

                                <span>{stock.symbol}</span>

                                <span className="text-blaze font-bold">
                                    {stock.change}
                                </span>

                            </div>

                        ))}

                    </div>

                </div>

            </div>

            <div className="card-tactical rounded-xl p-5">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-white/40"
                    />

                    <input
                        className="w-full bg-transparent border border-white/10 rounded-lg pl-10 pr-4 py-3 outline-none"
                        placeholder="Search AAPL, MSFT, NVDA, TSLA..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </div>

            <div className="text-xs text-white/50">
                Source: {source}
            </div>
            {loading ? (

                <div className="text-center py-20 text-white/50">
                    Loading live market...
                </div>

            ) : (

                <>

                    <div className="grid lg:grid-cols-3 gap-5">

                        <div className="card-tactical rounded-xl p-5">

                            <div className="flex items-center gap-2 mb-5">

                                <Activity className="text-volt" />

                                <h3 className="font-bold">
                                    Market Sentiment
                                </h3>

                            </div>

                            <div className="space-y-4">

                                <div className="flex justify-between">
                                    <span>Bullish</span>
                                    <span className="text-laser font-bold">
                                        72%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-white/10 rounded-full">
                                    <div className="h-2 w-[72%] rounded-full bg-green-500"></div>
                                </div>

                                <div className="flex justify-between">
                                    <span>Bearish</span>
                                    <span className="text-blaze font-bold">
                                        28%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-white/10 rounded-full">
                                    <div className="h-2 w-[28%] rounded-full bg-red-500"></div>
                                </div>

                            </div>

                        </div>

                        <div className="lg:col-span-2 card-tactical rounded-xl p-5">

                            <h3 className="font-bold mb-5">
                                Technical Ratings
                            </h3>

                            <div className="grid md:grid-cols-4 gap-4">

                                {[
                                    ["S&P 500", "BUY", "bg-green-500/20 text-laser"],
                                    ["NASDAQ", "STRONG BUY", "bg-green-500/20 text-laser"],
                                    ["DOW", "BUY", "bg-green-500/20 text-laser"],
                                    ["VIX", "SELL", "bg-red-500/20 text-blaze"],
                                ].map(([name, rating, cls]) => (

                                    <div
                                        key={name}
                                        className="border border-white/10 rounded-lg p-4"
                                    >

                                        <div className="text-white/50 text-sm">
                                            {name}
                                        </div>

                                        <div
                                            className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${cls}`}
                                        >
                                            {rating}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        {filteredStocks.map((stock) => (

                            <div
                                key={stock.symbol}
                                className="card-tactical rounded-xl p-5 hover:border-volt transition"
                            >

                                <div className="flex justify-between">

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

                                <div className="mt-5 flex justify-between">

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
                                    Updated{" "}
                                    {new Date(
                                        stock.updated_at
                                    ).toLocaleTimeString()}
                                </div>

                            </div>

                        ))}

                    </div>

                </>

            )}

            {!loading && filteredStocks.length === 0 && (

                <div className="card-tactical rounded-xl p-10 text-center">

                    <h2 className="font-heading text-3xl font-bold">
                        No Stocks Found
                    </h2>

                    <p className="text-white/50 mt-2">
                        Try another stock symbol.
                    </p>

                </div>

            )}

        </div>
    );
}
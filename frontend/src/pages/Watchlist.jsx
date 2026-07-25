import React, { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Trash2,
    Star,
    RefreshCw,
} from "lucide-react";

import {
    getWatchlist,
    searchStocks,
    addWatchlist,
    removeWatchlist,
} from "../lib/api";

export default function Watchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadWatchlist() {
        try {
            setLoading(true);

            const res = await getWatchlist();

            setWatchlist(res.data.watchlist || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadWatchlist();
    }, []);

    async function doSearch(text) {
        setQuery(text);

        if (!text.trim()) {
            setResults([]);
            return;
        }

        try {
            const res = await searchStocks(text);

            setResults(res.data.stocks || []);
        } catch (e) {
            console.error(e);
        }
    }

    async function add(stock) {
        try {
            await addWatchlist(stock.symbol, stock.name);

            setResults([]);

            setQuery("");

            loadWatchlist();
        } catch (e) {
            console.error(e);
        }
    }

    async function remove(symbol) {
        try {
            await removeWatchlist(symbol);

            loadWatchlist();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="space-y-6">

            <div>
                <div className="tag-uppercase text-volt">
                    Watchlist
                </div>

                <h1 className="font-heading font-black text-4xl">
                    My Watchlist
                </h1>

                <p className="text-white/50 mt-2">
                    Save your favorite US stocks.
                </p>
            </div>

            <div className="card-tactical rounded-xl p-5">

                <div className="relative">

                    <Search
                        className="absolute left-3 top-3 text-white/40"
                        size={18}
                    />

                    <input
                        className="w-full bg-transparent border border-white/10 rounded-lg pl-10 pr-4 py-3"
                        placeholder="Search AAPL, NVDA, TSLA..."
                        value={query}
                        onChange={(e) => doSearch(e.target.value)}
                    />

                </div>

                {results.length > 0 && (

                    <div className="mt-4 space-y-2">

                        {results.map((stock) => (

                            <div
                                key={stock.symbol}
                                className="flex justify-between items-center border border-white/10 rounded-lg px-4 py-3"
                            >

                                <div>
                                    <div className="font-bold">
                                        {stock.symbol}
                                    </div>

                                    <div className="text-white/50 text-sm">
                                        {stock.name}
                                    </div>
                                </div>

                                <button
                                    onClick={() => add(stock)}
                                    className="btn-primary px-3 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add
                                </button>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            <div className="flex justify-between items-center">

                <h2 className="font-heading text-2xl">
                    ⭐ My Stocks
                </h2>

                <button
                    onClick={loadWatchlist}
                    className="btn-outline px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>

            </div>

            {loading ? (

                <div className="card-tactical rounded-xl p-10 text-center">
                    Loading...
                </div>

            ) : watchlist.length === 0 ? (

                <div className="card-tactical rounded-xl p-10 text-center">

                    <Star
                        className="mx-auto mb-4 text-yellow-400"
                        size={40}
                    />

                    <h2 className="text-2xl font-bold">
                        No Favorite Stocks
                    </h2>

                    <p className="text-white/50 mt-3">
                        Search any US stock and add it to your watchlist.
                    </p>

                </div>

            ) : (

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

                    {watchlist.map((stock) => (

                        <div
                            key={stock.symbol}
                            className="card-tactical rounded-xl p-5"
                        >

                            <div className="flex justify-between">

                                <div>

                                    <div className="text-2xl font-bold">
                                        {stock.symbol}
                                    </div>

                                    <div className="text-white/50">
                                        {stock.name}
                                    </div>

                                </div>

                                <button
                                    onClick={() => remove(stock.symbol)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={18} />
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}
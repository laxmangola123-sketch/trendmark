import React, { useEffect, useRef, useState } from "react";

export default function TradingChart() {
    const container = useRef(null);

    const [symbol, setSymbol] = useState("NASDAQ:AAPL");

    useEffect(() => {
        container.current.innerHTML = "";

        const script = document.createElement("script");

        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

        script.type = "text/javascript";
        script.async = true;

        script.innerHTML = JSON.stringify({
            autosize: true,
            symbol: symbol,
            interval: "1",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            allow_symbol_change: true,
            save_image: true,
            hide_top_toolbar: false,
            hide_side_toolbar: false,
            withdateranges: true,
            studies: [
                "RSI@tv-basicstudies",
                "MACD@tv-basicstudies",
                "MASimple@tv-basicstudies",
                "BB@tv-basicstudies",
                "Volume@tv-basicstudies"
            ],
            container_id: "tv_chart"
        });

        container.current.appendChild(script);
    }, [symbol]);

    const stocks = [
        "NASDAQ:AAPL",
        "NASDAQ:MSFT",
        "NASDAQ:NVDA",
        "NASDAQ:TSLA",
        "NASDAQ:AMZN",
        "NASDAQ:META",
        "NASDAQ:GOOGL",
        "NASDAQ:AMD",
        "NASDAQ:NFLX",
        "AMEX:SPY"
    ];

    return (
        <div className="space-y-5">

            <div className="flex flex-wrap gap-3">

                <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="bg-black border border-white/10 rounded-lg px-4 py-3"
                >
                    {stocks.map((stock) => (
                        <option key={stock} value={stock}>
                            {stock}
                        </option>
                    ))}
                </select>

            </div>

            <div
                className="card-tactical rounded-xl overflow-hidden"
                style={{ height: "800px" }}
            >
                <div
                    id="tv_chart"
                    ref={container}
                    style={{ height: "100%", width: "100%" }}
                />
            </div>

        </div>
    );
}
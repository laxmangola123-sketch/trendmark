import React from "react";
import TradingChart from "../components/TradingChart";

export default function Analytics() {
    return (
        <div className="space-y-6">

            <div>
                <div className="tag-uppercase text-volt">
                    Technical Analysis
                </div>

                <h1 className="font-heading font-black text-4xl">
                    Live US Stock Charts
                </h1>

                <p className="text-white/50 mt-2">
                    Real-time TradingView charts with multiple timeframes.
                </p>
            </div>

            <TradingChart />

        </div>
    );
}
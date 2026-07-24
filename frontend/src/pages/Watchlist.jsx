import React from "react";

export default function Watchlist() {
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
                    Save your favorite US stocks here.
                </p>
            </div>

            <div className="card-tactical rounded-xl p-10 text-center">
                <h2 className="font-heading text-3xl font-bold">
                    ⭐ Watchlist
                </h2>

                <p className="text-white/50 mt-4">
                    Add your favorite US stocks and monitor them in real time.
                </p>
            </div>

        </div>
    );
}
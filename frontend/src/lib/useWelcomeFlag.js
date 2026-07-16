import { useState, useEffect } from "react";

export function useWelcomeFlag() {
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const flag = localStorage.getItem("welcomeShown");

        if (!flag) {
            setShowWelcome(true);
        }
    }, []);

    const markWelcomeShown = () => {
        localStorage.setItem("welcomeShown", "true");
        setShowWelcome(false);
    };

    return {
        showWelcome,
        markWelcomeShown,
    };
}


export function toneForCount(count) {
    if (count >= 10) return "high";
    if (count >= 5) return "medium";
    return "low";
}
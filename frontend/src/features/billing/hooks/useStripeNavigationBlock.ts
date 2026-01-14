import * as React from "react";

// Forces full page reload when navigating away from checkout to stop Stripe beacons
export function useStripeNavigationBlock() {
    React.useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (anchor && anchor.href && !anchor.href.includes("/account/checkout")) {
                e.preventDefault();
                window.location.href = anchor.href;
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);
}

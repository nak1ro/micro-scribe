"use client";

import { useConfirmEmail } from "../../hooks/useConfirmEmail";
import { useEmailResend } from "../../hooks/useEmailResend";
import { ConfirmEmailVerify } from "./ConfirmEmailVerify";
import { ConfirmEmailSuccess } from "./ConfirmEmailSuccess";
import { ConfirmEmailError } from "./ConfirmEmailError";

export function ConfirmEmailContent() {
    const { state, errorMessage, isLoggedIn } = useConfirmEmail();
    const { email, setEmail, isLoading, isSuccess, handleResend } = useEmailResend();

    if (state === "verifying") {
        return <ConfirmEmailVerify />;
    }

    if (state === "success") {
        return <ConfirmEmailSuccess isLoggedIn={isLoggedIn} />;
    }

    if (state === "error") {
        return (
            <ConfirmEmailError
                errorMessage={errorMessage}
                email={email}
                onEmailChange={(e) => setEmail(e.target.value)}
                onResend={handleResend}
                resendLoading={isLoading}
                resendSuccess={isSuccess}
            />
        );
    }

    return null;
}

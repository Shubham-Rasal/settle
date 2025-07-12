"use server";
import { authClient } from "@/lib/auth/client";

export const getSession = async () => {
    const session = await authClient.getSession();
    return session;
};


// src/types/auth.ts
// Types

import { Profile } from "./profile";

export interface User {
    id: string;
    email: string;
    email_confirmed_at?: string;
    last_sign_in_at?: string;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}


// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
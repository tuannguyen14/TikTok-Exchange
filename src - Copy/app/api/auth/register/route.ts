// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

interface RegisterRequest {
    email: string;
    password: string;
}

export async function POST(request: NextRequest) {
    try {
        const { email, password }: RegisterRequest = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();

        console.log(email, password);
        // Register with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            let errorMessage = 'Có lỗi xảy ra khi đăng ký';

            if (error.message.includes('User already registered')) {
                errorMessage = 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.';
            } else if (error.message.includes('Invalid email')) {
                errorMessage = 'Email không hợp lệ';
            } else if (error.message.includes('Password')) {
                errorMessage = 'Mật khẩu không đủ mạnh';
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: 400 }
            );
        }

        if (data.user) {
            return NextResponse.json({
                user: data.user,
                message: data.user.email_confirmed_at
                    ? 'Đăng ký thành công!'
                    : 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
            });
        }

        return NextResponse.json(
            { error: 'Không thể tạo tài khoản' },
            { status: 500 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.' },
            { status: 500 }
        );
    }
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://kdbackend.ryban.ru/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: login.trim(),
                    password: password
                }),
            });

            console.log('Статус ответа:', response.status);

            const data = await response.json();
            console.log('Ответ от бэкенда:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Неверный логин или пароль');
            }

            if (!data.token) {
                throw new Error('Токен не пришёл от сервера');
            }

            localStorage.setItem('token', data.token);
            console.log('✅ Токен сохранён!');

            router.push('/');
            router.refresh();

        } catch (err: any) {
            console.error('Ошибка входа:', err);
            setError(err.message || 'Не удалось подключиться к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05040b] text-white relative overflow-hidden flex items-center justify-center">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,#2a1b5f_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.18),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.18),transparent_50%)]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="text-center mb-10">
                    <Link href="/" className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-4xl shadow-[0_0_30px_#a855f7]">
                            K
                        </div>
                        <span className="text-4xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>
                    <h1 className="text-3xl font-bold">Вход в аккаунт</h1>
                </div>

                <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Логин</label>
                            <input
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                placeholder="testuser10"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                placeholder="12121212"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 font-semibold text-lg hover:brightness-110 disabled:opacity-70 transition-all"
                        >
                            {loading ? 'ВХОДИМ...' : 'ВОЙТИ'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-500 mt-6">
                    Тестовые данные уже заполнены
                </p>
            </div>
        </div>
    );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        login: '',
        password: '',
        email: '',
        name: '',
        surname: '',
        phone: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        let formatted = '+7';

        if (numbers.length > 1) {
            formatted += ' (' + numbers.slice(1, 4);
        }
        if (numbers.length > 4) {
            formatted += ') ' + numbers.slice(4, 7);
        }
        if (numbers.length > 7) {
            formatted += '-' + numbers.slice(7, 9);
        }
        if (numbers.length > 9) {
            formatted += '-' + numbers.slice(9, 11);
        }

        return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            setFormData({ ...formData, phone: formatPhone(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!formData.login || !formData.password || !formData.email || !formData.name || !formData.surname) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError('Введите корректный email адрес');
            return;
        }

        if (formData.password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов');
            return;
        }

        if (formData.phone && formData.phone.length < 16) {
            setError('Введите полный номер телефона');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://kdbackend.ryban.ru/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Login: formData.login,
                    Password: formData.password,
                    Email: formData.email,
                    Name: formData.name,
                    Surname: formData.surname,
                    Phone: formData.phone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Ошибка при регистрации');
            }

            alert('✅ Аккаунт успешно создан! Теперь войдите в систему.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Произошла ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05040b] text-white relative overflow-hidden flex items-center justify-center">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,#2a1b5f_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]" />
            </div>

            <div className="relative z-10 w-full max-w-lg px-6 py-12">
                <div className="text-center mb-10">
                    <Link href="/" className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-4xl shadow-[0_0_30px_#a855f7]">
                            K
                        </div>
                        <span className="text-4xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight">Создать аккаунт</h1>
                    <p className="text-zinc-400 mt-3">Начни собирать свои уникальные клавиатуры</p>
                </div>

                <div className="bg-zinc-900/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Имя</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                    placeholder="Антон"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Фамилия</label>
                                <input
                                    type="text"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                    placeholder="Сергеевич"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Логин</label>
                                <input
                                    type="text"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                    placeholder="testuser10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Телефон</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                    placeholder="+7 (999) 123-45-67"
                                    maxLength={18}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                placeholder="user10@gmail.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-6 py-4 focus:border-cyan-400 focus:outline-none transition"
                                placeholder="Минимум 8 символов"
                                required
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
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 font-semibold text-lg hover:brightness-110 active:scale-[0.985] transition-all disabled:opacity-70 shadow-xl shadow-purple-500/30 mt-2"
                        >
                            {loading ? 'СОЗДАЁМ АККАУНТ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
                        </button>
                    </form>

                    <div className="text-center mt-8 text-sm text-zinc-400">
                        Уже есть аккаунт?{' '}
                        <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
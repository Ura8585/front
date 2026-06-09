'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="min-h-screen bg-[#05040b] text-white">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <Link href="/" className="text-3xl font-black">KDB<span className="text-cyan-400">.</span>APP</Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-black mb-4">Техподдержка</h1>
                <p className="text-zinc-400 mb-12">Есть вопросы или проблемы? Напиши нам — ответим в течение 24 часов.</p>

                {sent ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-10 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-emerald-400">Заявка отправлена!</h2>
                        <p className="text-zinc-400 mt-2">Мы свяжемся с тобой по email в ближайшее время.</p>
                        <Link href="/" className="mt-6 inline-block px-8 py-3 bg-white text-black rounded-2xl font-bold">На главную</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Тема обращения</label>
                            <select className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-400 outline-none">
                                <option>Проблема с заказом</option>
                                <option>Вопрос по конфигуратору</option>
                                <option>Предложение по улучшению</option>
                                <option>Другое</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Email для связи</label>
                            <input type="email" className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-400 outline-none" placeholder="your@email.com" required />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Описание проблемы</label>
                            <textarea className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 focus:border-cyan-400 outline-none h-40" placeholder="Опиши проблему подробнее..." required />
                        </div>
                        <button type="submit" className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-bold text-lg hover:brightness-110 transition">
                            Отправить заявку
                        </button>
                    </form>
                )}

                <div className="mt-16 grid grid-cols-3 gap-6">
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                        <div className="text-3xl mb-3">📧</div>
                        <h3 className="font-bold">Email</h3>
                        <p className="text-zinc-400 text-sm">support@kdb.app</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                        <div className="text-3xl mb-3">💬</div>
                        <h3 className="font-bold">Telegram</h3>
                        <p className="text-zinc-400 text-sm">@kdb_support</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 text-center">
                        <div className="text-3xl mb-3">📞</div>
                        <h3 className="font-bold">Телефон</h3>
                        <p className="text-zinc-400 text-sm">8-800-KDB-HELP</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
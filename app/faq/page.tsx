'use client';

import Link from 'next/link';

const faq = [
    { q: 'Как создать клавиатуру?', a: 'Перейди в Конфигуратор, выбери раскладку, цвета, свитчи и нажми "Отправить сборку".' },
    { q: 'Сколько стоит доставка?', a: 'Доставка рассчитывается при оформлении заказа. Средняя стоимость по РФ — 500₽.' },
    { q: 'Как долго собирается заказ?', a: 'Обычно 3-7 рабочих дней после подтверждения. Ты можешь отслеживать статус в личном кабинете.' },
    { q: 'Можно ли вернуть клавиатуру?', a: 'Да, в течение 14 дней после получения, если она не была в использовании.' },
    { q: 'Как опубликовать сборку в галерее?', a: 'В личном кабинете у заказа нажми кнопку "🌐 В галерею" и введи название.' },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-[#05040b] text-white">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <Link href="/" className="text-3xl font-black">KDB<span className="text-cyan-400">.</span>APP</Link>
                </div>
            </header>
            <main className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-black mb-12">Частые вопросы</h1>
                <div className="space-y-4">
                    {faq.map((item, i) => (
                        <details key={i} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 cursor-pointer group">
                            <summary className="font-bold text-lg list-none flex justify-between items-center">
                                {item.q}
                                <span className="text-zinc-500 group-open:rotate-45 transition-transform text-xl">+</span>
                            </summary>
                            <p className="mt-4 text-zinc-400">{item.a}</p>
                        </details>
                    ))}
                </div>
            </main>
        </div>
    );
}
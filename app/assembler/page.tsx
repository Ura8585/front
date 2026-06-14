'use client';

import React from 'react';
import Link from 'next/link';

export default function AssemblerPage() {
    // Заглушка с тестовыми заказами
    const testOrders = [
        {
            id: 1001,
            userLogin: 'cyber_user',
            totalPrice: 12500,
            status: 'В обработке',
            statusId: 2,
            caseName: 'Tofu60 Pro',
            caseColor: '#22d3ee',
            switchType: 'linear',
            keycapName: 'GMK Laser',
            layout: '80',
            hasCustomPrint: true,
            shippingAddress: 'Москва, ул. Тверская, д. 15, кв. 42'
        },
        {
            id: 1002,
            userLogin: 'keeb_master',
            totalPrice: 18900,
            status: 'Собирается',
            statusId: 6,
            caseName: 'KBDfans D84',
            caseColor: '#a855f7',
            switchType: 'tactile',
            keycapName: 'SA Dreameater',
            layout: '100',
            hasCustomPrint: false,
            shippingAddress: 'СПб, Невский пр., д. 88, кв. 12'
        },
        {
            id: 1003,
            userLogin: 'clicky_fan',
            totalPrice: 9500,
            status: 'В обработке',
            statusId: 2,
            caseName: 'Akko MOD007',
            caseColor: '#141416',
            switchType: 'clicky',
            keycapName: 'Osume Dalgona',
            layout: '80',
            hasCustomPrint: true,
            shippingAddress: 'Казань, ул. Баумана, д. 5'
        }
    ];

    const pendingOrders = testOrders.filter(o => o.statusId === 2);
    const inProgressOrders = testOrders.filter(o => o.statusId === 6);

    const [localOrders, setLocalOrders] = React.useState(testOrders);

    const startAssembly = (id: number) => {
        setLocalOrders(localOrders.map(o => o.id === id ? { ...o, status: 'Собирается', statusId: 6 } : o));
    };

    const completeAssembly = (id: number) => {
        setLocalOrders(localOrders.map(o => o.id === id ? { ...o, status: 'Собран', statusId: 3 } : o));
    };

    return (
        <div className="min-h-screen bg-[#05040b] text-white">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center font-black text-2xl">🔧</div>
                        <span className="text-3xl font-black">ЦЕХ<span className="text-emerald-400">.</span>СБОРКИ</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold">ДЕМО-РЕЖИМ</span>
                        <Link href="/admin" className="text-sm text-zinc-400 hover:text-white">← Админка</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-4xl font-black text-amber-400">{pendingOrders.length}</p>
                        <p className="text-sm text-zinc-400">Ожидают сборки</p>
                    </div>
                    <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-4xl font-black text-cyan-400">{inProgressOrders.length}</p>
                        <p className="text-sm text-zinc-400">В процессе</p>
                    </div>
                    <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-4xl font-black text-emerald-400">{localOrders.filter(o => o.statusId === 3).length}</p>
                        <p className="text-sm text-zinc-400">Собрано</p>
                    </div>
                </div>

                {localOrders.filter(o => o.statusId !== 3).length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        <p className="text-4xl mb-4">✅</p>
                        <p className="text-xl">Все заказы собраны!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {localOrders.filter(o => o.statusId !== 3).map(order => (
                            <div key={order.id} className={`bg-zinc-900/70 border rounded-3xl p-8 ${order.statusId === 6 ? 'border-cyan-500/30' : 'border-white/10'}`}>
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl font-black">Заказ #{order.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.statusId === 6 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400">Заказчик: <span className="text-white font-bold">{order.userLogin}</span></p>
                                        <p className="text-zinc-400 text-sm mt-1">Адрес: {order.shippingAddress}</p>
                                        <p className="text-2xl font-bold mt-3 text-cyan-400">{order.totalPrice.toLocaleString('ru-RU')} ₽</p>
                                    </div>

                                    <div className="flex-1 bg-zinc-800/50 rounded-2xl p-5">
                                        <h4 className="font-bold mb-3">📋 Сборочный лист</h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-zinc-500">Раскладка: </span><span className="text-cyan-400 font-bold">{order.layout === '100' ? 'Full-size' : '80% TKL'}</span></div>
                                            <div><span className="text-zinc-500">Корпус: </span><span className="text-white">{order.caseName}</span></div>
                                            <div>
                                                <span className="text-zinc-500">Цвет корпуса: </span>
                                                <span className="inline-block w-5 h-5 rounded border border-white/20 align-middle ml-1" style={{ backgroundColor: order.caseColor }}></span>
                                            </div>
                                            <div><span className="text-zinc-500">Кейкапы: </span><span className="text-white">{order.keycapName}</span></div>
                                            <div><span className="text-zinc-500">Свитчи: </span><span className="text-amber-400 capitalize font-bold">{order.switchType}</span></div>
                                            <div><span className="text-zinc-500">Принт: </span>{order.hasCustomPrint ? <span className="text-emerald-400">🎨 Да</span> : <span className="text-zinc-500">Нет</span>}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center gap-3 min-w-[220px]">
                                        {order.statusId === 2 && (
                                            <button onClick={() => startAssembly(order.id)} className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition text-sm shadow-lg shadow-cyan-500/30">
                                                🔧 НАЧАТЬ СБОРКУ
                                            </button>
                                        )}
                                        {order.statusId === 6 && (
                                            <button onClick={() => completeAssembly(order.id)} className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition text-sm shadow-lg shadow-emerald-500/30">
                                                ✅ СОБРАНО
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
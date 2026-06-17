'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
    id: number;
    login: string;
    email: string;
    name?: string;
    surname?: string;
    avatarUrl?: string | null;
}

interface Order {
    id: number;
    configurationId: number;
    totalPrice: number;
    quantity: number;
    status: string;
    createdAt: string;
    shippingAddress?: string;
    contactEmail?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const base = 'http://89.109.16.50:8968';

                const profileRes = await fetch(`${base}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (profileRes.ok) setUser(await profileRes.json());

                const ordersRes = await fetch(`${base}/api/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (ordersRes.ok) {
                    setOrders(await ordersRes.json());
                }
            } catch (err: any) {
                console.error(err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://89.109.16.50:8968/api/users/upload-avatar', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Ошибка загрузки');

            if (user) setUser({ ...user, avatarUrl: data.avatarUrl });
            setUploadMessage('Аватарка успешно обновлена ✓');
        } catch (err: any) {
            setUploadMessage(`Ошибка: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/');
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Уверен, что хочешь отменить заказ?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://89.109.16.50:8968/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Ошибка отмены');

            const ordersRes = await fetch('http://89.109.16.50:8968/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ordersRes.ok) setOrders(await ordersRes.json());
        } catch (err: any) {
            alert(err.message);
        }
    };
    const handlePublishToGallery = async (configId: number) => {
        const title = prompt('Название для галереи:', 'Моя сборка');
        if (!title) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://89.109.16.50:8968/api/gallery/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ configId, title })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Опубликовано в галерее! 🎉');
            } else {
                alert(data.error || 'Ошибка');
            }
        } catch (err: any) {
            alert('Ошибка сети');
        }
    };
    const getStatusInfo = (status: string) => {
        const map: any = {
            'Новый': { text: 'Новый', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
            'В обработке': { text: 'В обработке', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
            'Собран': { text: 'Собран', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
            'Доставлен': { text: 'Доставлен', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
            'Отменён': { text: 'Отменён', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
        };
        return map[status] || { text: status, color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
    };

    const canEditOrder = (status: string) => {
        return status === 'В обработке' || status === 'Новый';
    };

    const canChangeConfig = (status: string) => {
        return status === 'Новый';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05040b] flex items-center justify-center text-cyan-400 font-mono tracking-widest">
                ЗАГРУЗКА ПРОФИЛЯ...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05040b] text-white relative overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,#2a1b5f_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.12),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.12),transparent_50%)]" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl shadow-[0_0_25px_#a855f7]">
                            K
                        </div>
                        <span className="text-3xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>
                    <button onClick={handleLogout} className="px-6 py-2.5 rounded-2xl border border-white/10 hover:bg-red-500/10 hover:text-red-400 transition">
                        Выйти
                    </button>
                </div>
                <Link href="/gallery" className="text-sm text-zinc-400 hover:text-white transition">Галерея</Link>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-black tracking-tighter mb-2">Личный кабинет</h1>
                <p className="text-zinc-400">Добро пожаловать, {user?.login}</p>
                <div className="mt-12 bg-zinc-900/70 border border-white/10 backdrop-blur-2xl rounded-3xl p-10">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="flex flex-col items-center">
                            <div className="relative group w-40 h-40 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                                {user?.avatarUrl ? (
                                    <img src={`http://89.109.16.50:8968${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-6xl font-black text-zinc-700">
                                        {user?.login?.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={uploading} />
                                    <span className="text-sm font-medium">{uploading ? 'Загрузка...' : 'Сменить фото'}</span>
                                </label>
                            </div>
                            {uploadMessage && <p className="text-cyan-400 text-sm mt-3">{uploadMessage}</p>}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-4xl font-bold">{user?.login}</h2>
                            <p className="text-zinc-400 text-lg">{user?.email}</p>
                            <div className="mt-8 grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-xs text-zinc-500">Имя</p>
                                    <p className="text-xl">{user?.name || 'Не указано'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500">Фамилия</p>
                                    <p className="text-xl">{user?.surname || 'Не указано'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        Мои заказы <span className="text-sm font-normal text-zinc-500">({orders.length})</span>
                    </h2>

                    {orders.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-16 text-center">
                            <p className="text-zinc-400 text-lg">У тебя пока нет заказов</p>
                            <Link href="/configurator" className="mt-6 inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold">
                                Собрать первую клавиатуру →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                const canEdit = canEditOrder(order.status);
                                const canConfig = canChangeConfig(order.status);

                                return (
                                    <div key={order.id} className="bg-zinc-900/70 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div>
                                                <p className="text-sm text-zinc-500">Заказ #{order.id}</p>
                                                <p className="text-3xl font-bold mt-1">{(order.totalPrice * (order.quantity || 1)).toLocaleString('ru-RU')} ₽</p>
                                                <p className="text-sm text-zinc-400 mt-2">
                                                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                                                </p>
                                            </div>

                                            <div className={`px-6 py-3 rounded-2xl text-sm font-medium border self-start ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </div>

                                            <div className="text-sm text-zinc-400 max-w-md">
                                                <p className="text-xs text-zinc-500 mb-1">Адрес доставки:</p>
                                                <p>{order.shippingAddress || 'Не указан'}</p>
                                            </div>
                                        </div>
                                        {canEdit && (
                                            <div className="flex gap-3 pt-4 border-t border-white/5 flex-wrap">
                                                {/* Изменить адрес — переход на чекаут */}
                                                <Link
                                                    href={`/checkout?configId=${order.configurationId}&orderId=${order.id}&editMode=true`}
                                                    className="px-6 py-2.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition"
                                                >
                                                    ✏️ Изменить адрес
                                                </Link>

                                                {/* Изменить конфигурацию — только для Новый */}
                                                {canConfig && (
                                                    <Link
                                                        href={`/configurator?configId=${order.configurationId}&editMode=true`}
                                                        className="px-6 py-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition"
                                                    >
                                                        🔧 Изменить конфигурацию
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="px-6 py-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-bold hover:bg-rose-500/20 transition"
                                                >
                                                    Отменить заказ
                                                </button>
                                                <button
                                                    onClick={() => handlePublishToGallery(order.configurationId)}
                                                    className="px-6 py-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition"
                                                >
                                                    🌐 В галерею
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/configurator" className="rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-600 p-10 text-center hover:brightness-110 transition-all">
                        <p className="text-3xl font-bold">Собрать новую клавиатуру</p>
                    </Link>
                    <Link href="/" className="rounded-3xl border border-white/10 p-10 text-center hover:bg-white/5 transition-all">
                        <p className="text-3xl font-bold">Вернуться в магазин</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
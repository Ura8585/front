'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ComponentItem {
    id: number;
    name: string;
    price: number;
}

interface ConfigurationDetails {
    configurationId: number;
    case: ComponentItem | null;
    switch: ComponentItem | null;
    keycap: ComponentItem | null;
    totalPrice: number;
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const configId = searchParams.get('configId');
    const orderId = searchParams.get('orderId');
    const editMode = searchParams.get('editMode') === 'true';

    const [config, setConfig] = useState<ConfigurationDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [shippingAddress, setShippingAddress] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [quantity, setQuantity] = useState(1);

    const [orderLoading, setOrderLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
    const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
    useEffect(() => {
        if (!configId) {
            setError('Конфигурация не найдена');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const base = 'https://kdbackend.ryban.ru';
                const token = localStorage.getItem('token')!;
                const profileRes = await fetch(`${base}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                let userEmail = '';
                if (profileRes.ok) {
                    const p = await profileRes.json();
                    userEmail = p.email || '';
                }
                const configRes = await fetch(`${base}/api/configurations/${configId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (configRes.ok) setConfig(await configRes.json());
                if (editMode && orderId) {
                    const ordersRes = await fetch(`${base}/api/orders/my-orders`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (ordersRes.ok) {
                        const orders = await ordersRes.json();
                        const currentOrder = orders.find((o: any) => o.id === Number(orderId));
                        if (currentOrder) {
                            setShippingAddress(currentOrder.shippingAddress || '');
                            setContactEmail(currentOrder.contactEmail || userEmail);
                        } else {
                            setContactEmail(userEmail);
                        }
                    } else {
                        setContactEmail(userEmail);
                    }
                } else {
                    setContactEmail(userEmail);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [configId, router, editMode, orderId]);
    useEffect(() => {
        if (loading || error || !config || successOrderId) return;

        const initializeMap = async () => {
            try {
                const leafletScript = document.createElement('script');
                leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                document.head.appendChild(leafletScript);

                const leafletCSS = document.createElement('link');
                leafletCSS.rel = 'stylesheet';
                leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(leafletCSS);

                await new Promise(resolve => { leafletScript.onload = resolve; });

                const L = (window as any).L;
                if (!L) return;

                const mapElement = document.getElementById('map');
                if (!mapElement) return;

                const map = L.map('map', { attributionControl: false }).setView([55.75, 37.62], 11);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                const marker = L.marker([55.75, 37.62], { draggable: true }).addTo(map);

                marker.on('dragend', function () {
                    const pos = marker.getLatLng();
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
                        .then(r => r.json())
                        .then(data => {
                            if (data.display_name) {
                                setShippingAddress(data.display_name);
                                const input = document.getElementById('address_search') as HTMLInputElement;
                                if (input) input.value = data.display_name;
                            }
                        });
                });

                map.on('click', function (e: any) {
                    marker.setLatLng(e.latlng);
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
                        .then(r => r.json())
                        .then(data => {
                            if (data.display_name) setShippingAddress(data.display_name);
                        });
                });

            } catch (e) {
                console.error("Ошибка карты:", e);
            }
        };

        initializeMap();
    }, [loading, error, config, successOrderId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            setOrderStatus('Укажите адрес доставки');
            return;
        }

        setOrderLoading(true);
        setOrderStatus(null);

        try {
            const token = localStorage.getItem('token');

            if (editMode && orderId) {
                const response = await fetch(`https://kdbackend.ryban.ru/api/orders/${orderId}/update`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        shippingAddress: shippingAddress
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Ошибка обновления');

                setSuccessOrderId(Number(orderId));
            } else {
                const response = await fetch('https://kdbackend.ryban.ru/api/orders/place', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        configurationId: Number(configId),
                        shippingAddress,
                        contactEmail,
                        quantity,
                        totalPrice: (config?.totalPrice || 0) * quantity
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || data.message || 'Ошибка');

                setSuccessOrderId(data.orderId);
            }
        } catch (err: any) {
            setOrderStatus(`Ошибка: ${err.message}`);
        } finally {
            setOrderLoading(false);
        }
    };

    if (successOrderId) {
        return (
            <div className="min-h-screen bg-[#05040b] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6">{editMode ? '✅' : '🎉'}</div>
                    <h1 className="text-5xl font-black text-emerald-400">
                        {editMode ? 'Заказ обновлён!' : `Заказ #${successOrderId}`}
                    </h1>
                    <p className="mt-4 text-xl text-emerald-400">
                        {editMode ? 'Адрес доставки изменён' : 'Успешно оформлен!'}
                    </p>
                    <Link href="/profile" className="mt-10 inline-block bg-white text-black px-10 py-4 rounded-2xl font-semibold">
                        Перейти в профиль
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05040b] text-white relative overflow-hidden">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl shadow-[0_0_25px_#a855f7]">
                            K
                        </div>
                        <span className="text-3xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7">
                        <h1 className="text-4xl font-black tracking-tighter mb-2">
                            {editMode ? 'Изменение адреса доставки' : 'Оформление заказа'}
                        </h1>
                        {editMode && (
                            <p className="text-zinc-400 text-sm">Заказ #{orderId}</p>
                        )}

                        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Email</label>
                                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-3xl px-6 py-4 focus:border-cyan-400" required />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Адрес доставки</label>
                                <input
                                    id="address_search"
                                    type="text"
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-3xl px-6 py-4 focus:border-cyan-400"
                                    placeholder="Москва, Тверская ул., 1"
                                    required
                                />
                                <div id="map" style={{ height: "420px", marginTop: "12px" }} className="rounded-3xl border border-white/10 overflow-hidden" />
                            </div>

                            {orderStatus && (
                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-400 text-sm">
                                    {orderStatus}
                                </div>
                            )}

                            <button type="submit" disabled={orderLoading} className="w-full py-5 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 font-semibold text-xl hover:brightness-110 disabled:opacity-70">
                                {orderLoading ? 'СОХРАНЕНИЕ...' : editMode ? 'СОХРАНИТЬ АДРЕС' : 'ПОДТВЕРДИТЬ ЗАКАЗ'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-24 bg-zinc-900/70 border border-white/10 rounded-3xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Твоя сборка</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between"><span className="text-zinc-400">Корпус</span><span>{config?.case?.name || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">Свитчи</span><span>{config?.switch?.name || '—'}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">Кейкапы</span><span>{config?.keycap?.name || '—'}</span></div>
                            </div>
                            <div className="border-t border-white/10 mt-8 pt-6 flex justify-between text-3xl font-black">
                                <span>Итого</span>
                                <span>{(config?.totalPrice || 0) * quantity} ₽</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#05040b] flex items-center justify-center text-cyan-400">Загрузка...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
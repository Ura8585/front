'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'orders' | 'users' | 'gallery' | 'components' | 'stats';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [gallery, setGallery] = useState<any[]>([]);
    const [components, setComponents] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    // Форма добавления компонента
    const [showAddComponent, setShowAddComponent] = useState(false);
    const [compForm, setCompForm] = useState({ category: 'case', name: '', description: '', price: 0, inStook: true, imageUrl: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

        // Проверяем роль
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('PAYLOAD:', payload);

            // JWT использует полные URI для claims
            const role = payload.role
                || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
                || '';

            const nameId = payload.nameid
                || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
                || '';

            console.log('ROLE:', role, 'USER_ID:', nameId);
            setUserRole(role || 'user');

            if (role !== 'admin' && role !== 'moderator') {
                alert('Нет доступа. Ваша роль: ' + (role || 'не указана'));
                window.location.href = '/';
                return;
            }

            loadData(token);
        } catch (e) {
            console.error('Ошибка токена:', e);
            window.location.href = '/login';
            return;
        }
    }, []);

    const api = (url: string, options: any = {}) => {
        const token = localStorage.getItem('token');
        return fetch(`http://localhost:5237${url}`, {
            ...options,
            headers: { ...options.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
    };

    const loadData = async (token: string) => {
        const [ordersRes, statsRes] = await Promise.all([
            api('/api/admin/orders'),
            api('/api/admin/stats')
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        setLoading(false);
    };

    const loadUsers = async () => {
        const res = await api('/api/admin/users');
        if (res.ok) setUsers(await res.json());
    };

    const loadGallery = async () => {
        const res = await api('/api/admin/gallery/all');
        if (res.ok) setGallery(await res.json());
    };

    const loadComponents = async () => {
        const res = await api('/api/admin/components');
        if (res.ok) setComponents(await res.json());
    };

    const updateStatus = async (orderId: number, statusId: number) => {
        await api(`/api/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ statusId }) });
        const res = await api('/api/admin/orders');
        if (res.ok) setOrders(await res.json());
    };

    const updateRole = async (userId: number, role: string) => {
        await api(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
        loadUsers();
    };

    const toggleBan = async (userId: number) => {
        await api(`/api/admin/users/${userId}/ban`, { method: 'PUT' });
        loadUsers();
    };

    const deleteFromGallery = async (id: number) => {
        if (!confirm('Удалить из галереи?')) return;
        await api(`/api/admin/gallery/${id}`, { method: 'DELETE' });
        loadGallery();
    };

    const toggleModerate = async (id: number, approved: boolean) => {
        await api(`/api/admin/gallery/${id}/moderate`, { method: 'PUT', body: JSON.stringify({ approved }) });
        loadGallery();
    };

    const addComponent = async () => {
        await api('/api/admin/components', { method: 'POST', body: JSON.stringify(compForm) });
        setShowAddComponent(false);
        setCompForm({ category: 'case', name: '', description: '', price: 0, inStook: true, imageUrl: '' });
        loadComponents();
    };

    const deleteComponent = async (id: number) => {
        if (!confirm('Удалить компонент?')) return;
        await api(`/api/admin/components/${id}`, { method: 'DELETE' });
        loadComponents();
    };

    const isAdmin = userRole === 'admin';

    if (loading) return <div className="min-h-screen bg-[#05040b] flex items-center justify-center text-cyan-400 font-mono text-xl">ЗАГРУЗКА...</div>;

    return (
        <div className="min-h-screen bg-[#05040b] text-white">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl">A</div>
                        <span className="text-3xl font-black">ADMIN<span className="text-rose-400">.</span>PANEL</span>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-400 font-bold">{userRole.toUpperCase()}</span>
                        <Link href="/" className="text-sm text-zinc-400 hover:text-white">← На сайт</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Вкладки */}
                <div className="flex gap-3 mb-8 flex-wrap">
                    {[
                        { id: 'orders', label: '📦 Заказы' },
                        { id: 'gallery', label: '🖼️ Галерея' },
                        { id: 'components', label: '🔧 Компоненты' },
                        { id: 'stats', label: '📊 Статистика' },
                        ...(isAdmin ? [{ id: 'users', label: '👥 Пользователи' }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as Tab);
                                if (tab.id === 'users') loadUsers();
                                if (tab.id === 'gallery') loadGallery();
                                if (tab.id === 'components') loadComponents();
                            }}
                            className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition ${activeTab === tab.id ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Статистика */}
                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Заказов', value: stats.totalOrders, color: 'text-cyan-400' },
                            { label: 'Пользователей', value: stats.totalUsers, color: 'text-purple-400' },
                            { label: 'Выручка', value: `${(stats.totalRevenue || 0).toLocaleString('ru-RU')} ₽`, color: 'text-emerald-400' },
                            { label: 'В галерее', value: stats.totalGallery, color: 'text-pink-400' },
                            { label: 'Компонентов', value: stats.totalComponents, color: 'text-amber-400' }
                        ].map(s => (
                            <div key={s.label} className="bg-zinc-900/70 border border-white/10 rounded-2xl p-6 text-center">
                                <p className="text-3xl font-black mb-1">{s.value}</p>
                                <p className={`text-sm ${s.color}`}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Заказы */}
                {activeTab === 'orders' && (
                    <div className="overflow-x-auto bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-white/10 text-zinc-400">
                                <th className="text-left py-3 px-4">ID</th>
                                <th className="text-left py-3 px-4">Пользователь</th>
                                <th className="text-left py-3 px-4">Сумма</th>
                                <th className="text-left py-3 px-4">Статус</th>
                                <th className="text-left py-3 px-4">Адрес</th>
                                <th className="text-left py-3 px-4">Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map(o => (
                                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4">#{o.id}</td>
                                    <td className="py-3 px-4">{o.userLogin}</td>
                                    <td className="py-3 px-4">{(o.totalPrice || 0).toLocaleString('ru-RU')} ₽</td>
                                    <td className="py-3 px-4"><span className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-400">{o.status}</span></td>
                                    <td className="py-3 px-4 text-zinc-400 text-xs max-w-[200px] truncate">{o.shippingAddress || '—'}</td>
                                    <td className="py-3 px-4">
                                        <select onChange={(e) => updateStatus(o.id, Number(e.target.value))} defaultValue="" className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs">
                                            <option value="" disabled>Статус</option>
                                            <option value="1">Новый</option>
                                            <option value="2">В обработке</option>
                                            <option value="3">Собран</option>
                                            <option value="4">Доставлен</option>
                                            <option value="5">Отменён</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Пользователи (только admin) */}
                {activeTab === 'users' && isAdmin && (
                    <div className="overflow-x-auto bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-white/10 text-zinc-400">
                                <th className="text-left py-3 px-4">ID</th>
                                <th className="text-left py-3 px-4">Логин</th>
                                <th className="text-left py-3 px-4">Email</th>
                                <th className="text-left py-3 px-4">Роль</th>
                                <th className="text-left py-3 px-4">Статус</th>
                                <th className="text-left py-3 px-4">Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4">#{u.id}</td>
                                    <td className="py-3 px-4">{u.login}</td>
                                    <td className="py-3 px-4 text-zinc-400 text-xs">{u.email}</td>
                                    <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs ${u.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : u.role === 'moderator' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                                                {u.role || 'user'}
                                            </span>
                                    </td>
                                    <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs ${u.isactive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {u.isactive ? 'Активен' : 'Заблокирован'}
                                            </span>
                                    </td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <select onChange={(e) => updateRole(u.id, e.target.value)} defaultValue="" className="bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs">
                                            <option value="" disabled>Роль</option>
                                            <option value="user">User</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button onClick={() => toggleBan(u.id)} className="px-2 py-1 rounded-lg text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500/30">
                                            {u.isactive ? 'Бан' : 'Разбан'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Галерея */}
                {activeTab === 'gallery' && (
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gallery.map(g => (
                                <div key={g.id} className="bg-zinc-800/50 border border-white/5 rounded-2xl p-4">
                                    <h4 className="font-bold truncate">{g.title}</h4>
                                    <p className="text-xs text-zinc-400">Автор: {g.author}</p>
                                    <p className="text-xs text-zinc-500">Статус: {g.isModerated ? '✅ Одобрено' : '⏳ На модерации'}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => toggleModerate(g.id, !g.isModerated)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${g.isModerated ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {g.isModerated ? 'Снять' : 'Одобрить'}
                                        </button>
                                        <button onClick={() => deleteFromGallery(g.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30">
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Компоненты */}
                {activeTab === 'components' && (
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                        <button onClick={() => setShowAddComponent(true)} className="mb-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition">
                            + Добавить компонент
                        </button>

                        {showAddComponent && (
                            <div className="mb-6 p-4 bg-zinc-800 rounded-2xl space-y-3">
                                <select value={compForm.category} onChange={(e) => setCompForm({ ...compForm, category: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2">
                                    <option value="case">Корпус</option>
                                    <option value="switch">Свитч</option>
                                    <option value="keycap">Кейкап</option>
                                </select>
                                <input placeholder="Название" value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2" />
                                <input placeholder="Описание" value={compForm.description} onChange={(e) => setCompForm({ ...compForm, description: e.target.value })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2" />
                                <input type="number" placeholder="Цена" value={compForm.price} onChange={(e) => setCompForm({ ...compForm, price: Number(e.target.value) })} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2" />
                                <div className="flex gap-2">
                                    <button onClick={addComponent} className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold">Сохранить</button>
                                    <button onClick={() => setShowAddComponent(false)} className="px-5 py-2 rounded-xl bg-zinc-700 text-white">Отмена</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {components.map(c => (
                                <div key={c.id} className="bg-zinc-800/50 border border-white/5 rounded-xl p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm">{c.name}</p>
                                        <p className="text-xs text-zinc-400">{c.category} • {c.price?.toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                    <button onClick={() => deleteComponent(c.id)} className="text-rose-400 hover:text-rose-300 text-xs">🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
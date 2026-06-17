'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ComponentItem {
    id: number;
    category: string;
    name: string;
    description: string;
    price: number;
    inStook: boolean;
    imageUrl: string | null;
}

interface CatalogData {
    cases: ComponentItem[];
    switches: ComponentItem[];
    keycaps: ComponentItem[];
}

interface GalleryItem {
    id: number;
    title: string;
    author: string;
    configId: number;
    caseColor: string;
    keycapColor: string;
    switchColor: string;
    switchType: string;
    totalPrice: number;
    likesCount: number;
}

interface UserProfile {
    id: number;
    login: string;
    email: string;
    name?: string;
    surname?: string;
    role?: string;
}

export default function HomePage() {
    const router = useRouter();
    const [catalog, setCatalog] = useState<CatalogData | null>(null);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const catalogRes = await fetch('http://89.109.16.50:8968/api/catalog');
                if (catalogRes.ok) setCatalog(await catalogRes.json());

                const galleryRes = await fetch('http://89.109.16.50:8968/api/gallery');
                if (galleryRes.ok) {
                    const data = await galleryRes.json();
                    setGallery(data.slice(0, 6));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch('http://89.109.16.50:8968/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    setUser(await response.json());
                } else {
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error('Auth check failed:', err);
            }
        };

        fetchData();
        checkAuth();
    }, []);

    const handleAuth = async () => {
        setAuthError('');
        setAuthLoading(true);
        try {
            if (authMode === 'login') {
                const res = await fetch('http://89.109.16.50:8968/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password })
                });
                const data = await res.json();
                if (res.ok && data.token) {
                    localStorage.setItem('token', data.token);
                    const profileRes = await fetch('http://89.109.16.50:8968/api/users/profile', {
                        headers: { Authorization: `Bearer ${data.token}` },
                    });
                    if (profileRes.ok) {
                        setUser(await profileRes.json());
                        setIsAuthModalOpen(false);
                        router.refresh();
                    }
                } else {
                    setAuthError(data.message || data.error || 'Ошибка входа');
                }
            } else {
                const res = await fetch('http://89.109.16.50:8968/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ login, password, email, name, surname, phone })
                });
                const data = await res.json();
                if (res.ok) {
                    setAuthMode('login');
                    setAuthError('Регистрация успешна! Войдите.');
                } else {
                    setAuthError(data.message || data.error || 'Ошибка регистрации');
                }
            }
        } catch (err) {
            setAuthError('Ошибка сети');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.refresh();
    };

    const getCategoryItems = (category: string) => {
        if (!catalog) return [];
        if (category === 'case') return catalog.cases?.slice(0, 4) || [];
        if (category === 'switch') return catalog.switches?.slice(0, 4) || [];
        if (category === 'keycap') return catalog.keycaps?.slice(0, 4) || [];
        return [];
    };

    return (
        <div className="min-h-screen bg-[#05040b] text-white relative overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,#2a1b5f_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.18),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.18),transparent_50%)]" />
                <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] bg-cyan-400/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-300px] right-[-200px] w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[160px]" />
            </div>
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl shadow-[0_0_25px_#a855f7]">K</div>
                        <span className="text-3xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>

                    <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
                        <Link href="/gallery" className="hover:text-white transition">Галерея</Link>
                        <a href="#catalog" className="hover:text-white transition">Каталог</a>
                        <Link href="/configurator" className="hover:text-white transition">Конфигуратор</Link>
                        <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                        <Link href="/support" className="hover:text-white transition">Поддержка</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="text-xs px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 font-bold hover:bg-rose-500/30 transition">
                                        ADMIN
                                    </Link>
                                )}
                                <Link href="/profile" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">
                                    {user.login}
                                </Link>
                                <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-red-400 transition">Выйти</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium hover:text-white transition">
                                Войти
                            </button>
                        )}
                        <Link href="/configurator" className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 font-semibold text-sm hover:brightness-110 transition-all shadow-xl shadow-purple-500/40">
                            Создать
                        </Link>
                    </div>
                </div>
            </header>
            <section className="relative min-h-[90dvh] flex items-center justify-center z-10">
                <div className="max-w-5xl mx-auto text-center px-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm mb-10">
                        ✨ Новое поколение кастомизации
                    </div>
                    <h1 className="text-6xl md:text-7xl lg:text-[5.8rem] font-black tracking-[-3.5px] leading-none mb-8">
                        ТВОЯ<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400">УНИКАЛЬНАЯ</span><br />
                        КЛАВИАТУРА
                    </h1>
                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12">
                        Создай клавиатуру своей мечты с помощью мощного 3D-конфигуратора.<br />
                        Каждая деталь — полностью под твоим контролем.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link href="/configurator" className="px-10 py-5 text-lg font-semibold rounded-3xl bg-white text-black hover:bg-zinc-200 transition">
                            🎨 Создать клавиатуру
                        </Link>
                        <Link href="/gallery" className="px-10 py-5 text-lg font-medium border border-white/30 rounded-3xl hover:bg-white/5 transition">
                            🔥 Галерея работ →
                        </Link>
                    </div>
                </div>
            </section>
            <section id="gallery" className="relative py-24 z-10 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-5xl font-bold tracking-tight mb-2">🔥 Галерея сообщества</h2>
                            <p className="text-zinc-400 text-lg">Лучшие сборки от пользователей</p>
                        </div>
                        <Link href="/gallery" className="text-cyan-400 hover:text-cyan-300 font-medium">Смотреть все →</Link>
                    </div>

                    {gallery.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            <p className="text-4xl mb-4">🏗️</p>
                            <p className="text-lg">В галерее пока нет работ</p>
                            <Link href="/configurator" className="mt-4 inline-block text-cyan-400 hover:underline">Создать первую →</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gallery.map(item => (
                                <Link
                                    key={item.id}
                                    href={`/configurator?configId=${item.configId}`}
                                    className="group relative aspect-video rounded-3xl overflow-hidden border border-white/5 hover:border-purple-500/60 transition-all hover:scale-[1.02]"
                                >
                                    <div className="absolute inset-0" style={{
                                        background: `linear-gradient(160deg, ${item.caseColor || '#1a1a1a'} 0%, ${item.caseColor || '#1a1a1a'} 35%, ${item.keycapColor || '#333'} 65%, ${item.keycapColor || '#333'} 100%)`
                                    }} />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        <div className="grid grid-cols-6 gap-1.5 rotate-6">
                                            {Array.from({ length: 30 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-7 h-7 rounded-lg"
                                                    style={{
                                                        backgroundColor: item.keycapColor || '#333',
                                                        boxShadow: `0 3px 6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
                                                        border: '1px solid rgba(255,255,255,0.08)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <div className="grid grid-cols-6 gap-1.5 rotate-6 translate-y-4">
                                            {Array.from({ length: 30 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 h-3 rounded-full mx-auto"
                                                    style={{ backgroundColor: item.switchColor || '#ef4444' }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-cyan-400 text-sm font-mono">{item.author}</p>
                                        <p className="text-xl font-bold truncate">{item.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-zinc-400 text-sm">{item.totalPrice?.toLocaleString('ru-RU') || 0} ₽</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 capitalize">{item.switchType || '—'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <section id="catalog" className="relative py-24 z-10 bg-zinc-950/50 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-5xl font-bold tracking-tight mb-2">📦 Каталог компонентов</h2>
                    <p className="text-zinc-400 text-lg mb-12">Всё для твоей идеальной сборки</p>

                    {loading ? (
                        <div className="text-center py-16 text-zinc-500">Загрузка каталога...</div>
                    ) : (
                        <div className="space-y-16">
                            <div>
                                <h3 className="text-2xl font-bold mb-6">🏠 Корпуса</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {getCategoryItems('case').map(item => (
                                        <div key={item.id} className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 hover:border-cyan-400/30 transition">
                                            <div className="h-32 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center text-4xl">🏠</div>
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-cyan-400 text-xl font-bold mt-3">{item.price?.toLocaleString('ru-RU')} ₽</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-6">🔘 Переключатели</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {getCategoryItems('switch').map(item => (
                                        <div key={item.id} className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 hover:border-purple-400/30 transition">
                                            <div className="h-32 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center text-4xl">🔘</div>
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-purple-400 text-xl font-bold mt-3">{item.price?.toLocaleString('ru-RU')} ₽</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-6">🎨 Кейкапы</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {getCategoryItems('keycap').map(item => (
                                        <div key={item.id} className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 hover:border-pink-400/30 transition">
                                            <div className="h-32 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center text-4xl">🎨</div>
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                            <p className="text-pink-400 text-xl font-bold mt-3">{item.price?.toLocaleString('ru-RU')} ₽</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <footer className="relative z-10 border-t border-white/10 py-12 bg-[#05040b]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold mb-3">KDB.APP</h4>
                            <p className="text-zinc-500 text-sm">Конфигуратор кастомных клавиатур</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Навигация</h4>
                            <div className="flex flex-col gap-2 text-sm text-zinc-500">
                                <Link href="/gallery" className="hover:text-white transition">Галерея</Link>
                                <Link href="/configurator" className="hover:text-white transition">Конфигуратор</Link>
                                <Link href="/profile" className="hover:text-white transition">Профиль</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Помощь</h4>
                            <div className="flex flex-col gap-2 text-sm text-zinc-500">
                                <Link href="/faq" className="hover:text-white transition">FAQ</Link>
                                <Link href="/support" className="hover:text-white transition">Поддержка</Link>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Контакты</h4>
                            <div className="flex flex-col gap-2 text-sm text-zinc-500">
                                <span>support@kdb.app</span>
                                <span>@kdb_support</span>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 text-center text-zinc-600 text-sm">
                        <p>© 2025 KDB.APP — Создай свою идеальную клавиатуру. Все права защищены.</p>
                    </div>
                </div>
            </footer>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4" onClick={(e) => { if (e.target === e.currentTarget) setIsAuthModalOpen(false); }}>
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md p-10 relative">
                        <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-6 right-6 text-2xl text-zinc-500 hover:text-white">✕</button>

                        <h2 className="text-3xl font-bold text-center mb-8">
                            {authMode === 'login' ? 'Вход' : 'Регистрация'}
                        </h2>

                        {authError && (
                            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); handleAuth(); }} className="space-y-4">
                            <input type="text" placeholder="Логин" value={login} onChange={(e) => setLogin(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400" required />
                            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400" required />
                            {authMode === 'register' && (
                                <>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400" required />
                                    <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400" />
                                    <input type="text" placeholder="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400" />
                                    <input
                                        type="tel"
                                        placeholder="+7 (999) 999-99-99"
                                        value={phone}
                                        onChange={(e) => {
                                            let value = e.target.value.replace(/\D/g, ''); // Убираем всё кроме цифр
                                            if (value.startsWith('7') || value.startsWith('8')) {
                                                value = value.substring(1); // Убираем первую 7 или 8
                                            }
                                            if (value.length > 10) value = value.substring(0, 10); // Максимум 10 цифр

                                            let formatted = '+7 ';
                                            if (value.length > 0) formatted += '(' + value.substring(0, 3);
                                            if (value.length > 3) formatted += ') ' + value.substring(3, 6);
                                            if (value.length > 6) formatted += '-' + value.substring(6, 8);
                                            if (value.length > 8) formatted += '-' + value.substring(8, 10);

                                            setPhone(formatted);
                                        }}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-cyan-400"
                                        required
                                    />                                </>
                            )}
                            <button type="submit" disabled={authLoading} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-semibold text-lg hover:brightness-110 transition disabled:opacity-50">
                                {authLoading ? 'Загрузка...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                        </form>
                        <p className="text-center mt-6 text-sm text-zinc-400">
                            {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
                            <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-cyan-400 hover:underline">
                                {authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
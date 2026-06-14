'use client';

import React from 'react';
import Link from 'next/link';

export default function ComponentsTreePage() {
    return (
        <div className="min-h-screen bg-[#05040b] text-white font-mono">
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
                    <Link href="/" className="text-2xl font-black">KDB<span className="text-cyan-400">.</span>APP</Link>
                    <span className="ml-4 text-zinc-500 text-sm">← Дерево компонентов</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black mb-2">Дерево переиспользуемых UI-компонентов</h1>
                <p className="text-zinc-500 text-sm mb-10">Иерархическая структура компонентов клиентской части платформы</p>

                <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8 text-sm leading-relaxed overflow-x-auto">
                    <pre className="text-zinc-300">
<span className="text-rose-400 font-bold">App</span> <span className="text-zinc-600">(layout.tsx)</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">Header</span> <span className="text-zinc-600">— верхняя панель навигации</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">Logo</span> <span className="text-zinc-600">— логотип KDB.APP</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">NavLinks</span> <span className="text-zinc-600">— Галерея, Каталог, FAQ, Поддержка</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">AuthButton</span> <span className="text-zinc-600">— Войти / Профиль</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">AdminButton</span> <span className="text-zinc-600">— ADMIN (только для admin)</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">Footer</span> <span className="text-zinc-600">— футер с навигацией и контактами</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">FooterNav</span> <span className="text-zinc-600">— ссылки по категориям</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">FooterContacts</span> <span className="text-zinc-600">— email, telegram</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">AuthModal</span> <span className="text-zinc-600">— модальное окно входа/регистрации</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">LoginForm</span> <span className="text-zinc-600">— форма входа (логин + пароль)</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">RegisterForm</span> <span className="text-zinc-600">— форма регистрации с маской телефона</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">GalleryCard</span> <span className="text-zinc-600">— карточка галереи</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">GalleryPreview</span> <span className="text-zinc-600">— 3D-превью (Canvas + R3F)</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">AuthorInfo</span> <span className="text-zinc-600">— автор и название</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">PriceTag</span> <span className="text-zinc-600">— цена</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">LikeButton</span> <span className="text-zinc-600">— кнопка лайка</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">OrderCard</span> <span className="text-zinc-600">— карточка заказа в профиле</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">StatusBadge</span> <span className="text-zinc-600">— бейдж статуса</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">OrderInfo</span> <span className="text-zinc-600">— номер, дата, сумма</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">EditAddressButton</span> <span className="text-zinc-600">— изменить адрес</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">EditConfigButton</span> <span className="text-zinc-600">— изменить конфигурацию</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">CancelOrderButton</span> <span className="text-zinc-600">— отменить заказ</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">PublishGalleryButton</span> <span className="text-zinc-600">— в галерею</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">ComponentCard</span> <span className="text-zinc-600">— карточка товара в каталоге</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">ComponentPreview</span> <span className="text-zinc-600">— превью компонента</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">PriceTag</span> <span className="text-zinc-600">— цена</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">AdminTabs</span> <span className="text-zinc-600">— вкладки админ-панели</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">OrdersTable</span> <span className="text-zinc-600">— таблица заказов</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">UsersTable</span> <span className="text-zinc-600">— таблица пользователей</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">GalleryModeration</span> <span className="text-zinc-600">— модерация галереи</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">ComponentsManager</span> <span className="text-zinc-600">— управление компонентами</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">StatsPanel</span> <span className="text-zinc-600">— статистика</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">AssemblerCard</span> <span className="text-zinc-600">— карточка цеха сборки</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">AssemblySheet</span> <span className="text-zinc-600">— сборочный лист</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">StartAssemblyButton</span> <span className="text-zinc-600">— начать сборку</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">CompleteAssemblyButton</span> <span className="text-zinc-600">— собрано</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">MapViewer</span> <span className="text-zinc-600">— интерактивная карта</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">LeafletMap</span> <span className="text-zinc-600">— OpenStreetMap</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">DraggableMarker</span> <span className="text-zinc-600">— перетаскиваемый маркер</span>{'\n'}
                        <span className="text-blue-400"> ├──</span> <span className="text-purple-400">CropperModal</span> <span className="text-zinc-600">— обрезка принта</span>{'\n'}
                        <span className="text-blue-400"> │    ├──</span> <span className="text-cyan-400">ImageCropper</span> <span className="text-zinc-600">— react-easy-crop</span>{'\n'}
                        <span className="text-blue-400"> │    └──</span> <span className="text-cyan-400">ZoomSlider</span> <span className="text-zinc-600">— ползунок масштаба</span>{'\n'}
                        <span className="text-blue-400"> └──</span> <span className="text-purple-400">KeyboardEngine</span> <span className="text-zinc-600">— 3D-движок (R3F)</span>{'\n'}
                        <span className="text-blue-400">      ├──</span> <span className="text-cyan-400">KeyboardModel</span> <span className="text-zinc-600">— 3D-модель (useGLTF)</span>{'\n'}
                        <span className="text-blue-400">      ├──</span> <span className="text-cyan-400">MaterialController</span> <span className="text-zinc-600">— цвета, материалы</span>{'\n'}
                        <span className="text-blue-400">      ├──</span> <span className="text-cyan-400">AnimationController</span> <span className="text-zinc-600">— взрыв-схема, RGB</span>{'\n'}
                        <span className="text-blue-400">      ├──</span> <span className="text-cyan-400">Environment</span> <span className="text-zinc-600">— окружение (Drei)</span>{'\n'}
                        <span className="text-blue-400">      └──</span> <span className="text-cyan-400">OrbitControls</span> <span className="text-zinc-600">— управление камерой</span>
                    </pre>
                </div>

                <div className="mt-8 grid grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-400"></span> Корневой компонент</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-400"></span> Компонент-контейнер</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-cyan-400"></span> Дочерний компонент</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-600"></span> Описание</div>
                </div>
            </main>
        </div>
    );
}
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

interface GalleryItem {
    id: number;
    title: string;
    author: string;
    authorAvatar: string | null;
    configId: number;
    layout: string;
    caseColor: string;
    keycapColor: string;
    switchColor: string;
    switchType: string;
    caseName: string;
    keycapName: string;
    totalPrice: number;
    createdAt: string;
    likesCount: any;
    customPrintImageUrl: string | null;
    keycapMaterialType: string;
    rgbMode: boolean;
}

export default function GalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [Studio, setStudio] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:5237/api/gallery'),
            import('@react-three/fiber'),
            import('@react-three/drei')
        ]).then(([res, fiber, drei]) => {
            res.json().then(data => setItems(data));
            setStudio({
                Canvas: fiber.Canvas,
                useGLTF: drei.useGLTF,
                OrbitControls: drei.OrbitControls,
                Environment: drei.Environment
            });
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLike = async (id: number) => {
        try {
            await fetch(`http://localhost:5237/api/gallery/${id}/like`, { method: 'POST' });
            setItems(items.map(i => i.id === id ? { ...i, likesCount: 1 } : i));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !Studio) {
        return (
            <div className="min-h-screen bg-[#05040b] flex items-center justify-center text-cyan-400 font-mono">
                <div className="text-center">
                    <div className="text-5xl mb-4">🏗️</div>
                    <p className="text-xl tracking-widest">ЗАГРУЗКА ГАЛЕРЕИ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05040b] text-white">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,#2a1b5f_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,211,238,0.12),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.12),transparent_50%)]" />
            </div>

            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05040b]/90 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-black text-2xl shadow-[0_0_25px_#a855f7]">K</div>
                        <span className="text-3xl font-black tracking-[-2px]">KDB<span className="text-cyan-400">.</span>APP</span>
                    </Link>
                    <div className="flex gap-6">
                        <Link href="/configurator" className="text-sm text-zinc-400 hover:text-white transition">Конфигуратор</Link>
                        <Link href="/profile" className="text-sm text-zinc-400 hover:text-white transition">Профиль</Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-5xl font-black tracking-tighter mb-2">Галерея сборок</h1>
                <p className="text-zinc-400 mb-12">Лучшие конфигурации от сообщества</p>

                {items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6">🏗️</div>
                        <p className="text-2xl text-zinc-500 mb-4">В галерее пока нет сборок</p>
                        <p className="text-zinc-500 mb-8">Опубликуй свою первую сборку из профиля!</p>
                        <Link href="/configurator" className="inline-block px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl font-bold text-lg hover:brightness-110 transition">
                            Создать сборку →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-zinc-900/70 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] flex flex-col">
                                {/* 3D Превью */}
                                <div className="h-56 relative bg-[#121214]">
                                    <Studio.Canvas
                                        camera={{ position: [0, 2.5, 3.5], fov: 30 }}
                                        style={{ background: '#121214' }}
                                        gl={{ antialias: true }}
                                    >
                                        <Suspense fallback={null}>
                                            <ambientLight intensity={0.5} />
                                            <spotLight position={[3, 5, 3]} intensity={1.5} angle={0.3} penumbra={0.5} />
                                            <directionalLight position={[-3, 3, -3]} intensity={0.8} />

                                            <GalleryPreview
                                                Studio={Studio}
                                                layout={item.layout}
                                                caseColor={item.caseColor || '#22d3ee'}
                                                keycapColor={item.keycapColor || '#111111'}
                                                switchColor={item.switchColor || '#ef4444'}
                                                keycapMaterialType={item.keycapMaterialType || 'matte'}
                                            />

                                            <Studio.Environment preset="studio" environmentIntensity={0.3} />
                                            <Studio.OrbitControls
                                                enablePan={false}
                                                enableZoom={false}
                                                autoRotate
                                                autoRotateSpeed={1.5}
                                                minPolarAngle={Math.PI / 3}
                                                maxPolarAngle={Math.PI / 2.2}
                                            />
                                        </Suspense>
                                    </Studio.Canvas>
                                    <button
                                        onClick={() => handleLike(item.id)}
                                        className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-sm hover:bg-rose-500/30 transition z-10"
                                    >
                                        {item.likesCount ? '❤️' : '🤍'}
                                    </button>
                                    <span className="absolute bottom-3 left-3 text-[10px] font-mono bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-zinc-300">
                                        {item.layout === '100' ? 'FULL-SIZE' : '80% TKL'}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold truncate mb-3">{item.title}</h3>

                                    <div className="space-y-1.5 text-sm text-zinc-400 mb-4 flex-1">
                                        <div className="flex justify-between">
                                            <span>Автор</span>
                                            <span className="text-white">{item.author}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Свитчи</span>
                                            <span className="text-amber-400 capitalize">{item.switchType || '—'}</span>
                                        </div>
                                        {item.caseName && (
                                            <div className="flex justify-between">
                                                <span>Корпус</span>
                                                <span className="text-white truncate max-w-[150px]">{item.caseName}</span>
                                            </div>
                                        )}
                                        {item.keycapName && (
                                            <div className="flex justify-between">
                                                <span>Кейкапы</span>
                                                <span className="text-white truncate max-w-[150px]">{item.keycapName}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xl font-bold">{item.totalPrice?.toLocaleString('ru-RU') || 0} ₽</span>
                                        <Link
                                            href={`/configurator?configId=${item.configId}`}
                                            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-bold hover:bg-cyan-500/20 transition"
                                        >
                                            🔧 Собрать себе
                                        </Link>
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
function GalleryPreview({ Studio, layout, caseColor, keycapColor, switchColor, keycapMaterialType }: any) {
    const model80 = Studio.useGLTF('/models/main.glb');
    const model100 = Studio.useGLTF('/models/mainfull.glb');

    const currentModel = layout === '100' ? model100 : model80;
    const { scene } = currentModel;
    const clonedScene = React.useMemo(() => scene.clone(), [scene]);

    React.useEffect(() => {
        clonedScene.traverse((child: any) => {
            if (!child.isMesh) return;

            if (!child.userData.materialCloned && child.material) {
                child.material = Array.isArray(child.material)
                    ? child.material.map((m: any) => m.clone())
                    : child.material.clone();
                child.userData.materialCloned = true;
            }

            const meshName = child.name.toLowerCase();

            if (meshName.includes('board') || meshName.includes('case') || meshName.includes('body')) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any) => {
                    if (!mat) return;
                    mat.color.set(caseColor);
                    mat.roughness = 0.35;
                    mat.metalness = 0.15;
                    mat.needsUpdate = true;
                });
            }
            else if (meshName.includes('keycap') || meshName.includes('button') || child.position.y > 0.35) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any) => {
                    if (!mat) return;
                    mat.color.set(keycapColor);
                    mat.roughness = keycapMaterialType === 'matte' ? 0.75 : 0.1;
                    mat.metalness = keycapMaterialType === 'metallic' ? 0.95 : 0.0;
                    mat.needsUpdate = true;
                });
            }
            else if (meshName.includes('stem') || meshName.includes('shtok') || meshName.includes('axis')) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any, index: number) => {
                    if (!mat) return;
                    const matName = mat.name.toLowerCase();
                    const isStem = matName.includes('stem') || matName.includes('shtok') || (mats.length > 1 && index === 1);
                    if (isStem) {
                        mat.color.set(switchColor);
                        mat.roughness = 0.35;
                        mat.metalness = 0.0;
                        mat.needsUpdate = true;
                    }
                });
            }
        });
    }, [clonedScene, caseColor, keycapColor, switchColor, keycapMaterialType]);

    return <primitive object={clonedScene} scale={0.9} position={[0, -0.3, 0]} />;
}
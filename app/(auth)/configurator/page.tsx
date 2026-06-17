'use client';

import React, { useState, Suspense, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import * as THREE from 'three';
import Cropper from 'react-easy-crop';

const getCroppedImg = (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Не удалось получить контекст canvas')); return; }
            ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
            canvas.toBlob((blob) => { if (!blob) { reject(new Error('Canvas пустой')); return; } resolve(blob); }, 'image/jpeg');
        };
        image.onerror = (error) => reject(error);
    });
};

export default function ConfiguratorPageWrapper() {
    return (
        <Suspense fallback={<div className="h-screen bg-zinc-950 flex items-center justify-center text-white font-mono">Загрузка конфигуратора...</div>}>
            <ConfiguratorPage />
        </Suspense>
    );
}

function ConfiguratorPage() {
    const searchParams = useSearchParams();
    const configId = searchParams.get('configId');
    const editMode = searchParams.get('editMode') === 'true';

    const [Studio, setStudio] = useState<any>(null);
    const [layout, setLayout] = useState<'80' | '100'>('80');
    const [caseColor, setCaseColor] = useState('#22d3ee');
    const [keycapColor, setKeycapColor] = useState('#111111');
    const [volumeColor, setVolumeColor] = useState('#111111');
    const [switchColor, setSwitchColor] = useState('#ef4444');
    const [keycapMaterialType, setKeycapMaterialType] = useState('matte');
    const [switchType, setSwitchType] = useState('linear');
    const [revealSwitches, setRevealSwitches] = useState(false);
    const [rgbMode, setRgbMode] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [printFile, setPrintFile] = useState<File | null>(null);
    const [printBlobUrl, setPrintBlobUrl] = useState<string | null>(null);
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);
    const [waveResetTrigger, setWaveResetTrigger] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(!!configId);

    // === НОВОЕ: Каталог и цены ===
    const [catalogComponents, setCatalogComponents] = useState<any>({ cases: [], switches: [], keycaps: [] });
    const [selectedCaseId, setSelectedCaseId] = useState<number>(1);
    const [selectedSwitchId, setSelectedSwitchId] = useState<number>(2);
    const [selectedKeycapId, setSelectedKeycapId] = useState<number>(3);
    const [totalPrice, setTotalPrice] = useState(0);

    // Загрузка каталога
    useEffect(() => {
        const loadCatalog = async () => {
            try {
                const res = await fetch('https://kdbackend.ryban.ru/api/catalog');
                if (res.ok) {
                    const catalog = await res.json();
                    setCatalogComponents(catalog);
                    const c = catalog.cases?.[0];
                    const s = catalog.switches?.[0];
                    const k = catalog.keycaps?.[0];
                    if (c) setSelectedCaseId(c.id);
                    if (s) setSelectedSwitchId(s.id);
                    if (k) setSelectedKeycapId(k.id);
                    const price = (c?.price || 0) + (s?.price || 0) + (k?.price || 0);
                    setTotalPrice(price);
                }
            } catch (e) { console.error('Ошибка загрузки каталога:', e); }
        };
        loadCatalog();
    }, []);

    // Загрузка конфигурации
    useEffect(() => {
        if (!configId) { setLoadingConfig(false); return; }
        const loadConfig = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://kdbackend.ryban.ru/api/configurations/${configId}/full`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) { console.error('Не удалось загрузить конфигурацию'); setLoadingConfig(false); return; }
                const data = await response.json();
                if (data.layout) setLayout(data.layout);
                if (data.caseColor) setCaseColor(data.caseColor);
                if (data.keycapColor) setKeycapColor(data.keycapColor);
                if (data.volumeColor) setVolumeColor(data.volumeColor);
                if (data.switchColor) setSwitchColor(data.switchColor);
                if (data.keycapMaterialType) setKeycapMaterialType(data.keycapMaterialType);
                if (data.switchType) setSwitchType(data.switchType);
                if (data.rgbMode !== undefined && data.rgbMode !== null) setRgbMode(data.rgbMode);
                if (data.customPrintImageUrl) setPrintBlobUrl(`https://kdbackend.ryban.ru${data.customPrintImageUrl}`);
            } catch (err) { console.error('Ошибка загрузки конфигурации:', err); }
            finally { setLoadingConfig(false); }
        };
        loadConfig();
    }, [configId]);

    // Загрузка студии
    useEffect(() => {
        Promise.all([import('@react-three/fiber'), import('@react-three/drei')]).then(([fiber, drei]) => {
            setStudio({
                Canvas: fiber.Canvas, useFrame: fiber.useFrame, OrbitControls: drei.OrbitControls,
                Environment: drei.Environment, ContactShadows: drei.ContactShadows, useGLTF: drei.useGLTF
            });
        });
    }, []);

    const triggerKeycapWave = (action: () => void) => { action(); setWaveResetTrigger(prev => prev + 1); };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; const reader = new FileReader(); reader.addEventListener('load', () => { setRawImageSrc(reader.result as string); setCropModalOpen(true); }); reader.readAsDataURL(file); }
    };
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => { setCroppedAreaPixels(croppedAreaPixels); }, []);

    const handleSaveCroppedImage = async () => {
        try {
            if (!rawImageSrc || !croppedAreaPixels) return;
            const croppedBlob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
            if (printBlobUrl) URL.revokeObjectURL(printBlobUrl);
            const croppedUrl = URL.createObjectURL(croppedBlob);
            setPrintFile(new File([croppedBlob], 'cropped-print.jpg', { type: 'image/jpeg' }));
            setPrintBlobUrl(croppedUrl);
            setCropModalOpen(false);
            setRawImageSrc(null);
        } catch (e) { console.error(e); alert('Не удалось обрезать картинку'); }
    };

    const handleRemovePrint = () => { if (printBlobUrl) URL.revokeObjectURL(printBlobUrl); setPrintFile(null); setPrintBlobUrl(null); };

    const handleSwitchTypeChange = (type: 'linear' | 'tactile' | 'clicky') => {
        setSwitchType(type);
        if (type === 'linear') setSwitchColor('#ef4444');
        if (type === 'tactile') setSwitchColor('#78350f');
        if (type === 'clicky') setSwitchColor('#3b82f6');
    };

    const calculatePrice = () => {
        return totalPrice.toLocaleString('ru-RU') + ' ₽';
    };

    const handleSendAssembly = async () => {
        setIsSending(true);
        try {
            const formData = new FormData();
            formData.append('Layout', layout);
            formData.append('CaseColor', caseColor);
            formData.append('KeycapColor', keycapColor);
            formData.append('VolumeColor', volumeColor);
            formData.append('SwitchColor', switchColor);
            formData.append('KeycapMaterialType', keycapMaterialType);
            formData.append('SwitchType', switchType);
            formData.append('RgbMode', String(rgbMode));
            formData.append('HasCustomPrint', String(!!printFile));
            formData.append('TotalPrice', totalPrice.toString());
            if (printFile) formData.append('PrintImage', printFile);

            const response = await fetch('https://kdbackend.ryban.ru/api/configurations/create-custom', { method: 'POST', body: formData });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('lastConfigId', data.configurationId);
                window.location.href = editMode && configId ? '/profile' : `/checkout?configId=${data.configurationId}`;
            } else {
                const errorText = await response.text();
                console.error('Ошибка сервера:', errorText);
                alert('Ошибка при сохранении сборки.');
            }
        } catch (error) { console.error('Ошибка сети:', error); alert('Ошибка сети.'); }
        finally { setIsSending(false); }
    };

    const caseColorsList = ['#22d3ee', '#a855f7', '#ef4444', '#ffffff', '#141416', '#facc15', '#4ade80', '#fb923c', '#ec4899'];
    const keycapColorsList = ['#111111', '#4b5563', '#f3f4f6', '#b91c1c', '#065f46', '#1d4ed8', '#7e22ce', '#f59e0b'];
    const cropAspectRatio = layout === '100' ? 3.2 / 1 : 2.4 / 1;

    if (loadingConfig) {
        return (<div className="h-screen w-full bg-zinc-950 text-white flex items-center justify-center font-mono"><div className="text-center"><div className="text-4xl mb-4">⚙️</div><p className="text-cyan-400 text-lg">Загрузка конфигурации...</p></div></div>);
    }

    return (
        <div className="h-screen w-full bg-zinc-950 text-white overflow-hidden flex font-sans relative select-none">
            <AnimatePresence>
                {cropModalOpen && rawImageSrc && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl h-[550px] flex flex-col overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                                <div><h3 className="text-sm font-bold font-mono text-purple-400 uppercase tracking-wider">📐 Центрирование и подгонка принта</h3><p className="text-[11px] text-zinc-400 mt-0.5">Настрой положение картинки внутри рамки</p></div>
                                <button type="button" onClick={() => setCropModalOpen(false)} className="text-xs font-mono text-zinc-500 hover:text-white uppercase">Отмена</button>
                            </div>
                            <div className="flex-1 relative bg-zinc-950/40"><Cropper image={rawImageSrc} crop={crop} zoom={zoom} aspect={cropAspectRatio} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={true} /></div>
                            <div className="p-5 bg-zinc-900 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase w-16">Масштаб</span>
                                    <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-purple-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                                    <span className="text-xs font-mono text-purple-400 w-10 text-right">{zoom}x</span>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setCropModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-white/5 text-zinc-400 font-mono text-xs hover:bg-white/5 transition">Назад</button>
                                    <button type="button" onClick={handleSaveCroppedImage} className="px-6 py-2.5 rounded-xl bg-purple-500 text-black font-black font-mono text-xs hover:bg-purple-400 transition">✅ ПРИМЕНИТЬ ПРИНТ</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.aside initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="w-[420px] bg-zinc-900/95 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col justify-between z-20 overflow-y-auto text-white shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
                <div>
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div><h2 className="text-[9px] text-purple-400 font-mono tracking-[0.3em]">{editMode ? 'EDIT MODE' : 'PROJECTION ENGINE v3.0'}</h2><h1 className="text-2xl font-black tracking-tight font-mono text-white">{editMode ? `EDIT CONFIG #${configId}` : 'CUSTOM_KBD'}</h1></div>
                        {editMode && <button onClick={() => window.location.href = '/profile'} className="text-xs text-zinc-500 hover:text-white font-mono">← НАЗАД</button>}
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-purple-500/[0.05] to-pink-500/[0.05] border border-purple-500/30">
                        <label className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-3 block">🪐 Сплошной Full-Body Принт</label>
                        {!printBlobUrl ? (
                            <div className="relative border border-dashed border-purple-500/40 rounded-lg p-5 text-center hover:bg-purple-500/5 transition cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                <span className="text-xs font-mono text-zinc-300 block">📸 Загрузить принт</span>
                                <span className="text-[9px] text-zinc-500 block mt-1">Откроется удобное окно точной подгонки</span>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <img src={printBlobUrl} alt="preview" className="w-10 h-10 object-cover rounded border border-white/10" />
                                        <div><p className="text-xs font-mono max-w-[140px] truncate text-zinc-300">{printFile?.name}</p><p className="text-[9px] text-emerald-400 font-bold font-mono">ПОДОГНАН ПО РАЗМЕРУ</p></div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => setCropModalOpen(true)} className="text-[10px] uppercase font-mono text-purple-400 hover:text-purple-300 px-1">Изменить</button>
                                        <button type="button" onClick={handleRemovePrint} className="text-[10px] uppercase font-mono text-rose-400 hover:text-rose-300 px-1">Удалить</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20">
                        <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3 block">Форм-фактор</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setLayout('80')} className={`py-2.5 text-[10px] font-mono border rounded-lg transition-all ${layout === '80' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 text-zinc-500'}`}>🕹️ 80% TKL</button>
                            <button type="button" onClick={() => setLayout('100')} className={`py-2.5 text-[10px] font-mono border rounded-lg transition-all ${layout === '100' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 text-zinc-500'}`}>⌨️ 100% Full-size</button>
                        </div>
                    </div>
                    {/* === ВЫБОР КОРПУСА === */}
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3 block">🏠 Корпус</label>
                        <select
                            value={selectedCaseId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedCaseId(id);
                                const c = catalogComponents.cases?.find((c: any) => c.id === id);
                                const s = catalogComponents.switches?.find((s: any) => s.id === selectedSwitchId);
                                const k = catalogComponents.keycaps?.find((k: any) => k.id === selectedKeycapId);
                                if (c) setTotalPrice((c.price || 0) + (s?.price || 0) + (k?.price || 0));
                            }}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                            {catalogComponents.cases?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name} — {c.price?.toLocaleString('ru-RU')} ₽</option>
                            ))}
                        </select>
                    </div>

                    {/* === ВЫБОР СВИТЧЕЙ === */}
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3 block">🔘 Свитчи</label>
                        <select
                            value={selectedSwitchId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedSwitchId(id);
                                const c = catalogComponents.cases?.find((c: any) => c.id === selectedCaseId);
                                const s = catalogComponents.switches?.find((s: any) => s.id === id);
                                const k = catalogComponents.keycaps?.find((k: any) => k.id === selectedKeycapId);
                                if (s) setTotalPrice((c?.price || 0) + (s.price || 0) + (k?.price || 0));
                            }}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                            {catalogComponents.switches?.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name} — {s.price?.toLocaleString('ru-RU')} ₽</option>
                            ))}
                        </select>
                    </div>

                    {/* === ВЫБОР КЕЙКАПОВ === */}
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] text-pink-400 font-bold uppercase tracking-widest mb-3 block">🎨 Кейкапы</label>
                        <select
                            value={selectedKeycapId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedKeycapId(id);
                                const c = catalogComponents.cases?.find((c: any) => c.id === selectedCaseId);
                                const s = catalogComponents.switches?.find((s: any) => s.id === selectedSwitchId);
                                const k = catalogComponents.keycaps?.find((k: any) => k.id === id);
                                if (k) setTotalPrice((c?.price || 0) + (s?.price || 0) + (k.price || 0));
                            }}
                            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                        >
                            {catalogComponents.keycaps?.map((k: any) => (
                                <option key={k.id} value={k.id}>{k.name} — {k.price?.toLocaleString('ru-RU')} ₽</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 block">Цвет корпуса</label>
                        <div className="flex flex-wrap gap-2">{caseColorsList.map(c => (<button type="button" key={c} onClick={() => setCaseColor(c)} className={`w-7 h-7 rounded-lg border transition-all ${caseColor === c ? 'border-white scale-110' : 'border-white/10'}`} style={{ backgroundColor: c }}></button>))}</div>
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5" onMouseEnter={() => setHoveredSection('keycaps')} onMouseLeave={() => setHoveredSection(null)}>
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 block">Цвет клавиш</label>
                        <div className="flex flex-wrap gap-2">{keycapColorsList.map(c => (<button type="button" key={c} onClick={() => triggerKeycapWave(() => setKeycapColor(c))} className={`w-7 h-7 rounded-lg border transition-all ${keycapColor === c ? 'border-white scale-110' : 'border-white/10'}`} style={{ backgroundColor: c }}></button>))}</div>
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5" onMouseEnter={() => setHoveredSection('switches')} onMouseLeave={() => setHoveredSection(null)}>
                        <label className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-3 block">Тип переключателей</label>
                        <div className="grid grid-cols-3 gap-2">{['linear', 'tactile', 'clicky'].map(type => (<button type="button" key={type} onClick={() => handleSwitchTypeChange(type as any)} className={`py-2 border text-center rounded-lg text-[9px] font-mono transition ${switchType === type ? 'border-amber-400 bg-amber-400/10 text-amber-400' : 'border-white/5 text-zinc-400'}`}>{type.toUpperCase()}</button>))}</div>
                    </div>
                    <div className="mb-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-2 block">Материал клавиш</label>
                        <div className="grid grid-cols-2 gap-2">{[{ id: 'matte', name: 'PBT Матовый' },{ id: 'glossy', name: 'ABS Глянцевый' },{ id: 'metallic', name: 'Металл' },{ id: 'clear', name: '💎 Полупрозрачный' }].map(mat => (<button type="button" key={mat.id} onClick={() => setKeycapMaterialType(mat.id)} className={`py-2 text-[9px] font-mono border rounded-lg ${keycapMaterialType === mat.id ? 'border-cyan-400 text-cyan-400' : 'border-white/5 text-zinc-400'}`}>{mat.name}</button>))}</div>
                    </div>
                    <div className="flex gap-2 border-t border-white/5 pt-4 pb-4">
                        <button type="button" onClick={() => setRevealSwitches(!revealSwitches)} className={`flex-1 py-3 text-[10px] font-mono rounded-xl border ${revealSwitches ? 'bg-amber-500 text-black font-bold' : 'border-zinc-800 text-zinc-400'}`}>{revealSwitches ? '⏬ Собрать клавиатуру' : '💥 Взрыв-Схема'}</button>
                        <button type="button" onClick={() => setRgbMode(!rgbMode)} className={`px-4 text-[10px] font-mono rounded-xl border ${rgbMode ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-zinc-800'}`}>RGB</button>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-4 bg-zinc-950 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-baseline mb-4"><span className="text-[10px] text-zinc-500 uppercase font-mono">ИТОГ:</span><span className="text-3xl font-black tracking-tight font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{calculatePrice()}</span></div>
                    <button type="button" onClick={handleSendAssembly} disabled={isSending} className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-black font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all rounded-xl disabled:opacity-50">{isSending ? 'СОХРАНЕНИЕ...' : editMode ? '💾 ОБНОВИТЬ СБОРКУ' : 'ОТПРАВИТЬ СБОРКУ И ПРИНТ'}</button>
                </div>
            </motion.aside>
            <div className="flex-1 relative h-full bg-[#121214] flex flex-col">
                {Studio ? (
                    <Studio.Canvas shadows camera={{ position: [0, 3.8, 5.2], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}>
                        <color attach="background" args={['#121214']} />
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.3} color="#ffffff" />
                            <spotLight position={[5, 8, 4]} intensity={2.5} angle={0.35} penumbra={0.8} castShadow />
                            <directionalLight position={[-4, 5, -4]} intensity={1.2} color="#ffffff" />
                            <KeyboardEngine Studio={Studio} layout={layout} caseColor={caseColor} keycapColor={keycapColor} volumeColor={volumeColor} switchColor={switchColor} keycapMaterialType={keycapMaterialType} revealSwitches={revealSwitches} rgbMode={rgbMode} hoveredSection={hoveredSection} waveResetTrigger={waveResetTrigger} printBlobUrl={printBlobUrl} />
                            <Studio.Environment preset="studio" environmentIntensity={0.25} />
                            <Studio.ContactShadows position={[0, -0.65, 0]} opacity={0.6} scale={10} blur={2.2} far={2.0} color="#000000" />
                            <Studio.OrbitControls makeDefault enablePan={false} minDistance={3.0} maxDistance={7.5} maxPolarAngle={Math.PI / 2.1} />
                        </Suspense>
                    </Studio.Canvas>
                ) : (<div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-xs bg-[#121214]">LOADING 3D STUDIO CORE...</div>)}
            </div>
        </div>
    );
}

function KeyboardEngine({ Studio, layout, caseColor, keycapColor, volumeColor, switchColor, keycapMaterialType, revealSwitches, rgbMode, hoveredSection, waveResetTrigger, printBlobUrl }: any) {
    const { useFrame } = Studio;
    const model80 = Studio.useGLTF('/models/main.glb');
    const model100 = Studio.useGLTF('/models/mainfull.glb');
    const currentModel = layout === '100' ? model100 : model80;
    const { scene } = currentModel;
    const waveStartTime = useRef<number>(-10);
    const lastTrigger = useRef<number>(0);
    const currentTexture = useRef<THREE.Texture | null>(null);

    useEffect(() => {
        if (printBlobUrl) {
            new THREE.TextureLoader().load(printBlobUrl, (texture) => {
                texture.flipY = true; texture.center.set(0.5, 0.5); texture.rotation = Math.PI;
                texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping;
                currentTexture.current = texture;
            });
        } else { currentTexture.current = null; }
    }, [printBlobUrl]);

    useEffect(() => {
        const keycapsArray: any[] = [];
        scene.updateMatrixWorld(true);
        const globalBox = new THREE.Box3().setFromObject(scene);
        const minBound = globalBox.min, maxBound = globalBox.max;
        const totalSizeX = maxBound.x - minBound.x || 1, totalSizeZ = maxBound.z - minBound.z || 1;
        scene.traverse((child: any) => {
            if (!child.isMesh) return;
            if (child.userData.initialY === undefined) child.userData.initialY = child.position.y;
            const geometry = child.geometry;
            if (geometry && geometry.attributes.position) {
                const posAttr = geometry.attributes.position;
                const customUvArray = new Float32Array(posAttr.count * 2);
                const tempLocalVertex = new THREE.Vector3(), tempWorldVertex = new THREE.Vector3();
                for (let i = 0; i < posAttr.count; i++) {
                    tempLocalVertex.fromBufferAttribute(posAttr, i);
                    tempWorldVertex.copy(tempLocalVertex).applyMatrix4(child.matrixWorld);
                    customUvArray[i * 2] = 1 - (tempWorldVertex.x - minBound.x) / totalSizeX;
                    customUvArray[i * 2 + 1] = (tempWorldVertex.z - minBound.z) / totalSizeZ;
                }
                geometry.setAttribute('uv', new THREE.BufferAttribute(customUvArray, 2));
                geometry.attributes.uv.needsUpdate = true;
            }
            const meshName = child.name.toLowerCase();
            child.userData.customType = '';
            if (meshName.includes('board') || meshName.includes('case') || meshName.includes('body')) child.userData.customType = 'board';
            else if (meshName.includes('volume') || meshName.includes('knob')) child.userData.customType = 'volume';
            else if (meshName.includes('stem') || meshName.includes('shtok') || meshName.includes('axis')) child.userData.customType = 'switch_stem_mesh';
            else if (meshName.includes('switc') || meshName.includes('housing_sw')) child.userData.customType = 'switch_housing_mesh';
            else if (meshName.includes('keycap') || meshName.includes('button') || child.position.y > 0.35) { child.userData.customType = 'keycap'; keycapsArray.push(child); }
        });
        keycapsArray.sort((a, b) => a.position.x - b.position.x);
        keycapsArray.forEach((key: any, index: number) => { key.userData.waveIndex = index; });
    }, [scene, layout, printBlobUrl]);

    useFrame((state: any) => {
        const time = state.clock.getElapsedTime();
        if (waveResetTrigger !== lastTrigger.current) { waveStartTime.current = time; lastTrigger.current = waveResetTrigger; }
        const currentWaveTime = time - waveStartTime.current;
        scene.traverse((child: any) => {
            if (!child.isMesh) return;
            const type = child.userData.customType;
            const applyMaterialSettings = (mat: any, defaultColor: string, roughness: number, metalness: number, envIntensity = 0.3) => {
                if (!mat) return;
                if (currentTexture.current) { mat.map = currentTexture.current; mat.color.set('#ffffff'); }
                else { mat.map = null; mat.color.set(defaultColor); }
                mat.roughness = roughness; mat.metalness = metalness; mat.envMapIntensity = envIntensity; mat.needsUpdate = true;
            };
            if (!child.userData.materialCloned && child.material) {
                child.material = Array.isArray(child.material) ? child.material.map((m: any) => m.clone()) : child.material.clone();
                child.userData.materialCloned = true;
            }
            if (type === 'keycap') {
                const initY = child.userData.initialY ?? child.position.y; let targetY = initY;
                if (revealSwitches) targetY = initY + 0.45; else if (hoveredSection === 'keycaps') targetY = initY + 0.12;
                if (currentWaveTime >= 0 && currentWaveTime < 1.5) { const si = child.userData.waveIndex ?? 0; const phase = (currentWaveTime - si * 0.012) * 10; if (phase > 0 && phase < Math.PI) targetY += Math.sin(phase) * 0.08; }
                child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.15);
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any) => {
                    applyMaterialSettings(mat, keycapColor, keycapMaterialType === 'matte' ? 0.75 : 0.1, keycapMaterialType === 'metallic' ? 0.95 : 0.0, 0.5);
                    if (keycapMaterialType === 'clear' && !currentTexture.current) { mat.transparent = true; mat.opacity = 0.45; } else { mat.transparent = false; mat.opacity = 1.0; }
                });
            } else if (type === 'switch_stem_mesh' || type === 'switch_housing_mesh') {
                const initY = child.userData.initialY ?? child.position.y; let targetY = initY;
                if (hoveredSection === 'switches') targetY = initY + 0.2;
                child.position.y = THREE.MathUtils.lerp(child.position.y, targetY, 0.15);
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((mat: any, index: number) => {
                    if (!mat) return;
                    const isStem = mat.name.toLowerCase().includes('stem') || mat.name.toLowerCase().includes('shtok') || (type === 'switch_stem_mesh') || (mats.length > 1 && index === 1);
                    if (isStem) applyMaterialSettings(mat, switchColor, 0.35, 0.0, 0.4);
                    else { applyMaterialSettings(mat, '#1a1a1e', 0.5, 0.1, 0.3); if (mat.emissive) { if (rgbMode) { mat.emissive.setHSL((time * 0.3 + child.position.x * 0.05) % 1, 1, 0.5); mat.emissiveIntensity = 2.5; } else { mat.emissive.set('#000000'); mat.emissiveIntensity = 0; } } }
                });
            } else if (type === 'board') { const mats = Array.isArray(child.material) ? child.material : [child.material]; mats.forEach((mat: any) => applyMaterialSettings(mat, caseColor, 0.35, 0.15, 0.5)); }
            else if (layout === '80' && type === 'volume') { const mats = Array.isArray(child.material) ? child.material : [child.material]; mats.forEach((mat: any) => applyMaterialSettings(mat, volumeColor, 0.15, 0.85, 0.8)); }
        });
    });
    return <primitive object={scene} dispose={null} />;
}
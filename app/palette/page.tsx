export default function ColorPalette() {
    const colors = [
        { name: 'Графитовый фон', hex: '#05040b' },
        { name: 'Неоновый циан', hex: '#22d3ee' },
        { name: 'Фиолетовый', hex: '#a855f7' },
        { name: 'Розовый', hex: '#ec4899' },
        { name: 'Белый текст', hex: '#ffffff' },
        { name: 'Градиент (Циан → Фиолет → Розовый)', hex: 'gradient' },
    ];

    return (
        <div style={{
            background: '#0a0a0f',
            fontFamily: "'Courier New', monospace",
            padding: 40,
            color: 'white',
            minHeight: '100vh'
        }}>
            <p style={{
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: 3,
                color: '#888',
                marginBottom: 30,
                textAlign: 'center'
            }}>
                Рисунок 2 — Палитра цветов
            </p>
            <div style={{
                display: 'flex',
                gap: 20,
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                {colors.map((color) => (
                    <div key={color.name} style={{
                        width: color.hex === 'gradient' ? 280 : 120,
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '100%',
                            height: 120,
                            borderRadius: 16,
                            marginBottom: 12,
                            border: '2px solid rgba(255,255,255,0.1)',
                            background: color.hex === 'gradient'
                                ? 'linear-gradient(135deg, #22d3ee, #a855f7, #ec4899)'
                                : color.hex
                        }} />
                        <p style={{
                            fontSize: 11,
                            letterSpacing: 1,
                            color: '#aaa',
                            marginBottom: 4
                        }}>
                            {color.name}
                        </p>
                        <p style={{
                            fontSize: 14,
                            fontWeight: 'bold'
                        }}>
                            {color.hex === 'gradient' ? '#22d3ee → #a855f7 → #ec4899' : color.hex}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
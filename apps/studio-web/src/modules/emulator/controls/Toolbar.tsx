import React, { useEffect, useState, useRef } from 'react';
import styles from './Toolbar.module.scss';
import { useEmulatorStore } from '../store/emulatorStore';

const API_BASE_URL = 'http://localhost:21324/api/v1/led';

type ThemeItem = string | { id: string; name: string };

// Generate multiples of 16 from 16 to 160
const GRID_STEP_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) * 16);

export const Toolbar: React.FC = () => {
    const [themes, setThemes] = useState<ThemeItem[]>([]);
    const [selectedTheme, setSelectedTheme] = useState<string>('none');
    const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
    const [brightness, setBrightness] = useState<number>(100);

    // Playback States
    const [isPowerOn, setIsPowerOn] = useState<boolean>(true);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);

    // Sync width/height directly with current frame received from Python via Zustand store
    const width = useEmulatorStore((state) => state.width);
    const height = useEmulatorStore((state) => state.height);
    const setDimensions = useEmulatorStore((state) => state.setDimensions);

    // Custom Input Toggle States
    const [isCustomWidth, setIsCustomWidth] = useState<boolean>(false);
    const [isCustomHeight, setIsCustomHeight] = useState<boolean>(false);
    const [customWVal, setCustomWVal] = useState<number>(width);
    const [customHVal, setCustomHVal] = useState<number>(height);

    const isFetchedRef = useRef<boolean>(false);

    // Keep custom input fields in sync if server updates resolution automatically
    useEffect(() => {
        setCustomWVal(width);
        if (!GRID_STEP_OPTIONS.includes(width)) {
            setIsCustomWidth(true);
        }
    }, [width]);

    useEffect(() => {
        setCustomHVal(height);
        if (!GRID_STEP_OPTIONS.includes(height)) {
            setIsCustomHeight(true);
        }
    }, [height]);

    useEffect(() => {
        if (isFetchedRef.current) return;
        isFetchedRef.current = true;

        const fetchThemes = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/themes`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();

                if (data.themes && Array.isArray(data.themes)) {
                    // Prepend 'none' as the first default option
                    const updatedThemes = ['none', ...data.themes];
                    setThemes(updatedThemes);
                    setSelectedTheme('none');
                } else {
                    setThemes(['none']);
                }
            } catch (err) {
                console.error('Failed to load available themes:', err);
                setThemes(['none']);
            }
        };

        fetchThemes();
    }, []);

    // --- Control Handlers ---

    // Single Power Button toggle (Red / Green)
    const handlePowerToggle = async () => {
        const nextPower = !isPowerOn;
        setIsPowerOn(nextPower);
        setIsPlaying(nextPower);

        try {
            await fetch(`${API_BASE_URL}/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: nextPower }),
            });
        } catch (err) {
            console.error('Failed to toggle power:', err);
        }
    };

    // Single Play / Pause Button toggle
    const handlePlayPauseToggle = async () => {
        const nextPlay = !isPlaying;
        setIsPlaying(nextPlay);

        try {
            await fetch(`${API_BASE_URL}/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: nextPlay }),
            });
        } catch (err) {
            console.error('Failed to toggle playback:', err);
        }
    };

    // Stop Button (Disables stream & enables grid modification)
    const handleStop = async () => {
        setIsPlaying(false);
        setIsPowerOn(false);

        try {
            await fetch(`${API_BASE_URL}/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: false }),
            });
        } catch (err) {
            console.error('Failed to stop emulator:', err);
        }
    };

    const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const themeValue = e.target.value;
        setSelectedTheme(themeValue);

        try {
            await fetch(`${API_BASE_URL}/theme`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: themeValue }),
            });
        } catch (err) {
            console.error('Failed to update theme:', err);
        }
    };

    const handleColorChange = async (color: string) => {
        setSelectedColor(color);

        try {
            await fetch(`${API_BASE_URL}/color`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color }),
            });
        } catch (err) {
            console.error('Failed to set color:', err);
        }
    };

    const handleBrightnessChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setBrightness(val);

        try {
            await fetch(`${API_BASE_URL}/brightness`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: val }),
            });
        } catch (err) {
            console.error('Failed to update brightness:', err);
        }
    };

    // Commit Grid Resizing to Python Backend
    const applyGridChange = async (newW: number, newH: number) => {
        const targetW = Math.max(1, newW);
        const targetH = Math.max(1, newH);

        setDimensions(targetW, targetH);

        try {
            await fetch(`${API_BASE_URL}/grid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width: targetW, height: targetH }),
            });
        } catch (err) {
            console.error('Failed to update grid dimensions:', err);
        }
    };

    // Grid Sizing Enable Guard (Must stop playback first)
    const isGridEditingDisabled = isPlaying || isPowerOn;

    return (
        <div className={styles.toolbar}>
            {/* Playback Controls */}
            <div className={styles.group}>
                {/* Single Power Button (Green when ON, Red when OFF) */}
                <button
                    className={`${styles.btn} ${isPowerOn ? styles.powerOnBtn : styles.powerOffBtn}`}
                    onClick={handlePowerToggle}
                    title={isPowerOn ? 'Power Off' : 'Power On'}
                    style={{
                        backgroundColor: isPowerOn ? '#22c55e' : '#ef4444',
                        color: '#fff',
                    }}
                >
                    ⏻ {isPowerOn ? 'ON' : 'OFF'}
                </button>

                {/* Single Play/Pause Toggle */}
                <button
                    className={`${styles.btn} ${isPlaying ? styles.activeBtn : ''}`}
                    onClick={handlePlayPauseToggle}
                    disabled={!isPowerOn}
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>

                {/* Stop Button */}
                <button
                    className={`${styles.btn} ${!isPlaying && !isPowerOn ? styles.activeBtn : ''}`}
                    onClick={handleStop}
                    title="Stop Emulator (Unlocks Grid Resize)"
                >
                    ⏹ Stop
                </button>
            </div>

            {/* Theme Selector */}
            <div className={styles.group}>
                <label htmlFor="theme-select">Theme:</label>
                <select
                    id="theme-select"
                    value={selectedTheme}
                    onChange={handleThemeChange}
                    className={styles.select}
                >
                    {themes.map((item, idx) => {
                        const val = typeof item === 'object' ? item.id : item;
                        const label = typeof item === 'object' ? (item.name || item.id) : item;

                        return (
                            <option key={`${val}-${idx}`} value={val}>
                                {label}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Single Custom Color Picker (No presets) */}
            <div className={styles.group}>
                <label htmlFor="color-picker">Color:</label>
                <input
                    id="color-picker"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className={styles.colorPicker}
                    title="Choose Custom Color"
                />
            </div>

            {/* Brightness Control */}
            <div className={styles.group}>
                <label htmlFor="brightness-slider">Brightness: {brightness}%</label>
                <input
                    id="brightness-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={handleBrightnessChange}
                    className={styles.slider}
                />
            </div>

            {/* Dynamic Width & Height Controls */}
            <div className={`${styles.group} ${isGridEditingDisabled ? styles.disabledGroup : ''}`}>
                <label htmlFor="width-select">W:</label>
                {!isCustomWidth ? (
                    <select
                        id="width-select"
                        value={width}
                        disabled={isGridEditingDisabled}
                        onChange={(e) => {
                            if (e.target.value === 'custom') {
                                setIsCustomWidth(true);
                            } else {
                                applyGridChange(parseInt(e.target.value, 10), height);
                            }
                        }}
                        className={styles.select}
                    >
                        {GRID_STEP_OPTIONS.map((val) => (
                            <option key={`w-${val}`} value={val}>
                                {val}
                            </option>
                        ))}
                        <option value="custom">Custom...</option>
                    </select>
                ) : (
                    <div className={styles.customInputWrapper}>
                        <input
                            type="number"
                            min="16"
                            max="160"
                            value={customWVal}
                            disabled={isGridEditingDisabled}
                            onChange={(e) => setCustomWVal(parseInt(e.target.value, 10) || 0)}
                            onBlur={() => applyGridChange(customWVal, height)}
                            className={styles.numInput}
                        />
                        <button
                            disabled={isGridEditingDisabled}
                            onClick={() => setIsCustomWidth(false)}
                            className={styles.closeCustomBtn}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <label htmlFor="height-select">H:</label>
                {!isCustomHeight ? (
                    <select
                        id="height-select"
                        value={height}
                        disabled={isGridEditingDisabled}
                        onChange={(e) => {
                            if (e.target.value === 'custom') {
                                setIsCustomHeight(true);
                            } else {
                                applyGridChange(width, parseInt(e.target.value, 10));
                            }
                        }}
                        className={styles.select}
                    >
                        {GRID_STEP_OPTIONS.map((val) => (
                            <option key={`h-${val}`} value={val}>
                                {val}
                            </option>
                        ))}
                        <option value="custom">Custom...</option>
                    </select>
                ) : (
                    <div className={styles.customInputWrapper}>
                        <input
                            type="number"
                            min="16"
                            max="160"
                            value={customHVal}
                            disabled={isGridEditingDisabled}
                            onChange={(e) => setCustomHVal(parseInt(e.target.value, 10) || 0)}
                            onBlur={() => applyGridChange(width, customHVal)}
                            className={styles.numInput}
                        />
                        <button
                            disabled={isGridEditingDisabled}
                            onClick={() => setIsCustomHeight(false)}
                            className={styles.closeCustomBtn}
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
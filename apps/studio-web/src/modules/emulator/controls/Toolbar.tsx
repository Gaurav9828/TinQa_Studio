import React, { useEffect, useState, useRef } from 'react';
import styles from './Toolbar.module.scss';
import { useEmulatorStore } from '../store/emulatorStore';
import { EMULATOR_CONFIG } from "@core/config";

interface EffectOption {
    id: string;
    name: string;
    endpoint: string;
    default_duration_minutes: number;
}

interface SelectedLayerConfig {
    id: string;
    density: number;
}

const GRID_STEP_OPTIONS = Array.from({ length: 100 }, (_, i) => (i + 1) * 16);

export const Toolbar: React.FC = () => {
    // Base Weather & Multi-Select State
    const [hasBaseWeather, setHasBaseWeather] = useState<boolean>(true);
    const [themes, setThemes] = useState<EffectOption[]>([]);
    const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([]);
    const [layerDensities, setLayerDensities] = useState<Record<string, number>>({});
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    
    // Default Cycle set to 24 Hours
    const [durationUnit, setDurationUnit] = useState<'hours' | 'minutes'>('hours');
    const [durationValue, setDurationValue] = useState<number>(24);

    // Color & Brightness State
    const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
    const [brightness, setBrightness] = useState<number>(100);

    // Store sync
    const width = useEmulatorStore((state) => state.width);
    const height = useEmulatorStore((state) => state.height);
    const setDimensions = useEmulatorStore((state) => state.setDimensions);

    // Grid Editing Toggles
    const [isCustomWidth, setIsCustomWidth] = useState<boolean>(false);
    const [isCustomHeight, setIsCustomHeight] = useState<boolean>(false);
    const [customWVal, setCustomWVal] = useState<number>(width);
    const [customHVal, setCustomHVal] = useState<number>(height);

    const isPowerOn = useEmulatorStore((state) => state.isPowerOn);
    const isPlaying = useEmulatorStore((state) => state.isPlaying);
    const setDeviceStatus = useEmulatorStore((state) => state.setDeviceStatus);

    const isFetchedRef = useRef<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCustomWVal(width);
        if (!GRID_STEP_OPTIONS.includes(width)) setIsCustomWidth(true);
    }, [width]);

    useEffect(() => {
        setCustomHVal(height);
        if (!GRID_STEP_OPTIONS.includes(height)) setIsCustomHeight(true);
    }, [height]);

    // Close theme dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch registered themes directly from backend API without client-side filtering
    useEffect(() => {
        if (isFetchedRef.current) return;
        isFetchedRef.current = true;

        const fetchThemes = async () => {
            try {
                const res = await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/themes`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setThemes(data);
                } else if (data.status === "success" && Array.isArray(data.themes)) {
                    setThemes(data.themes);
                }
            } catch (err) {
                console.error('Failed to load available themes:', err);
            }
        };

        fetchThemes();
    }, []);

    useEffect(() => {
        const syncDeviceStatusOnLoad = async () => {
            try {
                const res = await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/status`);
                if (res.ok) {
                    const data = await res.json();
                    useEmulatorStore.getState().setServerStatus(data.device_status, data.fps);
                }
            } catch (err) {
                console.error('Failed to sync state on mount:', err);
            }
        };

        syncDeviceStatusOnLoad();
    }, []);

    // Sync state with backend API
    const syncCompositeTheme = async (
        baseWeatherActive: boolean,
        selectedIds: string[],
        densities: Record<string, number>
    ) => {
        const selectedEffects: SelectedLayerConfig[] = selectedIds.map((id) => ({
            id,
            density: densities[id] !== undefined ? densities[id] : 0.5,
        }));

        const totalMinutes = durationUnit === 'hours' ? durationValue * 60 : durationValue;

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/theme`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: "composite",
                    has_base_weather: baseWeatherActive,
                    duration_minutes: totalMinutes,
                    selected_effects: selectedEffects,
                }),
            });
        } catch (err) {
            console.error('Failed to update composite theme:', err);
        }
    };

    const handleThemeToggle = (id: string) => {
        let updatedIds: string[];
        if (selectedThemeIds.includes(id)) {
            updatedIds = selectedThemeIds.filter((item) => item !== id);
        } else {
            updatedIds = [...selectedThemeIds, id];
        }

        setSelectedThemeIds(updatedIds);

        const updatedDensities = { ...layerDensities };
        if (updatedDensities[id] === undefined) {
            updatedDensities[id] = 0.5; // Default 50%
        }

        setLayerDensities(updatedDensities);
        syncCompositeTheme(hasBaseWeather, updatedIds, updatedDensities);
    };

    const handleBaseWeatherToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextVal = e.target.checked;
        setHasBaseWeather(nextVal);
        syncCompositeTheme(nextVal, selectedThemeIds, layerDensities);
    };

    const handleDensityChange = (id: string, value: number) => {
        const updatedDensities = { ...layerDensities, [id]: value };
        setLayerDensities(updatedDensities);
        syncCompositeTheme(hasBaseWeather, selectedThemeIds, updatedDensities);
    };

    const handlePowerToggle = async () => {
        const nextPower = !isPowerOn;

        // Immediately update local & global store
        if (!nextPower) {
            setDeviceStatus('Stopped', 0);
        } else {
            setDeviceStatus('Connected', 30);
        }

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: nextPower, paused: false }),
            });
        } catch (err) {
            console.error('Failed to toggle power:', err);
        }
    };

    // 3. Updated Play / Pause Toggle
    const handlePlayPauseToggle = async () => {
        const nextPlay = !isPlaying;

        // Immediately update local & global store
        if (nextPlay) {
            setDeviceStatus('Connected', 30);
        } else {
            setDeviceStatus('Paused', 0);
        }

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: true, paused: !nextPlay }),
            });
        } catch (err) {
            console.error('Failed to toggle playback:', err);
        }
    };

    // 4. Updated Stop Handler
    const handleStop = async () => {
        setDeviceStatus('Stopped', 0);

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ power: false, paused: true }),
            });
        } catch (err) {
            console.error('Failed to stop emulator:', err);
        }
    };

    const handleDurationChange = async (unit: 'hours' | 'minutes', value: number) => {
        setDurationUnit(unit);
        setDurationValue(value);

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/duration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ unit, value }),
            });
        } catch (err) {
            console.error('Failed to update duration:', err);
        }
    };

    const handleColorChange = async (color: string) => {
        setSelectedColor(color);

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/color`, {
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
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/brightness`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: val }),
            });
        } catch (err) {
            console.error('Failed to update brightness:', err);
        }
    };

    const applyGridChange = async (newW: number, newH: number) => {
        const targetW = Math.min(1600, Math.max(16, newW));
        const targetH = Math.min(1600, Math.max(16, newH));

        setDimensions(targetW, targetH);

        try {
            await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/api/v1/led/grid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ width: targetW, height: targetH }),
            });
        } catch (err) {
            console.error('Failed to update grid dimensions:', err);
        }
    };

    const isGridEditingDisabled = isPlaying || isPowerOn;

    return (
        <div 
            className={styles.toolbar} 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                width: '100%', 
                boxSizing: 'border-box',
                gap: '12px', 
                padding: '6px 12px',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            
            {/* 1. PLAYBACK CONTROLS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flexShrink: 0 }}>
                <button
                    className={`${styles.btn} ${!isPowerOn ? styles.powerOnBtn : styles.powerOffBtn}`}
                    onClick={handlePowerToggle}
                    style={{ backgroundColor: !isPowerOn ? '#22c55e' : '#ef4444', color: '#fff', padding: '3px 8px', fontSize: '11px' }}
                >
                    ⏻ {!isPowerOn ? 'ON' : 'OFF'}
                </button>

                <button
                    className={`${styles.btn} ${!isPlaying ? styles.activeBtn : ''}`}
                    onClick={handlePlayPauseToggle}
                    disabled={!isPowerOn}
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>

                <button
                    className={styles.btn}
                    onClick={handleStop}
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                >
                    ⏹ Stop
                </button>
            </div>

            <div style={{ height: '65px', width: '1px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* 2. BASE WEATHER CHECKBOX & MULTI-SELECT DROPDOWN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, position: 'relative' }} ref={dropdownRef}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
                    <input
                        type="checkbox"
                        checked={hasBaseWeather}
                        onChange={handleBaseWeatherToggle}
                    />
                    Base Weather
                </label>

                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                        width: '130px', 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        backgroundColor: '#fff'
                    }}
                >
                    <span>{selectedThemeIds.length ? `${selectedThemeIds.length} Selected` : 'Select Themes'}</span>
                    <span>▾</span>
                </button>

                {isDropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        backgroundColor: '#ffffff',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        zIndex: 9999,
                        width: '150px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                        marginTop: '4px'
                    }}>
                        {themes.map((item) => (
                            <label 
                                key={item.id} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    fontSize: '11px', 
                                    padding: '4px 0', 
                                    cursor: 'pointer',
                                    color: '#333'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedThemeIds.includes(item.id)}
                                    onChange={() => handleThemeToggle(item.id)}
                                />
                                {item.name || item.id}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ height: '65px', width: '1px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* 3. SELECTED THEME DENSITY SLIDERS */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                paddingLeft: '6px', 
                paddingRight: '6px',
                maxHeight: '80px', 
                overflowY: 'auto',
                minWidth: '220px',
                maxWidth: '320px',
                flexShrink: 0
            }}>
                {selectedThemeIds.length === 0 ? (
                    <span style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', margin: 'auto 0' }}>
                        No additional themes selected
                    </span>
                ) : (
                    selectedThemeIds.map((id) => {
                        const effectObj = themes.find((t) => t.id === id);
                        const effectName = effectObj ? effectObj.name : id;
                        const currentDensity = layerDensities[id] !== undefined ? layerDensities[id] : 0.5;

                        return (
                            <div 
                                key={`theme-row-${id}`} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    width: '100%',
                                    minHeight: '20px'
                                }}
                            >
                                <span style={{ fontSize: '11px', fontWeight: 600, width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {effectName}
                                </span>

                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={currentDensity}
                                    onChange={(e) => handleDensityChange(id, parseFloat(e.target.value))}
                                    style={{ flex: '1', height: '4px', cursor: 'pointer' }}
                                />

                                <span style={{ fontSize: '10px', color: '#666', width: '30px', textAlign: 'right', flexShrink: 0 }}>
                                    {Math.round(currentDensity * 100)}%
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{ height: '65px', width: '1px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* 4. CYCLE DURATION (DEFAULT: 24 HOURS) & COLOR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <label style={{ fontSize: '11px' }}>Cycle:</label>
                    <select
                        value={durationUnit}
                        onChange={(e) => handleDurationChange(e.target.value as 'hours' | 'minutes', durationValue)}
                        style={{ fontSize: '11px' }}
                    >
                        <option value="hours">Hours</option>
                        <option value="minutes">Mins</option>
                    </select>

                    <select
                        value={durationValue}
                        onChange={(e) => handleDurationChange(durationUnit, parseFloat(e.target.value))}
                        style={{ fontSize: '11px' }}
                    >
                        {(durationUnit === 'hours' ? Array.from({ length: 24 }, (_, i) => i + 1) : Array.from({ length: 60 }, (_, i) => i + 1)).map((val) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '11px' }}>Color:</label>
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        style={{ width: '24px', height: '22px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                </div>
            </div>

            <div style={{ height: '65px', width: '1px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* 5. VERTICAL BRIGHTNESS CONTROL */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px' }}>{brightness}%</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={brightness}
                    onChange={handleBrightnessChange}
                    style={{
                        writingMode: 'bt-lr' as any,
                        WebkitAppearance: 'slider-vertical',
                        width: '8px',
                        height: '40px'
                    }}
                />
                <span style={{ fontSize: '10px' }}>Bright</span>
            </div>

            <div style={{ height: '65px', width: '1px', backgroundColor: '#e5e7eb', flexShrink: 0 }} />

            {/* 6. MATRIX GRID DIMENSION CONTROLS */}
            <div className={`${styles.group} ${isGridEditingDisabled ? styles.disabledGroup : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '11px' }}>W:</label>
                    <select
                        value={width}
                        disabled={isGridEditingDisabled}
                        onChange={(e) => applyGridChange(parseInt(e.target.value, 10), height)}
                        style={{ fontSize: '11px' }}
                    >
                        {GRID_STEP_OPTIONS.map((val) => (
                            <option key={`w-${val}`} value={val}>{val}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '11px' }}>H:</label>
                    <select
                        value={height}
                        disabled={isGridEditingDisabled}
                        onChange={(e) => applyGridChange(width, parseInt(e.target.value, 10))}
                        style={{ fontSize: '11px' }}
                    >
                        {GRID_STEP_OPTIONS.map((val) => (
                            <option key={`h-${val}`} value={val}>{val}</option>
                        ))}
                    </select>
                </div>
            </div>

        </div>
    );
};

export default Toolbar;
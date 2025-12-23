import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SECRET_TOKEN = 'phantom-gate-2024';
const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const TRIPLE_CLICK_TIMEOUT = 500;
const LOGO_RHYTHM = [300, 300, 600]; // Short, short, long rhythm pattern (milliseconds)
const RHYTHM_TOLERANCE = 150;

export const useSecretAccess = () => {
  const navigate = useNavigate();
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [rhythmClicks, setRhythmClicks] = useState<number[]>([]);

  // Navigate to secret auth page
  const activateSecretAccess = useCallback(() => {
    navigate(`/auth?access=${SECRET_TOKEN}`);
  }, [navigate]);

  // Konami code detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() === e.key ? e.key : e.key;
      const expectedKey = KONAMI_CODE[konamiIndex];

      if (key === expectedKey || key.toLowerCase() === expectedKey) {
        const newIndex = konamiIndex + 1;
        if (newIndex === KONAMI_CODE.length) {
          activateSecretAccess();
          setKonamiIndex(0);
        } else {
          setKonamiIndex(newIndex);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex, activateSecretAccess]);

  // Triple-click detection for secret elements
  const handleSecretClick = useCallback(() => {
    setClickCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (clickCount > 0) {
      const timeout = setTimeout(() => {
        if (clickCount >= 3) {
          activateSecretAccess();
        }
        setClickCount(0);
      }, TRIPLE_CLICK_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [clickCount, activateSecretAccess]);

  // Rhythm-based click detection (for logo clicks)
  const handleRhythmClick = useCallback(() => {
    const now = Date.now();
    setRhythmClicks(prev => {
      const newClicks = [...prev, now];
      
      // Keep only relevant clicks
      if (newClicks.length > LOGO_RHYTHM.length + 1) {
        newClicks.shift();
      }

      // Check if rhythm matches
      if (newClicks.length === LOGO_RHYTHM.length + 1) {
        const intervals = [];
        for (let i = 1; i < newClicks.length; i++) {
          intervals.push(newClicks[i] - newClicks[i - 1]);
        }

        const matches = intervals.every((interval, i) => 
          Math.abs(interval - LOGO_RHYTHM[i]) <= RHYTHM_TOLERANCE
        );

        if (matches) {
          setTimeout(() => activateSecretAccess(), 100);
          return [];
        }
      }

      return newClicks;
    });
  }, [activateSecretAccess]);

  // Clear rhythm after timeout
  useEffect(() => {
    if (rhythmClicks.length > 0) {
      const timeout = setTimeout(() => setRhythmClicks([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [rhythmClicks]);

  return {
    handleSecretClick, // For triple-click triggers
    handleRhythmClick, // For rhythm-based logo clicks
    activateSecretAccess, // Direct access
  };
};

export default useSecretAccess;

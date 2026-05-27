import { useEffect, useState, useRef, useCallback } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { store } from './store';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Lock, Fingerprint, Delete, Check, ShieldAlert } from 'lucide-react';

function AppContent() {
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem('app_lock_enabled') === 'true';
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const lastActiveRef = useRef<number>(Date.now());

  // Check hardware biometric availability
  const checkBiometrics = useCallback(async () => {
    try {
      const result = await NativeBiometric.isAvailable();
      if (result.isAvailable) {
        setIsBiometricsAvailable(true);
        return true;
      }
    } catch (e) {
      console.log('Biometrics not available on this platform/device', e);
    }
    setIsBiometricsAvailable(false);
    return false;
  }, []);

  // Trigger Native Biometrics Verification
  const triggerBiometrics = useCallback(async () => {
    try {
      const isAvailable = await checkBiometrics();
      if (!isAvailable) return;

      await NativeBiometric.verifyIdentity({
        reason: 'Authenticate to unlock the application',
        title: 'App Lock',
        subtitle: 'Verify your identity to proceed',
        description: 'Scan fingerprint, face, pattern or PIN'
      });

      // Authentication successful
      setUnlockSuccess(true);
      setTimeout(() => {
        setIsLocked(false);
        setUnlockSuccess(false);
        setEnteredPin('');
      }, 500);
    } catch (error: any) {
      console.log('Biometric auth failed or cancelled:', error);
    }
  }, [checkBiometrics]);

  // Handle keypad number press
  const handleNumberPress = useCallback((num: string) => {
    if (enteredPin.length >= 4) return;
    setPinError('');
    
    const newPin = enteredPin + num;
    setEnteredPin(newPin);

    if (newPin.length === 4) {
      const correctPin = localStorage.getItem('app_lock_pin');
      if (newPin === correctPin) {
        setUnlockSuccess(true);
        setTimeout(() => {
          setIsLocked(false);
          setUnlockSuccess(false);
          setEnteredPin('');
        }, 500);
      } else {
        setIsShaking(true);
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([100, 50, 100]);
        }
        setPinError('Incorrect PIN. Please try again.');
        setTimeout(() => {
          setEnteredPin('');
          setIsShaking(false);
        }, 500);
      }
    }
  }, [enteredPin]);

  // Delete last digit entered
  const handleDelete = useCallback(() => {
    if (enteredPin.length > 0) {
      setPinError('');
      setEnteredPin(prev => prev.slice(0, -1));
    }
  }, [enteredPin]);

  // Trigger biometrics on initial mount if app is locked
  useEffect(() => {
    if (isLocked) {
      triggerBiometrics();
    }
  }, []);

  // Setup app background listener to re-lock after 30 seconds of outage
  useEffect(() => {
    const handleVisibilityChange = () => {
      const lockEnabled = localStorage.getItem('app_lock_enabled') === 'true';
      if (!lockEnabled) return;

      if (document.visibilityState === 'hidden') {
        lastActiveRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const timeElapsed = Date.now() - lastActiveRef.current;
        // Re-lock if background duration exceeds 30 seconds
        if (timeElapsed > 30000) {
          setIsLocked(true);
          setEnteredPin('');
          setPinError('');
          setTimeout(() => {
            triggerBiometrics();
          }, 100);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [triggerBiometrics]);

  return (
    <>
      <RouterProvider router={router} />
      {isLocked && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-2xl animate-scale-in">
          {/* Style tag for dynamic CSS micro-animations */}
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-8px); }
              40%, 80% { transform: translateX(8px); }
            }
            .animate-shake {
              animation: shake 0.4s ease-in-out;
            }
            @keyframes pulsate {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.06); opacity: 1; }
            }
            .animate-pulsate {
              animation: pulsate 2.5s infinite ease-in-out;
            }
            @keyframes scaleIn {
              0% { transform: scale(0.95); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
              animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
          
          <div className="absolute -inset-10 rounded-full bg-emerald-500/5 blur-3xl opacity-70" />
          
          <div className="relative w-full max-w-sm p-8 rounded-3xl border border-white/20 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/60 shadow-2xl backdrop-blur-md text-center flex flex-col items-center justify-center">
            {/* Pulsating Shield Lock Icon or Success Checkmark */}
            <div className="mb-6 relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 shadow-inner border border-emerald-500/20 dark:border-emerald-500/10">
              {unlockSuccess ? (
                <Check className="h-10 w-10 text-emerald-500 animate-scale-in" />
              ) : (
                <Lock className="h-10 w-10 text-emerald-500 dark:text-emerald-400 animate-pulsate" />
              )}
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {unlockSuccess ? 'Welcome Back!' : 'App Locked'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[240px] mx-auto">
              {unlockSuccess ? 'Unlocking your session...' : 'Please enter your 4-digit PIN or authenticate with biometrics.'}
            </p>

            {/* Visual PIN Circle Indicators */}
            <div className={`flex justify-center space-x-4 my-8 ${isShaking ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isShaking
                      ? 'border-rose-500 bg-rose-500'
                      : index < enteredPin.length
                      ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110'
                      : 'border-gray-300 dark:border-gray-700 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Error message */}
            {pinError && (
              <div className="mb-4 text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 justify-center animate-scale-in">
                <ShieldAlert className="h-3.5 w-3.5 animate-pulsate" />
                {pinError}
              </div>
            )}

            {/* Keypad buttons */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4 mx-auto w-full max-w-[260px]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumberPress(num.toString())}
                  disabled={unlockSuccess || isShaking}
                  className="w-14 h-14 rounded-full border border-gray-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer shadow-sm select-none"
                >
                  {num}
                </button>
              ))}

              {/* Fingerprint button or empty slot */}
              {isBiometricsAvailable ? (
                <button
                  type="button"
                  onClick={triggerBiometrics}
                  disabled={unlockSuccess || isShaking}
                  className="w-14 h-14 rounded-full text-emerald-500 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 active:scale-90 transition-all cursor-pointer select-none"
                  aria-label="Use Biometrics"
                >
                  <Fingerprint className="h-7 w-7 animate-pulsate" />
                </button>
              ) : (
                <div className="w-14 h-14" />
              )}

              {/* Number 0 */}
              <button
                type="button"
                onClick={() => handleNumberPress('0')}
                disabled={unlockSuccess || isShaking}
                className="w-14 h-14 rounded-full border border-gray-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer shadow-sm select-none"
              >
                0
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={unlockSuccess || isShaking || enteredPin.length === 0}
                className="w-14 h-14 rounded-full text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-transparent select-none"
                aria-label="Delete"
              >
                <Delete className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
import { captureAndSave } from "@/services/screenshotService";
import { RefObject, useEffect, useRef } from "react";
import { AppState, AppStateStatus, View } from "react-native";

export const usePeriodicCapture = (
    rootRef: RefObject<View | null>,
    intervalMs = 10_000 // cada 10s para demo
) => {
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startTimer = () => {
        if (timerRef.current) return;

        // Captura inicial (solo si existe la referencia)
        if (rootRef.current) {
            captureAndSave(rootRef).catch(() => {});
        }

        // Capturas periódicas mientras la app esté en primer plano
        // @ts-ignore: setInterval retorna number en RN
        timerRef.current = setInterval(() => {
            if (rootRef.current) {
                captureAndSave(rootRef).catch(() => {});
            }
        }, intervalMs) as unknown as number;
    };

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextState === "active"
            ) {
                startTimer();
            } else if (nextState !== "active") {
                clearTimer();
            }
            appState.current = nextState;
        });

        // Arranca si ya está activa
        if (AppState.currentState === "active") startTimer();

        return () => {
            sub.remove();
            clearTimer();
        };
    }, [rootRef, intervalMs]);
};

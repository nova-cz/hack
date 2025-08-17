import { RefObject } from "react";
import { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { SCREENSHOT_DIR, ensureDirAsync } from "@/constants/paths";

export const initScreenshotDir = async () => {
    await ensureDirAsync(SCREENSHOT_DIR);
};

export const captureAndSave = async (rootRef: RefObject<View | null>) => {
    if (!rootRef.current) return null;

    // Captura la vista raíz de TU app (simulación)
    const tmpFile = await captureRef(rootRef, {
        format: "jpg",
        quality: 0.8,
        result: "tmpfile",
    });

    const filename = `screen_${Date.now()}.jpg`;
    const dest = SCREENSHOT_DIR + filename;

    await FileSystem.copyAsync({ from: tmpFile as string, to: dest });
    // Limpia el temporal si existe
    try {
        await FileSystem.deleteAsync(tmpFile as string, { idempotent: true });
    } catch { }

    return dest;
};

export const listScreenshots = async () => {
    await ensureDirAsync(SCREENSHOT_DIR);
    const files = (await FileSystem.readDirectoryAsync(SCREENSHOT_DIR)) || [];
    // Devuelve rutas absolutas
    return files
        .filter((f) => f.endsWith(".jpg"))
        .map((f) => SCREENSHOT_DIR + f)
        .sort()
        .reverse();
};

export const clearScreenshots = async () => {
    await ensureDirAsync(SCREENSHOT_DIR);
    await FileSystem.deleteAsync(SCREENSHOT_DIR, { idempotent: true });
    await ensureDirAsync(SCREENSHOT_DIR);
};

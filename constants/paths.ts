// Rutas y utilidades comunes
import * as FileSystem from "expo-file-system";

export const SCREENSHOT_DIR = `${FileSystem.documentDirectory}screenshots/`;
export const LOGS_DIR = `${FileSystem.documentDirectory}bglogs/`;

export const ensureDirAsync = async (dir: string) => {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

import { LOGS_DIR, ensureDirAsync } from "@/constants/paths";
import * as BackgroundFetch from "expo-background-fetch";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

const TASK_NAME = "bg-heartbeat-task";

export const initBackground = async () => {
    await ensureDirAsync(LOGS_DIR);
    await Notifications.requestPermissionsAsync();

    const isReg = await TaskManager.isTaskDefined(TASK_NAME);
    if (!isReg) {
        // Nada, la definición real está más abajo con TaskManager.defineTask(...)
    }

    const already = await BackgroundFetch.getStatusAsync();
    // Si el dispositivo permite background fetch, registra la tarea
    if (
        already === BackgroundFetch.BackgroundFetchStatus.Available ||
        already === BackgroundFetch.BackgroundFetchStatus.Restricted
    ) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 15 * 60, // 15 min (mín. iOS)
                stopOnTerminate: false,    // Android
                startOnBoot: true,         // Android
            });
        }
    }
};

// Útil para debug manual desde tu UI (no es el background real)
export const runHeartbeatOnceNow = async () => {
    const stamp = new Date().toISOString();
    const path = `${LOGS_DIR}heartbeat_${Date.now()}.txt`;
    await FileSystem.writeAsStringAsync(path, `tick ${stamp}`);
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Heartbeat (manual)",
                body: `tick ${stamp}`,
            },
            trigger: null,
        });
    } catch { }
    return path;
};

// Define la tarea background (el SO la invocará)
TaskManager.defineTask(TASK_NAME, async () => {
    try {
        await ensureDirAsync(LOGS_DIR);
        const stamp = new Date().toISOString();
        const path = `${LOGS_DIR}heartbeat_${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(path, `tick ${stamp}`);

        try {
            await Notifications.scheduleNotificationAsync({
                content: { title: "Heartbeat", body: `tick ${stamp}` },
                trigger: null,
            });
        } catch { }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (e) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

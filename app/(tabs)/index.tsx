import React, { useEffect, useRef, useState } from "react";
import { View, Text, Button, ScrollView, Image } from "react-native";
import { Link } from "expo-router";
import { usePeriodicCapture } from "@/hooks/usePeriodicCapture";
import { initScreenshotDir, listScreenshots, captureAndSave } from "@/services/screenshotService";
import { initBackground, runHeartbeatOnceNow } from "@/services/ background";

export default function Home() {
  const rootRef = useRef<View>(null); // Ref que puede ser null
  const [last, setLast] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  // Simulación: capturas periódicas en primer plano
  usePeriodicCapture(rootRef, 10_000);

  useEffect(() => {
    (async () => {
      await initScreenshotDir();
      await initBackground();
      // Muestra último screenshot al abrir
      const files = await listScreenshots();
      setCount(files.length);
      setLast(files[0] || null);
    })();
  }, []);

  const manualCapture = async () => {
    const uri = await captureAndSave(rootRef);
    if (uri) {
      setLast(uri);
      setCount((c) => c + 1);
    }
  };

  const runHeartbeat = async () => {
    await runHeartbeatOnceNow();
    // El background real también irá creando archivos "heartbeat_*.txt"
  };

  return (
    <View ref={rootRef} style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Demo captura + background</Text>

      <View style={{ gap: 8 }}>
        <Button title="Captura manual ahora" onPress={manualCapture} />
        <Button title="Heartbeat (debug manual)" onPress={runHeartbeat} />
        <Link href="/gallery" asChild>
          <Button title="Abrir Galería de capturas" />
        </Link>
      </View>

      <Text style={{ marginTop: 8 }}>
        Total capturas: {count} {last ? "(mostrando última abajo)" : ""}
      </Text>

      <ScrollView style={{ flex: 1, borderWidth: 1, borderColor: "#ddd" }}>
        {last ? (
          <Image source={{ uri: last }} style={{ width: "100%", height: 360 }} resizeMode="cover" />
        ) : (
          <Text style={{ padding: 16 }}>Aún no hay capturas.</Text>
        )}
      </ScrollView>

      <Text style={{ fontSize: 12, color: "#666" }}>
        Nota: Las capturas se realizan solo mientras esta app está en primer plano.
      </Text>
    </View>
  );
}

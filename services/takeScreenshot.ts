import { captureScreen } from 'react-native-view-shot';

const takeScreenshot = async () => {
  try {
    const uri = await captureScreen({
      format: 'jpg',
      quality: 0.8,
    });
    return uri;
  } catch (error) {
    console.error("Error capturando pantalla:", error);
  }
};
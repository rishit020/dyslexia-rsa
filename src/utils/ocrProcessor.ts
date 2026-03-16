import TextRecognition from '@react-native-ml-kit/text-recognition';

/**
 * Extracts text from an image using Google ML Kit on-device OCR.
 * Never throws — returns empty string on any error.
 */
export async function extractText(imageUri: string): Promise<string> {
  try {
    const result = await TextRecognition.recognize(imageUri);
    return result.blocks
      .map(block => block.text)
      .join('\n')
      .trim();
  } catch (e) {
    console.warn('OCR error:', e);
    return '';
  }
}

import { TranscriptionSegment } from "@/types/transcription";
import { voiceIdentificationService } from "./voiceIdentificationService";
import { handleNameRecognition } from "./nameRecognitionService";

export const processTranscriptionResult = (result: any): TranscriptionSegment[] => {
  return result.segments.map((segment: any) => {
    const audioFeatures = new Float32Array(segment.tokens.length);
    const timestamp = segment.start * 1000; // Convertendo para milissegundos
    
    let speaker = voiceIdentificationService.identifyMostSimilarSpeaker(audioFeatures, timestamp);
    
    // Tenta extrair nome do texto do segmento
    const recognizedName = handleNameRecognition(segment.text);
    if (recognizedName) {
      speaker = recognizedName;
      voiceIdentificationService.addProfile(recognizedName, audioFeatures);
    }

    return {
      speaker,
      text: segment.text,
      timestamp: new Date(timestamp).toISOString().substr(11, 8)
    };
  });
};
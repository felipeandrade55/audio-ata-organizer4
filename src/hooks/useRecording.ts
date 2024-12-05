import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRecordingState } from "./useRecordingState";
import { useTranscriptionHandler } from "./useTranscriptionHandler";
import { useAudioRecording } from "./useAudioRecording";
import { MeetingMinutes } from "@/types/meeting";

interface UseRecordingProps {
  apiKey: string;
  transcriptionService: 'openai' | 'google';
  minutes?: MeetingMinutes;
  onMinutesUpdate?: (minutes: MeetingMinutes) => void;
}

export const useRecording = ({ apiKey, transcriptionService, minutes, onMinutesUpdate }: UseRecordingProps) => {
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  
  const {
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    isTranscribing,
    setIsTranscribing,
    transcriptionSegments,
    setTranscriptionSegments,
    recordingStartTime,
    setRecordingStartTime,
  } = useRecordingState();

  const { handleTranscription } = useTranscriptionHandler({
    apiKey,
    transcriptionService,
    setIsTranscribing,
    setTranscriptionSegments,
    recordingStartTime,
    minutes,
    onMinutesUpdate,
  });

  const handleDataAvailable = (data: BlobPart) => {
    setAudioChunks(prev => [...prev, data]);
  };

  const {
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    pauseRecording: pauseAudioRecording,
    resumeRecording: resumeAudioRecording,
  } = useAudioRecording({
    onDataAvailable: handleDataAvailable,
    transcriptionService,
    apiKey,
  });

  const startRecording = async (identificationEnabled: boolean) => {
    const result = await startAudioRecording(identificationEnabled);
    if (result) {
      setRecordingStartTime(Date.now());
      setIsRecording(true);
      setIsPaused(false);
      setAudioChunks([]);
    }
  };

  const stopRecording = async () => {
    stopAudioRecording();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingStartTime(null);
    
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    await handleTranscription(audioBlob);
    setAudioChunks([]);
  };

  const pauseRecording = () => {
    pauseAudioRecording();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    resumeAudioRecording();
    setIsPaused(false);
  };

  return {
    isRecording,
    isPaused,
    isTranscribing,
    transcriptionSegments,
    recordingStartTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};
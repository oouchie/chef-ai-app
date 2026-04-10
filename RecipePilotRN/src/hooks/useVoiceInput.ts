import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { hapticLight, hapticMedium, hapticError } from '@/lib/haptics';

// Lazy import - expo-speech-recognition requires a dev/production build (not Expo Go)
let SpeechModule: any = null;
let useSpeechEvent: any = null;
try {
  const mod = require('expo-speech-recognition');
  SpeechModule = mod.ExpoSpeechRecognitionModule;
  useSpeechEvent = mod.useSpeechRecognitionEvent;
} catch {
  // Not available in Expo Go - voice input will be disabled
}

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isAvailable: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  cancelListening: () => void;
}

// No-op hook for when speech recognition is unavailable
const useNoopEvent = (_event: string, _handler: any) => {};

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onTranscript, onError, language = 'en-US' } = options;

  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const useSpeechRecognitionEvent = useSpeechEvent || useNoopEvent;

  // Check if speech recognition is available on mount
  useEffect(() => {
    if (!SpeechModule) {
      setIsAvailable(false);
      return;
    }
    const checkAvailability = async () => {
      try {
        const available = SpeechModule.isRecognitionAvailable();
        setIsAvailable(available);
      } catch (e) {
        console.warn('Speech recognition availability check failed:', e);
        setIsAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  // Event handlers for speech recognition
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
    hapticMedium();
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event: any) => {
    const result = event.results[0]?.transcript || '';
    setTranscript(result);

    // If this is a final result, call the callback
    if (event.isFinal && result) {
      onTranscript?.(result);
      hapticLight();
    }
  });

  useSpeechRecognitionEvent('error', (event: any) => {
    const errorMessage = getErrorMessage(event.error, event.message);
    setError(errorMessage);
    setIsListening(false);
    onError?.(errorMessage);
    hapticError();

    // Show user-friendly alert for certain errors
    if (event.error === 'not-allowed') {
      Alert.alert(
        'Microphone Access Required',
        'Please enable microphone access in Settings to use voice input.',
        [{ text: 'OK' }]
      );
    }
  });

  const startListening = useCallback(async () => {
    if (!SpeechModule) {
      const message = 'Voice input is not available in this build.';
      setError(message);
      onError?.(message);
      return;
    }

    try {
      // Clear previous state
      setTranscript('');
      setError(null);

      // Request permissions
      const permissionResult = await SpeechModule.requestPermissionsAsync();

      if (!permissionResult.granted) {
        const message = 'Microphone permission is required for voice input.';
        setError(message);
        onError?.(message);
        hapticError();

        Alert.alert(
          'Permission Required',
          'Please allow microphone and speech recognition access to use voice input.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Start speech recognition
      SpeechModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        // Recipe-related contextual strings to improve accuracy
        contextualStrings: [
          'recipe', 'ingredient', 'tablespoon', 'teaspoon', 'cup',
          'ounce', 'pound', 'gram', 'milliliter', 'liter',
          'bake', 'roast', 'saute', 'simmer', 'boil', 'fry',
          'chicken', 'beef', 'pork', 'fish', 'vegetable', 'pasta',
          'Italian', 'Mexican', 'Chinese', 'Indian', 'Thai', 'Japanese',
          'breakfast', 'lunch', 'dinner', 'dessert', 'appetizer',
          'vegan', 'vegetarian', 'gluten-free', 'keto', 'healthy',
        ],
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to start voice input';
      setError(message);
      onError?.(message);
      hapticError();
      console.error('Voice input start error:', e);
    }
  }, [language, onError]);

  const stopListening = useCallback(() => {
    if (!SpeechModule) return;
    try {
      SpeechModule.stop();
      hapticLight();
    } catch (e) {
      console.error('Voice input stop error:', e);
    }
  }, []);

  const cancelListening = useCallback(() => {
    if (!SpeechModule) return;
    try {
      SpeechModule.abort();
      setTranscript('');
      setIsListening(false);
      hapticLight();
    } catch (e) {
      console.error('Voice input cancel error:', e);
    }
  }, []);

  return {
    isListening,
    isAvailable,
    transcript,
    error,
    startListening,
    stopListening,
    cancelListening,
  };
}

/**
 * Convert error codes to user-friendly messages
 */
function getErrorMessage(errorCode: string, defaultMessage?: string): string {
  const errorMessages: Record<string, string> = {
    'not-allowed': 'Microphone access was denied. Please enable it in Settings.',
    'no-speech': 'No speech was detected. Please try again.',
    'audio-capture': 'Could not access the microphone. Please check your device settings.',
    'network': 'Network error. Please check your connection and try again.',
    'aborted': 'Voice input was cancelled.',
    'language-not-supported': 'This language is not supported for speech recognition.',
    'service-not-allowed': 'Speech recognition service is not available.',
    'busy': 'Speech recognition is busy. Please wait and try again.',
  };

  return errorMessages[errorCode] || defaultMessage || 'An error occurred with voice input.';
}

export default useVoiceInput;

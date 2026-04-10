import { useState, useCallback } from 'react';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { hapticLight, hapticError } from '@/lib/haptics';

// Lazy import - expo-image-picker requires a dev/production build (not Expo Go)
let ImagePicker: typeof import('expo-image-picker') | null = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  // Not available in Expo Go - image picker will be disabled
}

export interface ImageData {
  uri: string;
  base64: string;
  mimeType: string;
}

export interface UseImagePickerOptions {
  onImagePicked?: (image: ImageData) => void;
  onError?: (error: string) => void;
}

export interface UseImagePickerReturn {
  isAvailable: boolean;
  isProcessing: boolean;
  pickImage: () => void;
}

const JPEG_QUALITY = 0.7;

export function useImagePicker(options: UseImagePickerOptions = {}): UseImagePickerReturn {
  const { onImagePicked, onError } = options;
  const [isProcessing, setIsProcessing] = useState(false);

  const launchCamera = useCallback(async () => {
    if (!ImagePicker) {
      onError?.('Camera is not available in this build.');
      return;
    }
    setIsProcessing(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in Settings to photograph food.',
          [{ text: 'OK' }]
        );
        hapticError();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: JPEG_QUALITY,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
        exif: false,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (!asset.base64) return;

      hapticLight();
      onImagePicked?.({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (e) {
      console.error('Camera error:', e);
      hapticError();
      onError?.(e instanceof Error ? e.message : 'Failed to take photo');
    } finally {
      setIsProcessing(false);
    }
  }, [onImagePicked, onError]);

  const launchGallery = useCallback(async () => {
    if (!ImagePicker) {
      onError?.('Photo library is not available in this build.');
      return;
    }
    setIsProcessing(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Access Required',
          'Please enable photo library access in Settings.',
          [{ text: 'OK' }]
        );
        hapticError();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: JPEG_QUALITY,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
        exif: false,
      });

      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      if (!asset.base64) return;

      hapticLight();
      onImagePicked?.({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (e) {
      console.error('Gallery error:', e);
      hapticError();
      onError?.(e instanceof Error ? e.message : 'Failed to pick image');
    } finally {
      setIsProcessing(false);
    }
  }, [onImagePicked, onError]);

  const pickImage = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) launchCamera();
          else if (buttonIndex === 2) launchGallery();
        }
      );
    } else {
      Alert.alert('Add Photo', 'Choose a source', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: launchCamera },
        { text: 'Choose from Library', onPress: launchGallery },
      ]);
    }
  }, [launchCamera, launchGallery]);

  return {
    isAvailable: !!ImagePicker,
    isProcessing,
    pickImage,
  };
}

export default useImagePicker;

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '@/theme';
import { hapticSuccess, hapticWarning, hapticError } from '@/lib/haptics';
import { Feather } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: { action?: ToastAction; duration?: number }) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const typeConfig: Record<ToastType, { icon: keyof typeof Feather.glyphMap; color: string; haptic: () => void }> = {
  success: { icon: 'check-circle', color: '#10b981', haptic: hapticSuccess },
  error: { icon: 'x-circle', color: '#ef4444', haptic: hapticError },
  warning: { icon: 'alert-triangle', color: '#f59e0b', haptic: hapticWarning },
  info: { icon: 'info', color: '#3b82f6', haptic: () => {} },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const config = typeConfig[toast.type];

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const duration = toast.duration || 3000;
    timeoutRef.current = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.duration, onDismiss]);

  useEffect(() => {
    config.haptic();
  }, []);

  const backgroundColor = isDark
    ? 'rgba(30, 30, 30, 0.95)'
    : 'rgba(255, 255, 255, 0.95)';

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutUp.duration(200)}
      style={styles.toastContainer}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={40}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[styles.toastContent, { backgroundColor: Platform.OS === 'android' ? backgroundColor : 'transparent' }]}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Feather name={config.icon} size={20} color={config.color} />
        </View>

        <Text style={[styles.message, { color: colors.foreground }]} numberOfLines={2}>
          {toast.message}
        </Text>

        {toast.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              toast.action?.onPress();
              onDismiss();
            }}
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={18} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: { action?: ToastAction; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        id,
        message,
        type,
        action: options?.action,
        duration: options?.duration,
      };

      setToasts((prev) => [...prev.slice(-2), newToast]); // Keep max 3 toasts
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View
        style={[
          styles.toastWrapper,
          { top: insets.top + 10 },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => hideToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toastContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

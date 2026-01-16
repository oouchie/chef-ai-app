import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  FadeIn,
  FadeInLeft,
  FadeOut,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors } from '@/theme';
import { Shadows } from '@/theme';
import { ChatSession } from '@/types';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import { GradientButton } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: SidebarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Update animation values when isOpen changes
  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 25, stiffness: 200 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 25, stiffness: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOpen]);

  // Gesture for swipe to close
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(-SIDEBAR_WIDTH, event.translationX);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -100 || event.velocityX < -500) {
        translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 25, stiffness: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 25, stiffness: 200 });
      }
    });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  // Sort sessions by updatedAt (most recent first)
  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const handleSessionPress = useCallback(
    (sessionId: string) => {
      hapticLight();
      onSelectSession(sessionId);
    },
    [onSelectSession]
  );

  const handleDeletePress = useCallback(
    (sessionId: string) => {
      hapticMedium();
      onDeleteSession(sessionId);
    },
    [onDeleteSession]
  );

  const renderSession = useCallback(
    ({ item, index }: { item: ChatSession; index: number }) => {
      const isActive = item.id === currentSessionId;
      const messagePreview =
        item.messages.length > 0
          ? item.messages[item.messages.length - 1].content.slice(0, 50) + '...'
          : 'No messages yet';

      return (
        <Animated.View entering={FadeInLeft.delay(index * 50).duration(200)}>
          <TouchableOpacity
            style={[
              styles.sessionItem,
              {
                backgroundColor: isActive
                  ? colors.primary + '15'
                  : 'transparent',
                borderLeftColor: isActive ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => handleSessionPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.sessionContent}>
              <View style={styles.sessionHeader}>
                <Feather
                  name="message-circle"
                  size={18}
                  color={isActive ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.sessionTitle,
                    {
                      color: isActive ? colors.primary : colors.foreground,
                      fontWeight: isActive ? '600' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
              <Text
                style={[styles.sessionPreview, { color: colors.muted }]}
                numberOfLines={1}
              >
                {messagePreview}
              </Text>
              <Text style={[styles.sessionDate, { color: colors.muted }]}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="trash-2" size={16} color={colors.muted} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [currentSessionId, colors, handleSessionPress, handleDeletePress]
  );

  if (!isOpen && translateX.value === -SIDEBAR_WIDTH) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sidebar */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sidebar,
            sidebarStyle,
            { width: SIDEBAR_WIDTH },
            Shadows.xl,
          ]}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}

          <View
            style={[
              styles.sidebarContent,
              {
                backgroundColor:
                  Platform.OS === 'android'
                    ? isDark
                      ? 'rgba(20, 20, 20, 0.98)'
                      : 'rgba(255, 255, 255, 0.98)'
                    : 'transparent',
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.sidebarHeader}>
              <Text style={[styles.sidebarTitle, { color: colors.foreground }]}>
                Chats
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* New Chat Button */}
            <View style={styles.newChatContainer}>
              <GradientButton
                title="New Chat"
                onPress={onNewChat}
                icon={<Feather name="plus" size={20} color="white" />}
                fullWidth
              />
            </View>

            {/* Sessions List */}
            <FlatList
              data={sortedSessions}
              keyExtractor={(item) => item.id}
              renderItem={renderSession}
              contentContainerStyle={styles.sessionsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="message-circle" size={40} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.muted }]}>
                    No chat history yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                    Start a conversation to see it here
                  </Text>
                </View>
              }
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    overflow: 'hidden',
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  newChatContainer: {
    marginBottom: 20,
  },
  sessionsList: {
    paddingBottom: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  sessionContent: {
    flex: 1,
    marginRight: 10,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 15,
    flex: 1,
  },
  sessionPreview: {
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 26,
  },
  sessionDate: {
    fontSize: 11,
    marginLeft: 26,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

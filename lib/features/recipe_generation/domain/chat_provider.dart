import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../shared/models/models.dart';
import '../../../core/services/chat_service.dart';
import '../../../core/services/storage_service.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

class ChatState {
  final String? currentSessionId;
  final List<ChatSession> sessions;
  final bool isLoading;
  final String? selectedRegion;

  const ChatState({
    this.currentSessionId,
    this.sessions = const [],
    this.isLoading = false,
    this.selectedRegion,
  });

  ChatState copyWith({
    String? currentSessionId,
    List<ChatSession>? sessions,
    bool? isLoading,
    String? selectedRegion,
    bool clearRegion = false,
    bool clearCurrentSession = false,
  }) {
    return ChatState(
      currentSessionId: clearCurrentSession
          ? null
          : (currentSessionId ?? this.currentSessionId),
      sessions: sessions ?? this.sessions,
      isLoading: isLoading ?? this.isLoading,
      selectedRegion:
          clearRegion ? null : (selectedRegion ?? this.selectedRegion),
    );
  }

  ChatSession? get currentSession {
    if (currentSessionId == null) return null;
    try {
      return sessions.firstWhere((s) => s.id == currentSessionId);
    } catch (_) {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier() : super(const ChatState()) {
    _load();
  }

  static const _uuid = Uuid();

  Future<void> _load() async {
    final sessions = await StorageService.getSessions();
    final region = await StorageService.getSelectedRegion();
    final currentId = sessions.isNotEmpty ? sessions.first.id : null;
    state = state.copyWith(
      sessions: sessions,
      selectedRegion: region,
      currentSessionId: currentId,
    );
  }

  Future<void> _persist() async {
    await StorageService.saveSessions(state.sessions);
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  Future<void> createSession() async {
    final now = DateTime.now();
    final session = ChatSession(
      id: _uuid.v4(),
      title: 'New Chat',
      messages: const [],
      createdAt: now,
      updatedAt: now,
    );

    state = state.copyWith(
      sessions: [session, ...state.sessions],
      currentSessionId: session.id,
    );
    await _persist();
  }

  void selectSession(String id) {
    state = state.copyWith(currentSessionId: id);
  }

  Future<void> deleteSession(String id) async {
    final remaining = state.sessions.where((s) => s.id != id).toList();
    final nextId =
        remaining.isNotEmpty ? remaining.first.id : null;

    state = state.copyWith(
      sessions: remaining,
      currentSessionId:
          state.currentSessionId == id ? nextId : state.currentSessionId,
    );
    await _persist();
  }

  Future<void> setRegion(String? region) async {
    if (region == null) {
      state = state.copyWith(clearRegion: true);
    } else {
      state = state.copyWith(selectedRegion: region);
    }
    await StorageService.setSelectedRegion(region);
  }

  Future<void> sendMessage(String text, {String? imageBase64}) async {
    if (text.trim().isEmpty && imageBase64 == null) return;

    // Ensure there is an active session.
    if (state.currentSessionId == null) {
      await createSession();
    }

    final sessionId = state.currentSessionId!;
    final displayText = imageBase64 != null && text.trim().isEmpty
        ? '📷 [Photo sent]'
        : text.trim();

    final userMessage = Message(
      id: _uuid.v4(),
      role: 'user',
      content: displayText,
      timestamp: DateTime.now(),
    );

    // Append user message and set loading.
    state = state.copyWith(
      sessions: _updateSession(
        sessionId,
        (s) => s.copyWith(
          messages: [...s.messages, userMessage],
          title: s.messages.isEmpty ? _titleFromText(displayText) : s.title,
          updatedAt: DateTime.now(),
        ),
      ),
      isLoading: true,
    );

    try {
      final session = state.currentSession!;
      final result = await ChatService.sendMessage(
        message: text.trim(),
        history: session.messages,
        region: state.selectedRegion,
        imageBase64: imageBase64,
      );

      final assistantMessage = Message(
        id: _uuid.v4(),
        role: 'assistant',
        content: result.text,
        timestamp: DateTime.now(),
        recipe: result.recipe,
      );

      state = state.copyWith(
        sessions: _updateSession(
          sessionId,
          (s) => s.copyWith(
            messages: [...s.messages, assistantMessage],
            updatedAt: DateTime.now(),
          ),
        ),
        isLoading: false,
      );
    } catch (e) {
      final errorMessage = Message(
        id: _uuid.v4(),
        role: 'assistant',
        content: 'Sorry, something went wrong: $e',
        timestamp: DateTime.now(),
      );

      state = state.copyWith(
        sessions: _updateSession(
          sessionId,
          (s) => s.copyWith(
            messages: [...s.messages, errorMessage],
            updatedAt: DateTime.now(),
          ),
        ),
        isLoading: false,
      );
    }

    await _persist();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  List<ChatSession> _updateSession(
    String id,
    ChatSession Function(ChatSession) updater,
  ) {
    return state.sessions.map((s) => s.id == id ? updater(s) : s).toList();
  }

  String _titleFromText(String text) {
    final trimmed = text.trim();
    if (trimmed.length <= 40) return trimmed;
    return '${trimmed.substring(0, 37)}...';
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>(
  (ref) => ChatNotifier(),
);

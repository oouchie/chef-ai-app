import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

import '../domain/chat_provider.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/widgets.dart';
import '../../../core/constants/regions.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../features/profile/domain/profile_provider.dart';
import '../../../features/saved_recipes/domain/saved_recipes_provider.dart';
import '../../../shared/utils/shopping_list_helpers.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen>
    with TickerProviderStateMixin {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // Controls the 3-dot loading animation
  late AnimationController _dotController;

  // Speech-to-text
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _isListening = false;
  bool _speechAvailable = false;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _dotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize(
      onError: (error) {
        if (mounted) setState(() => _isListening = false);
        _pulseController.stop();
      },
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          if (mounted) setState(() => _isListening = false);
          _pulseController.stop();
        }
      },
    );
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _speech.stop();
      setState(() => _isListening = false);
      _pulseController.stop();
      return;
    }

    if (!_speechAvailable) {
      _speechAvailable = await _speech.initialize();
      if (!_speechAvailable) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text(AppStrings.voiceNotAvailable)),
          );
        }
        return;
      }
    }

    setState(() => _isListening = true);
    _pulseController.repeat(reverse: true);

    await _speech.listen(
      onResult: (result) {
        setState(() {
          _inputController.text = result.recognizedWords;
          _inputController.selection = TextSelection.fromPosition(
            TextPosition(offset: _inputController.text.length),
          );
        });
        if (result.finalResult && result.recognizedWords.trim().isNotEmpty) {
          _send(result.recognizedWords);
          setState(() => _isListening = false);
          _pulseController.stop();
        }
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 3),
      listenOptions: stt.SpeechListenOptions(
        cancelOnError: true,
        listenMode: stt.ListenMode.dictation,
      ),
    );
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _dotController.dispose();
    _pulseController.dispose();
    _speech.stop();
    super.dispose();
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send(String text, {String? imageBase64}) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty && imageBase64 == null) return;
    _inputController.clear();
    await ref.read(chatProvider.notifier).sendMessage(
          trimmed,
          imageBase64: imageBase64,
        );
    ref.read(profileProvider.notifier).incrementUsage();
    _scrollToBottom();
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: source,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 70,
    );
    if (picked == null) return;

    final bytes = await File(picked.path).readAsBytes();
    final base64Image = base64Encode(bytes);

    final text = _inputController.text.trim();
    _inputController.clear();
    await _send(
      text.isNotEmpty ? text : 'What is this? Give me a recipe.',
      imageBase64: base64Image,
    );
  }

  void _showImageSourcePicker() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppColors.primary),
              title: const Text('Take a photo'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppColors.secondary),
              title: const Text('Choose from gallery'),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final profileState = ref.watch(profileProvider);
    final savedState = ref.watch(savedRecipesProvider);
    final messages = chatState.currentSession?.messages ?? const [];
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Auto-scroll when message list changes
    if (messages.isNotEmpty) {
      _scrollToBottom();
    }

    return Scaffold(
      appBar: _buildAppBar(context, chatState, profileState, isDark),
      body: Column(
        children: [
          Expanded(
            child: messages.isEmpty
                ? _EmptyState(
                    onPromptTap: (_, text) => _send(text),
                    isDark: isDark,
                  )
                : _MessageList(
                    messages: messages,
                    isLoading: chatState.isLoading,
                    scrollController: _scrollController,
                    dotController: _dotController,
                    savedState: savedState,
                    isDark: isDark,
                    onSaveRecipe: (Recipe recipe) {
                      ref
                          .read(savedRecipesProvider.notifier)
                          .toggleSave(recipe);
                    },
                    onAddToShoppingList: (Recipe recipe) {
                      showAddToShoppingList(
                        context: context,
                        ref: ref,
                        recipe: recipe,
                      );
                    },
                  ),
          ),
          _InputBar(
            controller: _inputController,
            isPremium: profileState.isPremium,
            isListening: _isListening,
            pulseController: _pulseController,
            onSend: (text) => _send(text),
            onCamera: _showImageSourcePicker,
            onMicPressed: _toggleListening,
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // AppBar
  // -------------------------------------------------------------------------

  PreferredSizeWidget _buildAppBar(
    BuildContext context,
    ChatState chatState,
    ProfileState profileState,
    bool isDark,
  ) {
    final selectedRegion = chatState.selectedRegion;
    final usage = profileState.dailyUsage;
    final maxUsage = profileState.maxDailyUsage;
    final isPremium = profileState.isPremium;

    return AppBar(
      title: const Text(
        AppStrings.appName,
        style: TextStyle(fontWeight: FontWeight.w700),
      ),
      centerTitle: false,
      actions: [
        // Usage indicator
        if (!isPremium)
          Center(
            child: Container(
              margin: const EdgeInsets.only(right: 4),
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: usage >= maxUsage
                    ? AppColors.error.withOpacity(0.12)
                    : AppColors.primary.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: usage >= maxUsage
                      ? AppColors.error.withOpacity(0.4)
                      : AppColors.primary.withOpacity(0.4),
                  width: 1,
                ),
              ),
              child: Text(
                '$usage/$maxUsage',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: usage >= maxUsage
                      ? AppColors.error
                      : AppColors.primary,
                ),
              ),
            ),
          ),

        // Region selector
        _RegionDropdown(
          selectedRegion: selectedRegion,
          onSelected: (region) =>
              ref.read(chatProvider.notifier).setRegion(region),
        ),

        // Cooking tools
        IconButton(
          tooltip: 'Cooking tools',
          icon: const Icon(Icons.kitchen_outlined),
          onPressed: () => context.push(RouteNames.tools),
        ),

        // Restaurant recipes
        IconButton(
          tooltip: 'Restaurant recipes',
          icon: const Icon(Icons.storefront_outlined),
          color: AppColors.secondary,
          onPressed: () => context.push(RouteNames.restaurants),
        ),

        // New chat button
        IconButton(
          tooltip: 'New chat',
          icon: const Icon(Icons.add_comment_outlined),
          onPressed: () =>
              ref.read(chatProvider.notifier).createSession(),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Region dropdown
// ---------------------------------------------------------------------------

class _RegionDropdown extends StatelessWidget {
  const _RegionDropdown({
    required this.selectedRegion,
    required this.onSelected,
  });

  final String? selectedRegion;
  final void Function(String?) onSelected;

  @override
  Widget build(BuildContext context) {
    final label = selectedRegion != null
        ? worldRegions
            .firstWhere(
              (r) => r.id == selectedRegion,
              orElse: () => const RegionInfo(
                id: '',
                name: 'All',
                flag: '',
                cuisines: [],
              ),
            )
            .name
        : 'All';

    return PopupMenuButton<String?>(
      tooltip: 'Select region',
      offset: const Offset(0, 48),
      onSelected: (value) => onSelected(value == '__all__' ? null : value),
      itemBuilder: (context) => [
        const PopupMenuItem<String?>(
          value: '__all__',
          child: Text('All Regions'),
        ),
        const PopupMenuDivider(),
        for (final region in worldRegions)
          PopupMenuItem<String?>(
            value: region.id,
            child: Row(
              children: [
                Text(region.flag, style: const TextStyle(fontSize: 16)),
                const SizedBox(width: 10),
                Text(region.name),
              ],
            ),
          ),
      ],
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.public, size: 18),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Icon(Icons.arrow_drop_down, size: 18),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state (quick prompts)
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.onPromptTap,
    required this.isDark,
  });

  final void Function(int index, String text) onPromptTap;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(
            Icons.restaurant_menu,
            size: 64,
            color: AppColors.primary.withOpacity(0.7),
          ),
          const SizedBox(height: 16),
          Text(
            AppStrings.whatDoYouHave,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              'Ask me anything — ingredients you have, a craving, or a restaurant dish you want to recreate.',
              style: TextStyle(
                fontSize: 13,
                color: isDark
                    ? AppColors.darkTextSecondary
                    : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
          QuickPromptChipRow(
            prompts: quickPrompts,
            onTap: onPromptTap,
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Message list
// ---------------------------------------------------------------------------

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.messages,
    required this.isLoading,
    required this.scrollController,
    required this.dotController,
    required this.savedState,
    required this.isDark,
    required this.onSaveRecipe,
    required this.onAddToShoppingList,
  });

  final List<Message> messages;
  final bool isLoading;
  final ScrollController scrollController;
  final AnimationController dotController;
  final SavedRecipesState savedState;
  final bool isDark;
  final void Function(Recipe recipe) onSaveRecipe;
  final void Function(Recipe recipe) onAddToShoppingList;

  @override
  Widget build(BuildContext context) {
    final itemCount = messages.length + (isLoading ? 1 : 0);

    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      itemCount: itemCount,
      itemBuilder: (context, index) {
        if (index == messages.length && isLoading) {
          return _TypingIndicator(controller: dotController, isDark: isDark);
        }

        final message = messages[index];
        final isUser = message.role == 'user';

        return _MessageBubble(
          message: message,
          isUser: isUser,
          isDark: isDark,
          savedState: savedState,
          onSaveRecipe: onSaveRecipe,
          onAddToShoppingList: onAddToShoppingList,
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Individual message bubble
// ---------------------------------------------------------------------------

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.isUser,
    required this.isDark,
    required this.savedState,
    required this.onSaveRecipe,
    required this.onAddToShoppingList,
  });

  final Message message;
  final bool isUser;
  final bool isDark;
  final SavedRecipesState savedState;
  final void Function(Recipe recipe) onSaveRecipe;
  final void Function(Recipe recipe) onAddToShoppingList;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment:
            isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Text bubble
          Row(
            mainAxisAlignment:
                isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isUser) ...[
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppColors.primary.withOpacity(0.15),
                  child: const Text(
                    'AI',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isUser
                        ? AppColors.primary
                        : (isDark
                            ? AppColors.darkSurface
                            : const Color(0xFFF3F4F6)),
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(isUser ? 18 : 4),
                      bottomRight: Radius.circular(isUser ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    message.content,
                    style: TextStyle(
                      fontSize: 14,
                      height: 1.45,
                      color: isUser
                          ? Colors.white
                          : (isDark
                              ? AppColors.darkTextPrimary
                              : AppColors.textPrimary),
                    ),
                  ),
                ),
              ),
              if (isUser) const SizedBox(width: 6),
            ],
          ),

          // Recipe card (assistant only, when recipe is present)
          if (!isUser && message.recipe != null) ...[
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.only(left: 34),
              child: RecipeCard(
                recipe: message.recipe!,
                isSaved: savedState.isSaved(message.recipe!),
                onSave: () => onSaveRecipe(message.recipe!),
                onAddToShoppingList: () =>
                    onAddToShoppingList(message.recipe!),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Typing indicator — 3 animated dots
// ---------------------------------------------------------------------------

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator({
    required this.controller,
    required this.isDark,
  });

  final AnimationController controller;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: AppColors.primary.withOpacity(0.15),
            child: const Text(
              'AI',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isDark
                  ? AppColors.darkSurface
                  : const Color(0xFFF3F4F6),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: AnimatedBuilder(
              animation: controller,
              builder: (context, _) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (i) {
                    // Offset each dot by 0.33 of the cycle
                    final delay = i / 3.0;
                    final value =
                        ((controller.value - delay) % 1.0 + 1.0) % 1.0;
                    final opacity =
                        (value < 0.5 ? value * 2 : (1.0 - value) * 2)
                            .clamp(0.3, 1.0);
                    return Padding(
                      padding: EdgeInsets.only(right: i < 2 ? 5.0 : 0),
                      child: Opacity(
                        opacity: opacity,
                        child: Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkTextSecondary
                                : AppColors.textSecondary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Input bar
// ---------------------------------------------------------------------------

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.isPremium,
    required this.isListening,
    required this.pulseController,
    required this.onSend,
    required this.onCamera,
    required this.onMicPressed,
    required this.isDark,
  });

  final TextEditingController controller;
  final bool isPremium;
  final bool isListening;
  final AnimationController pulseController;
  final void Function(String) onSend;
  final VoidCallback onCamera;
  final VoidCallback onMicPressed;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkBackground : AppColors.background,
          border: Border(
            top: BorderSide(
              color: isDark
                  ? AppColors.darkTextSecondary.withOpacity(0.15)
                  : AppColors.textSecondary.withOpacity(0.15),
              width: 1,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Camera button
            IconButton(
              tooltip: 'Take a photo of food',
              icon: const Icon(Icons.camera_alt_outlined),
              color: AppColors.secondary,
              onPressed: onCamera,
            ),

            // Voice input — premium only
            if (isPremium) ...[
              AnimatedBuilder(
                animation: pulseController,
                builder: (context, child) {
                  final scale = isListening
                      ? 1.0 + (pulseController.value * 0.15)
                      : 1.0;
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      decoration: isListening
                          ? BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.error.withOpacity(
                                0.15 + pulseController.value * 0.1,
                              ),
                            )
                          : null,
                      child: IconButton(
                        tooltip: isListening
                            ? AppStrings.voiceListening
                            : AppStrings.voiceTapToSpeak,
                        icon: Icon(
                          isListening ? Icons.mic : Icons.mic_outlined,
                        ),
                        color: isListening
                            ? AppColors.error
                            : AppColors.primary,
                        onPressed: onMicPressed,
                      ),
                    ),
                  );
                },
              ),
            ],

            // Text field
            Expanded(
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.newline,
                style: TextStyle(
                  fontSize: 15,
                  color: isDark
                      ? AppColors.darkTextPrimary
                      : AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: isListening
                      ? AppStrings.voiceListening
                      : 'What ingredients do you have?',
                  hintStyle: TextStyle(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.textSecondary,
                    fontSize: 15,
                  ),
                  filled: true,
                  fillColor: isDark
                      ? AppColors.darkSurface
                      : AppColors.surface,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (text) {
                  if (text.trim().isNotEmpty) onSend(text);
                },
              ),
            ),

            const SizedBox(width: 8),

            // Send button
            FilledButton.icon(
              onPressed: () => onSend(controller.text),
              icon: const Icon(Icons.send, size: 18),
              label: const Text('Send'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

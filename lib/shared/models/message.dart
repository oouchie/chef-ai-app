import 'package:freezed_annotation/freezed_annotation.dart';

import 'recipe.dart';

part 'message.freezed.dart';
part 'message.g.dart';

@freezed
class Message with _$Message {
  const factory Message({
    required String id,
    required String role,
    required String content,
    required DateTime timestamp,
    Recipe? recipe,
  }) = _Message;

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
}

import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    required String email,
    @Default(false) bool isPremium,
    DateTime? premiumExpiresAt,
    String? revenueCatId,
    @Default(0) int dailyRequests,
    DateTime? lastRequestDate,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);
}

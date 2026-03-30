// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      id: json['id'] as String,
      email: json['email'] as String,
      isPremium: json['isPremium'] as bool? ?? false,
      premiumExpiresAt: json['premiumExpiresAt'] == null
          ? null
          : DateTime.parse(json['premiumExpiresAt'] as String),
      revenueCatId: json['revenueCatId'] as String?,
      dailyRequests: (json['dailyRequests'] as num?)?.toInt() ?? 0,
      lastRequestDate: json['lastRequestDate'] == null
          ? null
          : DateTime.parse(json['lastRequestDate'] as String),
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'isPremium': instance.isPremium,
      'premiumExpiresAt': instance.premiumExpiresAt?.toIso8601String(),
      'revenueCatId': instance.revenueCatId,
      'dailyRequests': instance.dailyRequests,
      'lastRequestDate': instance.lastRequestDate?.toIso8601String(),
    };

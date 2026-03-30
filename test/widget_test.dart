import 'package:flutter_test/flutter_test.dart';
import 'package:recipe_pilot/main.dart';

void main() {
  testWidgets('App renders without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(const RecipePilotApp());
    expect(find.text('Recipe Pilot'), findsOneWidget);
  });
}

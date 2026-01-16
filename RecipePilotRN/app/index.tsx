import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the chat tab on app launch
  return <Redirect href="/(tabs)/chat" />;
}

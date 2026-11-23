import { ArchivoBlack_400Regular, useFonts } from '@expo-google-fonts/archivo-black';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { prefsStore } from '@/kit/prefs';
import { KitRoot } from '@/kit/Root';
import { useTheme } from '@/kit/theme';
import { brand } from '@/brand';
import { StackUpIntro } from '@/components/StackUpIntro';

SplashScreen.preventAutoHideAsync().catch(() => {});
const usePrefs = prefsStore('stackup', 8);

function Shell() {
  const { c } = useTheme();
  const onboarded = usePrefs((s) => s.onboarded);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="challenge/[id]" options={{ headerShown: true, title: '', headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false }} />
        <Stack.Screen name="challenge/new" options={{ headerShown: true, title: 'New challenge', headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false }} />
        <Stack.Screen name="money" options={{ headerShown: true, title: 'Payday and bills', headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false }} />
      </Stack>
      {!onboarded ? (
        <View style={StyleSheet.absoluteFill}>
          <StackUpIntro onDone={() => usePrefs.getState().setOnboarded()} />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ ArchivoBlack_400Regular });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <KitRoot brand={brand}>
      <Shell />
    </KitRoot>
  );
}

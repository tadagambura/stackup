// Kaotic Chainz app kit: generated copy. Edit in app-portfolio/kit, then run scripts/sync-kit.sh.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdsProvider } from './ads';
import { AllAccessOffer } from './AllAccessOffer';
import { initAnalytics } from './analytics';
import { Billing, testClient, type TestControls } from './billing';
import { revenueCatClient, revenueCatKey } from './billing.revenuecat';
import { CelebrateProvider } from './celebrate';
import { FeedbackProvider } from './feedback';
import { PremiumProvider } from './premium';
import { KCStartup } from './startup';
import { finishStartup, startupFinished } from './startup/state';
import { ThemeProvider, useTheme, type Brand } from './theme';

import { TEST_MODE } from './env';

export { TEST_MODE };

function Bar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}

// One Billing per app process, created once: RevenueCat must only be configured once.
let shared: { billing: Billing; test: TestControls | null } | null = null;

export function billingFor(app: string): { billing: Billing; test: TestControls | null } {
  if (shared) return shared;
  const key = revenueCatKey({ ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY }, __DEV__);
  if (key) {
    shared = { billing: new Billing(revenueCatClient(key, __DEV__)), test: null };
  } else {
    const t = testClient(app, TEST_MODE);
    shared = { billing: new Billing(t), test: t.controls };
  }
  return shared;
}

// Browser journeys run the web build in test mode: they start straight on the app.
const SKIP_STARTUP = Platform.OS === 'web' && process.env.EXPO_PUBLIC_TEST_MODE === '1';
if (SKIP_STARTUP) finishStartup();

/** `onSignIn` opens KC account sign-in once accounts exist; until then All Access says "coming soon". */
export function KitRoot({ brand, children, onSignIn }: { brand: Brand; children: ReactNode; onSignIn?: () => void }) {
  useEffect(() => initAnalytics(brand.slug), [brand.slug]);
  const { billing, test } = billingFor(brand.slug);
  const [intro, setIntro] = useState(() => !startupFinished());
  return (
    <SafeAreaProvider>
      <PremiumProvider app={brand.slug} appName={brand.name} billing={billing} test={test} onSignIn={onSignIn}>
        <ThemeProvider brand={brand}>
          <FeedbackProvider>
            <AdsProvider app={brand.slug}>
              <CelebrateProvider app={brand.slug}>
                <Bar />
                {children}
                {intro ? (
                  <KCStartup
                    onDone={() => {
                      finishStartup();
                      setIntro(false);
                    }}
                  />
                ) : (
                  <AllAccessOffer />
                )}
              </CelebrateProvider>
            </AdsProvider>
          </FeedbackProvider>
        </ThemeProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}

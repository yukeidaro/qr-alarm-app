# AdMob Integration Research for QR Alarm App (Expo SDK 54)

**Research Date**: 2026-03-27
**Target Stack**: Expo SDK 54, React Native 0.81, Expo Router
**Research Status**: (確定) - Based on official docs and verified developer reports

---

## 1. Recommended Library

### react-native-google-mobile-ads (by Invertase)

This is the **only recommended library** for AdMob in Expo as of 2025-2026. The old `expo-ads-admob` package is **deprecated**.

- **npm**: https://www.npmjs.com/package/react-native-google-mobile-ads
- **Docs**: https://docs.page/invertase/react-native-google-mobile-ads
- **GitHub**: https://github.com/invertase/react-native-google-mobile-ads

**Key facts**:
- Maintained by Invertase (same team as react-native-firebase)
- Includes Expo config plugin out of the box
- Supports Banner, Interstitial, Rewarded, App Open ad formats
- Does NOT work with Expo Go -- requires Development Build

---

## 2. Expo SDK 54 Compatibility (CRITICAL)

### Known Issues

There are **active compatibility issues** with Expo SDK 54 + react-native-google-mobile-ads v16.x:

| Issue | Version | Status | Source |
|-------|---------|--------|--------|
| Config plugin "Unexpected token 'typeof'" | v16.0.3 + Expo 54.0.33 | **OPEN** (as of 2026-03-13) | [#835](https://github.com/invertase/react-native-google-mobile-ads/issues/835) |
| "Does not contain a valid config plugin" | v16.0.0 + Expo 54.0.22 | **CLOSED** -- fixed by `npx expo install --fix` | [#820](https://github.com/invertase/react-native-google-mobile-ads/issues/820) |
| Ads not working on iOS | Expo SDK 52/53 | Open | [#742](https://github.com/invertase/react-native-google-mobile-ads/issues/742) |
| iOS 26 initialization failure | Expo 54 | Open | [#803](https://github.com/invertase/react-native-google-mobile-ads/issues/803) |

### Workarounds

1. **Run `npx expo install --fix`** and restart VS Code -- resolves the config plugin validation error
2. **Try downgrading to v16.0.1** if v16.0.3 has issues (v16.0.2 introduced breaking changes)
3. **Monitor the GitHub issues** -- the maintainers have acknowledged these need fixes
4. The app reportedly **still builds and runs** even with the config parsing warning

### Recommendation

Proceed with integration but **test thoroughly on both iOS and Android** with development builds. Pin the package version that works and don't blindly upgrade.

---

## 3. Setup: Step-by-Step

### 3.1 AdMob Account Registration

1. Go to https://admob.google.com
2. Sign in with your Google account
3. Account review: typically 24 hours, can take up to 2 weeks
4. **Add payment information** -- your account is NOT ready for monetization until payment info is added
5. Add your app (can be "Unpublished" if not yet in store)
6. Create ad units for each format you want (Banner, Rewarded, etc.)
7. Note your **App ID** (format: `ca-app-pub-xxxxxxxx~xxxxxxxx`) and **Ad Unit IDs** (format: `ca-app-pub-xxxxxxxx/yyyyyyyyyy`)

**Important (2025+ requirement)**: Apps created after January 2025 that are not verified will face **limited ad serving**, negatively impacting revenue. Complete the app verification process.

Source: https://support.google.com/admob/answer/15948559?hl=en

### 3.2 Install Dependencies

```bash
npx expo install react-native-google-mobile-ads
npx expo install expo-build-properties
npx expo install expo-tracking-transparency
```

### 3.3 Configure app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-xxxxxxxx~xxxxxxxx",
          "iosAppId": "ca-app-pub-xxxxxxxx~xxxxxxxx"
        }
      ],
      [
        "expo-tracking-transparency",
        {
          "userTrackingPermission": "This identifier will be used to deliver personalized ads to you."
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

### 3.4 Build Development Client

```bash
# EAS Build (cloud)
npx eas build --profile development --platform all

# Or local build
npx eas build --profile development --local
```

**Expo Go will NOT work** -- native modules require a development build.

### 3.5 iOS App Tracking Transparency (Required for iOS)

```typescript
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

// Call BEFORE initializing ads
const { status } = await requestTrackingPermissionsAsync();
if (status === 'granted') {
  // User allowed tracking - personalized ads
} else {
  // Non-personalized ads only
}
```

Request ATT permission **before** calling `mobileAds().initialize()` so the SDK can use IDFA if granted.

---

## 4. Implementation Code Examples

### 4.1 SDK Initialization (app/_layout.tsx or root)

```typescript
import mobileAds from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    async function initAds() {
      // iOS: Request ATT first
      if (Platform.OS === 'ios') {
        await requestTrackingPermissionsAsync();
      }

      // Initialize the Mobile Ads SDK
      await mobileAds().initialize();
      console.log('AdMob SDK initialized');
    }

    initAds();
  }, []);

  // ... rest of layout
}
```

### 4.2 Banner Ad Component

```typescript
import React from 'react';
import { Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : Platform.select({
      ios: 'ca-app-pub-xxx/yyy',      // Your iOS ad unit
      android: 'ca-app-pub-xxx/yyy',   // Your Android ad unit
    })!;

export function AdBanner() {
  return (
    <BannerAd
      unitId={BANNER_AD_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdLoaded={() => console.log('Banner loaded')}
      onAdFailedToLoad={(error) => console.error('Banner failed:', error)}
    />
  );
}
```

### 4.3 Interstitial Ad

```typescript
import { useEffect, useRef, useCallback } from 'react';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.select({
      ios: 'ca-app-pub-xxx/yyy',
      android: 'ca-app-pub-xxx/yyy',
    })!;

export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const isLoadedRef = useRef(false);

  const loadAd = useCallback(() => {
    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isLoadedRef.current = true;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      // Pre-load the next ad
      loadAd();
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial error:', error);
      isLoadedRef.current = false;
    });

    interstitial.load();
    adRef.current = interstitial;
  }, []);

  const showAd = useCallback(() => {
    if (isLoadedRef.current && adRef.current) {
      adRef.current.show();
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    loadAd();
    return () => {
      adRef.current?.removeAllListeners();
    };
  }, [loadAd]);

  return { showAd, isLoaded: isLoadedRef };
}
```

### 4.4 Rewarded Ad (KEY for QR Alarm -- "Watch Ad to Snooze")

```typescript
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const REWARDED_ID = __DEV__
  ? TestIds.REWARDED
  : Platform.select({
      ios: 'ca-app-pub-xxx/yyy',
      android: 'ca-app-pub-xxx/yyy',
    })!;

export function useRewardedAd() {
  const adRef = useRef<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEarned, setIsEarned] = useState(false);

  const loadAd = useCallback(() => {
    const rewarded = RewardedAd.createForAdRequest(REWARDED_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsLoaded(true);
      }
    );

    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward:', reward);
        // reward = { type: string, amount: number }
        setIsEarned(true);
      }
    );

    const unsubClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setIsLoaded(false);
        // Pre-load next ad
        loadAd();
      }
    );

    const unsubError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Rewarded ad error:', error);
        setIsLoaded(false);
      }
    );

    rewarded.load();
    adRef.current = rewarded;

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
  }, []);

  const showAd = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isLoaded || !adRef.current) {
        resolve(false);
        return;
      }

      setIsEarned(false);

      // Listen for earned reward
      const unsub = adRef.current.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          resolve(true);
          unsub();
        }
      );

      // Listen for close without reward
      const unsubClose = adRef.current.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          // Small delay to ensure EARNED_REWARD fires first if applicable
          setTimeout(() => {
            resolve(false);
            unsubClose();
          }, 100);
        }
      );

      adRef.current.show();
    });
  }, [isLoaded]);

  useEffect(() => {
    const cleanup = loadAd();
    return cleanup;
  }, [loadAd]);

  return { showAd, isLoaded, isEarned };
}
```

**Usage in Alarm Screen**:
```typescript
function AlarmScreen() {
  const { showAd, isLoaded } = useRewardedAd();

  const handleSnoozeWithAd = async () => {
    const rewarded = await showAd();
    if (rewarded) {
      // User watched the full ad -- grant snooze
      snoozeAlarm(5); // 5 minutes
    } else {
      // User closed ad early or ad failed -- no snooze
      Alert.alert('Snooze not granted', 'Watch the full ad to snooze.');
    }
  };

  return (
    <View>
      {/* QR scan to dismiss */}
      <Button title="Scan QR to Dismiss" onPress={handleDismiss} />

      {/* Rewarded ad to snooze */}
      {isLoaded && (
        <Button
          title="Watch Ad to Snooze (5 min)"
          onPress={handleSnoozeWithAd}
        />
      )}
    </View>
  );
}
```

### 4.5 Test Ad Unit IDs (Development Only)

```typescript
import { TestIds } from 'react-native-google-mobile-ads';

// These are Google's official test IDs -- safe to use during development
TestIds.BANNER        // Banner test ad
TestIds.INTERSTITIAL  // Interstitial test ad
TestIds.REWARDED      // Rewarded test ad
TestIds.APP_OPEN      // App open test ad
```

**NEVER use real ad unit IDs during development** -- this violates AdMob policy and can get your account banned.

---

## 5. Ad Types for QR Alarm App

### Recommended Strategy

| Ad Type | Use Case in QR Alarm | Priority |
|---------|---------------------|----------|
| **Rewarded Ad** | "Watch ad to snooze" -- user chooses to watch | HIGH -- core monetization |
| **Banner Ad** | Settings screen, alarm list screen (bottom) | MEDIUM -- passive revenue |
| **Interstitial Ad** | After dismissing alarm (between alarm and main screen) | LOW -- be careful with policy |
| **App Open Ad** | When returning to app | OPTIONAL |

### Rewarded Ad: "Watch Ad to Snooze" Design

This is the strongest monetization mechanic for an alarm app:
- User is **highly motivated** (wants to snooze)
- **Voluntary** -- user chooses to watch (policy-compliant)
- **Clear value exchange** -- watch ad = get snooze time
- High engagement = high eCPM for rewarded format

### Policy Considerations for Alarm Apps

**DO**:
- Show rewarded ads as an **opt-in** action (button: "Watch ad to snooze")
- Show banner ads on non-critical screens (settings, alarm list)
- Show interstitials at **natural break points** (after dismissing alarm, transitioning back to app)
- Pre-load ads so they display instantly when needed

**DO NOT**:
- Show interstitials **during** alarm dismissal flow (user is focused on a critical task)
- Show ads on app load or app exit
- Place banner ads near the "dismiss alarm" or "snooze" buttons (accidental clicks)
- Show interstitials after every user action
- Force users to watch ads to dismiss an alarm (this would be a terrible UX and likely policy violation)

Sources:
- https://support.google.com/admob/answer/6201362 (Disallowed interstitial implementations)
- https://support.google.com/admob/answer/6201350 (Recommended implementations)
- https://support.google.com/admob/answer/2753860 (Behavioral policies)

---

## 6. AdMob Policies Summary

### General Rules
- No incentivizing clicks (users must not be paid/rewarded for clicking ads themselves)
- No artificial impression/click inflation
- No placing ads that interfere with app's core content/functionality
- Must declare "Yes, my app contains ads" in Google Play Console

### Interstitial-Specific Rules
- **Disallowed**: On app load, on app exit, after every user action
- **Required**: Only at logical break points between content
- Pre-load to avoid latency-related accidental displays
- Show a "continue" or transitional UI before the interstitial

### iOS Requirements
- **ATT (App Tracking Transparency)**: MUST prompt before serving personalized ads
- Without ATT consent, only non-personalized ads will appear
- Apple may **reject** your app if ATT prompt is missing

### Android Requirements
- Declare `com.google.android.gms.permission.AD_ID` in AndroidManifest.xml
- In Google Play Console: Policy > App content > declare app contains ads

---

## 7. Revenue Expectations (Japan Market)

Japan is a **Tier 1** advertising market with premium eCPM rates.

### Estimated eCPM by Format (Japan, 2024-2025 data)

| Ad Format | Android eCPM | iOS eCPM | Notes |
|-----------|-------------|----------|-------|
| **Rewarded Video** | ~$17.35 | ~$20-25 (est.) | Highest-performing format |
| **Interstitial** | ~$10.78 | ~$12-15 (est.) | Japan described as "powerhouse" |
| **Banner** | ~$0.50-1.00 | ~$0.50-1.00 | Generally below $1 |

### Revenue Projection (Very Rough Estimates)

Assuming QR Alarm app with:
- 1,000 DAU (daily active users) in Japan
- Each user triggers alarm 1x/day
- 30% of users watch rewarded ad to snooze

```
Rewarded: 1,000 * 0.30 * 1 * ($17.35 / 1000) = ~$5.20/day = ~$156/month
Banner:   1,000 * 3 impressions * ($0.75 / 1000) = ~$2.25/day = ~$68/month
Total:    ~$224/month for 1,000 DAU
```

At 10,000 DAU: ~$2,240/month
At 50,000 DAU: ~$11,200/month

(未確定) -- These are rough estimates. Actual eCPM varies significantly by season, user demographics, and ad fill rates.

Sources:
- https://www.thesrzone.com/2024/01/admob-ecpm-rates-by-country.html
- https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect
- https://maf.ad/en/blog/mobile-ads-ecpm/

---

## 8. Common Pitfalls and Rejection Reasons

### Technical Pitfalls

1. **Expo Go incompatibility**: react-native-google-mobile-ads requires native modules -- MUST use development builds
2. **Expo SDK 54 config plugin issues**: Run `npx expo install --fix` to resolve. Monitor GitHub issues #835, #820, #803
3. **New ad units take time**: Can take 1 hour to several days for new ad units to serve ads
4. **iOS ads not showing on unpublished apps**: iOS apps won't display Google ads until listed in App Store (use test IDs until then)
5. **Emulator issues**: Ads may not display on emulators; test on physical devices
6. **Private DNS blocking**: Some DNS providers block ad domains

### Policy Pitfalls

1. **Testing with live ad units** -- Use TestIds during development; live ads during testing = account ban risk
2. **Missing ATT prompt on iOS** -- Apple will reject the app
3. **Banner ads near interactive elements** -- Causes "accidental clicks" policy violation
4. **Interstitials during user tasks** -- Never show during alarm interaction
5. **Too frequent interstitials** -- One after every action = policy violation
6. **Not declaring ads in Play Console** -- Must declare before release

### App Store Review Pitfalls

1. **iOS**: Ensure ATT dialog has clear, honest description
2. **Google Play**: "Policy and programmes" > "App content" > declare ads
3. **GDPR compliance**: Consider consent for EU users (even if targeting Japan)
4. **COPPA**: If app could attract children, additional restrictions apply

---

## 9. Implementation Plan for QR Alarm

### Phase 1: Setup (Day 1)
- [ ] Create AdMob account at https://admob.google.com
- [ ] Register app (Unpublished) for both iOS and Android
- [ ] Create ad units: 1x Banner, 1x Rewarded
- [ ] Install packages and configure app.json
- [ ] Set up development build via EAS

### Phase 2: Core Integration (Day 2-3)
- [ ] Initialize SDK in root layout with ATT prompt
- [ ] Implement `useRewardedAd` hook
- [ ] Add "Watch Ad to Snooze" button on alarm screen
- [ ] Add banner ad on alarm list / settings screen
- [ ] Test with TestIds on physical devices

### Phase 3: Polish (Day 4)
- [ ] Handle ad load failures gracefully (fallback UX)
- [ ] Add loading indicator while ad loads
- [ ] Test on both iOS and Android
- [ ] Verify policy compliance (no accidental clicks, proper ATT)

### Phase 4: Production (Before Store Submission)
- [ ] Replace TestIds with real ad unit IDs
- [ ] Declare ads in Google Play Console
- [ ] Complete app verification in AdMob
- [ ] Submit for review

---

## Sources

### Official Documentation
- [react-native-google-mobile-ads Docs](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMob Getting Started](https://support.google.com/admob/answer/15948559?hl=en)
- [AdMob Sign Up](https://support.google.com/admob/answer/7356219?hl=en)
- [Expo Tracking Transparency](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/)
- [AdMob Disallowed Interstitials](https://support.google.com/admob/answer/6201362?hl=en)
- [AdMob Recommended Interstitials](https://support.google.com/admob/answer/6201350)
- [AdMob Behavioral Policies](https://support.google.com/admob/answer/2753860?hl=en)

### GitHub Issues (Expo SDK 54 Compatibility)
- [#835 Config plugin "Unexpected token 'typeof'" -- OPEN](https://github.com/invertase/react-native-google-mobile-ads/issues/835)
- [#820 "Does not contain valid config plugin" -- CLOSED/FIXED](https://github.com/invertase/react-native-google-mobile-ads/issues/820)
- [#803 iOS 26 initialization failure -- OPEN](https://github.com/invertase/react-native-google-mobile-ads/issues/803)

### Tutorials and Guides
- [DEV.to: Integrating AdMob in React Native Expo](https://dev.to/oghenetega_adiri/integrating-admob-in-react-native-expo-a-comprehensive-developers-guide-35ij)
- [DEV.to: Adding Google AdMob to Expo Apps](https://dev.to/josie/adding-google-admob-to-expo-apps-2din)
- [Expo Blog: Adding AdMob to Expo](https://blog.expo.dev/adding-admob-to-your-expo-project-aa4e48ac848)
- [g1mishra: AdMob Ads in Expo React Native](https://blog.g1mishra.dev/admob-ads-in-expo-react-native-app)

### eCPM Data
- [AdMob eCPM by Country 2025](https://www.thesrzone.com/2024/01/admob-ecpm-rates-by-country.html)
- [Playwire: AdMob eCPM Benchmarks](https://www.playwire.com/blog/admob-ecpm-benchmarks-what-publishers-should-expect)
- [MAF: Mobile Ads eCPM](https://maf.ad/en/blog/mobile-ads-ecpm/)

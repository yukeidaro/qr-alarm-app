# Expo React Native App to TestFlight & Google Play Internal Testing -- Complete Guide
**Research Date**: 2026-03-27
**App Stack**: Expo SDK 54, React Native 0.81, Expo Router
**Developer Context**: Individual developer in Japan

---

## Table of Contents
1. [Developer Account Registration](#1-developer-account-registration)
2. [EAS Build Profiles](#2-eas-build-profiles)
3. [iOS: Code to TestFlight (Complete Workflow)](#3-ios-code-to-testflight)
4. [Android: Code to Internal Testing (Complete Workflow)](#4-android-code-to-internal-testing)
5. [EAS Submit Details](#5-eas-submit)
6. [TestFlight: Internal vs External Testing](#6-testflight-internal-vs-external)
7. [Over-The-Air Updates (EAS Update)](#7-ota-updates)
8. [App Store Requirements for TestFlight](#8-app-store-requirements-for-testflight)
9. [Common Blockers & Troubleshooting](#9-common-blockers)
10. [Realistic Timeline](#10-realistic-timeline)

---

## 1. Developer Account Registration

### Apple Developer Program (iOS)

| Item | Details |
|------|---------|
| **Cost** | 99 USD/year (Japan: 12,980 JPY/year) |
| **Account type** | Individual (no DUNS number needed; DUNS is only for Organization accounts) |
| **Requirements** | Apple ID with 2FA enabled, legal name on Apple ID, government-issued photo ID (passport accepted in Japan), be legal age of majority |
| **Registration URL** | https://developer.apple.com/programs/enroll/ |
| **Approval time** | Individual: typically 24-48 hours, but can take up to 1-2 weeks outside the US. Some Japan-based developers report 3-5 business days. |
| **Payment** | Credit card, charged in local currency (JPY) |
| **Important** | Do NOT use a nickname/alias/company name as your Apple ID first/last name -- this causes delays |

**Steps**:
1. Go to https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID
3. Select "Individual" enrollment type
4. Enter country (Japan), address, date of birth, phone number
5. Verify identity with government-issued ID (passport works)
6. Pay the annual fee
7. Wait for approval

### Google Play Developer Account (Android)

| Item | Details |
|------|---------|
| **Cost** | 25 USD one-time fee |
| **Requirements** | Google account, valid government ID, credit card (both under legal name) |
| **Registration URL** | https://play.google.com/apps/publish/signup/ |
| **Approval time** | Usually within a few days; identity verification may take up to 2 weeks |
| **New (2025)** | Google now requires identity verification for all developer accounts |

---

## 2. EAS Build Profiles

EAS Build uses `eas.json` to configure build profiles. Three default profiles:

### Default eas.json

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Profile Comparison

| Profile | Dev Tools | Distribution | Use Case |
|---------|-----------|-------------|----------|
| **development** | Yes (expo-dev-client) | Internal (direct install) | Daily development on physical devices |
| **preview** | No | Internal (direct install) | QA testing, stakeholder review, production-like testing |
| **production** | No | Store (App Store / Google Play) | TestFlight, App Store, Google Play submission |

**Key points**:
- `development`: Includes React DevTools, hot reloading, etc. Never submitted to stores.
- `preview`: Production-like build but distributed directly to devices (ad hoc / enterprise). Great for internal team testing without going through stores.
- `production`: Optimized, signed for store distribution. This is what you submit to TestFlight / Google Play.

**Commands**:
```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview build
eas build --profile preview --platform ios

# Production build (for store submission)
eas build --profile production --platform ios
eas build --profile production --platform android
```

---

## 3. iOS: Code to TestFlight

### Option A: The One-Command Way (Recommended for first time)

```bash
npx testflight
```

This single command handles EVERYTHING:
1. Initializes/detects your EAS project
2. Confirms/sets bundle identifier
3. Authenticates with your Apple ID (interactive 2FA)
4. Generates distribution certificate and provisioning profile automatically
5. Creates a production build (.ipa)
6. Creates/verifies App Store Connect API key
7. Uploads to App Store Connect
8. Enables TestFlight internal testing

**Prerequisites for `npx testflight`**:
- Paid Apple Developer Program membership (active)
- Expo account (free, `eas login`)
- `expo.ios.bundleIdentifier` set in app.json/app.config.js

### Option B: Step-by-Step Manual Way

**Step 1: Configure app.json**
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "ios": {
      "bundleIdentifier": "com.yourname.yourapp",
      "buildNumber": "1"
    }
  }
}
```

**Step 2: Build**
```bash
eas build --platform ios --profile production
```
- First time: EAS will prompt you to sign in with Apple ID
- EAS automatically creates/manages distribution certificate and provisioning profile
- You do NOT need a Mac -- EAS builds in the cloud
- You do NOT need to manually create certificates in Apple Developer Portal

**Step 3: Submit to TestFlight**
```bash
eas submit --platform ios
```
- Interactive prompts will guide you through Apple authentication
- Uploads the .ipa to App Store Connect
- Build appears in TestFlight after processing (10-15 minutes typically)

**Step 4 (Alternative): Build + Submit in one command**
```bash
eas build --platform ios --profile production --auto-submit
```

### Certificates & Provisioning Profiles

EAS handles this automatically ("managed credentials"):
- **Distribution Certificate**: Created automatically on first build. Stored on EAS servers. Shared across team members.
- **Provisioning Profile**: Created automatically. Expires after 12 months (won't affect published apps; just regenerate on next build).
- **Push Notification Key**: Also generated automatically if needed.
- Team members only need an Expo account to build -- they don't need Apple Developer Portal access after initial setup.

### App Store Connect Setup

If using `npx testflight`, most of this is handled automatically. Otherwise:

1. Go to https://appstoreconnect.apple.com/
2. Click "+" > "New App"
3. Fill in: name, primary language, bundle ID (must match your app.json), SKU
4. The app record is created and you can start receiving TestFlight builds

---

## 4. Android: Code to Internal Testing

### Step-by-Step Workflow

**Step 1: Create app on Google Play Console**
1. Go to https://play.google.com/console/
2. Click "Create app"
3. Fill in app details (name, language, app/game, free/paid)
4. Accept policies

**Step 2: Set up Internal Testing track**
1. Go to Testing > Internal testing
2. Create a testers list (add email addresses)
3. Click "Create new release"

**Step 3: Build with EAS**
```bash
eas build --platform android --profile production
```
This produces an .aab (Android App Bundle) file.

**Step 4: First upload MUST be manual**
- Download the .aab from EAS dashboard
- Upload it manually in Google Play Console > Internal testing > Create release > Upload
- This is a Google API limitation -- the first upload must be manual

**Step 5: Set up Google Service Account (for subsequent automated uploads)**
- Follow: https://github.com/expo/fyi/blob/main/creating-google-service-account.md
- Create service account in Google Cloud Console
- Grant access in Google Play Console
- Download JSON key file

**Step 6: Configure eas.json for automated submission**
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path-to-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Step 7: Automated submission (after first manual upload)**
```bash
eas submit --platform android
```

**Step 8: Invite testers**
- In Google Play Console > Internal testing > Testers tab
- Create email list or copy the opt-in URL link
- Share the link with testers
- Testers click the link, opt in, then can download from Play Store

### Google Play Testing Tracks

| Track | Testers | Review Required | Use Case |
|-------|---------|----------------|----------|
| **Internal testing** | Up to 100 email addresses | No review | Quick team testing |
| **Closed testing** | Managed lists, up to unlimited | Review required (hours-days) | Broader beta |
| **Open testing** | Anyone on Play Store | Review required | Public beta |

---

## 5. EAS Submit

### What It Does
`eas submit` automates uploading your built binary to App Store Connect (iOS) and Google Play Console (Android).

### iOS Submit
```bash
eas submit --platform ios
```
- Uploads .ipa to App Store Connect
- Build appears in TestFlight after processing
- Can authenticate via Apple ID (interactive) or App Store Connect API Key (CI/CD)
- Works from Windows/Linux (no Mac needed!)

### Android Submit
```bash
eas submit --platform android
```
- Uploads .aab to Google Play Console
- Requires Google Service Account JSON key
- First upload must be done manually through the console
- Can specify track: internal, alpha, beta, production

### Combined Build + Submit
```bash
# iOS
eas build --platform ios --profile production --auto-submit

# Android
eas build --platform android --profile production --auto-submit
```

### Full eas.json Example
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 6. TestFlight: Internal vs External Testing

### Internal Testing

| Aspect | Details |
|--------|---------|
| **Who** | App Store Connect team members (Admin, Developer, Marketing roles etc.) |
| **Max testers** | 100 |
| **Devices per tester** | Up to 30 |
| **Apple review** | NOT required |
| **Availability** | Immediately after build processing (10-15 min) |
| **Setup** | Add users to App Store Connect team, they get auto-invited via TestFlight app |

### External Testing

| Aspect | Details |
|--------|---------|
| **Who** | Anyone with an email address or invite link |
| **Max testers** | 10,000 |
| **Apple review** | YES -- required for first build. Subsequent builds in same group may skip review |
| **Review time** | Usually a few hours to 1-2 days |
| **Apple ID** | Testers don't need Apple ID (can be invited by email or public link) |
| **Setup** | Create test group > Add testers > Submit for Beta App Review |

### Build Expiration
- All TestFlight builds expire **90 days** after upload
- After expiration, testers cannot install or open the build

### Recommendation
- Start with **Internal Testing** (no review needed, instant access)
- Move to **External Testing** when you need broader feedback or non-team-member testers

---

## 7. OTA Updates (EAS Update)

### What It Can Do
- Push JavaScript/TypeScript code changes, UI changes, and asset changes WITHOUT rebuilding
- Testers get the update on next app launch/reload
- Works with TestFlight builds and Google Play builds

### What It Cannot Do
- Cannot update native code changes (new native modules, SDK version changes, native config changes)
- Those require a full rebuild and resubmission

### Setup
```bash
# Install
npx expo install expo-updates

# Configure update URL in app.json
# (EAS Update sets this up automatically)

# Send an update
eas update --branch production --message "Fix login bug"
```

### Practical Impact
- Bug fixes and UI tweaks: push via OTA in minutes
- New native features: full rebuild + resubmit to TestFlight (30+ min build + processing)
- This dramatically speeds up iteration during beta testing

---

## 8. App Store Requirements for TestFlight

### Internal Testing (Minimal Requirements)
- Valid bundle identifier
- App icon (in app.json, Expo generates the required sizes)
- Properly signed build
- NO privacy policy required
- NO screenshots required
- NO app description required

### External Testing (Beta App Review)
- Everything above, plus:
- **Privacy policy URL** (required since Oct 2018 for external testing)
- **Beta app description** (what is the app, what to test)
- **Beta app review contact info** (email, phone)
- **Test account credentials** (if app requires login)
- Screenshots: **optional** but can be included in invite
- App icon: must adhere to 4+ age rating even if app is rated higher

### Full App Store Release (for reference)
- All of the above, plus:
- Screenshots for all required device sizes
- Full app description, keywords, categories
- Support URL
- Age rating questionnaire

---

## 9. Common Blockers & Troubleshooting

### Apple / iOS

| Issue | Solution |
|-------|----------|
| **"Provisioning profile doesn't include signing certificate"** | Run `eas credentials --platform ios` and regenerate. This is the #1 reported issue in 2025. |
| **Certificate expired/revoked** | Regenerate both certificate AND provisioning profile via `eas credentials` |
| **Bundle identifier mismatch** | Ensure `expo.ios.bundleIdentifier` in app.json matches App Store Connect exactly. Changing it later causes headaches. |
| **Apple 2FA timeout during build** | Use App Store Connect API Key for CI/CD instead of interactive Apple ID auth |
| **Build processing stuck** | App Store Connect processing usually takes 10-15 min but can take up to an hour. Just wait. |
| **Beta App Review rejection** | Usually for crashes on launch, missing test account info, or privacy policy issues. Fix and resubmit. |
| **"App name already taken"** | Choose a different name in App Store Connect (can differ from your display name) |

### Google / Android

| Issue | Solution |
|-------|----------|
| **First upload must be manual** | Google API limitation. Upload first .aab through web console, then EAS Submit works for subsequent ones. |
| **Service account permissions** | Ensure service account has "Release Manager" or "Admin" permissions in Google Play Console. Permission propagation can take 24-48 hours. |
| **Testers can't find app** | They must click the opt-in link AND wait for the release to be "available" (can take a few hours for internal track) |
| **Identity verification delays** | Google now requires ID verification. Start this process early. |

### General / EAS

| Issue | Solution |
|-------|----------|
| **EAS Build queue** | Free tier has limited concurrency. Builds may queue for minutes. Priority plan available. |
| **Build fails on native modules** | Check that all native modules are compatible with your Expo SDK version. Use `npx expo-doctor` to diagnose. |
| **Large build size** | Enable `enableProguardInReleaseBuilds` (Android), check assets aren't bloated |

---

## 10. Realistic Timeline

### From "I have working code" to "Testers install via TestFlight"

| Step | Time | Notes |
|------|------|-------|
| **Apple Developer registration** | 1-7 days | Can be 24h if lucky, up to 2 weeks worst case |
| **Configure app.json + eas.json** | 30 minutes | Bundle ID, app name, build profiles |
| **First `npx testflight` run** | 30-45 minutes | Build (15-30 min) + upload + processing |
| **Apple ID verification / credential setup** | 5-10 minutes | Interactive, first time only |
| **TestFlight processing** | 10-15 minutes | Can be up to 1 hour |
| **Internal testers can install** | Immediately | After processing completes |
| **External testing review** | 1-24 hours | Only if you need external testers |

**Best case total: 1-2 days** (if Apple Developer account is already active)
**Typical case: 3-7 days** (including account registration wait)
**Worst case: 2-3 weeks** (account approval delays)

### From "I have working code" to "Testers install via Google Play Internal Testing"

| Step | Time | Notes |
|------|------|-------|
| **Google Play Developer registration** | 1-3 days | ID verification can add time |
| **Create app + internal testing track** | 15 minutes | |
| **EAS Build (Android)** | 10-20 minutes | .aab generation |
| **Manual first upload** | 5 minutes | Required one-time step |
| **Internal testing available** | Minutes to hours | Google says "immediately" but can take a few hours |

**Best case total: 1-2 days**
**Typical case: 3-5 days**

---

## Quick Start Checklist

- [ ] **Apple Developer Program**: Register at https://developer.apple.com/programs/enroll/ (12,980 JPY/year)
- [ ] **Google Play Console**: Register at https://play.google.com/apps/publish/signup/ ($25 one-time)
- [ ] **Expo account**: Create at https://expo.dev/signup (free)
- [ ] **Install EAS CLI**: `npm install -g eas-cli && eas login`
- [ ] **Set bundle identifier**: `expo.ios.bundleIdentifier` and `expo.android.package` in app.json
- [ ] **Initialize EAS**: `eas build:configure` (creates eas.json)
- [ ] **iOS TestFlight**: `npx testflight`
- [ ] **Android**: `eas build -p android --profile production` then manually upload first .aab
- [ ] **Set up Google Service Account** for automated Android submissions
- [ ] **Invite testers**
- [ ] **Set up EAS Update** for fast OTA iteration: `npx expo install expo-updates`

---

## Sources

### Official Expo Documentation
- [Create a production build for iOS - Expo Docs](https://docs.expo.dev/tutorial/eas/ios-production-build/)
- [npx testflight command - Expo Docs](https://docs.expo.dev/build-reference/npx-testflight/)
- [EAS Submit Introduction - Expo Docs](https://docs.expo.dev/submit/introduction/)
- [Submit to the Apple App Store - Expo Docs](https://docs.expo.dev/submit/ios/)
- [Submit to Google Play Store - Expo Docs](https://docs.expo.dev/submit/android/)
- [Configure EAS Build with eas.json - Expo Docs](https://docs.expo.dev/build/eas-json/)
- [Configuration with eas.json - Expo Docs](https://docs.expo.dev/eas/json/)
- [Using automatically managed credentials - Expo Docs](https://docs.expo.dev/app-signing/managed-credentials/)
- [App credentials - Expo Docs](https://docs.expo.dev/app-signing/app-credentials/)
- [EAS Update Introduction - Expo Docs](https://docs.expo.dev/eas-update/introduction/)
- [Send over-the-air updates - Expo Docs](https://docs.expo.dev/deploy/send-over-the-air-updates/)
- [Automate submissions - Expo Docs](https://docs.expo.dev/build/automate-submissions/)
- [Create a production build for Android - Expo Docs](https://docs.expo.dev/tutorial/eas/android-production-build/)
- [expo/testflight GitHub repo](https://github.com/expo/testflight)

### Apple Developer
- [Apple Developer Program Enrollment](https://developer.apple.com/programs/enroll/)
- [Membership Details](https://developer.apple.com/programs/whats-included/)
- [Choosing a Membership](https://developer.apple.com/support/compare-memberships/)
- [TestFlight Overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)
- [Invite External Testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Google Play
- [Get started with Play Console](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
- [Set up internal/closed/open tests](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
- [Creating Google Service Account (Expo guide)](https://github.com/expo/fyi/blob/main/creating-google-service-account.md)

### Developer Blog Posts & Guides
- [How to Build and Test iOS Apps: Expo EAS and TestFlight (Part 1)](https://dev.to/cathylai/how-to-build-and-test-ios-apps-on-a-physical-phone-expo-eas-and-apple-testflight-part-13-357o)
- [How to Build and Test iOS Apps: Expo EAS and TestFlight (Part 2)](https://dev.to/cathylai/how-to-build-and-test-ios-apps-on-a-physical-phone-expo-eas-and-apple-testflight-part-23-4ff8)
- [React Native App Deployment with Expo & EAS CLI (Levi9)](https://levi9-serbia.medium.com/react-native-app-deployment-with-expo-eas-cli-your-complete-guide-to-app-store-publishing-d4674cb00518)
- [How to Publish Expo React Native App (Pagepro, 2025)](https://pagepro.co/blog/publishing-expo-react-native-app-to-ios-and-android/)
- [Submit Expo iOS App to TestFlight Using GitHub Actions](https://www.amarjanica.com/submit-expo-ios-app-to-apple-appstore/)
- [Mastering Expo EAS: Submit, OTA Updates, and Workflow Automation](https://procedure.tech/blogs/mastering-expo-eas-submit-ota-updates-and-workflow-automation)
- [React Native OTA Updates with Expo EAS (DEV Community)](https://dev.to/nour_abdou/react-native-ota-updates-with-expo-eas-step-by-step-guide-best-practices-1idk)
- [iOS App Distribution Guide 2026 (Foresight Mobile)](https://foresightmobile.com/blog/ios-app-distribution-guide-2026)
- [TestFlight Beta Testing Complete Guide](https://iossubmissionguide.com/testflight-beta-testing-complete-guide/)

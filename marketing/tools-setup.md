# Tools Setup Guide

## 1. CapCut Pro

**Purpose**: Video editing, auto-captions, TikTok-native templates

### Setup
1. Download CapCut: https://www.capcut.com/
2. Sign up with TikTok account (links accounts)
3. Upgrade to Pro ($7.99/month) for:
   - No watermark
   - Extended AI features
   - Premium templates

### Key Features to Use
- **Auto Captions**: Enable for every video (boosts engagement 40%+)
- **Templates**: Search "alarm" / "morning routine" for trending formats
- **Text Styles**: Use bold, high-contrast text for hooks
- **Export**: 1080x1920, 30fps for TikTok/Reels

---

## 2. ElevenLabs

**Purpose**: AI voiceover generation

### Setup
1. Sign up: https://elevenlabs.io/
2. Plan: Starter ($5/month) — 30,000 characters/month (~30 min of audio)
3. API key: Settings → API Keys → Create

### Voice Configuration
- **Primary voice (male)**: "Josh" or "Adam" — casual, young American English
- **Primary voice (female)**: "Rachel" or "Bella" — casual, young American English
- **Settings**: Stability: 0.5, Similarity: 0.75, Style: 0.3 (natural, not robotic)

### Batch Generation
```
# PowerShell script pattern for batch voiceover
$scripts = Get-Content "marketing/scripts/week-XX.json" | ConvertFrom-Json
foreach ($script in $scripts) {
    # Call ElevenLabs API for each script
    # Save to marketing/assets/voiceovers/
}
```

API endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

---

## 3. Kling AI

**Purpose**: AI-generated visual hooks and B-roll

### Setup
1. Sign up: https://klingai.com/
2. Free tier: ~66 credits/day (enough for 2-3 short clips)
3. Pro ($8/month): 660 credits/month for more volume

### Prompt Templates for ScanAlarm Content
- **Bedroom scene**: "A groggy person waking up in a dark bedroom, phone alarm blaring, dramatic lighting, cinematic"
- **QR scan moment**: "Close-up of a phone scanning a QR code on a bathroom mirror, morning light, satisfying moment"
- **Chaos vs calm**: "Split comparison of chaotic morning routine vs calm productive morning, cinematic"

### Best Practices
- Generate 5-second clips max (best quality)
- Use Image-to-Video for more control (upload a reference frame)
- Download highest available resolution

---

## 4. HeyGen

**Purpose**: AI avatar talking-head videos

### Setup
1. Sign up: https://www.heygen.com/
2. Plan: Creator ($24/month) — 3 avatar videos/month up to 5 min each
3. Select avatars:
   - 1 male (young, casual, American)
   - 1 female (young, casual, American)

### Production Workflow
1. Write script in `content-templates/09-avatar-review.md` format
2. Paste into HeyGen
3. Select avatar + voice
4. Generate video
5. Download and edit in CapCut (add screen recordings, captions)

### Tips
- Keep scripts under 60 seconds
- Use "casual" setting for avatar (not corporate)
- Batch scripts: generate all avatar videos for the week in one session

---

## 5. Buffer

**Purpose**: Cross-platform scheduled posting

### Setup
1. Sign up: https://buffer.com/
2. Plan: Essentials ($15/month) — supports TikTok, Instagram, X
3. Connect accounts:
   - TikTok Business Account
   - Instagram Business Account (requires Facebook Page)
   - X account

### Queue Configuration
```
TikTok:
  - Mon-Sun: 8:00 AM EST, 8:00 PM EST

Instagram:
  - Mon-Sat: 8:30 AM EST

X:
  - Mon-Fri: 12:30 PM EST, 7:30 PM EST
  - Sat: 10:00 AM EST
```

### Workflow
1. Upload videos + captions in bulk on Sunday
2. Buffer auto-posts throughout the week
3. Check analytics weekly in Buffer dashboard

---

## 6. X API v2 (Direct Automation)

**Purpose**: Automated posting to X (supplement to Buffer)

### Setup
1. Developer Portal: https://developer.x.com/
2. Apply for Free tier (sufficient: 1,500 tweets/month)
3. Create Project + App
4. Generate keys:
   - API Key + Secret
   - Access Token + Secret
   - Bearer Token

### API Usage
```
# Post a tweet with media
# Step 1: Upload media
POST https://upload.twitter.com/1.1/media/upload.json

# Step 2: Create tweet
POST https://api.twitter.com/2/tweets
{
  "text": "The alarm app that should be illegal. QR scan = free. Download link in bio.",
  "media": {"media_ids": ["MEDIA_ID"]}
}
```

Free tier limits: 1,500 tweets/month, 50 requests/15 min

---

## 7. Adobe Premiere Pro (Already Licensed)

**Purpose**: Complex edits, high-quality output

### Templates
- Create a ScanAlarm template project with:
  - Brand colors / fonts
  - Lower third for "Free on App Store / Google Play"
  - End card template with QR code to download
  - Caption style preset (match TikTok aesthetic)

### When to Use Premiere vs CapCut
| Task | Use |
|------|-----|
| Quick TikTok edits | CapCut |
| Auto-captions | CapCut |
| Trending templates | CapCut |
| Complex multi-layer edits | Premiere Pro |
| Brand video / launch video | Premiere Pro |

---

## 8. Social Media Account Setup

### TikTok Business Account
1. Download TikTok → Sign up
2. Settings → Manage Account → Switch to Business Account
3. Category: "App / Software"
4. Bio: "The alarm you can't ignore. QR scan = FREE. Download below."
5. Link: App Store / Google Play link (or Linktree)

### Instagram Business Account
1. Create Instagram account (or convert existing)
2. Settings → Account → Switch to Professional Account → Business
3. Connect to Facebook Page
4. Bio: "Wake up for real. Free QR alarm app."
5. Link in bio: App Store / Google Play

### X Account
1. Create X account: @ScanAlarm (or closest available)
2. Bio: "The alarm that makes you get up. QR scan is FREE. Download now."
3. Pin a demo video tweet

### Linktree (Optional)
- Create free Linktree with:
  - App Store link
  - Google Play link
  - TikTok profile
  - Instagram profile

# Scan Alarm — Suno プロンプト集

---

## 手順（これだけ読めばOK）

### 1. Suno で生成
- https://suno.com にログイン（**Pro/Premier プラン必須**）
- 各プロンプトをコピペして生成
- **Duration: 30秒** に設定（Sunoの設定画面で選択）
- **Instrumental: ON**（Motivational Voice カテゴリだけ OFF）

### 2. ダウンロード
- 生成された曲を **MP3** でダウンロード

### 3. ファイルを置く場所
```
12-qr-alarm-app/assets/sounds/
```
（既存の gentle.wav や nature.wav と同じフォルダ）

### 4. ファイル名
`{カテゴリ}_{バリエーション名}.mp3`

例:
```
gentle_aurora.mp3
kpop_sparkle.mp3
lofi_morning.mp3
voice_gentle_ja.mp3
voice_fire_en.mp3
```

### 5. 生成後チェック
- [ ] 30秒でループしたとき不自然な切れ目がないか
- [ ] 音量が他のサウンドと揃っているか
- [ ] ファイルサイズ 1MB 以下か
- [ ] ファイル名が上記の命名規則に従っているか

---

## 生成ルールまとめ

| 項目               | 値                                |
| ---------------- | -------------------------------- |
| **長さ**           | **30秒**                          |
| **形式**           | MP3                              |
| **Instrumental** | ON（Voice カテゴリのみ OFF）             |
| **配置先**          | `12-qr-alarm-app/assets/sounds/` |
| **命名**           | `{category}_{variation}.mp3`     |
| **プラン**          | Suno Pro/Premier（Free版は商用不可）     |

---

## Suno 設定メモ
- **Custom Mode** を使う（スタイルプロンプトと歌詞を分けて入力）
- **Style prompt** に下記のプロンプトをコピペ
- **Lyrics** は空欄（Voiceカテゴリのみセリフを入力）
- 重要なワードはプロンプトの先頭に置く（Sunoは先頭を優先する）
- 4〜7個のキーワードが最適。多すぎると無視される

---

## Category 1: Gentle（やさしい目覚め）

### gentle_aurora
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Soft dreamy ambient. Gentle piano arpeggios in C major, warm analog pad synths, crystalline wind chimes every 4 bars. 70 BPM. Ethereal, calming, bright morning light atmosphere. Clean mix, no distortion, no bass. Suitable for waking up gently.
```

### gentle_sunrise
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Delicate nylon-string acoustic guitar fingerpicking with light wooden marimba melody and distant tubular bells. 65 BPM. Warm, cozy, minimal and spacious. Soft reverb. No drums, no bass. Like sunrise through curtains.
```

### gentle_cloud
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Floating ambient texture with Celtic harp glissandos, soft music box melody, and airy pad synths. 60 BPM. Weightless, spa-like tranquility. High-register only, no low frequencies. Smooth crossfade-friendly ending.
```

---

## Category 2: Nature（自然音ベース）

### nature_forest
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Morning forest soundscape with realistic birdsong and gentle stream. Soft Japanese shakuhachi wooden flute melody over the ambience. 75 BPM. Organic, peaceful, dawn atmosphere. Natural reverb, warm acoustic mix.
```

### nature_beach
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Tropical morning soundscape with gentle ocean waves. Bright ukulele melody, light steel drum accents, soft finger-snapped rhythm. 80 BPM. Warm, inviting, Hawaiian sunrise vibe. Clean, airy production.
```

### nature_garden
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Spring garden ambience with gentle wind rustling leaves. Simple acoustic guitar arpeggios, distant ceramic wind chimes, soft kalimba melody. 70 BPM. Fresh morning dew atmosphere. Crisp, natural, no compression.
```

---

## Category 3: Digital（デジタル・エレクトロニック）

### digital_pulse
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Clean minimal electronic. Soft plucked synth pulses, precise digital arpeggios in minor key, subtle side-chained pad. 90 BPM. Modern tech startup aesthetic. Crisp hi-hats, no heavy bass. Futuristic but not harsh. Crystal clear mix.
```

### digital_neon
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. 1980s synthwave. Warm analog Juno-style synth pads, pulsing Moog bass, crystalline FM digital bells, gated reverb snare. 85 BPM. Neon-lit cyberpunk morning aesthetic. Retro-futuristic, polished production.
```

### digital_matrix
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Glitchy IDM-inspired electronic. Filtered granular beats, sci-fi sonar bleeps, rhythmic stuttered synth stabs, subtle vocoder texture. 100 BPM. Attention-grabbing but not aggressive. Clean digital production, stereo panning.
```

---

## Category 4: Loud（しっかり起きる）

### loud_powerup
```
30-second morning alarm tone, seamless instrumental loop, no fade-out, strong attack from beat one. Energetic punk rock. Distorted power chord guitar riff in E, tight double-kick drums, growling bass guitar, crash cymbal hits. 120 BPM. Raw, punchy, impossible to sleep through. Loud and proud.
```

### loud_brass
```
30-second morning alarm tone, seamless instrumental loop, no fade-out, strong attack from beat one. Military reveille meets modern big band. Bright trumpet fanfare, French horn swells, tight marching snare rolls, bass drum quarter notes. 110 BPM. Commanding, authoritative, brass section power.
```

### loud_thunder
```
30-second morning alarm tone, seamless instrumental loop, no fade-out, strong attack from beat one. Epic cinematic orchestral. Thundering timpani rolls, dramatic fortissimo strings, massive brass stabs, taiko drum hits. 100 BPM. Hollywood trailer intensity. Forces you awake immediately.
```

---

## Category 5: Motivational（モチベーション）

### motivational_champion
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Uplifting sports stadium anthem. Driving four-on-the-floor kick, clap-along snare, soaring synth brass melody, inspirational string risers. 128 BPM. Victory celebration energy. Like walking onto the field. Punchy, triumphant.
```

### motivational_dawn
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Inspirational cinematic score. Building orchestral strings starting pianissimo, hopeful solo piano melody joined by French horns, emotional crescendo to fortissimo. 95 BPM. Sunrise over mountains. New chapter beginning.
```

### motivational_hustle
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Modern trap-pop motivational beat. Deep 808 sub bass, crisp trap hi-hats, snappy clap snare, uplifting major-key synth chord progression, bright lead melody. 140 BPM. Confident CEO-walk energy. Boss mode activated.
```

---

## Category 6: Classical（クラシック風）

### classical_string
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Baroque-inspired string quartet. First violin playing graceful melodic line in G major, second violin providing countermelody, viola and cello in warm pizzicato accompaniment. 80 BPM. Elegant, refined, sophisticated. Chamber music warmth.
```

### classical_moonlight
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Romantic-era solo piano. Gentle broken-chord arpeggios in C-sharp minor, expressive rubato melody in right hand, sustain pedal warmth. 72 BPM. Contemplative beauty. Steinway grand piano tone, intimate recital hall reverb.
```

### classical_vivaldi
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Bright Baroque concerto style. Lively harpsichord continuo, energetic violin ensemble melody, driving cello bass line. 100 BPM. Spring morning energy, Vivaldi Four Seasons spirit. Cheerful, danceable, aristocratic.
```

---

## Category 7: K-pop Style（K-pop風オリジナル）

### kpop_sparkle
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Catchy K-pop dance-pop instrumental. Bright supersaw synth hook, tight 808 kick and snappy snare, shimmering high-frequency arpeggios, funky filtered bass. 125 BPM. SM/JYP-style polished production. Addictive 4-bar melody loop. Clean, bright, poppy.
```

### kpop_dreamy
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Dreamy K-pop R&B ballad instrumental. Lush reverbed synth pads, soft trap-soul beat with gentle 808, twinkly celeste keys, warm electric piano chords. 90 BPM. Sweet, romantic morning. IU/Taeyeon ballad aesthetic. Intimate, delicate production.
```

### kpop_hype
```
30-second morning alarm tone, seamless instrumental loop, no fade-out, strong attack from beat one. High-energy K-pop EDM instrumental. Massive future bass drop with detuned supersaw chords, powerful brass stab hits, four-on-the-floor kick, festival laser synth FX. 130 BPM. BLACKPINK energy. Maximum hype.
```

---

## Category 8: J-pop Style（J-pop風オリジナル）

### jpop_sakura
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Bright J-pop anime opening instrumental. Rhythmic acoustic guitar strumming, uplifting piano melody, light electronic beat with sidechained pads, tambourine shaker. 135 BPM. Cherry blossom optimism. Radwimps/YOASOBI-inspired energy. Cheerful, catchy.
```

### jpop_city
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. 1980s Japanese city pop revival instrumental. Slap bass groove, Fender Rhodes jazzy electric piano chords, chorus-effect clean guitar, tight disco hi-hat pattern. 110 BPM. Tatsuro Yamashita aesthetic. Smooth, groovy, stylish Tokyo night.
```

### jpop_kawaii
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Cute Harajuku-pop instrumental. Twinkling music box melody, bouncy 8-bit chiptune bass, cheerful glockenspiel accents, light four-on-the-floor kick with clap. 120 BPM. Pastel candy colors in sound. Kawaii, playful, happy morning energy.
```

---

## Category 9: Lo-fi / Chill（ローファイ）

### lofi_morning
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Lo-fi hip hop. Warm vinyl crackle texture, mellow jazz piano chords with gentle swing, dusty boom-bap drum loop with soft kick and brushed snare, Rhodes bass. 85 BPM. Sunday morning coffee shop vibe. Tape-saturated warmth, analog feel.
```

### lofi_rainy
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Rainy day lo-fi beat. Nylon guitar fingerpicking with chorus effect, subtle rain ambience layer, warm tube-saturated analog bass, lazy half-time drum pattern. 80 BPM. Nostalgic, comforting, like staying in bed but gently waking up.
```

### lofi_sunset
```
30-second morning alarm tone, seamless instrumental loop, no fade-out. Lo-fi chillhop jazz. Dreamy Wurlitzer electric piano melody, smooth tenor saxophone ad-lib, tape-compressed SP-404 style drums, vinyl hiss. 82 BPM. Golden hour warmth. Nujabes-inspired. Soulful, mellow, beautiful.
```

---

## Category 10: Motivational Voice（モチベ音声）
> **Instrumental: OFF** — ボーカルありで生成
> **Lyrics欄** に下記の「」内セリフをそのまま入力する
> **Style prompt** に音楽の指示を入力する

### voice_gentle_en
**Style prompt:**
```
30-second morning alarm tone with spoken word, no fade-out. Calm deep male voice speaking over soft ambient piano pads, gentle reverb. Warm, reassuring tone like a wise mentor. 65 BPM. Intimate, close-mic voice recording feel.
```
**Lyrics:**
```
Good morning. Take a deep breath.
This day is yours.
You don't have to be perfect — you just have to show up.
And you already did.
Now go make something beautiful.
```

### voice_gentle_ja
**Style prompt:**
```
30-second morning alarm tone with spoken word, no fade-out. Calm warm Japanese male voice over gentle nylon guitar arpeggios and soft string pad. Reassuring, supportive coach tone. 65 BPM. Natural Japanese speech rhythm.
```
**Lyrics:**
```
おはよう。今日も目が覚めた。
それだけで、もう一歩前に進んでる。
焦らなくていい。
自分のペースで、最高の一日にしよう。
```

### voice_fire_en
**Style prompt:**
```
30-second morning alarm tone with motivational speech, no fade-out, building intensity. Powerful passionate male voice over epic cinematic instrumental, building timpani and brass swells. Commanding, intense. 110 BPM.
```
**Lyrics:**
```
Wake up.
While you're lying there, someone out there is putting in the work.
This is your moment. Not tomorrow. Not next week.
Right now.
Get up and make it happen.
```

### voice_fire_ja
**Style prompt:**
```
30-second morning alarm tone with motivational speech, no fade-out, building intensity. Strong passionate Japanese male voice over driving beat with taiko drums, powerful bass, dramatic strings. Direct coach-style. 110 BPM.
```
**Lyrics:**
```
起きろ。
昨日の自分を超えるのは、今日の自分だけだ。
言い訳してる時間はない。
さあ立ち上がれ。
お前の番だ。
```

### voice_calm_en
**Style prompt:**
```
30-second morning alarm tone with mindfulness spoken word, no fade-out. Soothing warm female voice over ambient soundscape with singing bowls, gentle nature sounds, airy pads. Meditative, grounding. 60 BPM.
```
**Lyrics:**
```
Breathe in. Breathe out.
A new day has begun, full of possibilities.
You are enough, exactly as you are.
Now rise gently,
and carry that peace with you.
```

### voice_calm_ja
**Style prompt:**
```
30-second morning alarm tone with mindfulness spoken word, no fade-out. Gentle soothing Japanese female voice over soft piano and ambient wind pads. Morning yoga instructor tone. Peaceful, meditative. 60 BPM.
```
**Lyrics:**
```
深呼吸して。
今日という日は、まだ何も書かれていない真っ白なページ。
どんな一日にするかは、あなた次第。
さあ、ゆっくり始めよう。
```

### voice_hype_en
**Style prompt:**
```
30-second morning alarm tone with high-energy motivational speech, no fade-out, strong attack from beat one. Energetic hyped male voice over modern trap beat with heavy 808 bass, crisp hi-hats, stadium claps. Maximum energy. 130 BPM.
```
**Lyrics:**
```
Let's GO!
Champions don't hit snooze.
You've got dreams to chase and goals to crush.
Every single morning is a chance to level up.
So get out of that bed and OWN this day!
```

### voice_gratitude_ja
**Style prompt:**
```
30-second morning alarm tone with spoken word, no fade-out. Kind mature Japanese male voice over gentle lo-fi piano with vinyl crackle, warm acoustic guitar. Philosophical, grateful tone. 75 BPM. Like a letter from a caring father.
```
**Lyrics:**
```
おはよう。
目が覚めたこと、当たり前じゃない。
今日会える人、食べられるごはん、全部がギフトだ。
感謝して、楽しんで、
今日も生きよう。
```

---

## 生成後チェックリスト

- [ ] 各サウンドが30秒で自然にループするか確認
- [ ] 音量レベルが統一されているか（ラウドネス正規化）
- [ ] ファイルサイズが適切か（各1MB以下推奨）
- [ ] MP3 128kbps以上の品質か
- [ ] ファイル命名規則に従っているか
- [ ] Suno Proプランで生成したことを記録

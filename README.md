# NSU PODIUM 2026 — WEBSITE 1

Official retro-arcade event platform for **NSU PODIUM 2026**, organized by **NSUDC — North South University Debate Club**.

> *“DEBATE. COMPETE. LEVEL UP.”*

---

## 🎨 Visual Identity & Reference Replication

Recreating the exact pixel-art arcade aesthetic from the provided reference screenshots:
* **Palette**: Deep Arcade Midnight (`#030611`, `#050a1f`), Neon Blue (`#1e40ff`), Electric Cyan (`#00f0ff`, `#38bdf8`), Arcade Gold/Yellow (`#facc15`), Arcade Pink (`#f472b6`), and Arcade Red (`#ef4444`).
* **Background Texture**: Authentic retro dot-matrix grid with subtle glowing grid intersections.
* **Cabinet Bezel**: Rounded glowing neon blue screen border with subtle CRT scanline effect.
* **Typography**:
  - Headings & Badges: `Press Start 2P` (Authentic 8-bit retro gaming typography)
  - Sub-elements & Accents: `Chakra Petch`
  - Input & Codes: `JetBrains Mono`

---

## 🏛️ Website Structure (Exact 2-Page Architecture)

### 🎮 Page 1: Main Arena (`index.html`)
*Recreation of Reference Image 1*
1. **Marquee Brand Header**: Natural integration of the official **NSU PODIUM 2026** logo and `NSUDC • OFFICIAL` badge.
2. **Top Arcade Status Bar**:
   - `1UP` (White 8-bit text)
   - `HIGH SCORE` (Glowing red 8-bit text)
   - `CREDIT 01` (White 8-bit text)
3. **3D Arcade Title**:
   - `NSU PODIUM` in large electric cyan font with 3D drop-shadow block extrusion.
   - Subtitle: `• DEBATE. COMPETE. LEVEL UP. •`
4. **Winners' Podium Centerpiece**:
   - **Step 1 (Center)**: Tall gold pedestal with yellow border, yellow number `1`, and glowing golden champion orb.
   - **Step 2 (Left)**: Blue pedestal with number `2` and cyan arcade ghost.
   - **Step 3 (Right)**: Purple/pink pedestal with number `3` and pink arcade ghost.
5. **Call to Action**:
   - Bright yellow rounded button: `Register now` linking directly to Page 2 (`register.html`).

---

### 📝 Page 2: Team Registration (Bangla) (`register.html`)
*Recreation of Reference Image 2*
1. **Top Logo & Header Section**:
   - Official **NSU PODIUM 2026** logo positioned in the designated logo area.
   - Main Title: `NSU PODIUM` (Integrated retro arcade electric blue)
   - Sub-Title: `Team Registration (Bangla)` (Matching blue with soft neon glow)
   - Caption: `Fill in your details to join the game.`
2. **Centered Registration Card**:
   - Card Title: `Insert your details`
   - Card Subtitle: `All fields are required.`
   - Form Fields (**EXACTLY 5 FIELDS**):
     1. `Institution/Club Name` (Required text input)
     2. `Representative Name` (Required text input)
     3. `Contact No` (Required text/phone input)
     4. `Email` (Required email input)
     5. `Number of Slots` (Required select dropdown with ONLY options: `1`, `2`, `3`, `4`)
3. **Submit Button**:
   - Bright yellow rounded button: `Register`
4. **Confirmation Receipt**:
   - On submission: Displays team Reference ID (`PODIUM-2026-XXXXX`), delegation summary receipt table, and reset button.
5. **Seamless Navigation**:
   - Links back to Page 1 via `← MAIN ARENA` and `← Back to Main Arena`.

---

## 📁 Project Structure

```text
├── index.html            # Page 1: Main Arena (Reference Image 1)
├── register.html         # Page 2: Bangla Registration (Reference Image 2)
├── css/
│   └── styles.css        # Unified retro-arcade design system & responsive rules
├── js/
│   ├── app.js            # Controller for form validation, submission, and receipt
│   └── storage.js        # RegistrationService (localStorage, anti-spam, duplicate check)
├── open-website.bat      # 1-click launcher to open index.html in default browser
├── serve.js              # Local Node.js static server supporting clean URLs
├── vercel.json           # Vercel configuration (cleanUrls: true)
├── _redirects            # Static host routing
└── package.json          # Project manifest
```

---

## 💻 How to Preview Locally

### Option 1: Direct File Launch
Double-click `open-website.bat` or open `index.html` directly:
```text
file:///C:/Users/Bindu%20IT/Downloads/chrome/assets/index.html
```

### Option 2: Local Static Server
Run:
```bash
node serve.js
```
Open: `http://localhost:3000` (or `http://localhost:3000/register`)

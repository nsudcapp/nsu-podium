# NSU PODIUM 2026

Official event website and registration platform for **NSU PODIUM 2026**, organized by **NSUDC — North South University Debate Club**.

> *“A platform for ideas. A stage for change.”*

---

## 🎨 Visual Design & Architecture

* **Institutional Palette**: Deep Navy (`#070d19`, `#0b1528`), Royal Blue (`#1d4ed8`), Crisp White (`#ffffff`), and Electric Cyan (`#06b6d4`, `#38bdf8`) accents.
* **Typography**: Paired with `Plus Jakarta Sans` for clean heading/body readability and `JetBrains Mono` for code and reference identifiers.
* **Graphic Assets**: Custom, self-contained vector SVG illustrations depicting the North South University campus facade, debate podium, and official NSUDC emblem. Zero external image dependencies to ensure 100% deployment reliability.
* **Layout**: Fully responsive single-page web application optimized across 1920px desktop, laptop, tablet, and mobile (down to 360px).

---

## 🏛️ Website Sections

1. **Sticky Navigation**:
   - NSU PODIUM 2026 brand crest.
   - Smooth-scrolling links: Home, About, Highlights, Program, Timeline, Registration, FAQ, Contact.
   - Active section scrollspy highlighting and mobile navigation drawer.
2. **Hero Section**:
   - NSU PODIUM 2026 flagship event badge with pulsing live indicator.
   - Main headline, theme tagline, and event description.
   - Event metadata ribbon with verified placeholders: Date (To Be Announced), Venue (To Be Announced), Registration (Available Now), and Audience (Students & Delegates).
   - High-definition architectural SVG artwork of the North South University campus and debate stage.
3. **About Section**:
   - Context on NSU PODIUM and NSUDC's mission to foster debate, dialogue, and leadership.
   - 4 Core Dimension Cards: Interdisciplinary, Student-Led, Ideas & Dialogue, and NSU Community.
4. **Event Highlights (6 Cards)**:
   - Inspiring Discussions, Diverse Participation, Critical Thinking, Public Speaking, Leadership & Communication, Growth & Perspective.
5. **Program Details**:
   - Informative session overview cards with editable neutral placeholders: Debate & Discussion, Public Speaking & Speech, Panel Discussions, Leadership & Communication, Interactive Sessions, and Concluding Session.
6. **Event Timeline**:
   - 4-phase milestone roadmap: Stage 01 (Registration Opens) → Stage 02 (Program Schedule Announcement) → Stage 03 (Event Sessions & Activities) → Stage 04 (Concluding Session).
7. **Participant Registration Section**:
   - Live registration portal with the required fields:
     1. Full Name
     2. Student ID
     3. Department (ECE, SBE, DEML, Law, CEE, SHLS, etc.)
     4. Batch
     5. Email Address
     6. Phone Number
     7. Participation Category (General Participant, Discussion & Debate, Public Speaking, Observer)
     8. Terms and Guidelines Agreement Checkbox
   - Real-time client-side field validation with inline error alerts.
   - Anti-spam submission throttle and duplicate submission check (Student ID, Email, Phone).
   - Instant confirmation receipt card with generated Reference ID (`PODIUM-2026-XXXXX`), one-click copy button, and registration summary table.
8. **Interactive FAQ Accordion**:
   - 5 Accordion items addressing delegate eligibility, reference IDs, schedule announcements, and contact support.
9. **Contact & Secretariat**:
   - Official North South University campus location (Plot 15, Block B, Bashundhara R/A, Dhaka-1229), official email (`info@nsudc.org`), and NSU PABX hotline (`+880 (2) 5566-8200`).
10. **Institutional Footer**:
    - Organizer attribution, navigation links, and copyright notices.

---

## 📁 Project Structure

```text
├── index.html            # Main semantic HTML5 webpage & SVG illustrations
├── css/
│   └── styles.css        # Comprehensive institutional design system & responsive rules
├── js/
│   ├── app.js            # Main controller, FAQ accordion, copy feedback, scrollspy
│   ├── validation.js     # FormValidator for all 8 registration fields
│   └── storage.js        # Client-side localStorage service, duplicate detection, reference ID
├── open-website.bat      # Windows 1-click launcher to open index.html in default browser
├── serve.js              # Zero-dependency local Node.js static server
├── vercel.json           # Vercel deployment configuration with static asset MIME preservation
├── _redirects            # Fallback routing for Netlify and static hosts
├── robots.txt            # Search engine crawler directives
└── package.json          # Project manifest with static build script
```

---

## 💻 How to Run Locally

### Option 1: Direct Browser Launch
Double-click `open-website.bat` or open `index.html` directly in any web browser.

### Option 2: Local Node Static Server (Zero Dependencies)
Run the built-in static server:
```bash
node serve.js
```
Open `http://localhost:3000` in your browser.

---

## 🚀 Vercel Deployment

This project is configured for static edge deployment on Vercel:
* `vercel.json` provides clean URLs, fallback rewrites, and explicit `Content-Type: text/css` & `application/javascript` headers.
* `package.json` contains `"build": "echo 'Static build ready'"` so Vercel's build pipeline completes with zero configuration.

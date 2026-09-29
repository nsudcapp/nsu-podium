# National Collegiate Innovation & Leadership Summit 2026 (NCILS 2026)
### Premium Institutional & Club Delegation Registration Platform

A production-grade, highly responsive, and accessible event registration platform designed specifically for universities, student clubs, collegiate societies, and institutional delegations.

---

## 🎨 Visual Identity & Design Principles

* **Primary Palette**: Professional deep royal blue (`#1d4ed8`), slate navy (`#0f172a`), subtle ice blue (`#eff6ff`), and neutral stone/slate tones (`#f8fafc`, `#e2e8f0`).
* **Design Philosophy**: Purposefully avoids generic "AI-template" aesthetics (no hyper-saturated neon glows, no excessive glassmorphism, no bloated animations). It feels authentic, trustworthy, and institutional.
* **8px Grid System**: Harmonized spacing tokens (`var(--space-*)`) across all layout sections, cards, and input fields.
* **Typography**: Crisp, readable pairing using `Plus Jakarta Sans` for headers/body and `JetBrains Mono` for official registration reference codes.

---

## 📋 Required Registration Fields & Behavior

| Field Name | Type | Specification & Validation |
| :--- | :--- | :--- |
| **Institution Full Name** | Text | Min 3 characters; sanitizes input; placeholder: `"Enter institution's full name"`. |
| **Club Name** | Text | Min 2 characters; sanitizes input; placeholder: `"Enter club name"`. |
| **Number of Slots** | Stepper / Number | Positive integer between 1 and 25; keyboard filter blocks negative values, decimals, and non-numeric keys; live stepper calculation (`+` / `-`). |
| **Representative's Name** | Text | Min 3 characters; placeholder: `"Enter representative's full name"`. |
| **Representative's Contact Number** | Tel | Validates Bangladeshi phone numbers (`013-019`, `+880`, `01XXXXXXXXX`) and standard international formats; live character sanitization. |

---

## 🚀 Key Features

1. **Centered Premium Registration Card**:
   - Two-column responsive desktop layout collapsing gracefully to a single column on mobile.
   - Consistent 48px input heights with contextual left icons and subtle focus glow.
   - Live remaining slots counter with pulsing indicator.
   - Distinct accessible error announcements with `aria-invalid`, `aria-describedby`, and SVG alert indicators.

2. **Polished Success State**:
   - Zero browser alerts; seamless in-card confirmation state.
   - Unique reference ID generated: `NCILS-2026-XXXXX`.
   - "Copy Reference ID" one-click button with feedback state.
   - Delegation receipt breakdown table (Institution, Club, Rep Name, Phone, Slots, Timestamp).
   - "Print Slip" / "Save PDF" capability via tailored print stylesheets.
   - "Register Another Delegation" button to reset form cleanly.

3. **Self-Service Verification & Lookup**:
   - Institutional attendees or organizers can enter their Reference ID or phone number to retrieve their registration status on demand.

4. **Security & Production Guardrails**:
   - **Anti-Spam Rate Limiting**: Throttles repeated automated submissions.
   - **Duplicate Protection**: Automatically blocks duplicate submissions from the same institution + club or contact phone.
   - **Full Dual-Layer Validation**: Client-side instant feedback paired with server-side validation.
   - **Input Sanitization**: Strips malicious script tags and angle brackets.

5. **Extensibility & Scalability Roadmap**:
   - Pre-wired architecture for multiple events (`EVENT_ID` config).
   - Endpoints for QR code attendee check-in (`POST /api/registration/:refId/check-in`).
   - Admin management endpoint with search, pagination, and status filters (`GET /api/registrations`).

---

## 💻 How to Run

### Option 1: Direct Browser Launch (Zero Dependencies)
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
The application is pre-configured with a client-side storage service (`js/storage.js`) featuring persistent `localStorage` and seed data for immediate testing.

### Option 2: Full Node.js / Express Server
To test the backend API, server-side validation, and security headers:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Access in browser
http://localhost:3000
```

---

## 📁 File Structure

```text
├── index.html            # Semantic, accessible HTML5 single-page structure
├── css/
│   └── styles.css        # Custom design system, CSS variables, responsive breakpoints
├── js/
│   ├── app.js            # Main application controller, UI event handling, stepper
│   ├── validation.js     # FormValidator with Bangladeshi phone regex & ARIA states
│   └── storage.js        # Data service, reference ID generator, duplicate detection
├── server.js             # Production Express API with security headers & rate limiting
├── package.json          # Node.js project manifest & scripts
├── .env.example          # Environment variables template
└── README.md             # Platform documentation & operational manual
```

---

## ♿ Accessibility (a11y) Verification

- WCAG AA compliant contrast ratio (>4.5:1 for body copy and >3:1 for large text).
- Visible keyboard focus rings (`:focus-visible` with 2px royal blue outline and offset).
- Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<form>`, `<footer>`).
- Screen reader announcements for errors and status changes via `role="alert"` and `role="region" aria-live="polite"`.

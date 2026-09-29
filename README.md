# NSU PODIUM

Official event website and registration platform for **NSU PODIUM**, organized by **NSUDC — North South University Debate Club**.

---

## 🎨 Visual Identity & Design

* **Primary Visual Identity**: Strong, polished royal blue theme (`#1d4ed8`) balanced with white cards and dark charcoal typography.
* **Style**: Professional, clean, institutional, and modern university presentation.
* **Layout**: Fully responsive single-page design with navigation, event introduction, information sections, and registration form.
* **Typography**: Paired with `Plus Jakarta Sans` for clean heading/body readability and `JetBrains Mono` for code and reference identifiers.

---

## 📋 Registration Form

The registration form contains exactly the 5 requested fields:

1. **Institution Full Name**
   - Type: Text input
   - Required: Yes
   - Placeholder: `"Enter institution's full name"`
2. **Club Name**
   - Type: Text input
   - Required: Yes
   - Placeholder: `"Enter club name"`
3. **Number of Slots**
   - Type: Number input
   - Required: Yes
   - Validation: Positive whole numbers only
   - Placeholder: `"Enter number of slots"`
4. **Representative’s Name**
   - Type: Text input
   - Required: Yes
   - Placeholder: `"Enter representative's full name"`
5. **Representative’s Contact No.**
   - Type: Telephone input
   - Required: Yes
   - Validation: Valid contact phone format
   - Placeholder: `"Enter contact number"`

### Form Submission & Success State
* Single submission button: **"Submit Registration"**.
* Features inline validation, duplicate prevention, and submission loading indicator.
* On successful submission, the form displays a confirmation state: **"Registration Successful"** with an official reference ID (e.g., `PODIUM-XXXXX`).

---

## 📁 Project Structure

```text
├── index.html            # Main semantic HTML5 webpage
├── css/
│   └── styles.css        # Visual styling and responsive design system
├── js/
│   ├── app.js            # Main UI controller and submission handler
│   ├── validation.js     # Form validation logic for the 5 required fields
│   └── storage.js        # Client-side data management & reference ID generation
├── open-website.bat      # Windows 1-click launcher to open index.html in browser
├── _redirects            # Static hosting redirect configuration
├── vercel.json           # Vercel deployment configuration
├── robots.txt            # Search engine crawler directives
└── package.json          # Project metadata
```

---

## 💻 How to View & Deploy

### Local Viewing
* Double-click `open-website.bat` or open `index.html` directly in any web browser.

### Public Deployment
* **Netlify Drop**: Drag and drop the project folder into [app.netlify.com/drop](https://app.netlify.com/drop) for instant deployment.
* **GitHub Pages**: Push to a GitHub repository and enable GitHub Pages under repository settings.
* **Vercel**: Import the repository or directory for automated static deployment.

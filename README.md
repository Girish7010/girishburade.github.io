“This is the source code for my portfolio — feel free to download it, customize the design, and create your own personalized version.”
## Portfolio Website Template

A simple, responsive portfolio template you can clone and make your own. It is a static site (HTML/CSS/JS) powered by Bootstrap and a few popular UI libraries.

### Features
- **Responsive layout**: Built with Bootstrap
- **Animations**: Animate.css, AOS (on-scroll animations)
- **Components**: Owl Carousel, Lightbox, CounterUp
- **Icons**: Font Awesome, Ionicons, Icomoon, Open Iconic
- **Utilities**: jQuery, Waypoints, Easing, Typed.js

### Quick start
- **Open directly**: Double‑click `index.html` to view in a browser
- **Serve locally** (recommended for correct asset loading):
  - Python: `python3 -m http.server 8080` then open `http://localhost:8080`
  - Node (if you have it): `npx serve .` then open the shown URL

### Project structure
- `index.html` – Main page markup
- `css/` – Compiled styles (including `style.css`)
- `scss/` – Source styles (edit `scss/style.scss` and Bootstrap partials)
- `js/` – Frontend scripts (site logic in `js/main.js`)
- `images/` – Site images
- `lib/` – Third‑party libraries (Bootstrap, jQuery, Owl Carousel, etc.)
- `docs/` – Extra assets (e.g., resume PDF)
- `prepros-6.config` – Optional Prepros config for SCSS compiling
- `girishburade.github.io/` – A copy of the site (you can ignore or deploy this folder separately)

### Customize
1. **Content**: Edit text, sections, and links in `index.html`
2. **Images**: Replace files in `images/` and update paths in `index.html`
3. **Styles**:
   - Quick tweaks: edit `css/style.css`
   - Best practice: edit `scss/style.scss` (or Bootstrap SCSS) and recompile
4. **Behavior**: Adjust interactions in `js/main.js`
5. **Resume**: Replace `docs/Girish_Cv.pdf` and update links if needed

### SCSS compilation
- With Prepros: open the project in Prepros (uses `prepros-6.config`) and let it watch/compile SCSS → CSS
- With Sass CLI: run `sass scss/style.scss css/style.css --no-source-map --style=compressed`

### Deploy
- **GitHub Pages**: push this repository and enable Pages for the `main` branch (or the `girishburade.github.io/` subfolder). Your site will be served at your GitHub Pages URL
- **Any static host**: upload the folder contents to Netlify, Vercel, S3/CloudFront, or any static file server

### Credits
This template bundles widely used open‑source libraries: Bootstrap, jQuery, Animate.css, AOS, Owl Carousel, Lightbox, Waypoints, CounterUp, Easing, Typed.js, Font Awesome, Ionicons, Icomoon, and Open Iconic. Each library retains its own license.

### Notes
- Some image/font files are placeholders; replace them with your own assets
- If you do not use certain libraries, you can remove their CSS/JS to reduce page weight

### License
No explicit license is included in this repository. Use at your own discretion and verify licenses of bundled third‑party libraries before distribution

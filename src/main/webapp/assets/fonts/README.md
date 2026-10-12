# VEIL Typography Assets Guide

## 1. Reference Fonts

VEIL's brand identity specifies two reference display typefaces:

### 1. Bootzy
- **Role**: Expressive display typography, hero headlines, editorial brand statements, oversized compositions.
- **Reference Characterization**: Bold / Gritty.
- **Expected File Locations**:
  - `src/main/webapp/assets/fonts/Bootzy.woff2`
  - `src/main/webapp/assets/fonts/Bootzy.ttf`
- **CSS Family**: `'Bootzy'`

### 2. AQUIRE
- **Role**: Technical identity, brand wordmark, technical headings, incident IDs, metadata chips, uppercase labels, and security-operation annotations.
- **Reference Characterization**: Sharp, Techy, Precise.
- **Expected File Locations**:
  - `src/main/webapp/assets/fonts/AQUIRE.woff2`
  - `src/main/webapp/assets/fonts/AQUIRE.otf`
- **CSS Family**: `'Aquire'`

### 3. Supporting Typeface (Inter)
- **Role**: Long paragraphs, dense tables, form controls, and body text readability.
- **Loaded via**: Standard web fonts with system fallbacks (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

---

## 2. Font Loading & Fallback Strategy

The application CSS (`assets/css/style.css`) defines local `@font-face` declarations for both Bootzy and AQUIRE. When font files are dropped into this directory, they are loaded immediately.

If commercial or proprietary font files are not placed in this folder, the system falls back gracefully to high-precision typographic stacks without layout breakage:
- **Display Fallback**: `'Bootzy', 'Syne', 'Impact', -apple-system, sans-serif`
- **Technical Fallback**: `'Aquire', 'Space Grotesk', 'Orbitron', 'JetBrains Mono', monospace`
- **Body Fallback**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

# Phase 2: Accessibility Fixes - Cursor Agent Instructions

## Current Status
✅ Phase 1 Complete - Performance optimizations applied
🎯 Now: Fix accessibility issues to go from 82 → 95+

---

## Task 2.1: Add Form Labels (HIGH PRIORITY)

**Lighthouse Issue**: "Form elements do not have associated labels"

### Instructions:
1. Find all `<input>`, `<textarea>`, and `<select>` elements
2. Ensure each has a corresponding `<label>` with matching `id` and `for` attributes
3. Add `aria-required="true"` to required fields

### Search for files containing forms:
```bash
# Find files with input elements
grep -r "<input" src/
grep -r "<textarea" src/
grep -r "type=\"email\"" src/
```

### Implementation pattern:
```vue
<!-- BEFORE (incorrect) -->
<input type="email" placeholder="Email">
<input type="text" placeholder="Name">
<textarea placeholder="Message"></textarea>

<!-- AFTER (correct) -->
<div class="form-group">
  <label for="contact-email">Email Address</label>
  <input 
    type="email" 
    id="contact-email" 
    name="email"
    placeholder="your@email.com"
    required
    aria-required="true"
  >
</div>

<div class="form-group">
  <label for="contact-name">Full Name</label>
  <input 
    type="text" 
    id="contact-name" 
    name="name"
    placeholder="John Doe"
    required
    aria-required="true"
  >
</div>

<div class="form-group">
  <label for="contact-message">Message</label>
  <textarea 
    id="contact-message" 
    name="message"
    placeholder="Tell me about your project..."
    rows="5"
    required
    aria-required="true"
  ></textarea>
</div>
```

### Visually hide labels if design requires it:
```css
/* If you need to hide labels visually but keep them for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```vue
<label for="email" class="sr-only">Email Address</label>
<input type="email" id="email" placeholder="Email">
```

---

## Task 2.2: Fix Link Accessibility (HIGH PRIORITY)

**Lighthouse Issue**: "Links do not have a discernible name"

### Instructions:
1. Find all icon-only links (Instagram, GitHub, LinkedIn)
2. Add descriptive `aria-label` attributes
3. Add `aria-hidden="true"` to decorative icons

### Search for problematic links:
```bash
grep -r "instagram" src/
grep -r "linkedin" src/
grep -r "github" src/
```

### Implementation pattern:
```vue
<!-- BEFORE (incorrect) -->
<a href="https://www.instagram.com/jalal.edn/">
  <i class="icon-instagram"></i>
</a>

<!-- AFTER (correct) -->
<a 
  href="https://www.instagram.com/jalal.edn/"
  aria-label="Follow Jalal Eddine on Instagram"
  target="_blank"
  rel="noopener noreferrer"
>
  <i class="icon-instagram" aria-hidden="true"></i>
</a>

<!-- For SVG icons -->
<a 
  href="https://github.com/jalaleddinemaoukil"
  aria-label="View Jalal Eddine's GitHub profile"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg aria-hidden="true">...</svg>
</a>

<!-- For "View Project" links -->
<a href="/works" aria-label="View StringTune project details and case study">
  View Project
</a>
```

### All social links need aria-labels:
- Instagram: "Follow Jalal Eddine on Instagram"
- LinkedIn: "Connect with Jalal Eddine on LinkedIn"
- GitHub: "View Jalal Eddine's GitHub repositories"

---

## Task 2.3: Fix Color Contrast (CRITICAL)

**Lighthouse Issue**: "Background and foreground colors do not have a sufficient contrast ratio"

### Instructions:
1. Use Chrome DevTools to identify failing elements:
   - Open DevTools → Elements
   - Look for contrast ratio warnings
2. Ensure minimum ratios:
   - Normal text: 4.5:1
   - Large text (18pt+): 3:1
   - UI components: 3:1

### Quick test:
```bash
# Run Lighthouse and check "Contrast" section
npx lighthouse http://localhost:4321 --only-categories=accessibility --view
```

### Common fixes needed:

```css
/* Example: Light gray text on white background (FAILS) */
.text-muted {
  color: #d1d5db; /* Too light - 2.1:1 ratio ❌ */
}

/* Fixed version */
.text-muted {
  color: #6b7280; /* Darker - 4.6:1 ratio ✅ */
}

/* Example: Button text */
.btn-secondary {
  background: #e5e7eb; /* Light background */
  color: #9ca3af; /* Light text - FAILS ❌ */
}

/* Fixed version */
.btn-secondary {
  background: #e5e7eb;
  color: #374151; /* Darker text ✅ */
}
```

### Use online tool to verify:
- https://webaim.org/resources/contrastchecker/
- Enter your foreground/background hex colors
- Ensure "WCAG AA" passes

### Find and fix all instances:
```bash
# Search for color values in CSS/Vue files
grep -r "color:" src/
grep -r "text-gray" src/
grep -r "text-slate" src/
```

---

## Task 2.4: Add Focus Indicators (MEDIUM PRIORITY)

**Issue**: Interactive elements need visible focus states for keyboard navigation

### Implementation:
```css
/* Add to your global CSS */

/* Links */
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Buttons */
button:focus,
.btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Form inputs */
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 0;
  border-color: #3b82f6;
}

/* Remove default outline only if custom one is applied */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Task 2.5: Add Skip Link (MEDIUM PRIORITY)

**Issue**: Keyboard users need to skip navigation

### Instructions:
1. Find your main layout file (likely `src/layouts/Layout.astro`)
2. Add skip link at the very start of `<body>`

### Implementation:
```astro
<!-- src/layouts/Layout.astro -->
<body>
  <!-- Skip link (first element in body) -->
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  
  <!-- Navigation -->
  <nav>
    <!-- your nav code -->
  </nav>
  
  <!-- Main content with ID -->
  <main id="main-content">
    <slot />
  </main>
  
  <!-- Footer -->
  <footer>
    <!-- your footer code -->
  </footer>
</body>
```

### Add CSS for skip link:
```css
/* Skip link - only visible when focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
}
```

---

## Task 2.6: Add Alt Text to All Images (CRITICAL)

**Issue**: Images without alt text fail accessibility

### Instructions:
1. Find all `<img>` and `<Image>` components
2. Ensure meaningful alt text (not just filename)

### Pattern:
```astro
<!-- BEFORE -->
<Image src={profile} />
<img src="/logo.png">

<!-- AFTER -->
<Image 
  src={profile} 
  alt="Jalal Eddine Maoukil, Senior Software Engineer, professional headshot"
/>
<img src="/logo.png" alt="Jalal Eddine portfolio logo">

<!-- For decorative images -->
<img src="/decoration.svg" alt="" role="presentation">
```

### Search for images:
```bash
grep -r "<Image" src/
grep -r "<img" src/
grep -r "alt=" src/
```

---

## Verification Checklist

After implementing all tasks, verify:

```bash
# 1. Build succeeds
npm run build

# 2. Run Lighthouse
npx lighthouse http://localhost:4321 --only-categories=accessibility --view

# 3. Manual keyboard test
# - Press Tab key through entire site
# - Ensure all interactive elements are reachable
# - Verify focus indicators are visible

# 4. Screen reader test (optional but recommended)
# - Use NVDA (Windows) or VoiceOver (Mac)
# - Navigate through the site
# - Ensure all content is announced
```

---

## Expected Results

After Phase 2:
- ✅ All form inputs have labels
- ✅ All links have discernible names
- ✅ Color contrast passes WCAG AA
- ✅ Focus indicators visible
- ✅ Skip link implemented
- ✅ All images have alt text

**Accessibility Score**: 82 → 95+

---

## Quick Reference Commands

```bash
# Find forms
grep -r "form" src/ --include="*.vue" --include="*.astro"

# Find links without aria-label
grep -r "<a href" src/ | grep -v "aria-label"

# Find images
grep -r "<img\|<Image" src/

# Test contrast
npx lighthouse http://localhost:4321 --only-categories=accessibility
```

---

## Report Back

After completing Phase 2, run:
```bash
npm run build
npx lighthouse http://localhost:4321 --view
```

Then report:
1. New Accessibility score
2. Remaining issues (if any)
3. Any errors encountered

---

**Estimated time**: 1-2 hours
**Priority**: HIGH (directly impacts user experience)

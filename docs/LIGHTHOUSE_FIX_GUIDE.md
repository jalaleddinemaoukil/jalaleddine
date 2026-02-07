# Lighthouse Performance Optimization Guide
## Portfolio: jalaleddine.vercel.app

---

## 🎯 OBJECTIVE
Improve Lighthouse scores from current baseline to target:
- **Performance**: 65 → 85+ 
- **Accessibility**: 82 → 95+
- **Best Practices**: 92 → 100
- **SEO**: 91 → 100

---

## 📋 IMPLEMENTATION CHECKLIST

### PHASE 1: Performance Optimizations (Critical)

#### Task 1.1: Configure Astro Build Optimizations
**File**: `astro.config.mjs`

**Action**: Update or create the configuration with these optimizations:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    // Inline small stylesheets automatically
    inlineStylesheets: 'auto',
    
    // Enable code splitting for better caching
    splitting: true,
  },
  
  vite: {
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true,
      
      // Minify with terser for better compression
      minify: 'terser',
      
      terserOptions: {
        compress: {
          // Remove console.log in production
          drop_console: true,
          drop_debugger: true,
        },
      },
      
      rollupOptions: {
        output: {
          // Separate vendor chunks for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  },
});
```

**Expected Impact**: Reduces unused JavaScript by ~17KB, improves caching

---

#### Task 1.2: Optimize Image Loading
**Files**: All `.astro` and `.vue` files with images

**Action**: Replace regular `<img>` tags with Astro's optimized Image component

**Before**:
```html
<img src="/_astro/profile.C0f1nYJ5.webp" alt="Profile">
```

**After**:
```astro
---
import { Image } from 'astro:assets';
import profileImage from '../assets/profile.webp';
---

<Image 
  src={profileImage}
  alt="Jalal Eddine Maoukil - Senior Software Engineer"
  width={800}
  height={600}
  format="webp"
  quality={80}
  loading="lazy"
  decoding="async"
/>
```

**For featured work images, use priority loading**:
```astro
<Image 
  src={heroImage}
  alt="..."
  loading="eager"
  fetchpriority="high"
/>
```

**Expected Impact**: Proper aspect ratios, automatic optimization, lazy loading

---

#### Task 1.3: Optimize Background Video
**File**: Where `website-bg.B8YgNB4L.webm` is used

**Action**: Add lazy loading and poster image

**Before**:
```html
<video autoplay muted loop playsinline>
  <source src="/_astro/website-bg.B8YgNB4L.webm" type="video/webm">
</video>
```

**After**:
```html
<video 
  autoplay 
  muted 
  loop 
  playsinline
  loading="lazy"
  poster="/video-poster.jpg"
  preload="metadata"
>
  <source src="/_astro/website-bg.B8YgNB4L.webm" type="video/webm">
  Your browser does not support the video tag.
</video>
```

**Additional Task**: Compress the video file
- Use FFmpeg or online tool to reduce file size
- Target: < 1MB for background videos
- Command: `ffmpeg -i input.webm -c:v libvpx-vp9 -b:v 500k -crf 30 output.webm`

**Expected Impact**: Faster initial load, reduced LCP

---

#### Task 1.4: Implement Critical CSS Strategy
**File**: Main layout file (likely `src/layouts/Layout.astro`)

**Action**: Separate critical and non-critical CSS

**Add to `<head>`**:
```astro
---
// src/layouts/Layout.astro
---
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Inline critical CSS -->
  <style is:inline>
    /* Add minimal styles needed for above-the-fold content */
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    .hero { min-height: 100vh; }
    /* Add other critical styles */
  </style>
  
  <!-- Defer non-critical CSS -->
  <link 
    rel="stylesheet" 
    href="/styles/non-critical.css" 
    media="print" 
    onload="this.media='all'"
  >
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Preload critical assets -->
  <link rel="preload" as="image" href="/profile.webp">
</head>
```

**Expected Impact**: Eliminates 160ms render-blocking delay

---

#### Task 1.5: Remove Unused CSS
**Action**: Audit and remove unused Tailwind classes or CSS rules

**If using Tailwind**, update `tailwind.config.cjs`:
```javascript
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**If using custom CSS**: 
- Use Chrome DevTools Coverage tool to identify unused CSS
- Remove or defer unused styles
- Consider using PurgeCSS

**Expected Impact**: Reduces unused CSS by ~16.5KB

---

### PHASE 2: Accessibility Fixes (Critical)

#### Task 2.1: Add Form Labels
**Files**: All forms (likely in contact section)

**Action**: Ensure all form inputs have associated labels

**Before**:
```vue
<input type="email" placeholder="Email">
<input type="text" placeholder="Name">
<textarea placeholder="Message"></textarea>
```

**After**:
```vue
<div class="form-group">
  <label for="email">Email Address</label>
  <input 
    type="email" 
    id="email" 
    name="email"
    placeholder="your@email.com"
    required
    aria-required="true"
  >
</div>

<div class="form-group">
  <label for="name">Full Name</label>
  <input 
    type="text" 
    id="name" 
    name="name"
    placeholder="John Doe"
    required
    aria-required="true"
  >
</div>

<div class="form-group">
  <label for="message">Message</label>
  <textarea 
    id="message" 
    name="message"
    placeholder="Tell me about your project..."
    required
    aria-required="true"
  ></textarea>
</div>
```

**Expected Impact**: Fixes form accessibility issues

---

#### Task 2.2: Fix Link Accessibility
**Files**: All navigation and social links

**Action**: Add descriptive aria-labels to icon-only links

**Before**:
```vue
<a href="https://www.instagram.com/jalal.edn/">
  <i class="icon-instagram"></i>
</a>
<a href="https://github.com/jalaleddinemaoukil">
  <i class="icon-github"></i>
</a>
```

**After**:
```vue
<a 
  href="https://www.instagram.com/jalal.edn/"
  aria-label="Follow me on Instagram"
  target="_blank"
  rel="noopener noreferrer"
>
  <i class="icon-instagram" aria-hidden="true"></i>
</a>

<a 
  href="https://github.com/jalaleddinemaoukil"
  aria-label="View my GitHub profile"
  target="_blank"
  rel="noopener noreferrer"
>
  <i class="icon-github" aria-hidden="true"></i>
</a>
```

**For "View Project" links**:
```vue
<a href="/works" aria-label="View StringTune project details">
  View Project
</a>
```

**Expected Impact**: All links will have discernible names

---

#### Task 2.3: Fix Color Contrast Issues
**Files**: Global CSS files

**Action**: Ensure text meets WCAG AA standards (4.5:1 ratio)

**Check current colors**:
- Use browser DevTools to inspect failing elements
- Use online contrast checker: https://webaim.org/resources/contrastchecker/

**Common fixes**:
```css
/* If text is too light on background */
.text-gray-400 {
  color: #9ca3af; /* Old - likely fails */
  color: #6b7280; /* New - darker, better contrast */
}

/* Ensure interactive elements have sufficient contrast */
button, a {
  /* Minimum 3:1 for large text, 4.5:1 for normal */
}

/* Add focus indicators */
a:focus, button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

**Expected Impact**: Passes all color contrast audits

---

#### Task 2.4: Add Skip Links
**File**: Main layout file

**Action**: Add skip navigation for keyboard users

**Add at top of `<body>`**:
```astro
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>
  
  <nav><!-- navigation --></nav>
  
  <main id="main-content">
    <!-- content -->
  </main>
</body>
```

**Add CSS**:
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Expected Impact**: Better keyboard navigation

---

### PHASE 3: Best Practices Fixes

#### Task 3.1: Fix Console Errors
**Action**: Open browser DevTools Console and fix all 5 errors

**Common issues to check**:
1. Missing image files
2. Failed network requests
3. Vue component errors
4. Module import errors
5. Script loading errors

**Debugging process**:
```bash
# Run dev server and check console
npm run dev

# Check for:
# - 404 errors (missing files)
# - CORS errors (external resources)
# - JavaScript errors (syntax, undefined variables)
# - Vue warnings (component issues)
```

**Expected Impact**: Clean console, better performance

---

#### Task 3.2: Add Image Dimensions
**Files**: All images without explicit width/height

**Action**: Prevent layout shift by specifying dimensions

**Before**:
```html
<img src="/image.jpg" alt="...">
```

**After**:
```astro
<Image 
  src={image}
  alt="..."
  width={1200}
  height={800}
  class="responsive-img"
/>
```

**Add CSS**:
```css
.responsive-img {
  width: 100%;
  height: auto;
}
```

**Expected Impact**: Fixes aspect ratio warnings, reduces CLS

---

### PHASE 4: SEO Improvements

#### Task 4.1: Fix Non-Crawlable Links
**Files**: All files with navigation/buttons

**Action**: Replace clickable divs with proper links

**Before**:
```vue
<div @click="navigateToWorks()" class="project-link">
  View Project
</div>

<button @click="$router.push('/works')">
  View All Work
</button>
```

**After**:
```vue
<a href="/works" class="project-link">
  View Project
</a>

<a href="/works" class="button">
  View All Work
</a>
```

**For SPA-style navigation with Vue Router**:
```vue
<router-link to="/works" class="project-link">
  View Project
</router-link>
```

**Expected Impact**: All links crawlable by search engines

---

#### Task 4.2: Add Structured Data
**File**: Main layout head

**Action**: Add JSON-LD schema for better SEO

**Add to `<head>`**:
```astro
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jalal Eddine Maoukil",
  "jobTitle": "Senior Software Engineer & Web Designer",
  "url": "https://jalaleddine.vercel.app",
  "sameAs": [
    "https://github.com/jalaleddinemaoukil",
    "https://www.linkedin.com/in/jalal-eddine-maoukil/",
    "https://www.instagram.com/jalal.edn/"
  ]
}
</script>
```

**Expected Impact**: Better search engine understanding

---

### PHASE 5: Advanced Performance

#### Task 5.1: Implement Resource Hints
**File**: Main layout head

**Action**: Add preload, prefetch, and preconnect

```astro
<head>
  <!-- Preload critical assets -->
  <link rel="preload" as="image" href="/profile.webp">
  <link rel="preload" as="font" href="/fonts/main.woff2" type="font/woff2" crossorigin>
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://www.google-analytics.com">
  
  <!-- DNS prefetch for third-party resources -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
</head>
```

---

#### Task 5.2: Add Service Worker for Caching
**File**: `public/sw.js` (create new)

**Action**: Cache static assets

```javascript
const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/profile.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**Register in layout**:
```astro
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

### PHASE 6: Testing & Validation

#### Task 6.1: Run Lighthouse Again
**Action**: Test after each phase

```bash
# Option 1: Chrome DevTools
# Open DevTools → Lighthouse → Generate Report

# Option 2: CLI
npx lighthouse https://jalaleddine.vercel.app --view

# Option 3: CI/CD
npm install -D @lhci/cli
```

---

#### Task 6.2: Accessibility Testing
**Tools to use**:
1. **axe DevTools** (Browser extension)
2. **WAVE** (https://wave.webaim.org/)
3. **Lighthouse**
4. **Screen reader testing** (NVDA/JAWS/VoiceOver)

**Manual checks**:
- Tab through entire site (keyboard navigation)
- Test with screen reader
- Check color contrast
- Verify all images have alt text

---

## 📊 EXPECTED RESULTS

After implementing all phases:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Performance | 65 | 85+ | +20 |
| Accessibility | 82 | 95+ | +13 |
| Best Practices | 92 | 100 | +8 |
| SEO | 91 | 100 | +9 |

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All console errors resolved
- [ ] Lighthouse score > 90 on all metrics
- [ ] Tested on mobile devices
- [ ] Tested with slow 3G throttling
- [ ] All images optimized (< 200KB each)
- [ ] Video compressed (< 1MB)
- [ ] Accessibility tested with screen reader
- [ ] Forms tested and working
- [ ] All links functional
- [ ] Meta tags updated
- [ ] Sitemap generated
- [ ] robots.txt configured

---

## 🔧 QUICK COMMANDS

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Lighthouse
npx lighthouse http://localhost:4321 --view

# Check bundle size
npm run build && npx vite-bundle-visualizer
```

---

## 📚 RESOURCES

- [Astro Images Documentation](https://docs.astro.build/en/guides/images/)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Scoring Guide](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/)

---

## ⚠️ CRITICAL NOTES FOR CURSOR AGENT

1. **Preserve existing functionality** - Don't break working features
2. **Test after each change** - Verify nothing breaks
3. **Backup before major changes** - Commit to git frequently
4. **Mobile-first approach** - Test on mobile viewports
5. **Maintain design** - Keep visual design intact

---

## 🎯 PRIORITY ORDER

1. **Phase 1 (Performance)** - Biggest score impact
2. **Phase 2 (Accessibility)** - User experience critical
3. **Phase 3 (Best Practices)** - Quick wins
4. **Phase 4 (SEO)** - Long-term benefit
5. **Phase 5 (Advanced)** - Optional enhancements

---

## ✅ VERIFICATION STEPS

After each task:
1. Run `npm run build`
2. Run `npm run preview`
3. Open Chrome DevTools → Lighthouse
4. Generate new report
5. Compare scores
6. Fix any new issues
7. Commit changes

---

## 🐛 TROUBLESHOOTING

### If build fails:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### If images don't load:
- Check file paths are correct
- Verify images are in `/src/assets` or `/public`
- Check import statements

### If CSS issues occur:
- Clear browser cache
- Check PostCSS configuration
- Verify Tailwind config (if used)

---

**END OF GUIDE**

Implementation estimate: 4-6 hours
Expected score improvement: +30 points overall

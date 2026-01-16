# HEARTH Broken Links Report

**Date**: 2026-01-16
**Branch**: main
**Checked by**: Automated link checker

## Summary

✅ **Status**: All critical links working
⚠️ **Fixed Issues**: 1 broken internal link

---

## Internal Links ✅

### HTML Files
- ✅ `index.html` → `submit.html` (Submit a Hunt button)
- ✅ `submit.html` → `index.html` (View Hunts button)
- ✅ `index.html` → `index.html` (Logo link - FIXED from broken `index-new.html`)

### Assets
- ✅ `/Assets/HEARTH-logo.png` - Exists in both root and public/ (490 KB)
- ✅ `/public/Assets/HEARTH-logo.png` - Copied for Vite builds

### Module Scripts
- ✅ `/src/main.ts` - Main TypeScript entry point
- ✅ `/src/submit.ts` - Submit page entry point

---

## External Links ✅

### GitHub Links
- ✅ `https://github.com/THORCollective/HEARTH` (HTTP 200)
- ✅ `https://github.com/THORCollective/HEARTH/issues/new?template=cti_submission.yml` (HTTP 302 - redirects to GitHub)
- ✅ `https://github.com/THORCollective/HEARTH/issues/new?template=hunt_template.yaml` (HTTP 302 - redirects to GitHub)

### Issue Templates Verified
- ✅ `.github/ISSUE_TEMPLATE/cti_submission.yml` - Exists
- ✅ `.github/ISSUE_TEMPLATE/hunt_template.yaml` - Exists
- ✅ `.github/ISSUE_TEMPLATE/forge_template.yaml` - Exists
- ✅ `.github/ISSUE_TEMPLATE/general_issue_template.yaml` - Exists
- ✅ `.github/ISSUE_TEMPLATE/manual_submission.yml` - Exists

### CDN/External Scripts
- ✅ `https://www.googletagmanager.com/gtag/js?id=G-B4FE1Q174V` (HTTP 200) - Google Analytics

---

## Fixed Issues ✅

### 1. Broken Logo Link (index.html:19)
**Issue**: Logo linked to non-existent `index-new.html`
```html
<!-- BEFORE (BROKEN) -->
<a href="index-new.html" class="logo-link">

<!-- AFTER (FIXED) -->
<a href="index.html" class="logo-link">
```
**Status**: ✅ FIXED

---

## Recommendations

### Optional Improvements
1. **Logo link behavior**: Consider changing `href="index.html"` to `href="/"` for cleaner URLs
2. **Add 404 page**: Create custom 404.html for GitHub Pages
3. **Link checker CI**: Add automated link checking to GitHub Actions
4. **External link monitoring**: Monitor GitHub and analytics endpoints for uptime

---

## Test Commands

To verify links manually:

```bash
# Check internal links
ls -la public/Assets/HEARTH-logo.png
ls -la src/main.ts src/submit.ts

# Check external links
curl -I https://github.com/THORCollective/HEARTH
curl -I https://www.googletagmanager.com/gtag/js?id=G-B4FE1Q174V

# Check GitHub templates
ls -la .github/ISSUE_TEMPLATE/
```

---

**Conclusion**: All links are now working correctly. One broken internal link was identified and fixed.

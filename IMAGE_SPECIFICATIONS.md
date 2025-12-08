# Image Specifications & Upload Guidelines

## 📸 Image Dimensions & Requirements

### 1. **Dashboard/Banner Images** 🎯

#### Recommended Dimensions:
- **Primary:** 1920×1080px (16:9 aspect ratio) ✅
- **Alternative 1:** 1600×900px (16:9)
- **Alternative 2:** 1280×720px (16:9)

#### Aspect Ratio: **16:9** (Width:Height)
This is the MOST IMPORTANT - maintain this ratio!

#### File Requirements:
- **Max File Size:** 1 MB (1024 KB)
- **Formats:** JPEG, PNG, WebP (JPEG recommended for photos)
- **Quality:** 80-90% for optimal file size

#### Best Practices:
✅ Use 16:9 ratio - CRITICAL for no cropping
✅ Center important content (text, logos) in the middle 60% of the image
✅ Avoid important details at edges
✅ Test on both mobile and desktop before uploading
✅ Use landscape orientation always

#### Why 16:9?
- Matches most modern displays (phones, tablets, desktops)
- No cropping on any device
- Same view everywhere
- Professional look

---

### 2. **Product Images** 🛍️

#### Recommended Dimensions:
- **Primary:** 800×600px (4:3 aspect ratio) ✅
- **Alternative 1:** 1200×900px (4:3)
- **Alternative 2:** 1600×1200px (4:3)

#### Aspect Ratio: **4:3** (Width:Height)
This ratio works best for product displays!

#### File Requirements:
- **Max File Size:** 500 KB per image
- **Formats:** JPEG, PNG, WebP
- **Quality:** 85-90%

#### Best Practices:
✅ Use 4:3 aspect ratio for consistency
✅ White or light gray background recommended
✅ Product should fill 70-80% of frame
✅ Center the product
✅ Good lighting - no shadows
✅ Multiple angles (front, side, back, detail shots)

#### Multiple Product Images:
- Upload 3-5 images per product
- All should maintain 4:3 ratio
- First image is the main display image
- Show different angles/uses

---

## 🎨 Image Preparation Tips

### Tools You Can Use:
1. **Free Online:** 
   - Canva.com (resize feature)
   - Pixlr.com
   - ResizeImage.net

2. **Desktop:**
   - GIMP (free)
   - Adobe Photoshop
   - Paint.NET (Windows)

3. **Mobile:**
   - Snapseed
   - Adobe Lightroom Mobile

### Quick Resize Guide:

#### For Dashboard Images (16:9):
1. Open image in editing tool
2. Set canvas/crop to 16:9 ratio
3. Options: 1920×1080, 1600×900, or 1280×720
4. Export as JPEG, quality 80-85%
5. Check file size < 1 MB

#### For Product Images (4:3):
1. Open image in editing tool
2. Set canvas/crop to 4:3 ratio
3. Options: 800×600, 1200×900, or 1600×1200
4. Add white/gray background if needed
5. Export as JPEG, quality 85-90%
6. Check file size < 500 KB

---

## ✅ Quality Checklist

### Before Uploading Dashboard Images:
- [ ] Aspect ratio is 16:9
- [ ] Resolution is at least 1280×720px
- [ ] File size is under 1 MB
- [ ] Image is clear and sharp
- [ ] Important content is centered
- [ ] Tested preview on mobile & desktop

### Before Uploading Product Images:
- [ ] Aspect ratio is 4:3
- [ ] Resolution is at least 800×600px
- [ ] File size is under 500 KB
- [ ] Product is centered and well-lit
- [ ] Background is clean
- [ ] Multiple angles captured
- [ ] All images have same ratio

---

## 🚫 Common Mistakes to Avoid

### Dashboard Images:
❌ Using portrait orientation
❌ Using random aspect ratios (square, 4:3, etc.)
❌ File size over 1 MB
❌ Low resolution (less than 1280×720)
❌ Important text/logos at edges

### Product Images:
❌ Different aspect ratios for different products
❌ Dark or cluttered backgrounds
❌ Product too small in frame
❌ Blurry or low-resolution images
❌ Inconsistent lighting across images

---

## 📐 Technical Details

### Display Behavior:

#### Dashboard Images:
- **Desktop:** Full width, 16:9 container
- **Tablet:** Full width, 16:9 container
- **Mobile:** Full width, 16:9 container
- **Method:** `object-contain` - shows full image without cropping

#### Product Images:
- **Grid View:** Square cards with 4:3 images inside
- **List View:** Smaller thumbnails, 4:3 ratio
- **Product Detail:** Larger display, 4:3 ratio
- **Method:** `object-contain` with padding - no cropping

---

## 💡 Pro Tips

1. **Batch Processing:**
   - Use tools like IrfanView (Windows) or ImageMagick for bulk resizing
   - Maintain consistent naming (product-name-front.jpg, etc.)

2. **Optimization:**
   - Use TinyPNG.com or Squoosh.app to compress without quality loss
   - JPEG for photos, PNG for graphics with transparency

3. **Consistency:**
   - Keep same background color for all product images
   - Use same lighting setup
   - Maintain same distance/framing

4. **Mobile First:**
   - Always check how images look on mobile devices
   - Text should be readable even on small screens

---

## 📱 Responsive Display Info

### Dashboard Images Display:
- **Desktop (>1024px):** Max width 1200px, centered
- **Tablet (768-1023px):** Full width minus padding
- **Mobile (<768px):** Full width
- **All maintain:** 16:9 ratio, no cropping

### Product Images Display:
- **Grid View Desktop:** 4 columns
- **Grid View Tablet:** 3 columns
- **Grid View Mobile:** 2 columns
- **All maintain:** 4:3 ratio, no cropping

---

## 🔧 Implementation Details

### CSS Properties Used:
```css
/* Dashboard Images */
aspect-ratio: 16/9;
object-fit: contain;
background: gray-50;

/* Product Images */
aspect-ratio: 4/3;
object-fit: contain;
padding: 0.5rem;
background: gray-50;
```

### Why These Work:
- `aspect-ratio`: Forces container to maintain ratio
- `object-fit: contain`: Shows full image without cropping
- `background`: Fills empty space if image doesn't match exactly
- `padding`: Adds breathing room for product images

---

## 📞 Need Help?

If images aren't displaying correctly:
1. Verify aspect ratio (16:9 for dashboard, 4:3 for products)
2. Check file size limits
3. Ensure file format is supported
4. Clear browser cache and reload
5. Contact support with image details

---

**Last Updated:** 2025
**Version:** 1.0


# Deployment Guide - Virtual Try-On MVP

## 1. Netlify Deployment

### Prerequisites
- GitHub repository with your code
- Netlify account
- Google Gemini API key

### Steps

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Virtual Try-On MVP"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

3. **Set Environment Variables:**
   - In your Netlify dashboard, go to Site settings > Environment variables
   - Add: `GOOGLE_GEMINI_API_KEY` = `your_actual_api_key`

4. **Custom Domain (Optional):**
   - Go to Domain management in Netlify
   - Add your custom domain
   - Configure DNS records as instructed

## 2. Shopify Theme App Extension

### Option A: Shopify App (Recommended)

1. **Create Shopify App:**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   shopify app init
   ```

2. **Add Theme Extension:**
   ```bash
   shopify app generate extension --template theme-app-extension
   ```

3. **Integrate Virtual Try-On:**
   - Copy the widget code from `shopify-widget-example.html`
   - Update the API endpoint to point to your Netlify deployment
   - Add the widget to your Shopify theme

### Option B: Direct Theme Integration

1. **Add to Shopify Theme:**
   - Go to your Shopify admin > Online Store > Themes
   - Click "Actions" > "Edit code"
   - Create a new section file: `sections/virtual-try-on.liquid`

2. **Section Content:**
   ```liquid
   {% comment %}
     Virtual Try-On Section
     Usage: {% section 'virtual-try-on' %}
   {% endcomment %}
   
   <div class="virtual-try-on-section">
     <div class="page-width">
       <div class="section-header text-center">
         <h2>{{ section.settings.title | default: 'Virtual Try-On' }}</h2>
         <p>{{ section.settings.subtitle | default: 'Isprobajte odeću na sebi koristeći AI tehnologiju' }}</p>
       </div>
       
       <div id="virtual-try-on-widget" 
            data-api-endpoint="{{ section.settings.api_endpoint | default: 'https://your-app.netlify.app/api/virtual-try-on' }}">
       </div>
     </div>
   </div>
   
   <script>
     // Load Virtual Try-On widget
     (function() {
       const widget = document.getElementById('virtual-try-on-widget');
       const apiEndpoint = widget.dataset.apiEndpoint;
       
       // Load widget HTML and CSS
       fetch('https://your-app.netlify.app/shopify-widget-example.html')
         .then(response => response.text())
         .then(html => {
           // Extract and inject the widget
           const parser = new DOMParser();
           const doc = parser.parseFromString(html, 'text/html');
           const widgetContent = doc.querySelector('.virtual-try-on-widget');
           
           if (widgetContent) {
             widget.innerHTML = widgetContent.outerHTML;
             
             // Update API endpoint
             const generateBtn = widget.querySelector('#generateBtn');
             if (generateBtn) {
               generateBtn.onclick = function() {
                 generateVirtualTryOn(apiEndpoint);
               };
             }
           }
         });
     })();
     
     async function generateVirtualTryOn(apiEndpoint) {
       // Implementation similar to shopify-widget-example.html
       // but using the dynamic apiEndpoint
     }
   </script>
   
   {% schema %}
   {
     "name": "Virtual Try-On",
     "settings": [
       {
         "type": "text",
         "id": "title",
         "label": "Section Title",
         "default": "Virtual Try-On"
       },
       {
         "type": "text",
         "id": "subtitle",
         "label": "Section Subtitle",
         "default": "Isprobajte odeću na sebi koristeći AI tehnologiju"
       },
       {
         "type": "url",
         "id": "api_endpoint",
         "label": "API Endpoint",
         "info": "URL to your Virtual Try-On API"
       }
     ],
     "presets": [
       {
         "name": "Virtual Try-On"
       }
     ]
   }
   {% endschema %}
   ```

3. **Add to Product Page:**
   - In your product template, add: `{% section 'virtual-try-on' %}`
   - Or use the section in the theme customizer

## 3. Environment Configuration

### Development (.env.local)
```env
GOOGLE_GEMINI_API_KEY=your_development_api_key
```

### Production (Netlify)
- Set in Netlify dashboard: Site settings > Environment variables
- Key: `GOOGLE_GEMINI_API_KEY`
- Value: `your_production_api_key`

### Shopify App (if using Shopify CLI)
```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=write_products,write_themes
```

## 4. Testing

### Local Testing
```bash
npm run dev
# Open http://localhost:3000
```

### Production Testing
1. Deploy to Netlify
2. Test the API endpoint: `POST /api/virtual-try-on`
3. Test the widget in Shopify theme

### API Testing
```bash
# Test with curl
curl -X POST \
  -F "userPhoto=@/path/to/user-photo.jpg" \
  -F "clothingPhoto=@/path/to/clothing-photo.jpg" \
  https://your-app.netlify.app/api/virtual-try-on \
  -o result.png
```

## 5. Monitoring & Analytics

### Netlify Analytics
- View site analytics in Netlify dashboard
- Monitor API usage and performance

### Error Tracking
- Check Netlify function logs
- Monitor API response times
- Track Gemini API usage

## 6. Security Considerations

### API Key Security
- ✅ API key stored in environment variables
- ✅ Never exposed in frontend code
- ✅ Different keys for dev/prod

### CORS Configuration
- Configure CORS in `next.config.ts` if needed
- Restrict origins to your Shopify domain

### Rate Limiting
- Consider implementing rate limiting
- Monitor API usage to prevent abuse

## 7. Performance Optimization

### Image Optimization
- Compress uploaded images before sending to Gemini
- Implement client-side image resizing
- Use WebP format when possible

### Caching
- API responses include Cache-Control headers
- Consider implementing Redis for session caching
- Use CDN for static assets

## 8. Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   npm run build:clean
   npm run type-check
   ```

2. **API Errors:**
   - Check Gemini API key validity
   - Verify image format and size
   - Check Netlify function logs

3. **CORS Issues:**
   - Update `next.config.ts` with CORS headers
   - Verify domain origins

4. **Shopify Integration:**
   - Check browser console for errors
   - Verify API endpoint URL
   - Test widget in isolation

### Support Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Shopify Theme Development](https://shopify.dev/docs/themes)

## 9. Next Steps

### Enhancements
- Add user authentication
- Implement image history
- Add social sharing
- Integrate with Shopify cart
- Add analytics tracking

### Scaling
- Implement queue system for image generation
- Add multiple AI model support
- Implement A/B testing
- Add performance monitoring

### Monetization
- Freemium model with API limits
- Shopify app marketplace
- Enterprise features
- White-label solutions

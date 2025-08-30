# 🎯 Virtual Try-On MVP

**AI-powered virtual try-on application using Google Gemini 2.5 image-to-image for Shopify integration.**

## 🚀 Features

- **Virtual Try-On**: Upload user photo + clothing item → AI generates realistic try-on image
- **Google Gemini 2.5**: Uses `gemini-2.5-flash-image-preview` model for high-quality results
- **Shopify Ready**: Designed as a widget for Shopify Theme App Extensions
- **Dual API Support**: Google Vertex AI (service account) + Google Generative AI (fallback)
- **Real-time Processing**: Generates photorealistic PNG images in ~8 seconds

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js 20+
- **AI Models**: Google Gemini 2.5 Flash Image
- **APIs**: Google Vertex AI, Google Generative AI
- **Deployment**: Netlify-ready

## 📁 Project Structure

```
virtual-try-on/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── virtual-try-on/route.ts    # Main try-on endpoint
│   │   │   ├── ping/route.ts              # Auth test endpoint
│   │   │   └── virtual-try-on/test/route.ts # Test PNG endpoint
│   │   ├── lib/
│   │   │   └── b64.ts                     # Base64 helper
│   │   └── page.tsx                       # Main page
│   └── components/
│       └── VirtualTryOn.tsx               # Main component
├── assets/                                # Test images
├── .env.local                             # Environment variables
└── package.json
```

## 🔑 Environment Variables

Create `.env.local` with:

```bash
# Google Vertex AI (Primary)
GOOGLE_APPLICATION_CREDENTIALS=./keys/service-account.json
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=global
TRYON_MODEL=gemini-2.5-flash-image-preview

# Google Generative AI (Fallback)
GEMINI_API_KEY=your-api-key
USE_GEMINI_API=true
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/api/virtual-try-on \
     -F "userPhoto=@assets/user-photo.png" \
     -F "clothingPhoto=@assets/clothing-item.png" \
     -o result.png
   ```

## 📡 API Endpoints

### POST `/api/virtual-try-on`
Main virtual try-on endpoint.

**Input:**
- `userPhoto` (required): User's photo
- `clothingPhoto` (optional): Clothing item photo

**Output:**
- PNG image (success)
- JSON error message (failure)

### GET `/api/ping`
Authentication test endpoint.

### GET `/api/virtual-try-on/test`
Returns test PNG for routing verification.

## 🎨 Frontend Component

The `VirtualTryOn` component provides:
- Image upload with preview
- Real-time API calls
- Result display
- Error handling
- Download functionality

## 🔧 Configuration

### Model Selection
- **Primary**: Google Vertex AI with service account
- **Fallback**: Google Generative AI with API key
- **Model**: `gemini-2.5-flash-image-preview`

### Prompt Engineering
Current working prompt:
```
"Put the clothing from the second image onto the person in the first image. Make it look realistic and natural."
```

## 🚀 Deployment

### Netlify
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables for Production
- `GOOGLE_PROJECT_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_LOCATION`
- `TRYON_MODEL`
- `GEMINI_API_KEY`
- `USE_GEMINI_API`

## 📊 Performance

- **Generation Time**: ~8 seconds
- **Image Quality**: High-resolution PNG
- **API Response**: Binary image or JSON error
- **Fallback Support**: Automatic API switching

## 🔒 Security

- Service account credentials stored server-side only
- Environment variables for sensitive data
- No API keys exposed in frontend
- Input validation and sanitization

## 🧪 Testing

Test with provided sample images in `assets/` folder:
- `deovjka 1.png` - User photo
- `tia.png` - Clothing item
- `zenskamajica.jpg` - Alternative clothing

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ using Next.js and Google Gemini AI**

# 🛍️ Virtual Try-On Widget - Shopify Theme App Extension

**Shopify Theme App Extension za Virtual Try-On funkcionalnost na product stranicama.**

## 🎯 Funkcionalnosti

- **Virtual Try-On Widget**: Dodaje se na Product template kao blok
- **Modal sa iframe**: Prikazuje Netlify aplikaciju u modalnom prozoru
- **Product info prosleđivanje**: Automatski prosleđuje informacije o proizvodu
- **PostMessage komunikacija**: Sluša rezultate iz iframe-a
- **Order button**: Aktivira se kada je virtual try-on završen
- **Customizacija**: Sve se podešava kroz Theme customizer

## 🚀 Instalacija

### 1. Dodaj extension u postojeći Shopify app

```bash
# U Shopify app repozitorijumu
shopify app generate extension --template theme-app-extension
```

### 2. Kopiraj fajlove

Kopiraj sve fajlove iz `shopify-extension/` foldera u novi extension folder.

### 3. Deploy extension

```bash
shopify app deploy
```

## 📱 Korišćenje

### 1. Dodaj blok u Theme customizer

1. Idite na **Online Store > Themes**
2. Kliknite **Customize** na aktivnom theme-u
3. Idite na **Product template**
4. Kliknite **Add block**
5. Dodajte **Virtual Try-On Widget**

### 2. Podesite widget

- **Button Settings**: Tekst, stil, boje, border radius
- **Product Card**: Prikaz mini kartice proizvoda
- **Modal Settings**: Naslov, boje, border radius
- **Layout**: Poravnanje, margine
- **Advanced**: Compact mode, animacije, zatvaranje

## 🔧 Tehnikalije

### PostMessage komunikacija

Extension očekuje poruku iz iframe-a:

```javascript
// Kada je virtual try-on završen
window.parent.postMessage({
  type: 'vto:result',
  ready: true
}, '*');
```

### Product info prosleđivanje

Iframe prima query parametre:

```
https://gpt-virtual-tryon-tia.netlify.app?
  mode=compact&
  source=shopify&
  productId={{ product.id }}&
  variantId={{ product.selected_or_first_available_variant.id }}&
  handle={{ product.handle }}&
  title={{ product.title }}&
  price={{ product.selected_or_first_available_variant.price }}&
  image={{ product.featured_image }}
```

### Order button funkcionalnost

Kada se aktivira "Poruči" dugme:

1. **Opcija 1** (trenutno): Navigacija na product page sa variant ID-jem
2. **Opcija 2** (zakomentarisano): AJAX add-to-cart

## 🎨 Customizacija

### CSS varijable

```css
:root {
  --vto-primary-color: #007cba;
  --vto-secondary-color: #6c757d;
  --vto-success-color: #28a745;
  --vto-border-radius: 6px;
  --vto-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --vto-transition: all 0.3s ease;
}
```

### Theme customizer opcije

- **Button**: Tekst, stil, boje, border radius
- **Product Card**: Prikaz, boje, border radius
- **Modal**: Naslov, boje, border radius
- **Layout**: Poravnanje, margine
- **Advanced**: Compact mode, animacije

## 📱 Responsive Design

- **Desktop**: Full modal (900px max-width)
- **Tablet**: Srednji modal
- **Mobile**: Compact modal sa optimizovanim UI

## 🔒 Sigurnost

- **Origin checking**: PostMessage samo od Netlify aplikacije
- **XSS protection**: Escape-ovanje product data
- **CSP compatible**: Bez inline scripts

## 🧪 Testiranje

### 1. Lokalno testiranje

```bash
shopify app serve
```

### 2. Production testiranje

1. Deploy extension
2. Dodaj blok u theme
3. Testiraj na product stranici
4. Proveri PostMessage komunikaciju

## 📋 Checklist za deployment

- [ ] Extension je deploy-ovan
- [ ] Blok je dodat u theme
- [ ] PostMessage komunikacija radi
- [ ] Order button se aktivira
- [ ] Responsive design radi
- [ ] Customizacija radi u Theme customizer-u

## 🆘 Troubleshooting

### Problem: PostMessage se ne prima

**Rešenje**: Proveri da li Netlify aplikacija šalje poruku sa `type: 'vto:result'`

### Problem: Modal se ne otvara

**Rešenje**: Proveri da li su CSS fajlovi učitani

### Problem: Product info se ne prikazuje

**Rešenje**: Proveri da li su Liquid varijable ispravne

## 📞 Podrška

Za pitanja i podršku, otvorite issue u GitHub repozitorijumu.

---

**Built with ❤️ for Shopify merchants**

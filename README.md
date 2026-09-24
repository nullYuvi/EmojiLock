# 🔐 EmojiLock

> **"Hide a secret in plain sight."**

**EmojiLock** is a production-grade, 100% client-side privacy web application that encrypts sensitive text messages into innocuous strings of emojis. Encrypted emoji strings can be shared across WhatsApp, Instagram, Telegram, Discord, Signal, SMS, or any messaging platform. Recipients paste the emojis into EmojiLock to decrypt and recover the original plaintext message.

---

## 🌟 Key Highlights

- **🔒 Emoji-Based Encrypted Messaging**: Transforms sensitive text into clean, shareable emoji strings that blend in with everyday digital conversations.
- **🛡️ 100% Client-Side Architecture**: All cryptographic operations execute entirely inside the user's browser.
- **🚫 No Database & No Backend**: Zero server communication, zero logging, and zero data persistence. Secrets never touch a server.
- **👤 No Account Required**: Instant zero-friction encryption and decryption without sign-ups, logins, or tracking.
- **⚡ Web Crypto API & Modern Cryptography**:
  - **AES-256-GCM**: Authenticated encryption with 128-bit integrity tags and Additional Authenticated Data (AAD) binding.
  - **PBKDF2-SHA-256**: Key derivation with 100,000 iterations for password-protected secrets.
  - **SHA-256 Fingerprints**: Distinct cryptographic checksums (e.g. `7F-A2-91-C4`) for out-of-band verification.
- **🔑 Flexible Modes**:
  - **Password-Protected Mode**: Requires a shared passphrase to unlock and decrypt.
  - **Passwordless Quick-Share Mode**: Instant obfuscation with cryptographic integrity verification.
  - **Decoy Mode**: Natural conversational prefix/suffix framing for camouflage.
  - **View-Once Mode**: Instructs single viewing with immediate in-memory state zeroing.
- **🔤 Unicode-Safe Base256 Emoji Codec**: Built on a curated 256 single-codepoint emoji alphabet without zero-width joiners (ZWJ) or skin-tone modifiers, ensuring cross-platform preservation on iOS, Android, macOS, Windows, and Linux.
- **📱 PWA & Offline Support**: Offline-first architecture installable as a Progressive Web App (PWA) with Service Worker caching.

---

## 🚀 Local Development

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Tests

Run the automated test suite:

```bash
npm test
```

To run tests in interactive watch mode during development:

```bash
npm run test:watch
```

---

## 🏗️ Production Build

Compile the optimized production distribution:

```bash
npm run build
```

This compiles TypeScript (`tsc`) and bundles optimized static assets to the `dist/` directory.

---

## 🔍 Production Preview

Preview the production build locally:

```bash
npm run preview
```

---

## ☁️ Deploy to Vercel

Follow these steps to deploy EmojiLock to [Vercel](https://vercel.com):

1. **Step 1:** Push the project to GitHub.
2. **Step 2:** Open [Vercel](https://vercel.com).
3. **Step 3:** Click **"Add New Project"**.
4. **Step 4:** Import the GitHub repository: **`EmojiLock`**.
5. **Step 5:** Configure the project build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   *(No environment variables are required)*
6. **Step 6:** Click **Deploy**.
7. **Step 7:** After deployment completes, open the generated Vercel URL.
8. **Step 8:** Test the deployment:
   - **Encode** a message → **Copy** emoji payload → **Decode** → **Paste** → **Decrypt**.
   - Also test a **Password-Protected** message with correct and incorrect passwords.

---

## 🌐 Custom Domain Configuration

To connect a custom domain to your Vercel deployment:

1. In your **Vercel Project Dashboard**, navigate to **Settings** → **Domains**.
2. Click **Add Domain** and enter your desired domain or subdomain.
3. Configure your DNS provider with the records displayed by Vercel:
   - For apex domains (e.g. `example.com`): Add an `A` record pointing to the Vercel IP address.
   - For subdomains (e.g. `app.example.com`): Add a `CNAME` record pointing to `cname.vercel-dns.com`.
4. Vercel will automatically provision a free SSL/TLS certificate once DNS propagation completes.

---

## 🛡️ Security Architecture

### Binary Payload Specification (v1)

| Offset (Bytes) | Field | Size | Description |
|---|---|---|---|
| `0..3` | `MAGIC` | 4 bytes | Magic header identifier (`EMJL` = `0x45, 0x4D, 0x4A, 0x4C`) |
| `4` | `VERSION` | 1 byte | Protocol version number (`0x01`) |
| `5` | `FLAGS` | 1 byte | Bit 0: `HAS_PASSWORD`, Bit 1: `VIEW_ONCE`, Bit 2: `DECOY_MODE` |
| `6..9` | `CIPHERTEXT_LEN` | 4 bytes | Big-Endian unsigned 32-bit integer |
| `10..25` | `SALT` | 16 bytes | Cryptographic salt generated via secure random bytes |
| `26..37` | `NONCE` | 12 bytes | AES-GCM 96-bit initialization vector |
| `38..` | `CIPHERTEXT` | Variable | AES-256-GCM ciphertext with appended 16-byte authentication tag |

### Security Headers
The included [`vercel.json`](./vercel.json) configures standard hardening headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`: Strictly scoped to self-hosted scripts, styles, Google Fonts, and offline workers.

---

## 📄 License

MIT License. Free and open source for personal and commercial privacy.

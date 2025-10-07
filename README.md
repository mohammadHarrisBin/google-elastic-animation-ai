<img width="200" height="200" alt="voxa" src="https://github.com/user-attachments/assets/c96d762d-bea8-4a08-ba5d-f0f55f8738db" />

# 📚 Voxa — A Hackathon Story

> *The tale of Harris, his glasses, and an AI-powered comic finder that nobody believed in...*

---

## 🎭 Chapter 1: The Idea Nobody Wanted

```
     👓
    /😤\     "An AI comic finder? That's too ambitious!"
    /||\     - Everyone at the hackathon
    / \
   Harris
```

**Harris:** *"I've read 100+ manhwa chapters and can't remember where specific dialogues are..."*

**Teammates:** *"Just use Ctrl+F on the website bro."*

**Harris:** *"But... what if the dialogue is IN the images?"*

**Teammates:** *walks away*

```
    👓
   /😔\
   /||\    *Alone, but determined*
   / \
```

---

## 🎭 Chapter 2: The Planning Phase

```
╔════════════════════════════════════╗
║  HARRIS'S BATTLE PLAN             ║
║  ─────────────────────────────    ║
║  ☐ Google Cloud Vision (OCR)      ║
║  ☐ Elasticsearch (Search)         ║
║  ☐ Next.js (Frontend)             ║
║  ☐ Make everyone regret doubting  ║
╚════════════════════════════════════╝

     👓
    /🤔\     "This is either genius or I'm coding for 48 hours straight..."
    /||\
    / \
```

**Hour 2:** Drawing architecture diagrams on whiteboard  
**Hour 3:** Still drawing diagrams  
**Hour 4:** Realized the markers are dry  

---

## 🎭 Chapter 3: The Coding Begins

```
    ☕☕☕
     👓
    />💻<\    *furious typing*
    /||\      
    / \

[11:47 PM] npm install everything
[11:52 PM] npm install works!
[11:53 PM] Wait, wrong Node version
[12:30 AM] Okay NOW it works
```

**The Haters Walk By:**

```
  😏  😏  😏
 /|\ /|\ /|\    "Still working on that 'impossible' project?"
 / \ / \ / \    
              👓
             /😤\    *doesn't even look up*
             /||\    "Just wait..."
             / \
```

---

## 🎭 Chapter 4: ElasticSearch - The 2 Day Boss Fight

```
╔══════════════════════════════╗
║   ELASTICSEARCH             ║
║   HP: ████████████ 100%     ║
║   Status: REFUSING TO WORK  ║
╚══════════════════════════════╝

     👓
    /😫\     "WHY WON'T YOU CONNECT?!"
   💻||\💻   
    / \
```

**Day 1 of Fighting ElasticSearch:**
- ❌ Connection refused
- ❌ Version mismatch
- ❌ Node.js too old
- ❌ Node.js too new
- ❌ Tried 17 StackOverflow answers
- ❌ Still broken

```
     👓
    /😵\     "Maybe the haters were right..."
    /||\
   💀 \_

[3:47 AM] Error: Cannot connect to Elasticsearch
[3:48 AM] Harris has left the chat
[3:49 AM] Harris has returned
```

**Day 2 of Fighting ElasticSearch:**
```
     👓✨
    /😤\     *finds ONE comment buried in GitHub issues*
    /||\     
    / \      "UPGRADE NODE TO >=20"

✅ IT WORKS!!!

     👓
    /🎉\     "I AM A GOD!"
    /||\
    / \
```

---

## 🎭 Chapter 5: Google Vision API - The Permission Hell

```
╔═══════════════════════════════════╗
║  ERROR 403: FORBIDDEN            ║
║  You don't have permission       ║
╚═══════════════════════════════════╝

     👓
    /😩\     "I LITERALLY CREATED THE PROJECT!"
    /||\
    / \

[Reading documentation for 4 hours]
[Clicking through 47 Google Cloud Console menus]
[Enabling 23 different APIs]
[Downloading service account keys]
[Sacrificing a keyboard to the cloud gods]

✅ API Key finally works!
```

---

## 🎭 Chapter 6: The Breakthrough

```
═══════════════════════════════════
    Harris vs The Upload Button
═══════════════════════════════════

[Upload comic panel] ✅
[Extract text with AI] ✅
[Index in Elasticsearch] ✅
[Search for dialogue] ✅
[Highlight text bubbles] ✅

     👓
    /🤯\     "IT... IT ACTUALLY WORKS!"
    /||\
    / \

[4:23 AM] The moment everything clicked
```

---

## 🎭 Chapter 7: The Haters Return

```
  🤨  🤨  🤨
 /|\ /|\ /|\    "Yo Harris, how's that project going?"
 / \ / \ / \    
              👓
             /😎\    *spins laptop around*
            💻||\💻  "See for yourself."
             / \

[Demo: Upload panel → Search "I won't give up" → Text highlights]

  😲  😳  🤯
 /|\ /|\ /|\    "Bro... that's actually fire!"
 / \ / \ / \    
              👓
             /😏\    "Told you."
             /||\
             / \
```

---

## 🎭 Chapter 8: The Final Push

```
⏰ TIME REMAINING: 2 HOURS

CHECKLIST:
✅ Core features working
✅ UI looks decent  
✅ No major bugs (that we know of)
☐ README
☐ Demo video
☐ Deployment
☐ Caffeine IV drip

     👓
    /😵\     *running on pure determination and Red Bull*
    /||\
    / \💻

[6:47 AM] Fixed styling
[7:13 AM] Added animations
[7:44 AM] Wrote README
[7:58 AM] Recording demo
[7:59 AM] SUBMITTED!

     👓
    /😴\     *passes out*
    /||\
    / \
```

---

## 🏆 The Moral of The Story

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  "Everyone will doubt you.                           ║
║   ElasticSearch will break for 2 days.               ║
║   Google Cloud will gatekeep you.                    ║
║   You'll want to quit at 3 AM.                       ║
║                                                       ║
║   But when that search bar highlights the dialogue   ║
║   bubble for the first time?                         ║
║                                                       ║
║   Worth it. Every. Single. Bug."                     ║
║                                                       ║
║                    - Harris (probably needs sleep)   ║
╚═══════════════════════════════════════════════════════╝

     👓
    /😌\
    /||\    Built with ❤️, ☕, and pure spite
    / \
```

---

## 💻 The Tech (What Actually Powers This Thing)

| What Harris Used | Why Harris Chose It | Did It Work? |
|-----------------|---------------------|--------------|
| Next.js + React | Fast, modern, heard it's good | ✅ Yes |
| Tailwind CSS | Styling without crying | ✅ Yes |
| Google Vision API | Smartest OCR out there | ✅ (eventually) |
| Elasticsearch | Fast search engine | ✅ (after 2 days) |
| Node.js >=20 | The MUST HAVE version that works | ✅ (crucial) |
| Coffee | Stay awake | ✅ (too well) |
| Glasses | See the screen | ✅ (essential) |

---

## 🚀 Want to Run This Yourself?

**Fair warning:** You're about to experience the same pain Harris did. But here's the roadmap:

### Prerequisites
```bash
# You'll need:
- Node.js >=v20 (NOT v18 DAMN IT)
- A Google Cloud account (and patience)
- An Elasticsearch Cloud account (and more patience)
- Coffee (essential)
- Determination (critical)
```

### Setup (The Short Version)

```bash
# 1. Clone this masterpiece
git clone https://github.com/mohammadHarrisBin/google-elastic-animation-ai.git
cd google-elastic-animation-ai

# 2. Install dependencies
npm install

# 3. Create .env.local file
GOOGLE_APPLICATION_CREDENTIALS=./your-google-key.json
ELASTIC_URL=your_elasticsearch_url
ELASTIC_API_KEY=your_elasticsearch_key

# 4. Run it
npm run dev

# 5. Pray to the demo gods
# Open http://localhost:3000
```

### Setup (The "What Harris Actually Did" Version)

```bash
# 1. Clone repo (5 minutes)
git clone https://github.com/mohammadHarrisBin/google-elastic-animation-ai.git

# 2. Install dependencies (10 minutes)
npm install
# *watches progress bar*

# 3. Try to run it (Immediately fails)
npm run dev
# Error: Connection refused

# 4. Spend 2 days fixing Elasticsearch
# - Read 47 documentation pages
# - Try 12 different Node versions
# - Question life choices
# - Upgrade to Node >=v20
# - IT WORKS!

# 5. Google Cloud API Setup (4 hours)
# - Create project
# - Enable Vision API
# - Create service account
# - Download key
# - Set permissions
# - Still get 403
# - Enable MORE permissions
# - Finally works

# 6. Run again
npm run dev
# Opens http://localhost:3000
# IT ACTUALLY WORKS!

# 7. Celebrate
echo "I AM A CODING GOD"
```

---

## 🐛 Known Bugs (That Harris Hasn't Fixed Yet)

```
     👓
    /😅\     "They're not bugs, they're features!"
    /||\
    / \

1. Sometimes the text detection thinks speech bubbles are clouds
2. App crashes if you upload 500 images at once (don't do that)
3. Elasticsearch occasionally forgets it exists (just restart)
4. The UI looks weird on Internet Explorer (stop using IE!)
```

---

## 🔮 What's Next?

```
HARRIS'S TODO LIST (Post-Hackathon):

☐ Actually sleep
☐ Turn this into a real platform
☐ Add user accounts
☐ Let people upload entire series
☐ AI-powered comic recommendations
☐ Prove the haters wrong (again)
☐ Maybe fix those bugs
☐ Probably create new bugs
```

---

## 📬 Contact Harris

```
     👓
    /😊\     "Feel free to reach out!"
    /||\     
    / \

📧 Email: harrishero2003@example.com
💼 LinkedIn: https://www.linkedin.com/in/mohammad-harris-8a66641bb/
🐙 GitHub: https://github.com/mohammadHarrisBin

"If I can build this while everyone doubted me,
 imagine what we could build together."
```

---

## 🙏 Special Thanks

- **The Haters**: For the motivation
- **StackOverflow**: For saving me at 3 AM
- **Coffee**: For keeping me alive
- **My Glasses**: For letting me see the bugs
- **ElasticSearch Docs**: Even though you confused me
- **Google Cloud**: Eventually you let me in
- **Future Me**: Sorry about the technical debt

---

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║         THE END... OR IS IT?                       ║
║                                                    ║
║              👓                                    ║
║             /😎\                                   ║
║             /||\        Voxa v1.0                  ║
║             / \         "Search Comics with AI"   ║
║                                                    ║
║         Built in 48 hours of pure chaos           ║
║                                                    ║
║    ⭐ Star this repo if you like the story! ⭐    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

**P.S.** If you're reading this at a hackathon right now, and everyone's doubting your idea... this README is for you. Build it anyway. 💪

**P.P.S.** Node.js >=v20. Trust me on this one.

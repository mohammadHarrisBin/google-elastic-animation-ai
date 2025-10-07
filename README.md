# 📚 Voxa — Your AI-powered Comic Finder

Voxa is an AI-powered web app that allows users to extract and highlight dialogue bubbles from comic and manhwa panels. Whether you're analyzing your favorite stories or just want to find that one memorable line — Voxa helps you locate it instantly.

---

## 🚀 Inspiration

I've always loved reading manhwa and comics, but it was hard to remember every scene or conversation across 100+ chapters. I wanted a way to *search for conversations directly from images*, so I could instantly find specific dialogue or emotional moments from any panel.

---

## 💡 What It Does

- 🧠 Uses **AI and OCR** to extract text from comic images.  
- 🔍 Lets you **search for dialogue** or keywords across all uploaded panels.  
- 🖊️ Automatically **highlights text bubbles** that match your search.  
- 📂 Plans to become a **user-uploaded library** for comics and manhwa in the future.  

---

## 🎬 Demo / Preview

![Voxa Demo](public/preview.png)

*Upload a comic panel, search for dialogue, and see text bubbles highlighted in real-time!*

> [🔗 **Live Demo:** ](https://google-elastic-animation-ai.vercel.app/)

---

## 🛠️ How We Built It

1. **Frontend** — Built with **Next.js** + **React**, styled using **Tailwind CSS** and **ShadCN UI**.  
2. **AI & OCR** — Integrated **Google Cloud Vision API** for extracting text from comic panels.  
3. **Search** — Used **Elasticsearch Cloud** to index and search text efficiently across uploaded images.  
4. **Storage** — Panels stored temporarily in the browser (later planned to use Firebase or Supabase).  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mohammadHarrisBin/google-elastic-animation-ai.git
cd google-elastic-animation-ai
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-service-account-key.json
ELASTIC_URL=your_elasticsearch_cloud_url
ELASTIC_API_KEY=your_elasticsearch_api_key
```

> 🔐 **Security Note:** 
> - Never commit your `.env.local` file or service account JSON to version control
> - Add `.env.local` and `*.json` (for credentials) to your `.gitignore`
> - Keep your API keys and credentials secure

**Getting your credentials:**
- **Google Cloud Vision API:** Create a service account in [Google Cloud Console](https://console.cloud.google.com/) and download the JSON key
- **Elasticsearch:** Get your Cloud ID and API key from [Elastic Cloud](https://cloud.elastic.co/)

### 4️⃣ Run the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Tools & Technologies Used

| Category        | Tool / Library                          |
| --------------- | --------------------------------------- |
| Frontend        | Next.js, React, Tailwind CSS, ShadCN UI |
| AI / OCR        | Google Cloud Vision API                 |
| Search Engine   | Elasticsearch Cloud                     |
| Server Runtime  | Node.js                                 |
| Version Control | Git + GitHub                            |
| Deployment      | Vercel (planned)                        |

---

## 🧠 Challenges We Faced

- ElasticSearch wasn't working for 2 days due to version mismatches in Node.js.
- Google Vision API setup required managing service credentials and permissions.
- Managing large image files and ensuring accurate text detection for stylized fonts in comics.

---

## 🏆 Accomplishments We're Proud Of

- Successfully extracted readable dialogue text from complex comic images.
- Built a working search interface that highlights text bubbles dynamically.
- Learned how to integrate AI APIs and search infrastructure together for real-world use cases.

---

## 📘 What We Learned

- How to work with **AI OCR models** and **Elasticsearch indexing**.
- The importance of consistent data pipelines when processing images and text.
- How to debug API integrations and manage authentication securely in `.env` files.

---

## 🔮 What's Next for Voxa

- 🌍 Turn Voxa into a **public webtoon/comic platform** where users can upload and search panels.
- 🎞️ Add **AI-driven comic animation** to bring still panels to life.
- 🤝 Enable **community features** like tagging, sharing, and bookmarking favorite scenes.

---

## 🧮 Technical Note

Voxa's AI text recognition can be modeled as a mapping:

$$f: I \rightarrow T$$

where $I$ represents an image panel and $T$ represents extracted text data.

Future plans include semantic embedding search:

$$\text{similarity}(t_1, t_2) = \frac{t_1 \cdot t_2}{|t_1||t_2|}$$

to find related dialogue scenes beyond simple keyword matching.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Author

Built with ❤️ by **Mohammad Harris**

📩 [harrishero2003@gmail.com](mailto:harrishero2003@gmail.com)  
💼 [LinkedIn](https://www.linkedin.com/in/mohammad-harris-8a66641bb/)
🐙 [GitHub](https://github.com/mohammadHarrisBin)

---

## 🙏 Acknowledgments

- Thanks to Google Cloud Vision API for powerful OCR capabilities
- Elasticsearch for lightning-fast search functionality
- The amazing Next.js and React communities

---

**⭐ If you found this project interesting, please consider giving it a star on GitHub!**

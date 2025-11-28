# 📘 **AI Fax Portal — README.md (Updated With Pending OpenAI Support)**

# **AI Fax Portal**

AI-powered Fax Extraction System using **React + TypeScript + OCR + Google Gemini (Active) + OpenAI (Ready, Not Yet Deployed)** + Azure


## 🚀 **Overview**

**AI Fax Portal** is a web application designed to automate the processing of fax documents used in healthcare workflows.
The system digitizes faxed PDF/Image documents and extracts key clinical information using **OCR** and **AI models**.

The currently deployed version uses:

* **Google Gemini** → Active & Fully Integrated
* **OpenAI GPT Models** → *Code-ready but deployment pending*

---

## 🧩 **Key Features**

### ✔ Upload PDF/Image fax documents

Supports drag-and-drop or file selector.

### ✔ OCR (Optical Character Recognition)

Extracts raw text using:

* Tesseract.js (client-side)
* Gemini Vision OCR
* (Optional) Azure OCR

### ✔ AI Field Extraction

Transforms raw text into structured JSON fields:

* Patient Name
* DOB
* MRN
* Referral Date
* Diagnosis Codes
* Notes
* Additional metadata

### ✔ Split View Dashboard

Left → Fax list
Right → Fax preview + AI-extracted JSON

### ✔ Azure Blob Storage (Optional)

Upload PDF/Image to secure cloud storage.

### ✔ Modular AI Architecture

Easily switch between Gemini ↔ OpenAI by changing the model service.

---

# 🧠 **AI Model Support (Status)**

| AI Provider                     | Status                             | Notes                                          |
| ------------------------------- | ---------------------------------- | ---------------------------------------------- |
| **Google Gemini**               | ✅ Active (Deployed)                | Currently powering the live AI extraction      |
| **OpenAI GPT-4o / GPT-4o-mini** | 🟡 Code-Ready (Deployment Pending) | Code included but backend/API not deployed yet |

### Explanation

OpenAI integration is **written in the project**, but not yet deployed to Azure.
Once the API key & endpoint are added to Azure → the model will work.

---

# 🏛️ **Architecture Diagram**

<img width="1024" height="1536" alt="ChatGPT Image Nov 29, 2025, 12_30_31 AM" src="https://github.com/user-attachments/assets/75d2aec5-3d70-4d02-b191-e63182517cd7" />


# 🔄 **System Flow Diagram**

<img width="1024" height="1536" alt="ChatGPT Image Nov 29, 2025, 12_32_10 AM" src="https://github.com/user-attachments/assets/e7b60d42-ac19-40fc-9297-b82543f4cbfd" />


# 🛠️ **Tech Stack**

| Layer            | Technology                                               |
| ---------------- | -------------------------------------------------------- |
| Frontend         | React 18, TypeScript, Vite                               |
| Styling          | TailwindCSS                                              |
| OCR              | Tesseract.js / Gemini OCR                                |
| AI Models        | Gemini 1.5 (active) / OpenAI GPT-4o (pending deployment) |
| Storage          | Azure Blob Storage                                       |
| Hosting          | Azure Static Web Apps                                    |
| Optional Backend | Azure Functions                                          |

---

# 📁 **Project Structure**

```
src/
 ├─ components/
 │    ├─ UploadBox.tsx
 │    ├─ DocList.tsx
 │    ├─ SplitView.tsx
 │    └─ FieldDisplay.tsx
 │
 ├─ services/
 │    ├─ ocrService.ts
 │    ├─ aiModelService.ts
 │    └─ azureUploadService.ts
 │
 ├─ context/
 │    └─ NotificationContext.tsx
 │
 ├─ App.tsx
 └─ main.tsx
```

---

# ⚙️ *Environment Variables*

### For Gemini (Active)

```
VITE_GEMINI_API_KEY=your_key
```

### For OpenAI (Not yet deployed)

```
VITE_OPENAI_API_KEY=your_key
```

### Azure Blob

```
VITE_AZURE_STORAGE_SAS_URL=your_sas_url
```

---

# 🤖 **AI Service (Gemini - Active)**

```ts
export async function extractWithGemini(text: string) {
  // gemini code currently used in deployed environment
}
```

---

# 🤖 **AI Service (OpenAI - Ready but not yet deployed)**

```ts
export async function extractWithOpenAI(text: string) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Extract medical fields and return JSON." },
      { role: "user", content: text }
    ]
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}
```

---

# 🧪 **Workflow Summary**

1. User uploads a document
2. OCR extracts raw text
3. Gemini / OpenAI processes text into structured JSON
4. UI displays preview + results
5. Optionally uploads document to Azure

---

# 🚀 **Deploy to Azure**

1. Create Azure Static Web App
2. Connect repository
3. Build settings:

   ```
   App location: /
   Output: dist
   ```
4. Add environment variables in **Configuration**
5. Deploy — live in minutes



# 🔮 **Future Roadmap**

* 🟢 Deploy OpenAI pipeline
* 🟢 Add multi-page PDF segmentation
* 🟢 Add handwriting OCR
* 🟢 Build Azure Function backend for secure API usage
* 🟢 Enable database storage & analytics dashboard

# 🎉 **Final Notes**

This project is fully capable of processing medical fax documents using AI.
Gemini is active today, and OpenAI integration is built-in and ready for deployment whenever needed.


**Zen AI Fax** - Simplifying Healthcare Intake.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1M74aKHi5DghhBlE_2Nmxgvs7w8X-UsEr

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

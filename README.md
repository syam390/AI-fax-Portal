# Zen AI Fax

**Intelligent Referral Automation Portal**

Zen AI Fax is an enterprise-grade web application designed to automate the processing of medical fax referrals. It leverages **Google Gemini 2.5 Flash** for multimodal AI analysis (OCR + NLP) to extract patient data from PDFs, Images, and Word documents, streamlining the intake process for healthcare providers.

## 🚀 Features

- **AI-Powered Extraction**: Automatically identifies patient names, diagnosis codes, and referral details from messy documents (including handwritten notes).
- **Multimodal Support**: Handles PDF, JPG/PNG images, and Word (.docx) files.
- **Modern Dashboard**: "Inbox" style interface for managing referral status (Pending, Accepted, Rejected).
- **Split-Screen Review**: efficient side-by-side view of the original document and extracted data.
- **Azure Integration**: Built to deploy on Azure Static Web Apps with optional Azure Blob Storage integration.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
- **Storage**: Azure Blob Storage (optional) or Local Simulation
- **Icons**: Lucide React

## 🏃‍♂️ Getting Started Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/syam390/AI-fax-Portal.git
    cd AI-fax-Portal
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory (optional for local dev, but recommended):
    ```env
    # Required for AI processing
    API_KEY=your_google_gemini_api_key
    
    # Optional: For direct Azure uploads. If omitted, uses local simulation.
    AZURE_STORAGE_SAS_URL=your_azure_container_sas_url
    ```
    *Note: In development, you can also rely on the browser injecting these variables if configured in `vite.config.ts`.*

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## ☁️ Deployment to Azure

This project is optimized for **Azure Static Web Apps**.

### Option A: Deploy via GitHub Actions (Recommended)
1.  Push this code to a GitHub repository.
2.  Go to the **Azure Portal** > **Create a resource** > **Static Web App**.
3.  Select your subscription and link your GitHub account.
4.  Select the repository (`AI-fax-Portal`) and branch (`main`).
5.  **Build Presets**: Select `React`.
6.  **App Location**: `/`
7.  **Output Location**: `dist`
8.  Click **Review + Create**.

### Option B: Manual Deploy via Azure CLI
1.  Build the project:
    ```bash
    npm run build
    ```
2.  Deploy the `dist` folder using the SWA CLI or Azure Portal "Deploy from Zip" feature.

### 🔑 Configuration in Azure
Once deployed, go to your Static Web App in the Azure Portal:
1.  Navigate to **Configuration** (or **Environment variables**).
2.  Add the following settings:
    - `API_KEY`: Your Google Gemini API Key.
    - `AZURE_STORAGE_SAS_URL`: (Optional) The SAS URL for your Azure Storage Container (ensure Write permissions).

## 📂 Project Structure

- `/src/components`: UI components (Dashboard, Detail View, Dialogs).
- `/src/services`: Integrations with Gemini AI and Azure Storage.
- `/src/types`: TypeScript definitions for the Referral data model.
- `/src/context`: React Context for global state (Notifications).

---

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

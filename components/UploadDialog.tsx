import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, AlertCircle, Cloud, FileType } from 'lucide-react';
import { Button } from './Button';
import { GeminiService } from '../services/geminiService';
import { uploadToAzure } from '../services/azureService';
import { saveReferral } from '../services/mockStorage';
import { ReferralStatus } from '../types';
import mammoth from 'mammoth';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid file: Image (JPG, PNG), PDF, or Word Document (.docx).");
      return;
    }
    setError(null);
    setFile(file);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get raw base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const convertToDataUrl = (file: File): Promise<string> => {
     return new Promise((resolve) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result as string);
         reader.readAsDataURL(file);
     });
  };

  const handleSubmit = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY || (window as any)._env_api_key;
      if (!apiKey) {
        throw new Error("API Key is missing. Please configure it in Azure Static Web Apps settings or .env");
      }

      const gemini = new GeminiService(apiKey);
      
      // 1. Prepare Storage Data (Azure or Local)
      const dataUrl = await convertToDataUrl(file);
      const sasUrl = process.env.AZURE_STORAGE_SAS_URL || (window as any)._env_azure_storage_sas_url;
      let finalFilePath = dataUrl;
      let storageType = 'Local';

      if (sasUrl) {
        try {
          finalFilePath = await uploadToAzure(file, sasUrl);
          storageType = 'Azure Blob Storage';
        } catch (e) {
          console.error("Azure upload failed, falling back to local", e);
        }
      }

      // 2. Process with Gemini
      let extractedData;

      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle Word Doc - Extract Text locally first
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          const textContent = result.value;
          
          // Pass text to Gemini (no image/pdf data needed)
          extractedData = await gemini.processDocument(null, file.type, textContent);
        } catch (e) {
           console.error("Mammoth extraction failed", e);
           throw new Error("Failed to read Word document. Please ensure it is a valid .docx file.");
        }
      } else {
        // Handle Image or PDF
        const base64 = await convertToBase64(file);
        extractedData = await gemini.processDocument(base64, file.type);
      }

      // 3. Create new Referral Record
      const newReferral = {
        ID: `REF-${Math.floor(Math.random() * 10000)}`,
        PatientName: extractedData.PatientName || 'Unknown',
        ReferredBy: extractedData.ReferredBy || 'Unknown',
        ReferredTo: extractedData.ReferredTo || 'Unknown',
        Diagnosis: extractedData.Diagnosis || 'Unknown',
        FilePath: finalFilePath, 
        MimeType: file.type,
        // Use the status determined by AI (Pending or Rejected)
        Status: extractedData.Status || ReferralStatus.PENDING,
        DOB: extractedData.DOB,
        ReferralDate: extractedData.ReferralDate,
        Notes: extractedData.Notes
      };

      // 4. Save
      saveReferral(newReferral);
      
      console.log(`Processed file using ${storageType}. Status: ${newReferral.Status}`);
      onSuccess();
      onClose();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process document. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Referral Document</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-2">
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*,.pdf,.docx"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports: Images (Handwritten notes), PDF, Word (.docx)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                        {file.type.includes('pdf') ? <FileType className="h-8 w-8 text-red-500 mr-3" /> :
                         file.type.includes('word') ? <FileType className="h-8 w-8 text-blue-700 mr-3" /> :
                         <FileText className="h-8 w-8 text-blue-500 mr-3" />}
                        <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-md bg-red-50 p-3 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">Processing Pipeline</h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li>AI Analysis & OCR using <strong>Gemini 2.5 Flash</strong></li>
                      <li>Handwritten note recognition support</li>
                      {(process.env.AZURE_STORAGE_SAS_URL || (window as any)._env_azure_storage_sas_url) ? (
                        <li className="flex items-center">
                          <Cloud className="w-3 h-3 mr-1 inline" /> 
                          Store file in <strong>Azure Blob Storage</strong>
                        </li>
                      ) : (
                        <li>Store file locally (Browser Memory)</li>
                      )}
                  </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button 
                onClick={handleSubmit} 
                disabled={!file || processing} 
                isLoading={processing}
            >
              {processing ? 'Analyzing...' : 'Process File'}
            </Button>
            <Button 
                variant="secondary" 
                onClick={onClose} 
                className="mt-3 sm:mt-0 sm:mr-3"
                disabled={processing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
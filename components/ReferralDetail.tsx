import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReferralById, updateReferralStatus, saveReferral } from '../services/mockStorage';
import { ReferralData, ReferralStatus } from '../types';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle, Download, FileText } from 'lucide-react';

export const ReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ReferralData>>({});

  useEffect(() => {
    if (id) {
      const data = getReferralById(id);
      if (data) {
        setReferral(data);
        setFormData(data);
      } else {
        // Handle not found
      }
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (referral && formData) {
      const updated = { ...referral, ...formData } as ReferralData;
      saveReferral(updated);
      setReferral(updated);
      setIsEditing(false);
    }
  };

  const handleStatusChange = (status: ReferralStatus) => {
    if (referral) {
      updateReferralStatus(referral.ID, status);
      setReferral({ ...referral, Status: status });
    }
  };

  const renderDocumentViewer = (referral: ReferralData) => {
    const isPdf = referral.MimeType === 'application/pdf' || referral.FilePath.endsWith('.pdf');
    const isWord = referral.MimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || referral.FilePath.endsWith('.docx');
    const isImage = !isPdf && !isWord; // Default to image if not pdf/word

    if (!referral.FilePath) {
       return <div className="text-gray-500">Document not available</div>;
    }

    if (isPdf) {
      return (
        <iframe 
          src={referral.FilePath} 
          className="w-full h-full bg-white" 
          title="PDF Viewer"
        />
      );
    }

    if (isWord) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
          <FileText className="w-24 h-24" />
          <p className="text-lg font-medium text-gray-300">Word Document Preview Unavailable</p>
          <p className="text-sm max-w-md text-center">
            This document was processed via text extraction. The original layout cannot be displayed in-browser without an external viewer.
          </p>
          <a 
            href={referral.FilePath} 
            download 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            <Download className="mr-2 h-4 w-4" /> Download Original
          </a>
        </div>
      );
    }

    // Default Image
    return (
      <img 
        src={referral.FilePath} 
        alt="Fax Document" 
        className="max-w-full max-h-full object-contain shadow-lg border border-gray-300" 
      />
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading referral details...</div>;
  if (!referral) return <div className="p-8 text-center text-red-500">Referral not found.</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {referral.PatientName} 
              <span className="ml-3 text-base font-normal text-gray-500">#{referral.ID}</span>
            </h1>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
               <span>Received: {referral.ReferralDate || 'Unknown'}</span>
               <StatusBadge status={referral.Status} />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
           {isEditing && (
             <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
               Save Changes
             </Button>
           )}
           
           {referral.Status === ReferralStatus.PENDING && (
             <>
               <Button 
                 variant="danger" 
                 onClick={() => handleStatusChange(ReferralStatus.REJECTED)}
                 icon={<XCircle className="w-4 h-4" />}
               >
                 Reject
               </Button>
               <Button 
                 variant="success" 
                 onClick={() => handleStatusChange(ReferralStatus.ACCEPTED)}
                 icon={<CheckCircle className="w-4 h-4" />}
               >
                 Accept
               </Button>
             </>
           )}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* Left: Data Form */}
        <div className="bg-white shadow rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Extracted Data</h3>
            {isEditing && <span className="text-xs text-amber-600 font-medium flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Unsaved changes</span>}
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="PatientName" className="block text-sm font-medium text-gray-700">Patient Name</label>
                <input
                  type="text"
                  name="PatientName"
                  id="PatientName"
                  value={formData.PatientName || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="DOB" className="block text-sm font-medium text-gray-700">DOB</label>
                <input
                  type="date"
                  name="DOB"
                  id="DOB"
                  value={formData.DOB || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="ReferredBy" className="block text-sm font-medium text-gray-700">Referred By</label>
                <input
                  type="text"
                  name="ReferredBy"
                  id="ReferredBy"
                  value={formData.ReferredBy || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="ReferredTo" className="block text-sm font-medium text-gray-700">Referred To</label>
                <input
                  type="text"
                  name="ReferredTo"
                  id="ReferredTo"
                  value={formData.ReferredTo || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="Diagnosis" className="block text-sm font-medium text-gray-700">Diagnosis / ICD Code</label>
                <input
                  type="text"
                  name="Diagnosis"
                  id="Diagnosis"
                  value={formData.Diagnosis || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>

               <div className="sm:col-span-6">
                <label htmlFor="Notes" className="block text-sm font-medium text-gray-700">AI Summary / Notes</label>
                <textarea
                  name="Notes"
                  id="Notes"
                  rows={4}
                  value={formData.Notes || ''}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Document Viewer */}
        <div className="bg-gray-900 shadow rounded-lg border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
             <h3 className="text-sm font-medium text-white">Original Document</h3>
             <div className="text-xs text-gray-400">Read-only</div>
          </div>
          <div className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-4">
            {renderDocumentViewer(referral)}
          </div>
        </div>
      </div>
    </div>
  );
};
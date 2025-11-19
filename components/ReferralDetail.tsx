import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReferralById, updateReferralStatus, saveReferral } from '../services/mockStorage';
import { ReferralData, ReferralStatus } from '../types';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle, Download, FileText, Clock, Calendar, User, Stethoscope, MapPin, File, ChevronRight, Eye } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const ReferralDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
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
      showNotification('success', 'Data Saved');
    }
  };

  const handleStatusChange = (status: ReferralStatus) => {
    if (referral) {
      updateReferralStatus(referral.ID, status);
      setReferral({ ...referral, Status: status });
      showNotification(
        status === ReferralStatus.ACCEPTED ? 'success' : 'info', 
        `Referral ${status}`
      );
    }
  };

  const renderDocumentViewer = (referral: ReferralData) => {
    const isPdf = referral.MimeType === 'application/pdf' || referral.FilePath.endsWith('.pdf');
    const isWord = referral.MimeType?.includes('word') || referral.FilePath.endsWith('.docx');
    
    if (!referral.FilePath) return <div className="text-slate-400">No document found</div>;

    if (isPdf) {
      return <iframe src={referral.FilePath} className="w-full h-full bg-white rounded-md shadow-sm" title="PDF Viewer" />;
    }

    if (isWord) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 bg-white rounded-md border border-slate-200 m-4 p-8 shadow-sm">
          <FileText className="w-16 h-16 text-brand-200" />
          <div className="text-center">
             <p className="text-lg font-medium text-slate-700">Word Document</p>
             <p className="text-sm text-slate-500">Preview not available in browser.</p>
          </div>
          <Button variant="outline" onClick={() => window.open(referral.FilePath, '_blank')}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      );
    }

    return (
      <img src={referral.FilePath} alt="Fax Document" className="max-w-full max-h-full object-contain shadow-md rounded-md bg-white" />
    );
  };

  if (loading) return <div className="flex h-full items-center justify-center text-slate-500">Loading...</div>;
  if (!referral) return <div className="p-8 text-center text-red-500">Referral not found.</div>;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col gap-4">
      {/* Breadcrumb & Header */}
      <div className="shrink-0">
        <nav className="flex items-center text-sm text-slate-500 mb-2">
           <span className="cursor-pointer hover:text-brand-600" onClick={() => navigate('/')}>Inbox</span>
           <ChevronRight className="w-4 h-4 mx-1" />
           <span className="text-slate-800 font-medium">{referral.ID}</span>
        </nav>
        <div className="bg-white p-4 rounded-lg shadow-card border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{referral.PatientName}</h1>
              <p className="text-sm text-slate-500 flex items-center mt-0.5">
                 <span className="mr-3">Received: {referral.ReferralDate}</span>
                 <StatusBadge status={referral.Status} />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isEditing && (
               <Button variant="primary" onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                 Save Changes
               </Button>
             )}
             {referral.Status === ReferralStatus.PENDING && (
               <>
                 <Button variant="secondary" onClick={() => handleStatusChange(ReferralStatus.REJECTED)} className="text-red-600 hover:bg-red-50 border-red-200">
                   Reject
                 </Button>
                 <Button variant="success" onClick={() => handleStatusChange(ReferralStatus.ACCEPTED)}>
                   Accept Referral
                 </Button>
               </>
             )}
          </div>
        </div>
      </div>

      {/* Workspace Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left Panel: Extraction Form */}
        <div className="bg-white rounded-lg shadow-card border border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center">
              <Eye className="w-4 h-4 mr-2 text-brand-500" />
              Extracted Data
            </h2>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Patient Section */}
              <div className="bg-slate-50/50 p-4 rounded-md border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <input type="text" name="PatientName" value={formData.PatientName || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                    <input type="date" name="DOB" value={formData.DOB || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Referral Details */}
              <div className="bg-slate-50/50 p-4 rounded-md border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Clinical Details</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Referring Provider</label>
                      <input type="text" name="ReferredBy" value={formData.ReferredBy || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Referring To</label>
                      <input type="text" name="ReferredTo" value={formData.ReferredTo || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Diagnosis / ICD Code</label>
                    <div className="relative">
                       <input type="text" name="Diagnosis" value={formData.Diagnosis || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none pl-9" />
                       <Stethoscope className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div>
                     <label className="block text-xs font-semibold text-slate-600 mb-1.5">AI Summary / Notes</label>
                     <textarea name="Notes" rows={4} value={formData.Notes || ''} onChange={handleInputChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Document Viewer */}
        <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-800 flex flex-col overflow-hidden">
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
             <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original Fax</span>
             <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{referral.MimeType?.split('/')[1].toUpperCase()}</span>
          </div>
          <div className="flex-1 relative bg-[#1e293b] overflow-auto flex items-center justify-center p-4">
             {renderDocumentViewer(referral)}
          </div>
        </div>
      </div>
    </div>
  );
};
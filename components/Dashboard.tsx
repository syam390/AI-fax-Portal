import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight, Trash2, Users, Clock, CheckCircle, XCircle, Inbox, BrainCircuit, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { getReferrals, deleteReferral } from '../services/mockStorage';
import { ReferralData, ReferralStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { UploadDialog } from './UploadDialog';
import { useNotification } from '../context/NotificationContext';

export const Dashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [filter, setFilter] = useState<ReferralStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Higher density for inbox view

  const { showNotification } = useNotification();

  const refreshData = () => {
    setReferrals(getReferrals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to archive this referral record?')) {
      deleteReferral(id);
      refreshData();
      showNotification('success', 'Referral archived');
    }
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesStatus = filter === 'all' || ref.Status === filter;
    const matchesSearch = ref.PatientName.toLowerCase().includes(search.toLowerCase()) || 
                          ref.ID.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = referrals.filter(r => r.Status === ReferralStatus.PENDING).length;

  // Pagination Logic
  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const currentData = filteredReferrals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header - Zen AI Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Zen AI Fax Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Your intelligent queue for incoming referrals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<RefreshCw className="w-4 h-4" />} onClick={refreshData}>
            Refresh
          </Button>
          <Button 
            onClick={() => setIsUploadOpen(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            New Intake
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {/* Tabs / Filter */}
          <div className="flex p-1 gap-1 w-full md:w-auto bg-slate-50 rounded-md border border-slate-100">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setFilter(status as any); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all flex-1 md:flex-none ${
                  filter === status 
                    ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5 font-semibold' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {status} {status === 'pending' && pendingCount > 0 && (
                    <span className="ml-2 bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full text-xs">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Filter Tools */}
          <div className="flex items-center gap-3 w-full md:w-auto px-2">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                    type="text" 
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    placeholder="Search intake queue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md border border-transparent hover:border-slate-200">
                <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
      </div>

      {/* Data Table - Inbox Style */}
      <div className="bg-white rounded-lg shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Referring Provider</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {currentData.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-16 text-center">
                     <div className="flex flex-col items-center">
                       <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
                         <Inbox className="h-8 w-8 text-slate-300" />
                       </div>
                       <p className="text-slate-900 font-medium">No referrals found</p>
                       <p className="text-slate-500 text-sm mt-1">Clear filters to see more results</p>
                     </div>
                   </td>
                 </tr>
              ) : (
                currentData.map((referral) => (
                  <tr key={referral.ID} className="group hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{referral.ID}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {referral.ReferralDate}
                        </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                          {referral.PatientName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">{referral.PatientName}</div>
                          <div className="text-xs text-slate-500">DOB: {referral.DOB || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-slate-900 truncate max-w-[200px]" title={referral.ReferredBy}>{referral.ReferredBy}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">To: {referral.ReferredTo}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block border border-slate-200">
                        {referral.Diagnosis}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <StatusBadge status={referral.Status} />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                         <Link to={`/referral/${referral.ID}`}>
                           <Button variant="secondary" size="sm" className="h-8 px-3 text-xs">
                             Review
                           </Button>
                        </Link>
                        <button 
                          onClick={(e) => handleDelete(referral.ID, e)}
                          className="text-slate-300 hover:text-red-600 p-1.5 transition-colors"
                          title="Archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredReferrals.length > 0 && (
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-<span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredReferrals.length)}</span> of <span className="font-medium">{filteredReferrals.length}</span>
              </p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
      
      {isUploadOpen && (
        <UploadDialog 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={() => { refreshData(); showNotification('success', 'Analysis complete. Referral added to inbox.'); }}
        />
      )}
    </div>
  );
};
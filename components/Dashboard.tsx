import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { getReferrals } from '../services/mockStorage';
import { ReferralData, ReferralStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { UploadDialog } from './UploadDialog';

export const Dashboard: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [filter, setFilter] = useState<ReferralStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const refreshData = () => {
    setReferrals(getReferrals());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredReferrals = referrals.filter(ref => {
    const matchesStatus = filter === 'all' || ref.Status === filter;
    const matchesSearch = ref.PatientName.toLowerCase().includes(search.toLowerCase()) || 
                          ref.ID.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Referral Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and process incoming fax referrals.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            onClick={() => setIsUploadOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Process New Fax
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search patient name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-500 font-medium mr-2">Filter:</span>
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === status 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred From
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred To
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                     No referrals found matching your criteria.
                   </td>
                 </tr>
              ) : (
                filteredReferrals.map((referral) => (
                  <tr key={referral.ID} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{referral.ID}</div>
                      <div className="text-xs text-gray-500">{referral.ReferralDate || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{referral.PatientName}</div>
                      <div className="text-xs text-gray-500">DOB: {referral.DOB || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{referral.ReferredBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">{referral.ReferredTo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{referral.Diagnosis}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={referral.Status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/referral/${referral.ID}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                        View <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Fake Pagination for visuals */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredReferrals.length}</span> of <span className="font-medium">{filteredReferrals.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button disabled className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button disabled className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {isUploadOpen && (
        <UploadDialog 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

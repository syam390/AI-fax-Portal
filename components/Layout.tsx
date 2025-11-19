import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Menu, 
  X, 
  Settings, 
  Bell, 
  Search,
  ChevronDown,
  FileText,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(process.env.API_KEY || (window as any)._env_api_key || '');
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, count }: { to: string, icon: any, label: string, count?: number }) => (
    <Link
      to={to}
      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-150 mb-1 ${
        isActive(to) 
          ? 'bg-brand-600 text-white shadow-sm' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive(to) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className={`text-xs py-0.5 px-2 rounded-full ${isActive(to) ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
          {count}
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* Sidebar - Phelix Style: Dark Navy */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1120] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        {/* Logo Area - Zen AI Fax Branding */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Professional Zen Logo */}
            <div className="relative flex-shrink-0">
               <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="10" fill="url(#paint0_linear)" />
                  {/* Stylized Z representing speed and connection */}
                  <path d="M11 12H26.5C27.8807 12 29 13.1193 29 14.5V14.5C29 15.4956 28.4688 16.4021 27.6 16.8889L13.4 24.1111C12.5312 24.5979 12 25.5044 12 26.5V26.5C12 27.8807 13.1193 29 14.5 29H29" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="28" cy="13" r="2" fill="white" fillOpacity="0.9"/>
                  <circle cx="13" cy="28" r="2" fill="white" fillOpacity="0.9"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6"/>
                      <stop offset="1" stopColor="#1D4ED8"/>
                    </linearGradient>
                  </defs>
               </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-none">Zen AI Fax</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-none mt-1">Intelligent Intake</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Workspace</div>
          <NavItem to="/" icon={Inbox} label="Inbox" count={4} />
          <NavItem to="/referrals" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/patients" icon={Users} label="Patients" />
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 mt-8">System</div>
          <NavItem to="/reports" icon={FileText} label="Reports" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </div>

        {/* User Profile - Bottom */}
        <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3 p-1 rounded-lg cursor-pointer transition-colors group hover:bg-slate-800">
            <div className="h-8 w-8 rounded bg-brand-600 flex items-center justify-center text-white font-medium text-xs shadow-sm ring-2 ring-transparent group-hover:ring-brand-500 transition-all">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. John Doe</p>
              <p className="text-xs text-slate-400 truncate">Cardiology</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header - Minimalist White */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Global Search - Phelix Style */}
            <div className="hidden md:flex relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border-0 bg-slate-100 rounded-md leading-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-600 sm:text-sm transition-all"
                placeholder="Search for patients, referral IDs, or diagnoses..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Status Indicator */}
            { apiKey ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-medium">System Online</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full border border-red-100">
                   <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                   <span className="text-xs font-medium">API Key Missing</span>
                </div>
            )}

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
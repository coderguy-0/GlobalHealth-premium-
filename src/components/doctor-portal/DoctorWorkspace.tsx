import React, { useState } from 'react';
import {
  LayoutDashboard, CalendarDays, Clock3, CalendarClock, UserRound, BadgeCheck, Building2,
  Users, MessagesSquare, Bell, ArrowLeftRight, FileText, FolderLock, ShieldCheck, KeyRound,
  ScrollText, BarChart3, CircleHelp, LifeBuoy, LogOut, Activity, ChevronDown, Search
} from 'lucide-react';
import { useDoctorPortal, WorkspaceView, FACILITIES } from './doctorPortalData';
import { DoctorDashboard } from './DoctorDashboard';
import { DoctorAppointments } from './DoctorAppointments';
import { DoctorAvailability } from './DoctorAvailability';
import { DoctorProfileView } from './DoctorProfile';
import { DoctorCredentials } from './DoctorCredentials';
import { DoctorAffiliations } from './DoctorAffiliations';
import { DoctorSecurity } from './DoctorSecurity';
import { DoctorCommunication } from './DoctorCommunication';
import { DoctorHelp } from './DoctorHelp';

interface DoctorWorkspaceProps {
  onBackToGlobalHealth: () => void;
  onLogout: () => void;
}

interface NavItem {
  view: WorkspaceView;
  label: string;
  icon: React.ReactNode;
  group: string;
  /** Clinical modules only appear when the doctor is authorized + org supports them. */
  clinicalOnly?: boolean;
}

const NAV: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, group: 'Overview' },
  { view: 'profile', label: 'Profile', icon: <UserRound className="h-4 w-4" />, group: 'Practice' },
  { view: 'credentials', label: 'Credentials', icon: <BadgeCheck className="h-4 w-4" />, group: 'Practice' },
  { view: 'affiliations', label: 'Practice Locations', icon: <Building2 className="h-4 w-4" />, group: 'Practice' },
  { view: 'calendar', label: 'Calendar', icon: <CalendarDays className="h-4 w-4" />, group: 'Schedule' },
  { view: 'availability', label: 'Availability', icon: <Clock3 className="h-4 w-4" />, group: 'Schedule' },
  { view: 'appointments', label: 'Appointments', icon: <CalendarClock className="h-4 w-4" />, group: 'Schedule' },
  { view: 'patients', label: 'Patients', icon: <Users className="h-4 w-4" />, group: 'Clinical', clinicalOnly: true },
  { view: 'referrals', label: 'Referrals', icon: <ArrowLeftRight className="h-4 w-4" />, group: 'Clinical', clinicalOnly: true },
  { view: 'documents', label: 'Documents', icon: <FolderLock className="h-4 w-4" />, group: 'Clinical', clinicalOnly: true },
  { view: 'messages', label: 'Messages', icon: <MessagesSquare className="h-4 w-4" />, group: 'Communication' },
  { view: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, group: 'Communication' },
  { view: 'insights', label: 'Practice Insights', icon: <BarChart3 className="h-4 w-4" />, group: 'Insights' },
  { view: 'security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" />, group: 'Security' },
  { view: 'sessions', label: 'Sessions', icon: <KeyRound className="h-4 w-4" />, group: 'Security' },
  { view: 'delegated', label: 'Delegated Access', icon: <Users className="h-4 w-4" />, group: 'Security' },
  { view: 'audit', label: 'Audit Log', icon: <ScrollText className="h-4 w-4" />, group: 'Security' },
  { view: 'help', label: 'Help Center', icon: <CircleHelp className="h-4 w-4" />, group: 'Support' },
  { view: 'support', label: 'Contact Support', icon: <LifeBuoy className="h-4 w-4" />, group: 'Support' },
];

const GROUPS = ['Overview', 'Practice', 'Schedule', 'Clinical', 'Communication', 'Insights', 'Security', 'Support'];

/** Compact mobile bottom navigation — only the most important areas. */
const MOBILE_NAV: WorkspaceView[] = ['dashboard', 'appointments', 'calendar', 'profile', 'notifications'];

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({ onBackToGlobalHealth, onLogout }) => {
  const { doctor, activeFacilityId, setActiveFacility, notifications } = useDoctorPortal();
  const [view, setView] = useState<WorkspaceView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeFacility = FACILITIES.find((f) => f.id === activeFacilityId) || FACILITIES[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const go = (v: WorkspaceView) => { setView(v); setSidebarOpen(false); window.scrollTo({ top: 0 }); };

  const activeLabel = NAV.find((n) => n.view === view)?.label || 'Dashboard';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <button onClick={onBackToGlobalHealth} className="flex cursor-pointer items-center gap-2 text-left">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-medical-500 to-medical-800 text-white">
              <Activity className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-extrabold leading-tight tracking-tight text-slate-900">GlobalHealth</span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-medical-700">Doctor Portal</span>
            </span>
          </button>

          <span className="mx-1 hidden h-5 w-px bg-slate-200 md:block" aria-hidden="true" />
          <h1 className="hidden text-sm font-bold text-slate-700 md:block">{activeLabel}</h1>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-medical-200 hover:text-medical-800"
              aria-label="Search your portal"
            >
              <Search className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Search your portal…</span>
            </button>
            <button
              type="button"
              onClick={() => go('notifications')}
              className="relative cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-medical-200 hover:text-medical-800"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-medical-600 text-[9px] font-bold text-white">{unreadCount}</span>
              )}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Facility switcher — active organization is always obvious */}
        <div className="border-t border-slate-100 px-4 py-1.5">
          <div className="relative inline-block">
            <button
              type="button"
              onClick={() => setFacilityOpen(!facilityOpen)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-medical-50 px-2.5 py-1 text-xs font-bold text-medical-800 transition hover:bg-medical-100"
              aria-expanded={facilityOpen}
            >
              <Building2 className="h-3.5 w-3.5 text-medical-600" />
              {activeFacility.name}
              <ChevronDown className="h-3 w-3" />
            </button>
            {facilityOpen && (
              <div className="absolute left-0 top-full z-40 mt-1 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-lift">
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Current practice location</p>
                {FACILITIES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setActiveFacility(f.id); setFacilityOpen(false); }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold transition ${
                      f.id === activeFacilityId ? 'bg-medical-50 text-medical-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      <span className="block">{f.name}</span>
                      <span className="block text-[10px] font-normal text-slate-400">{f.address}</span>
                    </span>
                    {f.id === activeFacilityId && <BadgeCheck className="h-4 w-4 text-medical-600" />}
                  </button>
                ))}
                <p className="mt-1 border-t border-slate-100 px-2 pt-1.5 text-[10px] text-slate-400">Data shown is scoped to the selected organization.</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global portal search (authorized resources only) */}
      {searchOpen && <PortalSearch onNavigate={go} onClose={() => setSearchOpen(false)} />}

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
          <nav className="sticky top-[104px] max-h-[calc(100vh-112px)] overflow-y-auto p-3" aria-label="Doctor portal navigation">
            {GROUPS.map((group) => {
              const items = NAV.filter((n) => n.group === group && !n.clinicalOnly);
              if (!items.length) return null;
              return (
                <div key={group} className="mb-3">
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</p>
                  <div className="space-y-0.5">
                    {items.map((item) => (
                      <button
                        key={item.view}
                        type="button"
                        onClick={() => go(item.view)}
                        aria-current={view === item.view ? 'page' : undefined}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                          view === item.view ? 'bg-medical-600 text-white shadow-sm' : 'text-slate-600 hover:bg-medical-50 hover:text-medical-800'
                        }`}
                      >
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="mt-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={onBackToGlobalHealth}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                <Activity className="h-4 w-4" /> Back to GlobalHealth
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-slate-950/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-3 shadow-lift">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="text-sm font-extrabold text-slate-900">Doctor Portal</span>
                <button type="button" onClick={() => setSidebarOpen(false)} className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close navigation">✕</button>
              </div>
              {GROUPS.map((group) => {
                const items = NAV.filter((n) => n.group === group && !n.clinicalOnly);
                if (!items.length) return null;
                return (
                  <div key={group} className="mb-3">
                    <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</p>
                    {items.map((item) => (
                      <button key={item.view} type="button" onClick={() => go(item.view)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                          view === item.view ? 'bg-medical-600 text-white' : 'text-slate-600 hover:bg-medical-50'
                        }`}>
                        {item.icon} {item.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <DoctorProfileBanner />
            {view === 'dashboard' && <DoctorDashboard onNavigate={go} />}
            {view === 'appointments' && <DoctorAppointments />}
            {view === 'calendar' && <DoctorAppointments calendarMode />}
            {view === 'availability' && <DoctorAvailability />}
            {view === 'profile' && <DoctorProfileView />}
            {view === 'credentials' && <DoctorCredentials />}
            {view === 'affiliations' && <DoctorAffiliations />}
            {view === 'patients' && <PatientsPlaceholder onNavigate={go} />}
            {view === 'referrals' && <DoctorCommunication section="referrals" />}
            {view === 'documents' && <DoctorCommunication section="documents" />}
            {view === 'messages' && <DoctorCommunication section="messages" />}
            {view === 'notifications' && <DoctorCommunication section="notifications" />}
            {view === 'insights' && <DoctorCommunication section="insights" />}
            {view === 'security' && <DoctorSecurity section="security" />}
            {view === 'sessions' && <DoctorSecurity section="sessions" />}
            {view === 'delegated' && <DoctorSecurity section="delegated" />}
            {view === 'audit' && <DoctorSecurity section="audit" />}
            {view === 'help' && <DoctorHelp section="help" />}
            {view === 'support' && <DoctorHelp section="support" />}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation — compact, most important areas only */}
      <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden" aria-label="Mobile portal navigation">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((v) => {
            const item = NAV.find((n) => n.view === v)!;
            return (
              <button key={v} type="button" onClick={() => go(v)}
                className={`flex cursor-pointer flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${
                  view === v ? 'text-medical-700' : 'text-slate-400 hover:text-slate-600'
                }`}>
                {item.icon} {v === 'notifications' && unreadCount > 0 ? `Notifications (${unreadCount})` : item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

/** Compact header strip: greeting + verification/profile state. */
const DoctorProfileBanner: React.FC = () => {
  const { doctor, activeFacilityId } = useDoctorPortal();
  const facility = FACILITIES.find((f) => f.id === activeFacilityId);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">{greeting}, {doctor.displayName}</h2>
        <p className="text-xs text-slate-500">{doctor.professionalTitle} · {doctor.specialty} · {facility?.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
          doctor.verificationStatus === 'verified'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          {doctor.verificationStatus === 'verified' ? <BadgeCheck className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {doctor.verificationStatus === 'verified' ? 'Verified Professional' : 'Verification in progress'}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
          <FileText className="h-3.5 w-3.5 text-medical-600" /> Profile {doctor.profileCompleteness}%
        </span>
      </div>
    </div>
  );
};

/** Authorized-resource search (never returns unauthorized records). */
const PortalSearch: React.FC<{ onNavigate: (v: WorkspaceView) => void; onClose: () => void }> = ({ onNavigate, onClose }) => {
  const { appointments, referrals, documents, activeFacilityId } = useDoctorPortal();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const scopedAppointments = appointments.filter((a) => a.facilityId === activeFacilityId);
  const results = query
    ? {
        appointments: scopedAppointments.filter((a) => a.patientIdentifier.toLowerCase().includes(query) || a.date.includes(query)).slice(0, 4),
        referrals: referrals.filter((r) => r.patientIdentifier.toLowerCase().includes(query) || r.specialty.toLowerCase().includes(query)).slice(0, 3),
        documents: documents.filter((d) => d.name.toLowerCase().includes(query)).slice(0, 3),
      }
    : { appointments: [], referrals: [], documents: [] };
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/30 p-4 pt-16" onClick={onClose} role="dialog" aria-modal="true" aria-label="Portal search">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search appointments, patients, documents… (authorized records only)"
          className="w-full rounded-xl border border-medical-200 bg-medical-50/40 px-3 py-2.5 text-sm focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20"
          aria-label="Search your portal"
        />
        {query && (
          <div className="mt-3 space-y-2 text-xs">
            {results.appointments.map((a) => (
              <button key={a.id} type="button" onClick={() => onNavigate('appointments')}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-medical-200">
                <span className="font-bold text-slate-700">{a.patientIdentifier} — {a.date} {a.startTime}</span>
                <span className="text-[10px] font-semibold text-slate-400">{a.type.replace('_', ' ')}</span>
              </button>
            ))}
            {results.referrals.map((r) => (
              <button key={r.id} type="button" onClick={() => onNavigate('referrals')}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-medical-200">
                <span className="font-bold text-slate-700">Referral · {r.patientIdentifier} → {r.specialty}</span>
                <span className="text-[10px] font-semibold capitalize text-slate-400">{r.status}</span>
              </button>
            ))}
            {results.documents.map((d) => (
              <button key={d.id} type="button" onClick={() => onNavigate('documents')}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:border-medical-200">
                <span className="font-bold text-slate-700">{d.name}</span>
                <span className="text-[10px] font-semibold text-slate-400">{d.sizeKB} KB</span>
              </button>
            ))}
            {!results.appointments.length && !results.referrals.length && !results.documents.length && (
              <p className="rounded-xl bg-slate-50 p-3 text-center text-[11px] text-slate-400">No authorized records match “{q}”.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** Clinical workspace placeholder — clearly access-controlled, not a mock EHR. */
const PatientsPlaceholder: React.FC<{ onNavigate: (v: WorkspaceView) => void }> = ({ onNavigate }) => (
  <div className="rounded-3xl border border-medical-100/90 bg-white p-8 text-center shadow-lift">
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-medical-50 text-medical-700 ring-1 ring-medical-100">
      <Users className="h-7 w-7" />
    </div>
    <h2 className="mt-4 text-lg font-extrabold text-slate-900">Clinical Workspace</h2>
    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
      Patient records, clinical notes and encounters are not exposed here. They are activated only when your
      organization supports the Clinical Workspace and your role is authorized for it — with server-side
      patient scoping, audit logging and versioning. No UI mock-up is presented as a real EHR.
    </p>
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={() => onNavigate('referrals')} className="cursor-pointer rounded-xl bg-medical-600 px-4 py-2 text-xs font-bold text-white hover:bg-medical-700">Referrals</button>
      <button type="button" onClick={() => onNavigate('documents')} className="cursor-pointer rounded-xl border border-medical-200 bg-white px-4 py-2 text-xs font-bold text-medical-700 hover:bg-medical-50">Secure Documents</button>
    </div>
  </div>
);

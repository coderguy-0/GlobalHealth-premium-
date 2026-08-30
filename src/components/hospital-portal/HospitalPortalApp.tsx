import React, { useState } from 'react';
import { HospitalPortalProvider, useHospitalPortal, HospitalOrganization, StaffRole, seedOrganizations } from './hospitalPortalData';
import { HospitalAuth } from './HospitalAuth';
import { HospitalOnboarding } from './HospitalOnboarding';
import { HospitalWorkspace } from './HospitalWorkspace';

interface HospitalPortalAppProps {
  onBackToGlobalHealth: () => void;
}

type Phase = 'auth' | 'onboarding' | 'workspace';

const Inner: React.FC<HospitalPortalAppProps> = ({ onBackToGlobalHealth }) => {
  const { organization, setActiveHospital, setOrganizations } = useHospitalPortal();
  const [phase, setPhase] = useState<Phase>('auth');

  // Auth gate: hospital data is only mounted inside the workspace after login.
  const enterWorkspace = (orgs: HospitalOrganization[], role: StaffRole) => {
    setOrganizations(orgs);
    setActiveHospital(orgs[0]?.id ?? organization.id);
    // A fresh hospital (no legal name yet) goes through the registration wizard.
    setPhase(orgs[0]?.legalName ? 'workspace' : 'onboarding');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {phase === 'auth' && (
        <HospitalAuth
          onBackToGlobalHealth={onBackToGlobalHealth}
          onLoginSuccess={enterWorkspace}
        />
      )}
      {phase === 'onboarding' && (
        <HospitalOnboarding
          workEmail={organization.publicEmail}
          onComplete={(h: HospitalOrganization) => { setOrganizations([h]); setActiveHospital(h.id); setPhase('workspace'); }}
          onBack={() => setPhase('auth')}
        />
      )}
      {phase === 'workspace' && (
        <HospitalWorkspace onBackToGlobalHealth={onBackToGlobalHealth} onLogout={() => setPhase('auth')} />
      )}
    </div>
  );
};

export const HospitalPortalApp: React.FC<HospitalPortalAppProps> = ({ onBackToGlobalHealth }) => {
  return (
    <HospitalPortalProvider initialOrganizations={seedOrganizations} initialRole="owner">
      <Inner onBackToGlobalHealth={onBackToGlobalHealth} />
    </HospitalPortalProvider>
  );
};

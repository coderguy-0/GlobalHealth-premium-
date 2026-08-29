import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LocalizationProvider } from './context/LocalizationContext';
import { PatientEhrProvider } from './context/PatientEhrContext';
import { HospitalProvider } from './context/HospitalContext';
import { PharmacyProvider } from './context/PharmacyContext';
import { BiomedicalProvider } from './context/BiomedicalContext';
import { DiagnosticProvider } from './context/DiagnosticContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Wraps providers that hold user-private state and REMOUNTS them whenever the
// authenticated identity changes. This guarantees that on logout or account
// switch, every in-memory private state (EHR, pharmacy, diagnostics, etc.) is
// destroyed and rebuilt fresh for the new identity — no stale User A data can
// ever be rendered for User B or for a guest.
function IdentityScopedProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const scope = user ? user.id : 'guest';
  return (
    <PatientEhrProvider key={`ehr-${scope}`}>
      <HospitalProvider key={`hosp-${scope}`}>
        <DiagnosticProvider key={`diag-${scope}`}>
          <PharmacyProvider key={`pharm-${scope}`}>
            <BiomedicalProvider key={`bio-${scope}`}>{children}</BiomedicalProvider>
          </PharmacyProvider>
        </DiagnosticProvider>
      </HospitalProvider>
    </PatientEhrProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider>
      <AuthProvider>
        <IdentityScopedProviders>
          <App />
        </IdentityScopedProviders>
      </AuthProvider>
    </LocalizationProvider>
  </StrictMode>,
);

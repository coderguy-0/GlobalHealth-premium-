/* ============================================================================
   GlobalHealth audit event contract.

   Every sensitive action (record access, consent, prescription signing, lab
   review, referral, messaging, auth, profile/permission change) is recorded as
   an immutable-ish audit event. The UI should never be the only audit source;
   a backend store will replace this module's in-memory sink.
   ========================================================================== */

export type AuditOutcome = 'success' | 'denied' | 'blocked';

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET' | '2FA_CHANGED'
  | 'PATIENT_RECORD_VIEW' | 'PATIENT_RECORD_ACCESS_DENIED'
  | 'CONSENT_REQUEST' | 'CONSENT_APPROVED' | 'CONSENT_DENIED' | 'CONSENT_REVOKED'
  | 'PRESCRIPTION_CREATED' | 'PRESCRIPTION_SIGNED' | 'PRESCRIPTION_SENT_PHARMACY'
  | 'LAB_ORDER_CREATED' | 'LAB_REVIEWED'
  | 'IMAGING_ORDER_CREATED' | 'IMAGING_REVIEWED'
  | 'REFERRAL_CREATED' | 'REFERRAL_UPDATED'
  | 'MESSAGE_SENT' | 'PROFILE_CHANGED' | 'PERMISSION_CHANGED'
  | 'APPOINTMENT_CHANGED' | 'SCHEDULE_CHANGED' | 'DOCUMENT_UPLOADED'
  | 'VITALS_RECORDED' | 'CLINICAL_NOTE_CREATED'
  | 'CONSULTATION_CREATED' | 'CONSULTATION_COMPLETED' | 'BILLING_CHANGED';

export interface AuditEventInput {
  actorId: string;
  actorRole: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  patientId?: string | null;
  detail?: string;
  outcome?: AuditOutcome;
  ip?: string;
  location?: string;
  timestamp?: string;
}

export interface AuditEvent extends AuditEventInput {
  id: string;
  timestamp: string;
}

let counter = 0;

export function createAuditEvent(input: AuditEventInput): AuditEvent {
  counter += 1;
  return {
    id: `AUD-${Date.now()}-${counter}`,
    timestamp: new Date().toISOString(),
    outcome: 'success',
    ...input,
    detail: input.detail || input.action.replace(/_/g, ' ').toLowerCase(),
  };
}

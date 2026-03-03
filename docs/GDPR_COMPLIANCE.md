# GDPR Compliance Guide

## Overview

ElderConnect+ is designed with GDPR compliance as a core feature. This document outlines our compliance approach and implementation.

## Core Principles

### 1. Data Minimization
We only collect data that is necessary for providing the service.

**Implementation**:
- User signup only requires: email, password, name, role
- Optional fields are clearly marked
- No unnecessary tracking or analytics
- Regular audit of data collection

### 2. Lawful Basis for Processing

We process personal data under these bases:

| Data | Basis | Purpose |
|------|-------|---------|
| Account info (email, name) | Contract | Service provision |
| Health check-ins | Consent | Health tracking |
| Location data | Consent | Location-based matching |
| Communication logs | Contract | Service improvement |
| Emergency alert history | Vital interest | Safety |
| Audit logs | Legal obligation | Compliance |

### 3. User Consent

**Explicit Consent Required For**:
- Health data collection
- Location data sharing
- Family member access
- Marketing communications
- Emergency services access

**Implementation**:
```dart
// Consent checkbox in signup
CheckboxListTile(
  title: const Text('I agree to health data collection and processing'),
  value: _dataConsent,
  onChanged: (value) => setState(() => _dataConsent = value ?? false),
)
```

Database records:
```sql
ALTER TABLE users ADD COLUMN data_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN consent_date TIMESTAMP WITH TIME ZONE;
```

### 4. Transparency

**Privacy Policy**:
- Clear, plain language
- Specific about data usage
- Easy to understand
- Available before signup

**Data Processing**:
```sql
-- Audit log shows all data access
CREATE TABLE audit_logs (
  user_id UUID,
  action VARCHAR(20),  -- CREATE, READ, UPDATE, DELETE
  table_name VARCHAR(100),
  record_id UUID,
  created_at TIMESTAMP,
  ip_address INET
);
```

## User Rights Implementation

### 1. Right to Access (Article 15)

Users can download their data:

```sql
CREATE TABLE gdpr_export_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  request_date TIMESTAMP,
  status VARCHAR(20),  -- PENDING, COMPLETED, FAILED
  export_format VARCHAR(10),  -- JSON, CSV
  file_url TEXT,
  download_expires_at TIMESTAMP
);
```

**Process**:
1. User requests data export via Settings
2. System generates JSON file with:
   - User profile
   - Health check-ins
   - Messages (conversation partners noted)
   - Emergency alerts
   - Activity history
3. File available for 7 days
4. Logged in audit trail

**Implementation (Edge Function)**:
```typescript
// functions/export-user-data/index.ts
export async function handleExportRequest(userId: string) {
  const userData = await supabase
    .from('users')
    .select('*')
    .eq('id', userId);
  
  const healthData = await supabase
    .from('health_checkins')
    .select('*')
    .eq('user_id', userId);
  
  // Combine and create JSON file
  const exportData = {
    exported_at: new Date().toISOString(),
    user: userData,
    health_checkins: healthData,
    // ... other data
  };
  
  // Store in S3 and return URL
  return uploadToStorage(exportData, userId);
}
```

### 2. Right to Deletion (Article 17)

Users can request account deletion:

```sql
CREATE TABLE gdpr_deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  request_date TIMESTAMP,
  status VARCHAR(20),  -- PENDING, APPROVED, IN_PROGRESS, COMPLETED
  reason TEXT,
  completed_date TIMESTAMP
);
```

**Soft Delete Approach**:
```sql
-- Don't physically delete, mark as deleted
UPDATE users SET deleted_at = NOW() WHERE id = $1;
UPDATE health_checkins SET deleted_at = NOW() WHERE user_id = $1;
UPDATE messages SET deleted_at = NOW() WHERE sender_id = $1 OR recipient_id = $1;
```

**Timeline**:
- 30-day notice period (can cancel)
- After 30 days, data marked for deletion
- Permanent deletion after 90 days
- Retain minimal audit logs (anonymized)

### 3. Right to Rectification (Article 16)

Users can update their data:

```dart
// In profile editing screen
ElevatedButton(
  onPressed: () => updateProfile(
    firstName: _firstNameController.text,
    lastName: _lastNameController.text,
    bio: _bioController.text,
  ),
  child: const Text('Save Changes'),
)
```

**Implementation**:
- Direct edit in app
- Changes logged in audit trail
- Immediate effectiveness
- Version history maintained

### 4. Right to Restriction (Article 18)

Users can restrict how their data is used:

```sql
ALTER TABLE users ADD COLUMN data_restrictions JSONB;
-- Example: {"no_volunteer_matching": true, "no_analytics": true}
```

### 5. Right to Data Portability (Article 20)

Data export in machine-readable format:

```dart
// User downloads as JSON
final exportUrl = await ref.read(
  userDataExportProvider(userId).future,
);
// File contains portable format
```

### 6. Right to Object (Article 21)

Users can opt-out of certain processing:

```sql
-- User preferences
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{
  "email_notifications": false,
  "sms_notifications": false,
  "marketing": false,
  "analytics": false
}'::jsonb;
```

## Data Protection

### 1. Encryption

**In Transit**:
- HTTPS/TLS 1.2+
- All API calls encrypted
- Supabase handles automatically

**At Rest**:
```sql
-- Sensitive fields encrypted
CREATE EXTENSION pgcrypto;

ALTER TABLE users ADD COLUMN phone_number_encrypted bytea;
-- Use Supabase encrypted fields:
UPDATE users SET phone_number_encrypted = pgp_sym_encrypt(phone_number, 'encryption_key');
```

### 2. Access Control

**Row Level Security (RLS)**:
```sql
-- Users can only see their own health data
CREATE POLICY "Users can view own health data"
  ON health_checkins FOR SELECT
  USING (user_id = auth.uid());

-- Family members with permission
CREATE POLICY "Family can view shared health data"
  ON health_checkins FOR SELECT
  USING (
    user_id IN (
      SELECT elder_id FROM family_access 
      WHERE family_member_id = auth.uid() AND verified = TRUE
    )
  );
```

### 3. Authentication & Authorization

```dart
// Multi-level access control
enum AccessLevel {
  none,
  viewHealth,
  viewAll,
  editProfile,
}

class FamilyAccess {
  final String elderId;
  final String familyMemberId;
  final AccessLevel accessLevel;
  final bool verified;
}
```

## Data Retention

### Retention Policy

```sql
-- Soft delete after 1 year of inactivity
DELETE FROM users 
WHERE last_login < NOW() - INTERVAL '1 year'
  AND deleted_at IS NOT NULL;

-- Archive old messages (after 2 years)
ALTER TABLE messages 
ADD CONSTRAINT archive_old_messages
  CHECK (created_at > NOW() - INTERVAL '2 years');

-- Keep audit logs for 7 years (legal requirement)
```

### Data Cleanup Schedule

```
Every Month:
- Clean up expired verification tokens
- Delete expired GDPR deletion requests
- Archive old messages

Every Year:
- Soft delete inactive users
- Anonymize old health data
- Purge temporary files
```

## International Transfers

**No International Transfers**:
- All data stored within EU/UK
- Supabase EU region
- No data sharing with third parties
- Explicit no-transfer policy

## Third-Party Integrations

| Service | Purpose | Data | Transfer | Compliance |
|---------|---------|------|----------|------------|
| Stripe | Payments | Name, Email | US | SCCs, DPA |
| Jitsi | Video calls | Session ID | EU | GDPR |
| Firebase | Analytics (optional) | Anonymized | US | SCCs |

**Implementation**:
```dart
// Users can opt-out
if (preferences['analytics'] == false) {
  return;  // Don't send to Firebase
}
```

## Compliance Checklist

- [x] Privacy Policy (clear and accessible)
- [x] Cookie/tracking consent
- [x] Data processing agreements
- [x] Encryption (in transit & at rest)
- [x] Access logs (audit trails)
- [x] Data minimization
- [x] User rights implementation
- [x] Data retention policies
- [x] Staff training on GDPR
- [x] Incident response plan
- [x] Data Protection Officer (if required)
- [x] DPIA (Data Protection Impact Assessment)

## Incident Response

### Data Breach Protocol

1. **Detect**: Audit logs monitored 24/7
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Notify**: ICO within 72 hours
5. **Communicate**: Notify users if high risk
6. **Document**: Record in audit logs

```sql
CREATE TABLE incident_reports (
  id UUID PRIMARY KEY,
  report_date TIMESTAMP,
  description TEXT,
  affected_records INTEGER,
  severity VARCHAR(20),
  status VARCHAR(20),
  resolution TEXT
);
```

## Documentation

### Required Documentation

1. **Privacy Policy**: Publicly available
2. **Terms of Service**: User acknowledgment
3. **Data Processing Agreement**: For volunteers/professionals
4. **DPIA**: Data Protection Impact Assessment
5. **Retention Schedule**: Clear policy
6. **Staff Training**: GDPR compliance training

## Monitoring & Auditing

### Continuous Monitoring

```sql
-- Alert on suspicious access patterns
CREATE VIEW suspicious_access AS
SELECT 
  user_id,
  COUNT(*) as access_count,
  COUNT(DISTINCT table_name) as tables_accessed
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id
HAVING COUNT(*) > 100;  -- Threshold
```

### Regular Audits

- **Monthly**: Review access logs
- **Quarterly**: GDPR compliance audit
- **Annually**: Full security assessment
- **On-demand**: User complaints

## Contact & Support

**Data Protection Officer**: privacy@elderconnect.plus
**Complaints**: gdpr@elderconnect.plus
**Data Requests**: dataaccess@elderconnect.plus

---

## References

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO GDPR Guidance](https://ico.org.uk/for-organisations/gdpr/)
- [Supabase GDPR](https://supabase.com/docs/guides/auth)
- [OWASP Privacy](https://owasp.org/www-project-privacy-risks/)

**Last Updated**: 2024
**Next Review**: 2025

/**
 * Single source of truth for the app's identity and legal/contact details.
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  EDIT THE VALUES BELOW BEFORE PUBLISHING.                              │
 * │  They are injected into the Privacy Policy, Terms of Service, About    │
 * │  and Help Center screens (in both English and Bulgarian), so changing  │
 * │  them here updates every screen at once.                               │
 * └───────────────────────────────────────────────────────────────────────┘
 */
export const AppInfo = {
  /** The public product / brand name shown to users. */
  appName: 'U&I',

  /**
   * The person or company legally responsible for the app (the GDPR "data
   * controller"). Use your registered company name, or your full legal name if
   * you operate as an individual. This appears in the Privacy Policy and Terms,
   * so it must be a real legal identity — not the brand name.  ← REPLACE
   */
  legalEntity: 'Aleksandra Lyubomirova Kostova',

  /**
   * A mailbox you actually monitor. This is where privacy requests, support
   * questions and legal notices are sent.  ← REPLACE
   */
  supportEmail: 'uandi.app@gmail.com',

  /** Your marketing / landing website, if you have one.  ← REPLACE (or leave). */
  websiteUrl: 'https://your-domain.com',

  /**
   * The country whose laws govern the Terms and where the app is operated.
   * Bulgaria is assumed (EU / GDPR applies).  ← REPLACE if different.
   */
  governingCountry: 'Bulgaria',

  /**
   * The date the current Privacy Policy / Terms took effect. Update this every
   * time you change the legal text.  ← REPLACE on each revision.
   */
  effectiveDate: 'August 24, 2026',

  /**
   * Minimum age to use the app. Under EU GDPR the age of digital consent is 16
   * in Bulgaria; lower it only if you have a lawful basis and parental consent
   * flow.  ← REVIEW.
   */
  minAge: 16,
} as const;

export type AppInfoShape = typeof AppInfo;

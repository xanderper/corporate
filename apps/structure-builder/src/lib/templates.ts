/**
 * @file templates.ts
 * @description Starter documents. Illustrative only — not legal advice.
 */

import { CURRENT_SCHEMA_VERSION, type StructureDocument } from './types';
import { DEFAULT_PREFERENCES, DEFAULT_SETTINGS } from './constants';
import { createEmptyDocument } from './model';

export type TemplateKey = 'qorve' | 'blank';

const QORVE_TEMPLATE: StructureDocument = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  chartTitle: 'Qorve operating model',
  chartSubtitle: 'Illustrative regulated structure — ownership, activities, products and licences',
  entities: [
    { id: 'q0', name: 'Founder', type: 'NaturalPerson', status: 'active', color: 'amber', jurisdiction: 'Netherlands', notes: 'Ultimate beneficial owner via STAK certificates', x: 400, y: 40 },
    { id: 'q7', name: 'Stichting Administratiekantoor Virex', type: 'STAK', status: 'active', color: 'purple', jurisdiction: 'Netherlands', description: 'Holds the legal title to the shares in the group holding and issues depositary receipts', x: 400, y: 200 },
    { id: 'q1', name: 'Virex Holding Group B.V.', type: 'BV', status: 'active', color: 'green', jurisdiction: 'Netherlands', regNumber: '84729103', description: 'Top holding company for the Virex ecosystem', x: 400, y: 360 },
    { id: 'q2', name: 'Qorve Holding B.V.', type: 'BV', status: 'active', color: 'green', jurisdiction: 'Netherlands', regNumber: '85930214', description: 'Intermediate holding for the financial services cluster', x: 400, y: 520 },
    { id: 'q3', name: 'Qorve Bank N.V.', type: 'NV', status: 'planned', color: 'blue', jurisdiction: 'Netherlands', description: 'Prospective credit institution for deposits, payments and lending', x: 60, y: 700 },
    { id: 'q4', name: 'Qorve Technology B.V.', type: 'BV', status: 'active', color: 'blue', jurisdiction: 'Netherlands', regNumber: '86302914', description: 'Platform engineering, IP and ICT infrastructure', x: 300, y: 700 },
    { id: 'q5', name: 'Qorve Digital Assets B.V.', type: 'BV', status: 'in_incorporation', color: 'blue', jurisdiction: 'Netherlands', description: 'Prospective crypto-asset service provider', x: 540, y: 700 },
    { id: 'q6', name: 'Stichting Qorve Asset Safekeeping', type: 'Stichting', status: 'planned', color: 'purple', jurisdiction: 'Netherlands', description: 'Independent foundation for bankruptcy-remote segregation of client crypto-assets', x: 780, y: 700 }
  ],
  relationships: [
    { id: 'qe0', kind: 'certificates', from: 'q0', to: 'q7', certificatePct: 100 },
    { id: 'qe1', kind: 'ownership', from: 'q7', to: 'q1', sharePct: 100, votingPct: null, economicPct: null },
    { id: 'qe2', kind: 'ownership', from: 'q1', to: 'q2', sharePct: 100, votingPct: null, economicPct: null },
    { id: 'qe3', kind: 'ownership', from: 'q2', to: 'q3', sharePct: 100, votingPct: null, economicPct: null },
    { id: 'qe4', kind: 'ownership', from: 'q2', to: 'q4', sharePct: 100, votingPct: null, economicPct: null },
    { id: 'qe5', kind: 'ownership', from: 'q2', to: 'q5', sharePct: 100, votingPct: null, economicPct: null },
    { id: 'qe6', kind: 'service', from: 'q4', to: 'q3', description: 'Technology services' },
    { id: 'qe7', kind: 'service', from: 'q4', to: 'q5', description: 'Technology services' },
    { id: 'qe8', kind: 'custody', from: 'q6', to: 'q5', description: 'Segregated safekeeping of client assets' },
    { id: 'qe9', kind: 'personnel', from: 'q2', to: 'q4', description: 'Shared personnel' }
  ],
  groups: [],
  activities: [
    { id: 'qa1', name: 'Accepting deposits', category: 'Financial services', status: 'planned', requiresLicence: true, requiredLicenceType: 'credit_institution', regulatoryRequirements: 'Banking licence (credit institution) — DNB / ECB', relatedActivityIds: [] },
    { id: 'qa2', name: 'Payment services', category: 'Payments', status: 'planned', requiresLicence: true, requiredLicenceType: 'credit_institution', relatedActivityIds: [] },
    { id: 'qa3', name: 'Lending and credit services', category: 'Lending & credit', status: 'planned', requiresLicence: true, requiredLicenceType: 'credit_institution', relatedActivityIds: [] },
    { id: 'qa4', name: 'Software development', category: 'Technology & infrastructure', status: 'operational', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa5', name: 'Intellectual property management', category: 'Technology & infrastructure', status: 'operational', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa6', name: 'ICT infrastructure', category: 'Technology & infrastructure', status: 'operational', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa7', name: 'Crypto-asset custody', category: 'Crypto-assets', status: 'in_development', requiresLicence: true, requiredLicenceType: 'mica_casp', regulatoryRequirements: 'MiCA CASP authorisation', relatedActivityIds: ['qa8'] },
    { id: 'qa8', name: 'Crypto exchange', category: 'Crypto-assets', status: 'in_development', requiresLicence: true, requiredLicenceType: 'mica_casp', relatedActivityIds: ['qa7'] },
    { id: 'qa9', name: 'KYC and transaction monitoring', category: 'Compliance, risk & legal', status: 'planned', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa10', name: 'Shared personnel services', category: 'Operations & administration', status: 'operational', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa11', name: 'Treasury operations', category: 'Custody & treasury', status: 'operational', requiresLicence: false, relatedActivityIds: [] },
    { id: 'qa12', name: 'Checkout operations', category: 'Payments', status: 'in_development', requiresLicence: false, relatedActivityIds: ['qa2'] }
  ],
  activityAssignments: [
    { id: 'qaa1', activityId: 'qa1', entityId: 'q3', role: 'performs' },
    { id: 'qaa2', activityId: 'qa2', entityId: 'q3', role: 'performs' },
    { id: 'qaa3', activityId: 'qa3', entityId: 'q3', role: 'performs' },
    { id: 'qaa4', activityId: 'qa4', entityId: 'q4', role: 'performs' },
    { id: 'qaa5', activityId: 'qa5', entityId: 'q4', role: 'performs' },
    { id: 'qaa6', activityId: 'qa6', entityId: 'q4', role: 'performs' },
    { id: 'qaa7', activityId: 'qa7', entityId: 'q5', role: 'performs' },
    { id: 'qaa8', activityId: 'qa7', entityId: 'q6', role: 'supports', notes: 'Legal segregation of client assets' },
    { id: 'qaa9', activityId: 'qa8', entityId: 'q5', role: 'performs' },
    { id: 'qaa10', activityId: 'qa9', entityId: 'q3', role: 'performs' },
    { id: 'qaa11', activityId: 'qa9', entityId: 'q4', role: 'supports', notes: 'Monitoring software' },
    { id: 'qaa12', activityId: 'qa10', entityId: 'q2', role: 'performs' },
    { id: 'qaa13', activityId: 'qa11', entityId: 'q2', role: 'performs' },
    { id: 'qaa14', activityId: 'qa12', entityId: 'q4', role: 'performs' }
  ],
  products: [
    { id: 'qp1', name: 'Qorve Checkout', description: 'Hosted checkout for merchants', status: 'in_development', activityIds: ['qa12', 'qa2'] },
    { id: 'qp2', name: 'Qorve Wallet', description: 'Consumer wallet for fiat and crypto-assets', status: 'concept', activityIds: ['qa7', 'qa8'] },
    { id: 'qp3', name: 'Qorve Pay', description: 'Account-to-account payments', status: 'concept', activityIds: ['qa2'] },
    { id: 'qp4', name: 'Merchant dashboard', description: 'Merchant reporting and settlement overview', status: 'in_development', activityIds: ['qa4'] }
  ],
  productAssignments: [
    { id: 'qpa1', productId: 'qp1', entityId: 'q3', role: 'provider' },
    { id: 'qpa2', productId: 'qp1', entityId: 'q4', role: 'dependency' },
    { id: 'qpa3', productId: 'qp2', entityId: 'q5', role: 'provider' },
    { id: 'qpa4', productId: 'qp2', entityId: 'q6', role: 'dependency' },
    { id: 'qpa5', productId: 'qp3', entityId: 'q3', role: 'provider' },
    { id: 'qpa6', productId: 'qp4', entityId: 'q4', role: 'provider' }
  ],
  licences: [
    { id: 'ql1', name: 'Banking licence (credit institution)', licenceType: 'credit_institution', authority: 'De Nederlandsche Bank (DNB) / ECB', holderEntityId: 'q3', status: 'planned', activityIds: ['qa1', 'qa2', 'qa3'], documents: [], notes: 'Preparatory discussions only' },
    { id: 'ql2', name: 'MiCA CASP authorisation', licenceType: 'mica_casp', authority: 'Autoriteit Financiële Markten (AFM)', holderEntityId: 'q5', status: 'in_preparation', activityIds: ['qa7', 'qa8'], documents: [], notes: 'Application file in preparation' }
  ],
  preferences: { ...DEFAULT_PREFERENCES, mode: 'ownership' },
  settings: { ...DEFAULT_SETTINGS }
};

const BLANK_TEMPLATE: StructureDocument = (() => {
  const doc = createEmptyDocument('New corporate structure', 'Corporate holding and ownership architecture');
  return {
    ...doc,
    entities: [
      { id: 'n1', name: 'Holding B.V.', type: 'BV', status: 'active', color: 'green', jurisdiction: 'Netherlands', x: 400, y: 100 }
    ]
  };
})();

export const TEMPLATES: Record<TemplateKey, { label: string; description: string; document: StructureDocument }> = {
  qorve: {
    label: 'Qorve operating model',
    description:
      'STAK-held Dutch group with a prospective bank, technology company, crypto-asset entity and an independent safekeeping foundation, including activities, products and licence applications.',
    document: QORVE_TEMPLATE
  },
  blank: {
    label: 'Blank canvas',
    description: 'A single holding company to start from.',
    document: BLANK_TEMPLATE
  }
};

/** Returns a fresh copy so editing never mutates the shared template object. */
export function instantiateTemplate(key: TemplateKey): StructureDocument {
  return structuredClone(TEMPLATES[key].document);
}

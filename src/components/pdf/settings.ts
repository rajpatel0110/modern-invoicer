import { TemplateProfessional } from './TemplateProfessional';
import { TemplateTax } from './TemplateTax';

// Maps template keys to their display names and component implementations.
export const templates = {
  professional: {
    name: 'Professional',
    component: TemplateProfessional,
  },
  tax: {
    name: 'Tax Invoice',
    component: TemplateTax,
  },
};

// Defines the available paper sizes for the PDF documents.
export const paperSizes = {
  A4: { name: 'A4', displayName: 'A4 (210mm x 297mm)' },
  Letter: { name: 'LETTER', displayName: 'Letter (8.5in x 11in)' },
  Legal: { name: 'LEGAL', displayName: 'Legal (8.5in x 14in)' },
};
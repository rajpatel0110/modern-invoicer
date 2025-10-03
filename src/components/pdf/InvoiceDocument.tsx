import React from 'react';
import { Document } from '@react-pdf/renderer';
import { InvoiceTemplate } from './InvoiceTemplate';

type InvoiceDocumentProps = {
  invoice: any;
  user: any;
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, user }) => {
  return (
    <Document title={`Invoice_${invoice.invoiceNumber}`}>
      <InvoiceTemplate invoice={invoice} user={user} />
    </Document>
  );
};
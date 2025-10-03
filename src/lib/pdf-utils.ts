// src/lib/pdf-utils.ts
// Define clear, strict types for what the PDF documents expect.
export type SanitizedLineItem = {
  description: string;
  hsnCode: string;
  quantity: number;
  rate: number;
};

export type SanitizedClient = {
  fullName: string;
  billingAddress: string;
  phoneNumber: string;
  clientPanNumber: string;
  tradeName: string;
  clientGstin: string; // Added for tax invoice
};

export type SanitizedPaymentDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
  gPayNumber: string;
  qrCodeUrl: string; // Added for QR code
};

export type SanitizedInvoice = {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  lineItems: SanitizedLineItem[];
  notes: string | null;
  client: SanitizedClient;
  discount: number;
  taxRate: number;
  previousDues: number;
};

export type TableHeaders = {
  itemNo: string;
  description: string;
  hsnCode: string;
  quantity: string;
  rate: string;
  amount: string;
};

export type SanitizedUser = {
  companyName: string;
  companyAddress: string;
  contactPhone: string;
  companyLogoUrl?: string | null;
  taxPanNumber: string;
  taxGstin: string;
  email: string; // Added email field
  paymentDetails: SanitizedPaymentDetails;
  itemTableHeaders: TableHeaders;
};

const defaultHeaders: TableHeaders = {
    itemNo: 'NO.',
    description: 'DESCRIPTION',
    hsnCode: 'HSN/SAC',
    quantity: 'QTY',
    rate: 'RATE',
    amount: 'AMOUNT',
};

/**
 * Sanitizes invoice and user data to ensure all required fields have
 * safe, default values before being passed to the PDF renderer.
 * This prevents crashes from null or undefined values in the templates.
 * @param invoice - The raw invoice object from the API.
 * @param user - The raw user object from the API.
 * @returns A sanitized data object ready for PDF rendering.
 */
export function sanitizePdfData(
  invoice: any,
  user: any
): { sanitizedInvoice: SanitizedInvoice; sanitizedUser: SanitizedUser } {
  const sanitizedInvoice: SanitizedInvoice = {
    id: Number(invoice?.id) || 0,
    invoiceNumber: invoice?.invoiceNumber ?? 'N/A',
    invoiceDate: invoice?.invoiceDate ?? new Date().toISOString(),
    dueDate: invoice?.dueDate ?? null,
    notes: invoice?.notes ?? null,
    discount: Number(invoice?.discount) || 0,
    taxRate: Number(invoice?.taxRate) || 0,
    previousDues: Number(invoice?.previousDues) || 0,
    lineItems: Array.isArray(invoice?.lineItems)
      ? invoice.lineItems.map((item: any) => ({
          description: item?.description ?? '',
          hsnCode: item?.hsnCode ?? '',
          quantity: Number(item?.quantity) || 0,
          rate: Number(item?.rate) || 0,
        }))
      : [],
    client: {
      fullName: invoice?.client?.fullName ?? 'N/A',
      billingAddress: invoice?.client?.billingAddress ?? '',
      phoneNumber: invoice?.client?.phoneNumber ?? '',
      clientPanNumber: invoice?.client?.clientPanNumber ?? '',
      tradeName: invoice?.client?.tradeName ?? '',
      clientGstin: invoice?.client?.clientGstin ?? '', // Sanitize new field
    },
  };

  let headers: TableHeaders = defaultHeaders;
    if (user?.itemTableHeaders) {
        try {
            headers = { ...defaultHeaders, ...JSON.parse(user.itemTableHeaders) };
        } catch {
            // Keep default headers if parsing fails
        }
    }

  const sanitizedUser: SanitizedUser = {
    companyName: user?.companyName ?? 'Company Name Not Set',
    companyAddress: user?.companyAddress ?? '',
    contactPhone: user?.contactPhone ?? '',
    companyLogoUrl: user?.companyLogoUrl ?? null,
    taxPanNumber: user?.taxPanNumber ?? '',
    taxGstin: user?.taxGstin ?? '',
    email: user?.email ?? '', // Sanitize email
    paymentDetails: {
      accountName: user?.paymentDetails?.accountName ?? '',
      accountNumber: user?.paymentDetails?.accountNumber ?? '',
      bankName: user?.paymentDetails?.bankName ?? '',
      ifscCode: user?.paymentDetails?.ifscCode ?? '',
      upiId: user?.paymentDetails?.upiId ?? '',
      gPayNumber: user?.paymentDetails?.gPayNumber ?? '',
      qrCodeUrl: user?.paymentDetails?.qrCodeUrl ?? '', // Sanitize new field
    },
    itemTableHeaders: headers,
  };

  return { sanitizedInvoice, sanitizedUser };
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/components/pdf/InvoiceDocument';
import { sanitizePdfData, SanitizedInvoice, SanitizedUser } from '@/lib/pdf-utils';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';

// Define a type for the component's state
type PreviewData = {
  invoice: SanitizedInvoice;
  user: SanitizedUser;
};

export default function InvoicePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [data, setData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Effect to ensure client-side rendering and data fetching
  useEffect(() => {
    setIsClient(true); 
    
    if (invoiceId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/invoices/preview/${invoiceId}`);
          if (res.ok) {
            const rawData = await res.json();
            if (rawData && rawData.invoice && rawData.user) {
                // Sanitize data immediately after fetching
                const { sanitizedInvoice, sanitizedUser } = sanitizePdfData(rawData.invoice, rawData.user);
                setData({ invoice: sanitizedInvoice, user: sanitizedUser });
            } else {
                setError('Received incomplete or invalid data from the server.');
            }
          } else {
             const errorData = await res.json();
             setError(errorData.error || 'Failed to load invoice data.');
          }
        } catch (err) {
          console.error('An error occurred while fetching invoice data:', err);
          setError('An unexpected network error occurred. Please check your connection.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [invoiceId]);
  
  // A robust loader component for better UX
  const renderLoader = () => (
     <div className="d-flex flex-grow-1 justify-content-center align-items-center bg-light" style={{ height: '100%' }}>
        <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <h4 className="mt-3 text-muted">Loading Document...</h4>
            <p className="text-muted small">Please wait while we prepare the preview.</p>
        </div>
    </div>
  );
  
  // An improved error display
  const renderError = () => (
      <div className="d-flex flex-grow-1 justify-content-center align-items-center bg-light p-4" style={{ height: '100%' }}>
        <div className="text-center alert alert-danger p-4 col-md-6">
            <AlertTriangle size={48} className="mb-3 text-danger"/>
            <h4 className="alert-heading">Failed to Load Preview</h4>
            <p>{error}</p>
            <hr />
            <button onClick={() => router.back()} className="btn btn-danger mt-2">
                Go Back
            </button>
        </div>
      </div>
  );

  // Data is ready only when it's not loading, there's no error, and data is not null
  const isDataReady = !isLoading && !error && data;

  return (
    <div className="d-flex flex-column" style={{ height: 'calc(100vh - 60px)'}}>
       {/* UI Controls Header */}
       <div className="bg-white border-bottom shadow-sm" style={{ zIndex: 10 }}>
          <div className="container-fluid py-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <button onClick={() => router.back()} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                      <ArrowLeft size={18} /> Back
                  </button>
                  
                  {isDataReady ? (
                      <PDFDownloadLink
                          document={<InvoiceDocument invoice={data.invoice} user={data.user} />}
                          fileName={`Invoice_${data.invoice.invoiceNumber || data.invoice.id}.pdf`}
                          className="btn btn-primary d-flex align-items-center gap-2"
                      >
                         <Download size={18} /> Download PDF
                      </PDFDownloadLink>
                   ) : (
                     <button className="btn btn-primary d-flex align-items-center gap-2 disabled" aria-disabled="true">
                        <Download size={18} /> Download PDF
                     </button>
                   )}
              </div>
          </div>
      </div>
      
      {/* Main Content Area: Renders loader, error, or PDF viewer */}
      <div className="flex-grow-1" style={{ display: 'flex', flexDirection: 'column' }}>
        {isLoading && renderLoader()}
        {!isLoading && error && renderError()}
        {isDataReady && isClient && (
            <PDFViewer showToolbar={true} style={{ width: '100%', height: '100%', border: 'none' }}>
              <InvoiceDocument invoice={data.invoice} user={data.user} />
            </PDFViewer>
        )}
      </div>
    </div>
  );
}
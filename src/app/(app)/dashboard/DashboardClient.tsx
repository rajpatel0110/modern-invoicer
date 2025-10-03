// src/app/(app)/dashboard/DashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, DollarSign, Users, TrendingUp, Search, AlertTriangle, FileText } from 'lucide-react';
import type { Client, Invoice } from '@prisma/client';

// --- Type Definitions ---
type LineItem = { description: string; quantity: number; rate: number };
type ParsedInvoice = Omit<Invoice, 'lineItems'> & {
  lineItems: LineItem[];
  totalAmount: number;
  client: Client;
};
type Metrics = {
    totalPendingAmount: number;
    totalReceivedAmount: number;
    totalOverdueAmount: number;
    unpaidClientCount: number;
};
type ClientWithInvoices = Client & { invoices: ParsedInvoice[] };

// --- Utility Functions ---
const getStatusBadgeClass = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PAID': return 'bg-success-subtle text-success-emphasis';
    case 'SENT': return 'bg-primary-subtle text-primary-emphasis';
    case 'DRAFT': return 'bg-warning-subtle text-warning-emphasis';
    case 'OVERDUE': return 'bg-danger-subtle text-danger-emphasis';
    case 'UNPAID': return 'bg-info-subtle text-info-emphasis';
    default: return 'bg-secondary-subtle text-secondary-emphasis';
  }
};

interface DashboardClientProps {
    metrics: Metrics;
    clients: Client[];
    invoices: ParsedInvoice[];
}

export default function DashboardClient({ metrics, clients, invoices }: DashboardClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);

  const clientsWithInvoices: ClientWithInvoices[] = useMemo(() => {
    return clients
      .map(client => ({
        ...client,
        invoices: invoices.filter(inv => inv.clientId === client.id)
      }))
      .filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [clients, invoices, searchTerm]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
      .slice(0, 5);
  }, [invoices]);

  const toggleAccordion = (id: string) => {
    setActiveAccordionItem(activeAccordionItem === id ? null : id);
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h1 className="h2 text-dark fw-bold mb-0">Dashboard</h1>
        <Link href="/invoices/new" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
          <PlusCircle size={20} />
          New Invoice
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="row g-4 mb-5">
        <div className="col-lg col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="d-inline-flex bg-success-subtle p-2 rounded-circle me-3">
                <TrendingUp size={24} className="text-success" />
              </div>
              <div>
                <div className="text-muted small">Total Received</div>
                <h4 className="fw-bold mb-0">₹{metrics.totalReceivedAmount.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="d-inline-flex bg-info-subtle p-2 rounded-circle me-3">
                <DollarSign size={24} className="text-info" />
              </div>
              <div>
                <div className="text-muted small">Total Pending</div>
                <h4 className="fw-bold mb-0">₹{metrics.totalPendingAmount.toFixed(2)}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
                <div className="d-inline-flex bg-danger-subtle p-2 rounded-circle me-3">
                    <AlertTriangle size={24} className="text-danger" />
                </div>
                <div>
                    <div className="text-muted small">Total Overdue</div>
                    <h4 className="fw-bold mb-0">₹{metrics.totalOverdueAmount?.toFixed(2) || '0.00'}</h4>
                </div>
            </div>
          </div>
        </div>
        <div className="col-lg col-md-6">
            <div className="card shadow-sm h-100">
                <div className="card-body d-flex align-items-center">
                    <div className="d-inline-flex bg-warning-subtle p-2 rounded-circle me-3">
                        <Users size={24} className="text-warning" />
                    </div>
                    <div>
                        <div className="text-muted small">Unpaid Clients</div>
                        <h4 className="fw-bold mb-0">{metrics.unpaidClientCount}</h4>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="row g-5">
        {/* Left Column: Client List */}
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 text-dark mb-0">Clients & Invoices</h2>
            <div className="input-group" style={{ maxWidth: '250px' }}>
              <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
              <input type="text" placeholder="Search clients..." className="form-control border-start-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="card shadow-sm">
            {clientsWithInvoices.length > 0 ? (
              <div className="accordion accordion-flush" id="clientAccordion">
                {clientsWithInvoices.map(client => (
                  <div className="accordion-item" key={client.id}>
                    <h2 className="accordion-header" id={`heading-${client.id}`}>
                      <button className={`accordion-button ${activeAccordionItem !== `client-${client.id}` ? 'collapsed' : ''}`} type="button" onClick={() => toggleAccordion(`client-${client.id}`)}>
                        <div className="d-flex justify-content-between w-100 align-items-center pe-2">
                            <span className="fw-bold">{client.fullName}</span>
                            <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">{client.invoices.length} Invoices</span>
                        </div>
                      </button>
                    </h2>
                    <div id={`collapse-${client.id}`} className={`accordion-collapse collapse ${activeAccordionItem === `client-${client.id}` ? 'show' : ''}`}>
                      <div className="accordion-body p-0">
                        {client.invoices.length > 0 ? (
                             <ul className="list-group list-group-flush">
                                {client.invoices.map(invoice => (
                                     <li key={invoice.id} className="list-group-item d-flex justify-content-between align-items-center">
                                         <div>
                                             <Link href={`/invoices/${invoice.id}`} className="text-decoration-none fw-medium">{invoice.referenceName || `Invoice #${invoice.id}`}</Link>
                                             <small className="d-block text-muted">Issued: {new Date(invoice.invoiceDate).toLocaleDateString()} - Total: ₹{invoice.totalAmount.toFixed(2)}</small>
                                         </div>
                                         <span className={`badge rounded-pill ${getStatusBadgeClass(invoice.status)}`}>{invoice.status}</span>
                                     </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-3 text-center text-muted">No invoices for this client yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-5">
                <Users size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No Clients Found</h5>
                <p className="text-muted">Add a client to start creating invoices.</p>
                <Link href="/clients" className="btn btn-sm btn-primary mt-2">Add New Client</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Invoices */}
        <div className="col-lg-5">
            <h2 className="h4 text-dark mb-3">Recent Activity</h2>
            <div className="card shadow-sm">
                {recentInvoices.length > 0 ? (
                    <ul className="list-group list-group-flush">
                        {recentInvoices.map(invoice => (
                             <li key={invoice.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <Link href={`/invoices/${invoice.id}`} className="text-decoration-none fw-medium">{invoice.referenceName || `Invoice #${invoice.id}`}</Link>
                                    <small className="d-block text-muted">For {invoice.client.fullName} - ₹{invoice.totalAmount.toFixed(2)}</small>
                                </div>
                                <span className={`badge rounded-pill ${getStatusBadgeClass(invoice.status)}`}>{invoice.status}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="card-body text-center text-muted p-5">
                        <FileText size={48} className="mb-3" />
                        <h5>No recent invoices</h5>
                        <p>Your latest invoices will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
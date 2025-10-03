'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Search, ArrowRight, ArrowDown, FileText, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
type LineItem = { description: string; quantity: number; rate: number };
type ClientDetails = { id: number; fullName: string; phoneNumber: string | null };
type RawInvoice = { 
  id: number; 
  client: ClientDetails; 
  referenceName: string; 
  invoiceDate: string; 
  dueDate: string | null; 
  status: string; 
  lineItems: string | LineItem[]; 
  discount?: number; 
  taxRate?: number; 
  previousDues?: number;
};
type ParsedInvoice = Omit<RawInvoice, 'lineItems'> & { 
  lineItems: LineItem[]; 
  totalAmount: number;
};

type SortKeys = 'invoiceDate' | 'client' | 'status' | 'totalAmount';
type SortDirection = 'asc' | 'desc';

// --- Utility Functions ---

// Calculates total for consistent display across pages
const calculateTotal = (invoice: ParsedInvoice | RawInvoice): number => {
    let lineItems: LineItem[];
    if (Array.isArray(invoice.lineItems)) {
        lineItems = invoice.lineItems;
    } else {
        try {
            lineItems = JSON.parse(invoice.lineItems || '[]');
        } catch (e) {
            lineItems = [];
        }
    }
    
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const discountRate = invoice.discount || 0;
    const taxRate = invoice.taxRate || 0;

    const discountAmount = subtotal * (discountRate / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    
    return subtotalAfterDiscount + taxAmount + (invoice.previousDues || 0);
};

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

// --- Component ---

export default function InvoiceManagementPage() {
  const router = useRouter();
  const [rawInvoices, setRawInvoices] = useState<RawInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys, direction: SortDirection }>({ 
    key: 'invoiceDate', 
    direction: 'desc' 
  });
  
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data: RawInvoice[] = await res.json();
        setRawInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const parsedInvoices: ParsedInvoice[] = useMemo(() => {
    return rawInvoices.map(invoice => ({
      ...invoice,
      // Safely parse line items for front-end access
      lineItems: Array.isArray(invoice.lineItems) ? invoice.lineItems : JSON.parse(invoice.lineItems || '[]'),
      totalAmount: calculateTotal(invoice),
    }));
  }, [rawInvoices]);
  
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = parsedInvoices.filter(invoice => {
      const matchesSearch = searchTerm === '' ||
        invoice.referenceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || 
        invoice.status.toUpperCase() === statusFilter;
        
      return matchesSearch && matchesStatus;
    });

    // Sorting logic
    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;
      let aValue: any, bValue: any;
      
      switch (key) {
        case 'client':
          aValue = a.client.fullName.toLowerCase();
          bValue = b.client.fullName.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'invoiceDate':
        default:
          aValue = new Date(a.invoiceDate).getTime();
          bValue = new Date(b.invoiceDate).getTime();
          break;
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [parsedInvoices, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key: SortKeys) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKeys) => {
    if (sortConfig.key !== key) return null;
    // Visually represent the sort direction
    return sortConfig.direction === 'asc' ? <ArrowRight size={14} className="ms-1" style={{ transform: 'rotate(-90deg)' }}/> : <ArrowDown size={14} className="ms-1" />;
  };

  const handleDeleteInvoice = async (id: number) => {
    if (confirm('Are you sure you want to delete this invoice? This action is irreversible.')) {
      setRawInvoices(prev => prev.filter(inv => inv.id !== id)); // Optimistic update
      try {
        const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        if (!res.ok) {
           console.error("Failed to delete invoice on backend. Reverting/Re-fetching.");
           fetchInvoices(); // Revert on failure
        }
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        fetchInvoices(); // Revert on network error
      }
    }
  };
  
  // Double-click action requirement
  const handleDoubleClick = (id: number) => {
      router.push(`/invoices/${id}`);
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div><span className="visually-hidden">Loading...</span></div>;
    }
    if (parsedInvoices.length === 0) {
        return (
            <div className="text-center p-5">
              <div className="d-inline-flex bg-light p-3 rounded-circle mb-3">
                  <FileText size={48} className="text-primary"/>
              </div>
              <h4 className="text-muted fw-normal">No invoices have been created yet</h4>
              <p className="text-muted">Get started by creating your first invoice.</p>
              <Link href="/invoices/new" className="btn btn-primary mt-2">
                <PlusCircle size={18} className="me-2"/>
                Create New Invoice
              </Link>
            </div>
        );
    }
    
    return (
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-4">
                <button className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold" onClick={() => handleSort('client')}>
                  Client{getSortIcon('client')}
                </button>
              </th>
              <th scope="col">Reference</th>
              <th scope="col">
                <button className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold" onClick={() => handleSort('totalAmount')}>
                  Amount{getSortIcon('totalAmount')}
                </button>
              </th>
              <th scope="col">
                <button className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold" onClick={() => handleSort('invoiceDate')}>
                  Issue Date{getSortIcon('invoiceDate')}
                </button>
              </th>
              <th scope="col">
                <button className="btn btn-sm btn-link text-dark text-decoration-none p-0 fw-bold" onClick={() => handleSort('status')}>
                  Status{getSortIcon('status')}
                </button>
              </th>
              <th scope="col" className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInvoices.length > 0 ? filteredAndSortedInvoices.map((invoice) => (
              <tr key={invoice.id} onDoubleClick={() => handleDoubleClick(invoice.id)} style={{cursor: 'pointer'}}>
                <td className="ps-4 fw-medium">{invoice.client.fullName}</td>
                <td>{invoice.referenceName || invoice.id}</td>
                <td className="fw-semibold">₹{invoice.totalAmount.toFixed(2)}</td>
                <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                <td>
                   <span className={`badge rounded-pill ${getStatusBadgeClass(invoice.status)}`}>
                      {invoice.status}
                   </span>
                </td>
                <td className="text-end pe-4">
                  <div className="btn-group">
                    <Link href={`/invoices/preview/${invoice.id}`} onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-outline-info d-flex align-items-center gap-1">
                        <Eye size={14} /> Preview
                    </Link>
                    <Link href={`/invoices/${invoice.id}`} onClick={(e) => e.stopPropagation()} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                        <Edit size={14} /> Edit
                    </Link>
                    <button onClick={(e) => {e.stopPropagation(); handleDeleteInvoice(invoice.id);}} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                        <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
                 <tr>
                    <td colSpan={6} className="text-center p-4 text-muted">No invoices match your criteria.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h1 className="h2 text-dark fw-bold mb-0">Invoice Management</h1>
        <div className="d-flex gap-2">
            {/* Search Bar */}
            <div className="input-group" style={{maxWidth: '300px'}}>
                <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
                <input 
                    type="text" 
                    placeholder="Search reference, number, or client..."
                    className="form-control border-start-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* Status Filter */}
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select"
              style={{minWidth: '150px'}}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="UNCOLLECTIBLE">Uncollectible</option>
            </select>
            <Link href="/invoices/new" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 flex-shrink-0">
              <PlusCircle size={20} />
              New Invoice
            </Link>
        </div>
      </div>
      
      <div className="card shadow-sm">
        {renderContent()}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo, ChangeEvent, FC, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trash2, Plus, Save, Eye, User as UserIcon, AlertCircle, XCircle, FileText,
  Edit, Settings
} from 'lucide-react';

// --- Type Definitions ---
type Client = {
  id: number;
  fullName: string;
};

type LineItem = {
  description: string;
  hsnCode: string;
  quantity: number;
  rate: number;
};

type CalculationMode = 'percentage' | 'amount';
type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'UNPAID' | 'OVERDUE' | 'UNCOLLECTIBLE' | 'CANCELLED';

type TableHeaders = {
  itemNo: string;
  description: string;
  hsnCode: string;
  quantity: string;
  rate: string;
  amount: string;
};

type InvoiceData = {
    clientId: number;
    referenceName: string;
    invoiceDate: string;
    dueDate: string | null;
    status: InvoiceStatus;
    lineItems: LineItem[];
    discount: number;
    taxRate: number;
    notes: string;
    invoiceNumber: string;
}

// --- Helper Components ---

// Auto-resizing textarea component
const AutoResizeTextarea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.currentTarget;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        if (props.onChange) {
            props.onChange(event);
        }
    };
    return <textarea {...props} rows={1} onInput={handleInput} className="form-control" />;
};

// Settings Modal for editing table headers
const SettingsModal: FC<{
    headers: TableHeaders;
    onSave: (newHeaders: TableHeaders) => void;
    onCancel: () => void;
}> = ({ headers, onSave, onCancel }) => {
    const [localHeaders, setLocalHeaders] = useState(headers);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalHeaders(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
            <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Item Table Headers</h5>
                            <button type="button" className="btn-close" onClick={onCancel}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Description Header</label>
                                <input name="description" value={localHeaders.description} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">HSN/SAC Header</label>
                                <input name="hsnCode" value={localHeaders.hsnCode} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Quantity Header</label>
                                <input name="quantity" value={localHeaders.quantity} onChange={handleChange} className="form-control" />
                            </div>
                             <div className="mb-3">
                                <label className="form-label">Rate Header</label>
                                <input name="rate" value={localHeaders.rate} onChange={handleChange} className="form-control" />
                            </div>
                             <div className="mb-3">
                                <label className="form-label">Amount Header</label>
                                <input name="amount" value={localHeaders.amount} onChange={handleChange} className="form-control" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={() => onSave(localHeaders)}>Save Headers</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


// --- Main Page Component ---

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [clients, setClients] = useState<Client[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [referenceName, setReferenceName] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('DRAFT');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', hsnCode: '', quantity: 1, rate: 0 },
  ]);

  const [discountType, setDiscountType] = useState<CalculationMode>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxType, setTaxType] = useState<CalculationMode>('percentage');
  const [taxValue, setTaxValue] = useState(0);

  const [notes, setNotes] = useState('');

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tableHeaders, setTableHeaders] = useState<TableHeaders>({
    itemNo: '#',
    description: 'DESCRIPTION',
    hsnCode: 'HSN/SAC',
    quantity: 'QTY',
    rate: 'RATE',
    amount: 'AMOUNT',
  });

  // --- Data Fetching ---
  const fetchInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const [clientRes, invoiceRes, profileRes] = await Promise.all([
        fetch('/api/clients'),
        fetch(`/api/invoices/${invoiceId}`),
        fetch('/api/profile'),
      ]);

      if (clientRes.ok) setClients(await clientRes.json());
      
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile.itemTableHeaders) {
          try {
            setTableHeaders(JSON.parse(profile.itemTableHeaders));
          } catch {}
        }
      }

      if (invoiceRes.ok) {
        const data: InvoiceData = await invoiceRes.json();
        setClientId(String(data.clientId));
        setInvoiceNumber(data.invoiceNumber || '');
        setInvoiceDate(data.invoiceDate.split('T')[0]);
        setDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');
        setReferenceName(data.referenceName || '');
        setStatus(data.status.toUpperCase() as InvoiceStatus);
        setLineItems(data.lineItems || [{ description: '', hsnCode: '', quantity: 1, rate: 0 }]);
        setDiscountType('percentage');
        setDiscountValue(data.discount || 0);
        setTaxType('percentage');
        setTaxValue(data.taxRate || 0);
        setNotes(data.notes || '');
      } else {
        setError('Failed to fetch invoice data. It may not exist or belong to you.');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching initial data.');
    } finally {
      setInitialLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) {
      fetchInitialData();
    }
  }, [invoiceId, fetchInitialData]);

  // --- Line Item & Calculation Logic ---
  const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
    const updatedLineItems = [...lineItems];
    const item = updatedLineItems[index];
    if (field === 'quantity' || field === 'rate') {
      (item[field] as number) = parseFloat(value) || 0;
    } else {
      (item[field] as string) = value;
    }
    setLineItems(updatedLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', hsnCode: '', quantity: 1, rate: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const { subtotal, discountAmount, taxAmount, total } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const calculatedDiscount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
    const subtotalAfterDiscount = subtotal - calculatedDiscount;
    const calculatedTax = taxType === 'percentage' ? subtotalAfterDiscount * (taxValue / 100) : taxValue;
    const total = subtotalAfterDiscount + calculatedTax;
    return { subtotal, discountAmount: calculatedDiscount, taxAmount: calculatedTax, total };
  }, [lineItems, discountType, discountValue, taxType, taxValue]);

  // --- Save/Update Handlers ---
  const handleSaveHeaders = async (newHeaders: TableHeaders) => {
    setIsSaving(true);
    try {
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemTableHeaders: JSON.stringify(newHeaders) })
        });
        if (res.ok) {
            setTableHeaders(newHeaders);
            setShowSettingsModal(false);
        } else {
            setError("Failed to save header settings.");
        }
    } catch (err) {
        setError("An error occurred while saving header settings.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!clientId || !invoiceDate || !invoiceNumber) {
        setError('Please select a client, set the invoice date, and provide an invoice number.');
        return;
    }
    setIsSaving(true);

    const subtotalForCalc = lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const finalDiscountRate = subtotalForCalc > 0 ? (discountAmount / subtotalForCalc) * 100 : 0;
    const subtotalAfterDiscount = subtotalForCalc - discountAmount;
    const finalTaxRate = subtotalAfterDiscount > 0 ? (taxAmount / subtotalAfterDiscount) * 100 : 0;

    const updateData = {
        clientId: parseInt(clientId),
        referenceName,
        invoiceNumber,
        status,
        invoiceDate,
        dueDate: dueDate || null,
        lineItems,
        discount: finalDiscountRate,
        taxRate: finalTaxRate,
        notes,
    };

    try {
        const res = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });
        if (res.ok) {
            alert('Invoice updated successfully!');
            router.push('/invoices');
        } else {
            const data = await res.json();
            setError(data.error || 'Failed to update invoice.');
        }
    } catch (err) {
        setError('An unexpected error occurred.');
    } finally {
        setIsSaving(false);
    }
  };

  if (initialLoading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div className="container-lg py-4">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h1 className="h2 text-dark fw-bold mb-0 d-flex align-items-center gap-2">
            <Edit size={24} /> Edit Invoice
        </h1>
        <div className="d-flex gap-2 align-self-start align-self-sm-center">
            <button onClick={() => router.push('/invoices')} className="btn btn-light d-flex align-items-center justify-content-center gap-2">
                <XCircle size={18} /> Cancel
            </button>
            <Link href={`/invoices/preview/${invoiceId}`} className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2">
                <Eye size={18} /> Preview
            </Link>
            <button onClick={handleSave} disabled={isSaving} className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                 {isSaving ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')} role="alert">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body p-4 p-lg-5">
            <div className="row g-4 mb-5">
                <div className="col-md-6 col-lg-3">
                    <label className="form-label">Invoice Number</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light"><FileText size={16} className="text-muted"/></span>
                        <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required className="form-control" />
                    </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <label className="form-label">Client</label>
                     <div className="input-group">
                        <span className="input-group-text bg-light"><UserIcon size={16} className="text-muted"/></span>
                        <select value={clientId} onChange={(e) => setClientId(e.target.value)} required className="form-select">
                        <option value="">Select a client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                        </select>
                     </div>
                </div>
                 <div className="col-md-6 col-lg-3">
                    <label className="form-label">Reference (Optional)</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light"><FileText size={16} className="text-muted"/></span>
                        <input type="text" value={referenceName} onChange={(e) => setReferenceName(e.target.value)} className="form-control" placeholder="e.g., Project X" />
                    </div>
                </div>
                 <div className="col-md-6 col-lg-3">
                    <label className="form-label">Status</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light"><AlertCircle size={16} className="text-muted"/></span>
                        <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)} required className="form-select">
                            <option value="DRAFT">Draft</option>
                            <option value="SENT">Sent</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="PAID">Paid</option>
                            <option value="UNCOLLECTIBLE">Uncollectible</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                     </div>
                </div>
                <div className="col-md-6 col-lg-3">
                    <label className="form-label">Invoice Date</label>
                    <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required className="form-control" />
                </div>
                <div className="col-md-6 col-lg-3">
                    <label className="form-label">Due Date (Optional)</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-control" />
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">Line Items</h3>
              <button onClick={() => setShowSettingsModal(true)} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                <Settings size={14}/> Settings
              </button>
            </div>
            <div className="table-responsive">
                 <table className="table" style={{tableLayout: 'fixed'}}>
                    <thead className="table-light">
                        <tr>
                            <th style={{width: '45%'}}>{tableHeaders.description}</th>
                            <th>{tableHeaders.hsnCode}</th>
                            <th>{tableHeaders.quantity}</th>
                            <th>{tableHeaders.rate}</th>
                            <th className="text-end">{tableHeaders.amount}</th>
                            <th style={{width: '50px'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item, index) => (
                            <tr key={index} className="align-middle">
                                <td><AutoResizeTextarea placeholder="Item description..." value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} /></td>
                                <td><input type="text" placeholder="998314" value={item.hsnCode} onChange={e => handleLineItemChange(index, 'hsnCode', e.target.value)} className="form-control"/></td>
                                <td><input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="form-control"/></td>
                                <td><input type="number" placeholder="0.00" value={item.rate} onChange={e => handleLineItemChange(index, 'rate', e.target.value)} className="form-control"/></td>
                                <td className="text-end fw-semibold">₹{(item.quantity * item.rate).toFixed(2)}</td>
                                <td><button type="button" onClick={() => removeLineItem(index)} className="btn btn-sm btn-outline-danger" disabled={lineItems.length <= 1}><Trash2 size={16} /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button type="button" onClick={addLineItem} className="btn btn-outline-primary d-inline-flex align-items-center gap-2 mt-2">
                <Plus size={16} /> Add Line Item
            </button>

            <hr className="my-5"/>

            <div className="row g-5">
                <div className="col-lg-7">
                    <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="form-control" rows={5} placeholder="e.g., Thank you for your business!"></textarea>
                </div>
                <div className="col-lg-5">
                    <div className="card bg-light border-0">
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">Subtotal <span>₹{subtotal.toFixed(2)}</span></li>
                                <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                    <span>Discount</span>
                                    <div className="input-group" style={{width: '150px'}}>
                                        <input type="number" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} className="form-control text-end" />
                                        <div className="btn-group">
                                            <button className={`btn btn-outline-secondary ${discountType === 'percentage' && 'active'}`} onClick={() => setDiscountType('percentage')}>%</button>
                                            <button className={`btn btn-outline-secondary ${discountType === 'amount' && 'active'}`} onClick={() => setDiscountType('amount')}>₹</button>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                    <span>Tax</span>
                                     <div className="input-group" style={{width: '150px'}}>
                                        <input type="number" value={taxValue} onChange={e => setTaxValue(parseFloat(e.target.value) || 0)} className="form-control text-end" />
                                        <div className="btn-group">
                                            <button className={`btn btn-outline-secondary ${taxType === 'percentage' && 'active'}`} onClick={() => setTaxType('percentage')}>%</button>
                                            <button className={`btn btn-outline-secondary ${taxType === 'amount' && 'active'}`} onClick={() => setTaxType('amount')}>₹</button>
                                        </div>
                                    </div>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 fw-bold fs-4 border-top pt-3 mt-2">
                                    Total
                                    <span>₹{total.toFixed(2)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {showSettingsModal && (
        <SettingsModal 
            headers={tableHeaders}
            onSave={handleSaveHeaders}
            onCancel={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

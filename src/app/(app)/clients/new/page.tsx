'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, XCircle } from 'lucide-react';

type ClientFormData = {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  billingAddress: string;
  tradeName: string | null;
  clientPanNumber: string | null;
  clientGstin: string | null;
};

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    billingAddress: '',
    tradeName: '',
    clientPanNumber: '',
    clientGstin: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/clients');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create client.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-lg py-4">
      <form onSubmit={handleSave}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          <h1 className="h2 text-dark fw-bold mb-0">Create New Client</h1>
          <div className="d-flex gap-2">
            <button type="button" onClick={() => router.back()} className="btn btn-light d-flex align-items-center gap-2">
              <XCircle size={18} /> Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary d-flex align-items-center gap-2">
              {isSaving ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm">
          <div className="card-body p-4 p-lg-5">
            <div className="row g-4">
              <div className="col-md-6">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-control" />
              </div>
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
              </div>
              <div className="col-md-6">
                <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-12">
                <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                <textarea id="billingAddress" name="billingAddress" value={formData.billingAddress} onChange={handleChange} required rows={3} className="form-control"></textarea>
              </div>
              <div className="col-md-6">
                <label htmlFor="tradeName" className="form-label">Trade Name (Optional)</label>
                <input type="text" id="tradeName" name="tradeName" value={formData.tradeName || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label htmlFor="clientPanNumber" className="form-label">PAN Number (Optional)</label>
                <input type="text" id="clientPanNumber" name="clientPanNumber" value={formData.clientPanNumber || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label htmlFor="clientGstin" className="form-label">GSTIN (Optional)</label>
                <input type="text" id="clientGstin" name="clientGstin" value={formData.clientGstin || ''} onChange={handleChange} className="form-control" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
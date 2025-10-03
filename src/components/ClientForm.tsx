// src/components/ClientForm.tsx
'use client';

import { useState, useEffect } from 'react';

type Client = {
  id?: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  billingAddress: string;
};

type ClientFormProps = {
  client?: Client | null;
  onSave: (client: Client) => void;
  onCancel: () => void;
  isSaving: boolean;
};

export default function ClientForm({ client, onSave, onCancel, isSaving }: ClientFormProps) {
  const [formData, setFormData] = useState<Client>({
    fullName: '',
    email: '',
    phoneNumber: '',
    billingAddress: '',
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" style={{ zIndex: 1055 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{client ? 'Edit Client' : 'Create New Client'}</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} className="form-control" />
                </div>
                <div className="mb-3">
                  <label htmlFor="billingAddress" className="form-label">Billing Address</label>
                  <textarea id="billingAddress" name="billingAddress" value={formData.billingAddress} onChange={handleChange} required rows={3} className="form-control"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
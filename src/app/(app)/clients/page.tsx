'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Search, User, Mail, Phone, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
type Client = {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  billingAddress: string;
  tradeName: string | null;
  clientPanNumber: string | null;
  clientGstin: string | null;
};

type SortKeys = 'fullName' | 'email';
type SortDirection = 'asc' | 'desc';

// --- Reusable Confirmation Modal ---
const ConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void; }) => (
    <>
        <div className="modal-backdrop fade show" style={{ zIndex: 1060 }}></div>
        <div className="modal fade show d-block" style={{ zIndex: 1065 }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title">Confirm Deletion</h5>
                        <button type="button" className="btn-close" onClick={onCancel}></button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete this client? This action is irreversible and will also remove all associated invoices.</p>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>Delete Client</button>
                    </div>
                </div>
            </div>
        </div>
    </>
);


export default function ClientManagementPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys, direction: SortDirection }>({ 
    key: 'fullName', 
    direction: 'asc' 
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting logic
    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [clients, searchTerm, sortConfig]);

  const handleSort = (key: SortKeys) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKeys) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const handleDeleteRequest = (id: number) => {
    setClientToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete === null) return;
    try {
        await fetch(`/api/clients/${clientToDelete}`, { method: 'DELETE' });
        fetchClients();
    } catch (error) {
        console.error('Failed to delete client:', error);
    } finally {
        setShowDeleteConfirm(false);
        setClientToDelete(null);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div><span className="visually-hidden">Loading...</span></div>;
    }
    if (clients.length === 0) {
        return (
            <div className="text-center p-5">
              <div className="d-inline-flex bg-light p-3 rounded-circle mb-3">
                  <Users size={48} className="text-primary"/>
              </div>
              <h4 className="text-muted fw-normal">No clients have been added yet</h4>
              <p className="text-muted">Get started by adding your first client.</p>
              <Link href="/clients/new" className="btn btn-primary mt-2">
                <PlusCircle size={18} className="me-2"/>
                Add New Client
              </Link>
            </div>
        );
    }
    
    return (
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-4" onClick={() => handleSort('fullName')} style={{cursor: 'pointer'}}>
                Client Name{getSortIcon('fullName')}
              </th>
              <th scope="col">Contact Information</th>
              <th scope="col" className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClients.length > 0 ? filteredAndSortedClients.map((client) => (
              <tr key={client.id} onDoubleClick={() => router.push(`/clients/${client.id}`)} style={{cursor: 'pointer'}}>
                <td className="ps-4 fw-medium">{client.fullName}</td>
                <td>
                  <div><Mail size={14} className="me-2" />{client.email}</div>
                  <div><Phone size={14} className="me-2" />{client.phoneNumber || 'N/A'}</div>
                </td>
                <td className="text-end pe-4">
                  <div className="btn-group">
                    <Link href={`/clients/${client.id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                        <Edit size={14} /> Edit
                    </Link>
                    <button onClick={(e) => {e.stopPropagation(); handleDeleteRequest(client.id);}} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                        <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
                 <tr>
                    <td colSpan={3} className="text-center p-4 text-muted">No clients match your search.</td>
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
        <h1 className="h2 text-dark fw-bold mb-0">Client Management</h1>
        <div className="d-flex gap-2">
            <div className="input-group" style={{maxWidth: '300px'}}>
                <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
                <input 
                    type="text" 
                    placeholder="Search by name or email..."
                    className="form-control border-start-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link href="/clients/new" className="btn btn-primary d-flex align-items-center justify-content-center gap-2 flex-shrink-0">
              <PlusCircle size={20} />
              New Client
            </Link>
        </div>
      </div>
      
      <div className="card shadow-sm">
        {renderContent()}
      </div>
      
      {showDeleteConfirm && (
        <ConfirmationModal 
            onConfirm={confirmDelete} 
            onCancel={() => setShowDeleteConfirm(false)} 
        />
      )}
    </div>
  );
}
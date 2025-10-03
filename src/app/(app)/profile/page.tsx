'use client';

import { useState, useEffect, ChangeEvent, FC, ReactNode } from 'react';
import { 
    Save, UploadCloud, Trash2, Image as ImageIcon, 
    Building, Globe, Mail, Phone, Hash, User, Banknote, Landmark, QrCode
} from 'lucide-react';

// --- Type Definitions ---
type PaymentDetails = {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
  gPayNumber?: string;
  qrCodeUrl?: string;
};

type UserProfile = {
  companyName: string;
  companyLogoUrl: string;
  companyAddress: string;
  contactPhone: string;
  contactWebsite: string;
  taxPanNumber: string;
  taxGstin: string;
  email: string;
  paymentDetails: PaymentDetails;
  itemTableHeaders?: string; // Stored as a JSON string
};

// --- Reusable Component: Input with Icon ---
interface InputWithIconProps {
  icon: ReactNode;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  id?: string;
}

const InputWithIcon: FC<InputWithIconProps> = ({ icon, ...props }) => (
  <div className="input-group">
    <span className="input-group-text bg-light border-end-0">{icon}</span>
    <input {...props} type={props.type || 'text'} className="form-control border-start-0" />
  </div>
);

// --- Helper Component for Image Uploads (Bootstrap Version) ---
const ImageUploader = ({
  label,
  currentImageUrl,
  onFileChange,
  onRemove,
  isUploading,
}: {
  label: string;
  currentImageUrl?: string | null;
  onFileChange: (file: File) => void;
  onRemove: () => void;
  isUploading: boolean;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };
  
  const displayUrl = preview || currentImageUrl;

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="d-flex align-items-center gap-3 mt-1">
        <div 
            className="border rounded d-flex align-items-center justify-content-center bg-light"
            style={{ width: '64px', height: '64px' }}
        >
          {displayUrl ? (
            <img src={displayUrl} alt="Preview" className="img-fluid rounded" style={{ objectFit: 'contain', height: '100%' }} />
          ) : (
            <ImageIcon className="text-muted" />
          )}
        </div>
        <div className="d-flex align-items-center">
           <input
              id={label}
              type="file"
              className="d-none"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/svg+xml"
              disabled={isUploading}
            />
           <label htmlFor={label} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
            <UploadCloud size={16} />
            {isUploading ? 'Uploading...' : 'Change'}
          </label>
          {displayUrl && (
             <button type="button" onClick={handleRemove} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2 ms-2">
                <Trash2 size={16} />
                Remove
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    companyName: '', companyLogoUrl: '', companyAddress: '', contactPhone: '', 
    contactWebsite: '', taxPanNumber: '', taxGstin: '', email: '', paymentDetails: {}, itemTableHeaders: '{}'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.paymentDetails === 'string') {
          data.paymentDetails = JSON.parse(data.paymentDetails || '{}');
        } else if (!data.paymentDetails) {
          data.paymentDetails = {};
        }
        setProfile(data);
      }
    } catch (error) { console.error('Failed to fetch profile', error); } 
    finally { setIsLoading(false); }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentDetailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, [name]: value }}));
  };
  
  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.success ? data.url : null;
    } catch (error) {
      console.error('File upload failed', error);
      return null;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let updatedProfile = { ...profile };
    if (logoFile) {
      const logoUrl = await uploadFile(logoFile);
      if(logoUrl) updatedProfile.companyLogoUrl = logoUrl;
    }
    if (qrCodeFile) {
      const qrUrl = await uploadFile(qrCodeFile);
      if(qrUrl) updatedProfile.paymentDetails.qrCodeUrl = qrUrl;
    }
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      alert('Profile updated successfully!');
      setLogoFile(null);
      setQrCodeFile(null);
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
        <h1 className="h2 text-dark fw-bold mb-0">Your Profile</h1>
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
          {isSaving ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-4 p-lg-5">
        
          <section className="mb-5">
            <h2 className="h4 card-title border-bottom pb-3 mb-4">Company Details</h2>
            <div className="row g-4">
                <div className="col-md-6">
                  <label htmlFor="companyName" className="form-label">Company/Firm Name</label>
                  <InputWithIcon icon={<Building size={16} className="text-muted"/>} id="companyName" name="companyName" value={profile.companyName || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                    <ImageUploader 
                        label="Company Logo"
                        currentImageUrl={profile.companyLogoUrl}
                        onFileChange={setLogoFile}
                        onRemove={() => { setLogoFile(null); setProfile(p => ({...p, companyLogoUrl: ''})) }}
                        isUploading={isSaving}
                    />
                </div>
                <div className="col-12">
                  <label htmlFor="companyAddress" className="form-label">Company Address</label>
                  <textarea id="companyAddress" name="companyAddress" value={profile.companyAddress || ''} onChange={handleChange} className="form-control" rows={3}></textarea>
                </div>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="h4 card-title border-bottom pb-3 mb-4">Contact & Tax Information</h2>
            <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Contact Email</label>
                  <InputWithIcon icon={<Mail size={16} className="text-muted"/>} type="email" id="email" name="email" value={profile.email || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
                  <InputWithIcon icon={<Phone size={16} className="text-muted"/>} id="contactPhone" name="contactPhone" value={profile.contactPhone || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactWebsite" className="form-label">Website</label>
                  <InputWithIcon icon={<Globe size={16} className="text-muted"/>} id="contactWebsite" name="contactWebsite" value={profile.contactWebsite || ''} onChange={handleChange} placeholder="https://example.com" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="taxPanNumber" className="form-label">PAN Number</label>
                  <InputWithIcon icon={<Hash size={16} className="text-muted"/>} id="taxPanNumber" name="taxPanNumber" value={profile.taxPanNumber || ''} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label htmlFor="taxGstin" className="form-label">GSTIN</label>
                  <InputWithIcon icon={<Hash size={16} className="text-muted"/>} id="taxGstin" name="taxGstin" value={profile.taxGstin || ''} onChange={handleChange} />
                </div>
            </div>
          </section>

          <section>
            <h2 className="h4 card-title border-bottom pb-3 mb-4">Payment Details</h2>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Bank Name</label>
                    <InputWithIcon icon={<Landmark size={16} className="text-muted"/>} name="bankName" value={profile.paymentDetails.bankName || ''} onChange={handlePaymentDetailChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Account Holder Name</label>
                    <InputWithIcon icon={<User size={16} className="text-muted"/>} name="accountName" value={profile.paymentDetails.accountName || ''} onChange={handlePaymentDetailChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Account Number</label>
                    <InputWithIcon icon={<Hash size={16} className="text-muted"/>} name="accountNumber" value={profile.paymentDetails.accountNumber || ''} onChange={handlePaymentDetailChange} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">IFSC Code</label>
                    <InputWithIcon icon={<Hash size={16} className="text-muted"/>} name="ifscCode" value={profile.paymentDetails.ifscCode || ''} onChange={handlePaymentDetailChange} />
                </div>
                
                 <div className="col-12"><hr className="my-3" /></div>

                 <div className="col-md-6">
                    <label className="form-label">UPI ID</label>
                    <InputWithIcon icon={<Banknote size={16} className="text-muted"/>} name="upiId" value={profile.paymentDetails.upiId || ''} onChange={handlePaymentDetailChange} />
                 </div>
                 <div className="col-md-6">
                    <label className="form-label">Google Pay Number</label>
                    <InputWithIcon icon={<Phone size={16} className="text-muted"/>} name="gPayNumber" value={profile.paymentDetails.gPayNumber || ''} onChange={handlePaymentDetailChange} />
                 </div>
                 <div className="col-12">
                    <ImageUploader 
                        label="Payment QR Code"
                        currentImageUrl={profile.paymentDetails.qrCodeUrl}
                        onFileChange={setQrCodeFile}
                        onRemove={() => { setQrCodeFile(null); setProfile(p => ({...p, paymentDetails: {...p.paymentDetails, qrCodeUrl: ''}})) }}
                        isUploading={isSaving}
                    />
                 </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Upload, User, CreditCard, CheckCircle, 
  AlertTriangle, FileText, Phone, MapPin, Package, XCircle 
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LeadCompletion = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [leadDetails, setLeadDetails] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Photo Upload State
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
    bottom: null
  });

  // KYC State
  const [kycData, setKycData] = useState({
    customerName: '',
    idType: 'aadhaar',
    idNumber: '',
    idPhotoFront: null,
    idPhotoBack: null,
    customerSelfie: null
  });

  // Payment State
  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    amount: 0,
    accountDetails: '',
    transferProof: null
  });

  useEffect(() => {
    checkAuthentication();
    fetchLeadDetails();
    fetchCompletionStatus();
  }, [leadId]);

  const checkAuthentication = () => {
    const agentToken = sessionStorage.getItem('agentToken');
    if (!agentToken) {
      navigate('/agent-login');
    }
  };

  const fetchLeadDetails = async () => {
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeadDetails(data);
        setKycData(prev => ({ ...prev, customerName: data.customer_name }));
        setPaymentData(prev => ({ ...prev, amount: data.initial_quote }));
      } else {
        setError('Failed to fetch lead details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}/completion-status`, {
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompletionStatus(data);
        setCurrentStep(data.current_step);
      }
    } catch (error) {
      console.error('Error fetching completion status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (photoType, file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setPhotos(prev => ({ ...prev, [photoType]: file }));
    } else {
      alert('Photo size should be less than 5MB');
    }
  };

  const submitPhotos = async () => {
    const photoArray = Object.entries(photos)
      .filter(([_, file]) => file !== null)
      .map(([type, file]) => ({ type, data: 'mock_photo_data' }));

    if (photoArray.length !== 6) {
      alert('Please upload all 6 required photos');
      return;
    }

    setUploading(true);
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}/upload-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photos: photoArray })
      });

      if (response.ok) {
        setCurrentStep('kyc');
        fetchCompletionStatus();
      } else {
        setError('Failed to upload photos');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submitKYC = async () => {
    if (!kycData.customerName || !kycData.idNumber || !kycData.customerSelfie) {
      alert('Please fill all required KYC fields');
      return;
    }

    setUploading(true);
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}/submit-kyc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ kycData })
      });

      if (response.ok) {
        setCurrentStep('payment');
        fetchCompletionStatus();
      } else {
        setError('Failed to submit KYC');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentData.method || !paymentData.amount) {
      alert('Please complete payment details');
      return;
    }

    setUploading(true);
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentData })
      });

      if (response.ok) {
        setCurrentStep('completion');
        fetchCompletionStatus();
      } else {
        setError('Failed to confirm payment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const completeDevice = async () => {
    setUploading(true);
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const response = await fetch(`/api/agent/lead/${leadId}/complete-device`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${agentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        navigate('/agent/dashboard');
      } else {
        setError('Failed to complete device');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/agent/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const photoTypes = [
    { key: 'front', label: 'Front View (Screen)', icon: Camera },
    { key: 'back', label: 'Back View', icon: Camera },
    { key: 'left', label: 'Left Side', icon: Camera },
    { key: 'right', label: 'Right Side', icon: Camera },
    { key: 'top', label: 'Top View', icon: Camera },
    { key: 'bottom', label: 'Bottom/Charging Port', icon: Camera }
  ];

  const steps = [
    { key: 'photos', label: 'Device Photos', icon: Camera, completed: completionStatus?.photos_uploaded },
    { key: 'kyc', label: 'KYC Verification', icon: User, completed: completionStatus?.kyc_completed },
    { key: 'payment', label: 'Payment', icon: CreditCard, completed: completionStatus?.payment_confirmed },
    { key: 'completion', label: 'Complete Device', icon: CheckCircle, completed: completionStatus?.device_completed }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/agent/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Complete Lead #{leadDetails?.lead_id}
            </h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Steps */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Steps</h2>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = step.key === currentStep;
                  const isCompleted = step.completed;
                  
                  return (
                    <div key={step.key} className={`flex items-center p-3 rounded-md ${
                      isActive ? 'bg-blue-50 border border-blue-200' : 
                      isCompleted ? 'bg-green-50 border border-green-200' : 
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <StepIcon className={`h-5 w-5 mr-3 ${
                        isActive ? 'text-blue-600' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-blue-900' : 
                        isCompleted ? 'text-green-900' : 
                        'text-gray-600'
                      }`}>
                        {step.label}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails?.customer_name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails?.customer_phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-sm text-gray-900">{leadDetails?.pickup_address}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails?.manufacturer} {leadDetails?.model}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Photo Upload Step */}
            {currentStep === 'photos' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Device Photos</h2>
                <p className="text-sm text-gray-600 mb-6">Please upload 6 photos of the device from different angles. Each photo should be clear and less than 5MB.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {photoTypes.map((photoType) => {
                    const PhotoIcon = photoType.icon;
                    const hasPhoto = photos[photoType.key] !== null;
                    
                    return (
                      <div key={photoType.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900 mb-2">{photoType.label}</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={(e) => handlePhotoUpload(photoType.key, e.target.files[0])}
                          className="hidden"
                          id={`photo-${photoType.key}`}
                        />
                        <label
                          htmlFor={`photo-${photoType.key}`}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md cursor-pointer ${
                            hasPhoto 
                              ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {hasPhoto ? 'Photo Added' : 'Choose Photo'}
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submitPhotos}
                    disabled={uploading || Object.values(photos).some(photo => photo === null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? <LoadingSpinner size="small" /> : <Camera className="h-4 w-4 mr-2" />}
                    Submit Photos
                  </button>
                </div>
              </div>
            )}

            {/* KYC Step */}
            {currentStep === 'kyc' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">KYC Verification</h2>
                <p className="text-sm text-gray-600 mb-6">Please collect and verify customer's identity documents.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={kycData.customerName}
                      onChange={(e) => setKycData(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Government ID Type</label>
                    <select
                      value={kycData.idType}
                      onChange={(e) => setKycData(prev => ({ ...prev, idType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={kycData.idNumber}
                      onChange={(e) => setKycData(prev => ({ ...prev, idNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Photo (Front)</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setKycData(prev => ({ ...prev, idPhotoFront: e.target.files[0] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID Photo (Back)</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setKycData(prev => ({ ...prev, idPhotoBack: e.target.files[0] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Selfie *</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setKycData(prev => ({ ...prev, customerSelfie: e.target.files[0] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={submitKYC}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? <LoadingSpinner size="small" /> : <FileText className="h-4 w-4 mr-2" />}
                    Submit KYC
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Confirmation</h2>
                <p className="text-sm text-gray-600 mb-6">Confirm payment details and method for the customer.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                    <div className="text-2xl font-bold text-green-600">₹{paymentData.amount?.toLocaleString('en-IN')}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={paymentData.method}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  {(paymentData.method === 'bank_transfer' || paymentData.method === 'upi') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {paymentData.method === 'upi' ? 'UPI ID' : 'Account Details'}
                      </label>
                      <input
                        type="text"
                        value={paymentData.accountDetails}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, accountDetails: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={paymentData.method === 'upi' ? 'customer@upi' : 'Bank account details'}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Proof (Optional)</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => setPaymentData(prev => ({ ...prev, transferProof: e.target.files[0] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        Please ensure payment is completed and verified before confirming.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={confirmPayment}
                    disabled={uploading}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? <LoadingSpinner size="small" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}

            {/* Completion Step */}
            {currentStep === 'completion' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Complete Device Processing</h2>
                <p className="text-sm text-gray-600 mb-6">All steps have been completed. Click below to finalize and close this lead.</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Device photos uploaded</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">KYC verification completed</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Payment confirmed</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">
                      Lead #{leadDetails?.lead_id} is ready for completion. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => navigate('/agent/dashboard')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={completeDevice}
                    disabled={uploading}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    {uploading ? <LoadingSpinner size="small" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Complete Device
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCompletion;
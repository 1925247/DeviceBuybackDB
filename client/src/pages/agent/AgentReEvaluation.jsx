import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Package, DollarSign, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AgentReEvaluation = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [leadDetails, setLeadDetails] = useState(null);
  const [agentAnswers, setAgentAnswers] = useState({});
  const [finalPrice, setFinalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    checkAuthentication();
    fetchLeadDetails();
  }, [leadId]);

  useEffect(() => {
    if (leadDetails) {
      calculateFinalPrice();
    }
  }, [agentAnswers, leadDetails]);

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

      if (response.status === 401 || response.status === 403) {
        navigate('/agent-login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLeadDetails(data);
        
        // Initialize agent answers with customer answers
        const initialAnswers = {};
        data.customer_answers.forEach((item, index) => {
          initialAnswers[index] = {
            question: item.question,
            customer_answer: item.answer,
            agent_answer: item.answer,
            customer_deduction: item.deduction,
            agent_deduction: item.deduction
          };
        });
        setAgentAnswers(initialAnswers);
      } else {
        setError('Failed to fetch lead details');
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!leadDetails) return;

    const basePrice = parseFloat(leadDetails.base_price);
    const totalDeduction = Object.values(agentAnswers).reduce((sum, answer) => {
      return sum + (answer.agent_deduction || 0);
    }, 0);

    const calculatedPrice = basePrice * (1 - totalDeduction / 100);
    setFinalPrice(Math.max(0, calculatedPrice));
  };

  const handleAnswerChange = (questionIndex, newAnswer) => {
    const deductionMap = {
      'Excellent': 0,
      'Good (80-90%)': 0,
      'Good': 5,
      'Fair': 15,
      'Poor': 30,
      'Minor scratches': 5,
      'Major scratches': 15,
      'Cracked': 25,
      'None': 0,
      'Minor issues': 10,
      'Major issues': 25
    };

    setAgentAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        agent_answer: newAnswer,
        agent_deduction: deductionMap[newAnswer] || 0
      }
    }));
  };

  const handleSubmitEvaluation = async (decision) => {
    try {
      const agentToken = sessionStorage.getItem('agentToken');
      const agentId = sessionStorage.getItem('agentId');

      const evaluationData = {
        lead_id: leadId,
        agent_id: agentId,
        agent_answers: agentAnswers,
        final_price: finalPrice,
        customer_decision: decision,
        evaluation_timestamp: new Date().toISOString()
      };

      // In real app, send to backend
      console.log('Submitting evaluation:', evaluationData);

      // Navigate back to dashboard
      navigate('/agent/dashboard');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('Failed to submit evaluation');
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

  const customerPrice = parseFloat(leadDetails.customer_price);
  const priceDifference = finalPrice - customerPrice;

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
              Re-Evaluate Lead #{leadDetails.lead_id}
            </h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails.customer_name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails.customer_phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-sm text-gray-900">{leadDetails.pickup_address}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{leadDetails.manufacturer} {leadDetails.model}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Base Price: ₹{parseFloat(leadDetails.base_price).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Re-evaluation Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Device Re-Evaluation</h2>
              
              <div className="space-y-6">
                {Object.entries(agentAnswers).map(([index, answer]) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{answer.question}</h3>
                    
                    {/* Customer's Answer */}
                    <div className="mb-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-xs text-blue-600 font-medium">Customer's Answer:</p>
                      <p className="text-sm text-blue-800">{answer.customer_answer} (Deduction: {answer.customer_deduction}%)</p>
                    </div>

                    {/* Agent's Answer */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Your Evaluation:</label>
                      <select
                        value={answer.agent_answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Excellent">Excellent (0% deduction)</option>
                        <option value="Good">Good (5% deduction)</option>
                        <option value="Fair">Fair (15% deduction)</option>
                        <option value="Poor">Poor (30% deduction)</option>
                        <option value="Minor scratches">Minor scratches (5% deduction)</option>
                        <option value="Major scratches">Major scratches (15% deduction)</option>
                        <option value="Cracked">Cracked (25% deduction)</option>
                        <option value="Good (80-90%)">Good (80-90%) (0% deduction)</option>
                        <option value="None">None (0% deduction)</option>
                        <option value="Minor issues">Minor issues (10% deduction)</option>
                        <option value="Major issues">Major issues (25% deduction)</option>
                      </select>
                      {answer.customer_deduction !== answer.agent_deduction && (
                        <p className="text-xs text-orange-600 mt-1">
                          Difference from customer: {answer.agent_deduction - answer.customer_deduction}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Comparison */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Customer's Online Price</p>
                  <p className="text-lg font-semibold text-gray-900">₹{customerPrice.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600">Your Evaluated Price</p>
                  <p className="text-lg font-semibold text-blue-900">₹{Math.round(finalPrice).toLocaleString('en-IN')}</p>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${priceDifference >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-xs ${priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>Difference</p>
                  <p className={`text-lg font-semibold ${priceDifference >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {priceDifference >= 0 ? '+' : ''}₹{Math.round(priceDifference).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Customer Decision Buttons */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Customer Decision:</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleSubmitEvaluation('accept')}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex-1 justify-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Customer Accepts (₹{Math.round(finalPrice).toLocaleString('en-IN')})
                  </button>
                  
                  <button
                    onClick={() => handleSubmitEvaluation('reject')}
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 flex-1 justify-center"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Customer Rejects
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentReEvaluation;
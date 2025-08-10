import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, AlertTriangle, CheckCircle, XCircle, Camera } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const OrderReEvaluation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [customerAnswers, setCustomerAnswers] = useState({});
  const [agentAnswers, setAgentAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [agentPrice, setAgentPrice] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order details
      const orderResponse = await fetch(`/api/buyback-requests/${orderId}`);
      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        setOrder(orderData);
        
        if (orderData.condition_answers) {
          setCustomerAnswers(JSON.parse(orderData.condition_answers));
        }
        
        // Fetch questions for this device
        const questionsResponse = await fetch(
          `/api/condition-questions/${orderData.device_type}/${orderData.manufacturer}/${orderData.model}`
        );
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentAnswerChange = (questionId, answerId) => {
    setAgentAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateAgentPrice = async () => {
    setCalculating(true);
    try {
      // Calculate new price based on agent's assessment
      const response = await fetch('/api/calculate-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: order.device_type,
          brand: order.manufacturer,
          model: order.model,
          answers: agentAnswers,
          basePrice: order.offered_price // Use customer's base price as reference
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setAgentPrice(result.finalPrice);
        setShowComparison(true);
      }
    } catch (error) {
      console.error('Error calculating agent price:', error);
    } finally {
      setCalculating(false);
    }
  };

  const submitFinalDecision = async (acceptedPrice, decision) => {
    try {
      const response = await fetch(`/api/buyback-requests/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision === 'accept' ? 'completed' : 'cancelled',
          final_price: acceptedPrice,
          agent_answers: JSON.stringify(agentAnswers),
          agent_notes: decision === 'reject' ? 'Customer rejected revised price' : 'Customer accepted revised price',
          updated_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        navigate('/agent/dashboard');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getAnswerText = (questionId, answerId) => {
    const question = questions.find(q => q.id === parseInt(questionId));
    if (!question) return 'Unknown';
    
    const option = question.options?.find(opt => opt.id === parseInt(answerId));
    return option ? option.text : answerId;
  };

  const getAnswerColor = (customerAnswer, agentAnswer) => {
    if (customerAnswer === agentAnswer) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p className="text-red-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate('/agent/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Device Re-Evaluation</h1>
        <p className="text-gray-600 mt-2">Order #{order.order_id}</p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-500">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Device</p>
            <p className="font-medium">{order.manufacturer} {order.model}</p>
            <p className="text-sm text-green-600 font-semibold">
              Online Price: ₹{parseFloat(order.offered_price).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {!showComparison ? (
        /* Re-evaluation Questions */
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Physical Device Assessment</h2>
            <Camera className="h-6 w-6 text-blue-600" />
          </div>

          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <h3 className="font-medium text-gray-900 mb-2">{question.question}</h3>
                
                {/* Customer's Original Answer */}
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800 font-medium">Customer's Answer:</p>
                  <p className="text-sm text-blue-700">
                    {getAnswerText(question.id, customerAnswers[question.id])}
                  </p>
                </div>

                {/* Agent's Assessment */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Your Assessment:</p>
                  {question.options?.map(option => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name={`agent_${question.id}`}
                        value={option.value}
                        checked={agentAnswers[question.id] === option.value}
                        onChange={() => handleAgentAnswerChange(question.id, option.value)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${
                        customerAnswers[question.id] === option.value 
                          ? 'font-medium text-blue-600' 
                          : 'text-gray-700'
                      }`}>
                        {option.text}
                        {option.impact !== undefined && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({option.impact}% impact)
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={calculateAgentPrice}
              disabled={calculating || Object.keys(agentAnswers).length < questions.length}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {calculating ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Calculating...</span>
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Calculate Revised Price
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Price Comparison */
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Price Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Price */}
            <div className="p-4 border-2 border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Customer's Online Price</h3>
              <p className="text-3xl font-bold text-blue-600">
                ₹{parseFloat(order.offered_price).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-600 mt-2">Based on customer's self-assessment</p>
            </div>

            {/* Agent Price */}
            <div className="p-4 border-2 border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Revised Price (Your Assessment)</h3>
              <p className="text-3xl font-bold text-green-600">
                ₹{agentPrice?.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-600 mt-2">Based on physical inspection</p>
            </div>
          </div>

          {/* Difference Analysis */}
          <div className="mb-6">
            {agentPrice !== parseFloat(order.offered_price) && (
              <div className={`p-4 rounded-lg ${
                agentPrice < parseFloat(order.offered_price) 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center">
                  {agentPrice < parseFloat(order.offered_price) ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    agentPrice < parseFloat(order.offered_price) ? 'text-red-800' : 'text-green-800'
                  }`}>
                    Price Difference: ₹{Math.abs(agentPrice - parseFloat(order.offered_price)).toLocaleString('en-IN')}
                    {agentPrice < parseFloat(order.offered_price) ? ' Lower' : ' Higher'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Decision Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => submitFinalDecision(agentPrice, 'accept')}
              className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Customer Accepts ₹{agentPrice?.toLocaleString('en-IN')}
            </button>
            <button
              onClick={() => submitFinalDecision(null, 'reject')}
              className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 flex items-center"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Customer Rejects Offer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReEvaluation;
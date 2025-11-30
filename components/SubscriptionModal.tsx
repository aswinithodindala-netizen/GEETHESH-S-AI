
import React, { useState } from 'react';
import { X, Star, Zap, Shield, CreditCard, Loader2, Smartphone, ArrowLeft, CheckCircle, QrCode, Copy, Check, Search, ArrowRight } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

type PaymentMethod = 'UPI' | 'CARD';
type UpiApp = 'GPAY' | 'PHONEPE' | 'PAYTM';

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const [step, setStep] = useState<'PLANS' | 'METHODS' | 'PROCESSING' | 'SUCCESS'>('PLANS');
  const [selectedPlan, setSelectedPlan] = useState<{name: string, price: string, amount: string} | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [copied, setCopied] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("Initializing...");
  
  // Card State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const UPI_ID = "9550348939@axl";

  const handleSelectPlan = (name: string, price: string, amount: string) => {
    setSelectedPlan({ name, price, amount });
    setStep('METHODS');
  };

  const processPayment = (app?: UpiApp | 'QR_SCAN') => {
    if (!selectedPlan) return;

    // Construct the Real UPI Link with Amount
    const amountParam = `&am=${selectedPlan.amount}.00`; // e.g. &am=149.00
    const commonParams = `pa=${UPI_ID}&pn=GeetheshAI&cu=INR&tn=${selectedPlan.name}_Plan${amountParam}`;
    
    // Handle Deep Linking for Mobile Apps (Real Payment Trigger)
    if (app === 'GPAY') {
        const url = `upi://pay?${commonParams}`;
        window.location.href = url;
    } else if (app === 'PHONEPE') {
        // Try PhonePe specific scheme, fallback to generic if fails
        const url = `phonepe://pay?${commonParams}`;
        window.location.href = url;
    } else if (app === 'PAYTM') {
        const url = `paytmmp://pay?${commonParams}`;
        window.location.href = url;
    }

    // Proceed to Verification UI
    setStep('PROCESSING');
    
    if (app === 'QR_SCAN') {
        setProcessingStatus("Connecting to Bank Server...");
        
        setTimeout(() => {
            setProcessingStatus("Verifying Payment Receipt...");
        }, 2000);

        setTimeout(() => {
            setProcessingStatus("Confirming Transaction...");
        }, 4000);
    } else {
        setProcessingStatus("Waiting for App Confirmation...");
        setTimeout(() => {
            setProcessingStatus("Verifying Transaction Status...");
        }, 3000);
    }
    
    // Simulate gateway processing time (User must confirm they paid in real life)
    setTimeout(() => {
      setStep('SUCCESS');
      // Auto close after success and grant access
      setTimeout(() => {
        onSubscribe();
      }, 2000);
    }, 6000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPlans = () => (
    <div className="p-8 bg-slate-950 flex flex-col justify-center h-full">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Choose Your Plan</h3>
        
        <div className="space-y-4">
            {/* Monthly Plan */}
            <button 
                onClick={() => handleSelectPlan('Monthly', '₹149', '149')}
                className="w-full relative group p-1 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-800 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-left"
            >
                <div className="bg-slate-900 rounded-xl p-5 flex items-center justify-between h-full">
                    <div>
                        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">₹149</span>
                            <span className="text-slate-500">/mo</span>
                        </div>
                    </div>
                    <div className="px-6 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl font-semibold text-sm">
                        Select
                    </div>
                </div>
            </button>

            {/* Quarterly Plan */}
            <button 
                onClick={() => handleSelectPlan('Quarterly', '₹399', '399')}
                className="w-full relative group p-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 transform hover:scale-[1.02] transition-all duration-300 text-left"
            >
                <div className="absolute top-0 right-0 -mt-3 -mr-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 uppercase tracking-wide">
                    Best Value
                </div>
                <div className="bg-slate-900 rounded-xl p-5 flex items-center justify-between h-full relative z-0">
                    <div>
                        <div className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-1">3 Months</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">₹399</span>
                            <span className="text-slate-500">/quarter</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Save 17%</p>
                    </div>
                    <div className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30">
                        Select
                    </div>
                </div>
            </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">
            Secure payments via UPI (PhonePe, GPay, Paytm).
        </p>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="p-6 bg-slate-950 flex flex-col h-full relative">
        <button 
            onClick={() => setStep('PLANS')}
            className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-1 text-sm"
        >
            <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mt-8 mb-4 text-center">
            <span className="text-slate-400 text-xs uppercase tracking-widest">Paying amount</span>
            <div className="text-3xl font-bold text-white mt-1">{selectedPlan?.price}</div>
            <div className="text-indigo-400 text-sm font-medium">{selectedPlan?.name} Plan</div>
        </div>

        {/* Method Tabs */}
        <div className="flex p-1 bg-slate-900 rounded-xl mb-6">
            <button 
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'UPI' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                UPI / QR
            </button>
            <button 
                onClick={() => setPaymentMethod('CARD')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'CARD' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Card
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {paymentMethod === 'UPI' ? (
                <div className="space-y-6">
                    
                    {/* QR Code Section */}
                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <p className="text-slate-800 text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                            <QrCode className="w-4 h-4" /> Scan to Pay
                        </p>
                        <div className="bg-slate-100 p-2 rounded-xl mb-3">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=GeetheshAI&cu=INR&am=${selectedPlan?.amount}.00`)}`}
                                alt="Payment QR" 
                                className="w-32 h-32 mix-blend-multiply"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            <span className="text-slate-600 font-mono text-xs font-medium">{UPI_ID}</span>
                            <button 
                                onClick={copyUpiId}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Scan with any UPI app to pay {selectedPlan?.price}</p>
                        
                        {/* Continue Button */}
                        <button 
                            onClick={() => processPayment('QR_SCAN')}
                            className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-1"
                        >
                            <span>Continue to Pay</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Apps Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                        <div className="relative flex justify-center"><span className="bg-slate-950 px-2 text-[10px] text-slate-500 uppercase">Or Pay via App (Mobile)</span></div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => processPayment('GPAY')}
                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                                    <img src="https://cdn-icons-png.flaticon.com/128/6124/6124998.png" alt="GPay" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-medium text-slate-300 text-sm">Google Pay</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-indigo-500"></div>
                        </button>

                        <button 
                            onClick={() => processPayment('PHONEPE')}
                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#5f259f] rounded-lg flex items-center justify-center p-1.5">
                                   <span className="text-white font-bold text-[8px]">Pe</span>
                                </div>
                                <span className="font-medium text-slate-300 text-sm">PhonePe</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-indigo-500"></div>
                        </button>

                        <button 
                            onClick={() => processPayment('PAYTM')}
                            className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 rounded-xl transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#00b9f1] rounded-lg flex items-center justify-center p-1">
                                   <span className="text-white font-bold text-[8px]">Paytm</span>
                                </div>
                                <span className="font-medium text-slate-300 text-sm">Paytm</span>
                            </div>
                            <div className="w-4 h-4 rounded-full border border-slate-600 group-hover:border-indigo-500"></div>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-xs text-slate-400">Expiry</label>
                            <input 
                                type="text" 
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-2 w-24">
                            <label className="text-xs text-slate-400">CVC</label>
                            <input 
                                type="text" 
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <button 
                        onClick={() => processPayment()}
                        disabled={!cardNumber || !expiry || !cvc}
                        className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30"
                    >
                        Pay {selectedPlan?.price}
                    </button>
                </div>
            )}
        </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="p-8 bg-slate-950 flex flex-col items-center justify-center h-full text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{processingStatus}</h3>
        <p className="text-slate-400 text-sm">Please do not close this window...</p>
        <div className="mt-8 w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_infinite] w-1/2 rounded-full"></div>
        </div>
        
        {processingStatus.includes("Verifying") && (
             <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                <Search className="w-3 h-3" /> Checking with bank server...
             </div>
        )}
    </div>
  );

  const renderSuccess = () => (
    <div className="p-8 bg-slate-950 flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Payment Received!</h3>
        <p className="text-slate-400 text-sm mb-6">Your Premium Plan is now active.</p>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full max-w-xs text-left">
            <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">Transaction ID</span>
                <span className="text-slate-300 font-mono">TXN_{Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">Amount Paid</span>
                <span className="text-green-400 font-bold">{selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-800">
                <span className="text-slate-500">Status</span>
                <span className="text-green-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full h-[600px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Value Prop (Static) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-900 to-slate-900 p-8 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                  <Star className="w-6 h-6 text-indigo-400 fill-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Premium</h2>
              <p className="text-indigo-200 text-sm mb-8">Unlock the full power of Geethesh's AI without limits.</p>
              
              <ul className="space-y-4">
                  {[
                      { text: "Unlimited AI Chat & Writing", icon: Zap },
                      { text: "Unlimited Image Generation", icon: Zap },
                      { text: "Extended Voice Sessions", icon: Zap },
                      { text: "Priority Fast Processing", icon: Shield },
                      { text: "Access to New Features First", icon: Star },
                  ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-slate-200">
                          <div className="p-1 bg-indigo-500 rounded-full">
                              <item.icon className="w-3 h-3 text-white" />
                          </div>
                          {item.text}
                      </li>
                  ))}
              </ul>
           </div>
           
           <div className="relative z-10 mt-8 pt-6 border-t border-indigo-500/30">
              <p className="text-xs text-indigo-300 italic">"The best AI investment I've made for my productivity."</p>
           </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="w-full md:w-7/12 relative">
            {step === 'PLANS' && renderPlans()}
            {step === 'METHODS' && renderPaymentMethods()}
            {step === 'PROCESSING' && renderProcessing()}
            {step === 'SUCCESS' && renderSuccess()}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

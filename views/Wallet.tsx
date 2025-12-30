
import React, { useState } from 'react';
import { Currency, Transaction } from '../types';

interface WalletProps {
  balance: number;
  currency: Currency;
  transactions: Transaction[];
  onDeposit: (amountAOA: number) => void;
  onWithdraw: (amountAOA: number) => boolean;
  onBack: () => void;
}

const PAYMENT_METHODS = [
  { id: 'mc_express', name: 'MC Express', icon: '📱', color: 'bg-blue-600' },
  { id: 'unitel_money', name: 'Unitel Money', icon: '🍊', color: 'bg-orange-500' },
  { id: 'paypay', name: 'PayPay AO', icon: '🅿️', color: 'bg-indigo-600' },
  { id: 'bank_transfer', name: 'IBAN / Transfer', icon: '🏦', color: 'bg-gray-700' },
  { id: 'visa_master', name: 'Cartão Visa', icon: '💳', color: 'bg-yellow-600' },
  { id: 'crypto', name: 'Cripto / USDT', icon: '₿', color: 'bg-green-600' }
];

const Wallet: React.FC<WalletProps> = ({ balance, currency, transactions, onDeposit, onWithdraw, onBack }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatBalance = (val: number) => {
    if (currency === 'USD') return `$ ${(val / 830).toFixed(2)}`;
    return `Kz ${val.toLocaleString()}`;
  };

  const handleAction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      let success = false;
      if (activeTab === 'deposit') {
        onDeposit(numAmount);
        success = true;
      } else {
        success = onWithdraw(numAmount);
      }

      setIsProcessing(false);
      if (success) {
        setShowSuccess(true);
        setAmount('');
        setSelectedMethod('');
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Saldo insuficiente para realizar o levantamento.');
      }
    }, 2000);
  };

  return (
    <div className="py-6 space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-xl font-black uppercase tracking-tighter">Carteira KIMBA</h2>
        </div>
      </div>

      {/* Credit Card Style Balance */}
      <div className="relative h-56 w-full bg-gradient-to-br from-[#E41B17] via-black to-[#FFCC00] rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Saldo Digital</p>
              <h3 className="text-4xl font-black tracking-tighter mt-1">{formatBalance(balance)}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-mono tracking-widest opacity-80">**** **** **** 2024</p>
            <p className="text-[10px] font-black uppercase tracking-widest">KIMBA PAY</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => {setActiveTab('deposit'); setAmount(''); setSelectedMethod('');}}
          className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white dark:bg-black text-[#E41B17] shadow-lg' : 'text-gray-400'}`}
        >
          Recarregar
        </button>
        <button 
          onClick={() => {setActiveTab('withdraw'); setAmount(''); setSelectedMethod('');}}
          className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white dark:bg-black text-[#FFCC00] shadow-lg' : 'text-gray-400'}`}
        >
          Levantar
        </button>
      </div>

      {/* Action Form */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Selecionar Método</h4>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-5 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                  selectedMethod === method.id 
                  ? 'border-[#E41B17] bg-[#E41B17]/5' 
                  : 'border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className={`text-[9px] font-black uppercase tracking-tight ${selectedMethod === method.id ? 'text-[#E41B17]' : 'text-gray-500'}`}>{method.name}</span>
                {selectedMethod === method.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#E41B17] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Montante em Kwanza (AOA)</h4>
          <div className="relative">
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-[2rem] px-8 py-6 text-2xl font-black outline-none transition-all placeholder:opacity-20"
              placeholder="0.00"
            />
            <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-gray-300">AOA</span>
          </div>
        </div>

        <button 
          onClick={handleAction}
          disabled={!selectedMethod || !amount || isProcessing}
          className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 ${
            selectedMethod && amount 
            ? 'bg-black dark:bg-white text-white dark:text-black active:scale-95' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{activeTab === 'deposit' ? 'Confirmar Recarga' : 'Solicitar Levantamento'}</span>
          )}
        </button>
      </div>

      {/* Transactions History Section */}
      <div className="pt-8 space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Histórico Financeiro</h4>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-gray-50 dark:bg-gray-900 rounded-[2rem] p-5 flex items-center justify-between border border-gray-100 dark:border-gray-800 group hover:border-[#E41B17]/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                    tx.type === 'deposit' 
                    ? 'bg-green-500/10 text-green-500' 
                    : tx.type === 'payment' 
                    ? 'bg-[#E41B17]/10 text-[#E41B17]' 
                    : 'bg-gray-200 dark:bg-black text-gray-500'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m16 10-4-4-4 4M12 6v12"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m8 14 4 4 4-4M12 18V6"/></svg>
                    )}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-black dark:text-white leading-tight">{tx.description}</h5>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${
                    tx.type === 'deposit' ? 'text-green-500' : 'text-black dark:text-white'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'} {formatBalance(tx.amount)}
                  </p>
                  <p className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">Efetuado</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-white dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200 shadow-sm">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Sem movimentos registados.</p>
          </div>
        )}
      </div>

      {/* Success Modal Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-black rounded-[3rem] w-full max-w-sm p-10 text-center space-y-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-[#25D366] rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6 9 17 4 12"/></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tighter uppercase">Operação Concluída</h3>
              <p className="text-xs text-gray-500 font-medium">O seu saldo foi atualizado com sucesso. O comprovativo foi enviado por email.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-[10px] tracking-widest uppercase">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;


import React, { useState, useRef, useEffect } from 'react';
import { INTERESTS, Icons } from '../constants';

interface OnboardingProps {
  onComplete: (data: { name: string, email: string, interests: string[] }) => void;
}

type OnboardingStep = 'welcome' | 'email' | 'verify' | 'interests';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const simulateSendEmail = () => {
    if (!email || !name) return;
    setIsVerifying(true);
    // Simulação de delay de envio
    setTimeout(() => {
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const verifyCode = () => {
    const code = otp.join('');
    if (code.length === 6) {
      setIsVerifying(true);
      // Simulação de validação
      setTimeout(() => {
        setIsVerifying(false);
        setStep('interests');
      }, 1000);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-[#E41B17] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/20">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                KIMBA<br/><span className="text-[#E41B17]">ANGOLA</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Conhecimento que gera movimento. Junte-se à nova economia digital angolana.
              </p>
            </div>
            <button 
              onClick={() => setStep('email')}
              className="w-full max-w-xs py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2.5rem] shadow-xl uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
            >
              Criar Conta Grátis
            </button>
          </div>
        );

      case 'email':
        return (
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Identificação</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Introduza os seus dados reais</p>
            </div>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Como devemos chamar-te?</label>
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Manuel dos Santos" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">O seu melhor Email</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com" 
                    className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all"
                  />
               </div>
            </div>
            <button 
              onClick={simulateSendEmail}
              disabled={!email.includes('@') || name.length < 3 || isVerifying}
              className="w-full py-5 bg-[#E41B17] text-white font-black rounded-[2.5rem] shadow-xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enviar Código</span>
                  <Icons.ArrowRight />
                </>
              )}
            </button>
          </div>
        );

      case 'verify':
        return (
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-500 text-center">
             <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Validar Email</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Enviámos um código para:<br/>
                <span className="text-black dark:text-white lowercase">{email}</span>
              </p>
            </div>
            
            <div className="flex justify-between gap-2 max-w-sm mx-auto">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  className="w-12 h-14 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#FFCC00] rounded-2xl text-center text-xl font-black outline-none transition-all"
                />
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={verifyCode}
                disabled={otp.some(d => !d) || isVerifying}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2.5rem] shadow-xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verificar Agora</span>
                )}
              </button>
              <button 
                onClick={() => setStep('email')}
                className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[#E41B17] transition-colors"
              >
                Mudar Email ou Reenviar
              </button>
            </div>
          </div>
        );

      case 'interests':
        return (
          <div className="w-full max-w-md space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase">Interesses</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Personalize o seu feed KIMBA</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-[2rem] border-2 text-left flex flex-col justify-between h-28 transition-all duration-300 ${
                      isSelected 
                      ? 'border-[#E41B17] bg-[#E41B17]/5 text-[#E41B17]' 
                      : 'border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 text-gray-400'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                      {isSelected && <div className="w-3 h-3 bg-current rounded-full" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{interest.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onComplete({ name, email, interests: selectedInterests })}
              disabled={selectedInterests.length === 0}
              className="w-full py-5 bg-[#E41B17] text-white font-black rounded-[2.5rem] shadow-2xl shadow-red-500/30 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400"
            >
              <span>Concluir Registo</span>
              <Icons.ArrowRight />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-8 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-[#E41B17]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-[#FFCC00]/5 rounded-full blur-3xl -z-10" />
      
      {renderStep()}

      <div className="mt-12 flex items-center space-x-2 text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">
         <div className="w-1 h-1 rounded-full bg-gray-200" />
         <span>Orgulho em Angola</span>
         <div className="w-1 h-1 rounded-full bg-gray-200" />
      </div>
    </div>
  );
};

export default Onboarding;

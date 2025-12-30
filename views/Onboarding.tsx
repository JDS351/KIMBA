
import React, { useState, useRef, useEffect } from 'react';
import { INTERESTS, Icons } from '../constants';
import { extractDataFromID } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (data: { name: string, email: string, interests: string[] }) => void;
}

type OnboardingStep = 'welcome' | 'identification' | 'verify' | 'interests';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Angola');
  const [idType, setIdType] = useState('Bilhete de Identidade');
  const [idNumber, setIdNumber] = useState('');
  const [isDataSynced, setIsDataSynced] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Geolocalização para país aproximado
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Mock de geocoding aproximado: Em Angola latitudes são negativas e longitudes perto de 13-18
        const { latitude, longitude } = position.coords;
        if (latitude < 0 && longitude > 10 && longitude < 25) {
          setCountry('Angola');
        }
      });
    }
  }, []);

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

  const handleSyncIdentity = async () => {
    if (!idNumber) return;
    setIsScanning(true);
    
    // IA simula a recuperação de dados oficiais (OCR Virtual)
    const data = await extractDataFromID(idNumber, idType, country);
    
    if (data) {
      setName(data.name);
      setEmail(data.email);
      setCountry(data.validatedCountry);
      setIdType(data.validatedDocType);
      setIsDataSynced(true);
    }
    
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  const verifyCode = () => {
    const code = otp.join('');
    if (code.length === 6) {
      setIsVerifying(true);
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
          <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-[#E41B17] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/20">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                KIMBA<br/><span className="text-[#E41B17]">ANGOLA</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Conhecimento que gera movimento. A sua nova economia digital.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-4">
              <button 
                onClick={() => setStep('identification')}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2.5rem] shadow-xl uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
              >
                Criar Conta Grátis
              </button>
              <button 
                onClick={() => alert("Módulo de Login em desenvolvimento para o próximo sprint!")}
                className="w-full py-5 bg-gray-50 dark:bg-gray-900 text-gray-400 font-black rounded-[2.5rem] border border-gray-100 dark:border-gray-800 uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
              >
                Já tenho conta (Login)
              </button>
            </div>
          </div>
        );

      case 'identification':
        return (
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Identidade</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">IA OCR + Autodeclaração</p>
            </div>
            
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">País Emissor</label>
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-xs font-bold outline-none transition-all"
                    >
                      <option>Angola</option>
                      <option>Portugal</option>
                      <option>Brasil</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Documento</label>
                    <select 
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-xs font-bold outline-none transition-all"
                    >
                      <option>Bilhete de Identidade</option>
                      <option>Passaporte</option>
                      <option>Carta de Condução</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nº do Documento</label>
                  <div className="relative">
                    <input 
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Introduza o número oficial" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all"
                    />
                    {!isDataSynced && (
                      <button 
                        onClick={handleSyncIdentity}
                        disabled={idNumber.length < 5 || isScanning}
                        className="absolute right-2 top-2 bottom-2 px-5 bg-[#E41B17] text-white rounded-2xl text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-30 flex items-center space-x-2"
                      >
                        {isScanning ? (
                          <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            <span>Escanear</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
               </div>

               {isDataSynced && (
                 <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center space-x-3">
                       <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17 4 12"/></svg>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-green-600">OCR IA: {country} Validado</p>
                          <p className="text-[8px] font-bold text-green-500/70 uppercase">República de Angola identificado com sucesso</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Autodeclaração: Nome Completo</label>
                        <input 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nome Completo" 
                          className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Autodeclaração: Email</label>
                        <input 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="exemplo@email.com" 
                          className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-[#E41B17] rounded-3xl px-6 py-4 text-sm font-bold outline-none transition-all"
                        />
                      </div>
                    </div>
                 </div>
               )}
            </div>

            <button 
              onClick={() => setStep('verify')}
              disabled={!isDataSynced || !name || !email}
              className="w-full py-5 bg-[#E41B17] text-white font-black rounded-[2.5rem] shadow-2xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 disabled:bg-gray-200 dark:disabled:bg-gray-800"
            >
              <span>Validar Dados e Continuar</span>
              <Icons.ArrowRight />
            </button>
          </div>
        );

      case 'verify':
        return (
          <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-4 duration-500 text-center">
             <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Validar Conta</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Enviamos um código para:<br/>
                <span className="text-[#E41B17] lowercase font-medium">{email}</span>
              </p>
            </div>
            
            <div className="flex justify-between gap-2 max-w-sm mx-auto">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
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

            <button 
              onClick={verifyCode}
              disabled={otp.some(d => !d) || isVerifying}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[2.5rem] shadow-xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Ativar Perfil Digital</span>
              )}
            </button>
          </div>
        );

      case 'interests':
        return (
          <div className="w-full max-w-md space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Interesses</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Personalize o seu ecossistema</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-[2rem] border-2 text-left flex flex-col justify-between h-28 transition-all duration-300 ${
                    selectedInterests.includes(interest.id)
                    ? 'border-[#E41B17] bg-[#E41B17]/5 text-[#E41B17]' 
                    : 'border-gray-50 dark:border-gray-900 bg-gray-50 dark:bg-gray-900 text-gray-400'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center">
                    {selectedInterests.includes(interest.id) && <div className="w-3 h-3 bg-current rounded-full" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{interest.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onComplete({ name, email, interests: selectedInterests })}
              disabled={selectedInterests.length === 0}
              className="w-full py-5 bg-[#E41B17] text-white font-black rounded-[2.5rem] shadow-2xl uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3"
            >
              <span>Concluir Onboarding</span>
              <Icons.ArrowRight />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-8 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-[#E41B17]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-[#FFCC00]/5 rounded-full blur-3xl -z-10" />
      {renderStep()}
    </div>
  );
};

export default Onboarding;

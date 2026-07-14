import React, { useState, useEffect } from 'react';
import { Location, City } from '../types';
import { 
  Calculator, 
  TrendingUp, 
  Coins, 
  Copy,
  Percent, 
  Landmark, 
  Ruler, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  HelpCircle,
  TrendingDown,
  Info,
  DollarSign,
  MapPin,
  User,
  Phone,
  ExternalLink,
  ChevronDown,
  Check,
  Save,
  Trash2,
  Clock,
  Sparkles,
  Plus,
  ChevronUp,
  Share2,
  X
} from 'lucide-react';

interface AcquisitionCalculatorProps {
  locations: Location[];
  cities: City[];
  onSelectProperty?: (property: Location) => void;
}

interface SavedEstimation {
  id: string;
  name: string;
  date: string;
  propertyName: string;
  propertyId: string;
  basePrice: number;
  sqft: number;
  stampDutyPercent: number;
  stampDutyCost: number;
  registrationPercent: number;
  registrationCost: number;
  brokeragePercent: number;
  brokerageCost: number;
  infrastructureFees: number;
  totalAcquisitionCost: number;
  financingNeeded: boolean;
  downPaymentPercent: number;
  downPaymentAmount: number;
  interestRate: number;
  loanTenureYears: number;
  emiAmount: number;
  totalRepayment: number;
  totalInterestPayable: number;
  aggregateOutlayWithInterest: number;
  appreciationRate: number;
}

const LANGUAGES_TEXT = {
  en: {
    title: "🏡 PROPERTY ACQUISITION & INVESTMENT ESTIMATE",
    dear: "Dear",
    thankYou: "Thank you for your interest. Please find below the detailed estimation for your selected property.",
    propertyDetails: "📍 Property Details",
    proposal: "Proposal",
    plotSize: "Plot Size",
    estimationDate: "Estimation Date",
    costBreakdown: "💰 Acquisition Cost Breakdown",
    colDescription: "Description",
    colAmount: "Amount",
    basePrice: "🏞️ Base Land Price",
    stampDuty: "Stamp Duty",
    registration: "Registration Fee",
    brokerage: "Brokerage",
    infrastructure: "Infrastructure Charges",
    totalCost: "✅ Total Acquisition Cost",
    inclusiveCharges: "*(Inclusive of all applicable charges mentioned above.)*",
    futureValueTitle: "📈 Estimated Future Property Value",
    appreciationNote: "Based on an assumed annual appreciation of",
    colPeriod: "Investment Period",
    colFutureValue: "Estimated Property Value",
    after3Years: "📅 After 3 Years",
    after5Years: "📅 After 5 Years",
    after10Years: "📅 After 10 Years",
    moreInfo: "📞 For More Information",
    consultant: "Property Consultant",
    mobile: "Mobile",
    chooseDmns: "Thank you for choosing **DMNS Land & Plot Planner**.",
    assistNote: "We appreciate the opportunity to assist you and look forward to helping you make a valuable investment.",
    bestRegards: "Best Regards,",
    companyName: "DMNS Land & Plot Planner"
  },
  te: {
    title: "🏡 PROPERTY ACQUISITION & INVESTMENT ESTIMATE (ఆస్తి కొనుగోలు మరియు పెట్టుబడి అంచనా)",
    dear: "Dear (ప్రియమైన)",
    thankYou: "Thank you for your interest. Please find below the detailed estimation for your selected property.\n(మా ప్రాజెక్ట్ పట్ల ఆసక్తి చూపినందుకు ధన్యవాదాలు. మీరు ఎంచుకున్న ప్లాట్ యొక్క పూర్తి అంచనా వివరాలు క్రింద ఇవ్వబడ్డాయి.)",
    propertyDetails: "📍 Property Details (ప్లాట్ వివరాలు)",
    proposal: "Proposal (ప్రపోజల్)",
    plotSize: "Plot Size (ప్లాట్ వైశాల్యం)",
    estimationDate: "Estimation Date (అంచనా తేదీ)",
    costBreakdown: "💰 Acquisition Cost Breakdown (కొనుగోలు వ్యయాల వివరణ)",
    colDescription: "Description (వివరాలు)",
    colAmount: "Amount (మొత్తం)",
    basePrice: "🏞️ Base Land Price (ప్లాట్ బేస్ ధర)",
    stampDuty: "Stamp Duty (స్టాంప్ డ్యూటీ)",
    registration: "Registration Fee (రిజిస్ట్రేషన్ ఫీజు)",
    brokerage: "Brokerage (బ్రోకరేజ్ / కమీషన్)",
    infrastructure: "Infrastructure Charges (ఇన్ఫ్రాస్ట్రక్చర్ ఛార్జీలు)",
    totalCost: "✅ Total Acquisition Cost (మొత్తం కొనుగోలు ఖర్చు)",
    inclusiveCharges: "*(Inclusive of all applicable charges mentioned above. / పైన పేర్కొన్న అన్ని వర్తించే ఛార్జీలతో కలిపి.)*",
    futureValueTitle: "📈 Estimated Future Property Value (భవిష్యత్తులో ఆస్తి విలువ అంచనా)",
    appreciationNote: "Based on an assumed annual appreciation of",
    colPeriod: "Investment Period (సమయం)",
    colFutureValue: "Estimated Property Value (అంచనా విలువ)",
    after3Years: "📅 After 3 Years (3 సంవత్సరాల తరువాత)",
    after5Years: "📅 After 5 Years (5 సంవత్సరాల తరువాత)",
    after10Years: "📅 After 10 Years (10 సంవత్సరాల తరువాత)",
    moreInfo: "📞 For More Information (మరిన్ని వివరాల కోసం)",
    consultant: "Property Consultant (ఆస్తి సలహాదారు)",
    mobile: "Mobile (మొబైల్)",
    chooseDmns: "Thank you for choosing **DMNS Land & Plot Planner**.\n(**DMNS Land & Plot Planner** ని ఎంచుకున్నందుకు ధన్యవాదాలు.)",
    assistNote: "We appreciate the opportunity to assist you and look forward to helping you make a valuable investment.\n(మీకు సేవ చేసే అవకాశం కల్పించినందుకు మేము అభినందిస్తున్నాము మరియు మీ విలువైన పెట్టుబడి ప్రయాణంలో సహాయం చేయడానికి ఎదురుచూస్తున్నాము.)",
    bestRegards: "Best Regards (భవదీయుడు),",
    companyName: "DMNS Land & Plot Planner"
  },
  hi: {
    title: "🏡 PROPERTY ACQUISITION & INVESTMENT ESTIMATE (संपत्ति खरीद एवं निवेश अनुमान)",
    dear: "Dear (प्रिय)",
    thankYou: "Thank you for your interest. Please find below the detailed estimation for your selected property.\n(हमारी परियोजना में रुचि दिखाने के लिए धन्यवाद। आपके द्वारा चुने गए प्लॉट का विस्तृत अनुमान नीचे दिया गया है।)",
    propertyDetails: "📍 Property Details (प्लॉट विवरण)",
    proposal: "Proposal (प्रस्ताव)",
    plotSize: "Plot Size (प्लॉट का आकार)",
    estimationDate: "Estimation Date (अनुमानित तिथि)",
    costBreakdown: "💰 Acquisition Cost Breakdown (खरीद लागत का विवरण)",
    colDescription: "Description (विवरण)",
    colAmount: "Amount (राशि)",
    basePrice: "🏞️ Base Land Price (बुनियादी भूमि मूल्य)",
    stampDuty: "Stamp Duty (स्टाम्प शुल्क)",
    registration: "Registration Fee (पंजीकरण शुल्क)",
    brokerage: "Brokerage (दलाली / ब्रोकरेज)",
    infrastructure: "Infrastructure Charges (बुनियादी ढांचा शुल्क)",
    totalCost: "✅ Total Acquisition Cost (कुल खरीद लागत)",
    inclusiveCharges: "*(Inclusive of all applicable charges mentioned above. / उपरोक्त सभी लागू शुल्कों सहित।)*",
    futureValueTitle: "📈 Estimated Future Property Value (भविष्य का अनुमानित संपत्ति मूल्य)",
    appreciationNote: "Based on an assumed annual appreciation of",
    colPeriod: "Investment Period (निवेश अवधि)",
    colFutureValue: "Estimated Property Value (अनुमानित संपत्ति मूल्य)",
    after3Years: "📅 After 3 Years (3 वर्षों के बाद)",
    after5Years: "📅 After 5 Years (5 वर्षों के बाद)",
    after10Years: "📅 After 10 Years (10 वर्षों के बाद)",
    moreInfo: "📞 For More Information (अधिक जानकारी के लिए)",
    consultant: "Property Consultant (संपत्ति सलाहकार)",
    mobile: "Mobile (मोबाइल)",
    chooseDmns: "Thank you for choosing **DMNS Land & Plot Planner**.\n(**DMNS Land & Plot Planner** को चुनने के लिए धन्यवाद।)",
    assistNote: "We appreciate the opportunity to assist you and look forward to helping you make a valuable investment.\n(हम आपकी सहायता करने के अवसर की सराहना करते हैं और आपके मूल्यवान निवेश में आपकी सहायता करने के लिए तत्पर हैं।)",
    bestRegards: "Best Regards (सादर),",
    companyName: "DMNS Land & Plot Planner"
  },
  ta: {
    title: "🏡 PROPERTY ACQUISITION & INVESTMENT ESTIMATE (சொத்து வாங்குதல் மற்றும் முதலீட்டு மதிப்பீடு)",
    dear: "Dear (அன்புள்ள)",
    thankYou: "Thank you for your interest. Please find below the detailed estimation for your selected property.\n(எங்கள் திட்டத்தில் ஆர்வம் காட்டியதற்கு நன்றி. நீங்கள் தேர்ந்தெடுத்த சொத்தின் விரிவான மதிப்பீடு கீழே கொடுக்கப்பட்டுள்ளது.)",
    propertyDetails: "📍 Property Details (சொத்து விவரங்கள்)",
    proposal: "Proposal (முன்மொழிவு)",
    plotSize: "Plot Size (அளவு)",
    estimationDate: "Estimation Date (மதிப்பீடு செய்யப்பட்ட தேதி)",
    costBreakdown: "💰 Acquisition Cost Breakdown (கையகப்படுத்தல் செலவு விவரம்)",
    colDescription: "Description (விவரம்)",
    colAmount: "Amount (தொகை)",
    basePrice: "🏞️ Base Land Price (அடிப்படை நில விலை)",
    stampDuty: "Stamp Duty (முத்திரைத்தாள் கட்டணம்)",
    registration: "Registration Fee (பதிவு கட்டணம்)",
    brokerage: "Brokerage (தரகு கட்டணம்)",
    infrastructure: "Infrastructure Charges (உள்கட்டமைப்பு கட்டணம்)",
    totalCost: "✅ Total Acquisition Cost (மொத்த கொள்முதல் செலவு)",
    inclusiveCharges: "*(Inclusive of all applicable charges mentioned above. / மேலே குறிப்பிட்டுள்ள அனைத்து பொருந்தக்கூடிய கட்டணங்கள் உட்பட.)*",
    futureValueTitle: "📈 Estimated Future Property Value (சொத்தின் எதிர்கால மதிப்பிடப்பட்ட மதிப்பு)",
    appreciationNote: "Based on an assumed annual appreciation of",
    colPeriod: "Investment Period (முதலீட்டு காலம்)",
    colFutureValue: "Estimated Property Value (மதிப்பிடப்பட்ட சொத்து மதிப்பு)",
    after3Years: "📅 After 3 Years (3 ஆண்டுகளுக்குப் பிறகு)",
    after5Years: "📅 After 5 Years (5 ஆண்டுகளுக்குப் பிறகு)",
    after10Years: "📅 After 10 Years (10 ஆண்டுகளுக்குப் பிறகு)",
    moreInfo: "📞 For More Information (மேலும் விவரங்களுக்கு)",
    consultant: "Property Consultant (சொத்து ஆலோசகர்)",
    mobile: "Mobile (கைபேசி எண்)",
    chooseDmns: "Thank you for choosing **DMNS Land & Plot Planner**.\n(**DMNS Land & Plot Planner** ஐத் தேர்ந்தெடுத்ததற்கு நன்றி.)",
    assistNote: "We appreciate the opportunity to assist you and look forward to helping you make a valuable investment.\n(உங்களுக்கு உதவ கிடைத்த வாய்ப்பை நாங்கள் பாராட்டுகிறோம், மேலும் உங்கள் மதிப்புமிக்க முதலீட்டு பயணத்தில் உதவ ஆவலுடன் காத்திருக்கிறோம்.)",
    bestRegards: "Best Regards (அன்புடன்),",
    companyName: "DMNS Land & Plot Planner"
  },
  kn: {
    title: "🏡 PROPERTY ACQUISITION & INVESTMENT ESTIMATE (ಆಸ್ತಿ ಖರೀದಿ ಮತ್ತು ಹೂಡಿಕೆ ಅಂದಾಜು)",
    dear: "Dear (ಆತ್ಮೀಯ)",
    thankYou: "Thank you for your interest. Please find below the detailed estimation for your selected property.\n(ನಮ್ಮ ಯೋಜನೆಯಲ್ಲಿ ಆಸಕ್ತಿ ತೋರಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಪ್ಲಾಟ್‌ಗೆ ಸಂಬಂಧಿಸಿದ ವಿವರವಾದ ಅಂದಾಜು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.)",
    propertyDetails: "📍 Property Details (ಆಸ್ತಿಯ ವಿವರಗಳು)",
    proposal: "Proposal (ಪ್ರಸ್ತಾವನೆ)",
    plotSize: "Plot Size (ಪ್ಲಾಟ್ ಗಾತ್ರ)",
    estimationDate: "Estimation Date (ಅಂದಾಜು ದಿನಾಂಕ)",
    costBreakdown: "💰 Acquisition Cost Breakdown (ಖರೀದಿ ವೆಚ್ಚಗಳ ವಿವರಣೆ)",
    colDescription: "Description (ವಿವರಣೆ)",
    colAmount: "Amount (ಮೊತ್ತ)",
    basePrice: "🏞️ Base Land Price (ಮೂಲ ಭೂಮಿ ಬೆಲೆ)",
    stampDuty: "Stamp Duty (ಮುದ್ರಾಂಕ ಶುಲ್క)",
    registration: "Registration Fee (ನೋಂದಣಿ ಶುಲ್ಕ)",
    brokerage: "Brokerage (ದಲ್ಲಾಳಿ ವೆಚ್ಚ)",
    infrastructure: "Infrastructure Charges (ಮೂಲಸೌಕರ್ಯ ವೆಚ್ಚಗಳು)",
    totalCost: "✅ Total Acquisition Cost (ಒಟ್ಟು ಖರೀದಿ ವೆಚ್ಚ)",
    inclusiveCharges: "*(Inclusive of all applicable charges mentioned above. / ಮೇಲೆ ತಿಳಿಸಲಾದ ಎಲ್ಲಾ ಅನ್ವಯವಾಗುವ ವೆಚ್ಚಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.)*",
    futureValueTitle: "📈 Estimated Future Property Value (ಭವಿಷ್ಯದ ಅಂದಾಜು ಆಸ್ತಿ ಮೌಲ್ಯ)",
    appreciationNote: "Based on an assumed annual appreciation of",
    colPeriod: "Investment Period (ಹೂಡಿಕೆ ಅವಧಿ)",
    colFutureValue: "Estimated Property Value (ಅಂದಾಜು ಆಸ್ತಿ ಮೌಲ್ಯ)",
    after3Years: "📅 After 3 Years (3 ವರ್ಷಗಳ ನಂತರ)",
    after5Years: "📅 After 5 Years (5 ವರ್ಷಗಳ ನಂತರ)",
    after10Years: "📅 After 10 Years (10 ವರ್ಷಗಳ ನಂತರ)",
    moreInfo: "📞 For More Information (ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ)",
    consultant: "Property Consultant (ಆಸ್ತಿ ಸಲಹೆಗಾರ)",
    mobile: "Mobile (ಮೊಬೈಲ್)",
    chooseDmns: "Thank you for choosing **DMNS Land & Plot Planner**.\n(**DMNS Land & Plot Planner** ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.)",
    assistNote: "We appreciate the opportunity to assist you and look forward to helping you make a valuable investment.\n(ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿಕ್ಕ ಅವಕಾಶವನ್ನು ನಾವು ಪ್ರಶಂಸಿಸುತ್ತೇವೆ ಮತ್ತು ನಿಮ್ಮ ಅಮೂಲ್ಯವಾದ ಹೂಡಿಕೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಎದುರುನೋಡುತ್ತಿದ್ದೇವೆ.)",
    bestRegards: "Best Regards (ಇಂತಿ ನಮಸ್ಕಾರಗಳು),",
    companyName: "DMNS Land & Plot Planner"
  }
};

const capitalizeName = (name: string) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const formatShareDate = (dateStr: string) => {
  try {
    let cleaned = dateStr.replace(/, /g, ' | ').replace(/Jul/g, 'July').replace(/Jan/g, 'January').replace(/Feb/g, 'February').replace(/Mar/g, 'March').replace(/Apr/g, 'April').replace(/May/g, 'May').replace(/Jun/g, 'June').replace(/Aug/g, 'August').replace(/Sep/g, 'September').replace(/Oct/g, 'October').replace(/Nov/g, 'November').replace(/Dec/g, 'December');
    cleaned = cleaned.replace(/pm/g, 'PM').replace(/am/g, 'AM');
    return cleaned;
  } catch (e) {
    return dateStr;
  }
};

export default function AcquisitionCalculator({ locations, cities, onSelectProperty }: AcquisitionCalculatorProps) {
  // Available properties for calculation
  const landProperties = locations.filter(l => l.status !== 'sold');

  // Saved Estimations (Estimated Details) States
  const [savedEstimations, setSavedEstimations] = useState<SavedEstimation[]>([]);
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const [estimationSaveName, setEstimationSaveName] = useState('');
  const [isEstimationsExpanded, setIsEstimationsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadedEstimationId, setLoadedEstimationId] = useState<string | null>(null);
  const [loadedEstimationName, setLoadedEstimationName] = useState<string>('');
  const [updatedId, setUpdatedId] = useState<string | null>(null);

  // Share modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEstimation, setShareEstimation] = useState<SavedEstimation | null>(null);
  const [shareLanguage, setShareLanguage] = useState<'en' | 'te' | 'hi' | 'ta' | 'kn'>('en');
  const [shareCopied, setShareCopied] = useState(false);

  // Input states
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(3500000); // 35 Lakhs default
  const [customSqft, setCustomSqft] = useState<number>(10890); // 10,890 sqft (0.25 Acres)
  const [customName, setCustomName] = useState<string>('Custom Plot Proposal');

  // Acquisition details
  const [stampDutyPercent, setStampDutyPercent] = useState<number>(7); // 7% standard in Tamil Nadu/India
  const [registrationPercent, setRegistrationPercent] = useState<number>(1); // 1% standard
  const [brokeragePercent, setBrokeragePercent] = useState<number>(20); // 20% default as requested
  const [infrastructureFees, setInfrastructureFees] = useState<number>(50000); // Utility connections, boundaries

  // Financing details toggle and values
  const [financingNeeded, setFinancingNeeded] = useState<boolean>(false); // Financing option default to false
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% down payment
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% standard home/plot loan
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15); // 15 years loan tenure

  // Investment appreciation projections
  const [appreciationRate, setAppreciationRate] = useState<number>(12); // 12% annual compounding appreciation

  // Sync state if property is selected
  useEffect(() => {
    if (selectedPropertyId && selectedPropertyId !== 'custom') {
      const prop = landProperties.find(l => l.id === selectedPropertyId);
      if (prop) {
        const parsedPrice = Number(prop.price.toString().replace(/[^0-9.]/g, '')) || 0;
        setCustomPrice(parsedPrice);
        setCustomSqft(prop.sqft);
        setCustomName(prop.name);
      }
    } else if (selectedPropertyId === 'custom') {
      setCustomPrice(3500000);
      setCustomSqft(10890);
      setCustomName('Custom Plot Proposal');
    }
  }, [selectedPropertyId]);

  // Load saved estimations on mount
  useEffect(() => {
    const stored = localStorage.getItem('plot_saved_estimations');
    if (stored) {
      try {
        setSavedEstimations(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load saved estimations', e);
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (list: SavedEstimation[]) => {
    localStorage.setItem('plot_saved_estimations', JSON.stringify(list));
    setSavedEstimations(list);
  };

  const handleSaveEstimation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estimationSaveName.trim()) return;

    const newEstimationId = `est_${Date.now()}`;
    const newEstimation: SavedEstimation = {
      id: newEstimationId,
      name: estimationSaveName.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      propertyName: customName,
      propertyId: selectedPropertyId,
      basePrice,
      sqft: customSqft,
      stampDutyPercent,
      stampDutyCost,
      registrationPercent,
      registrationCost,
      brokeragePercent,
      brokerageCost,
      infrastructureFees,
      totalAcquisitionCost,
      financingNeeded,
      downPaymentPercent,
      downPaymentAmount,
      interestRate,
      loanTenureYears,
      emiAmount,
      totalRepayment,
      totalInterestPayable,
      aggregateOutlayWithInterest,
      appreciationRate
    };

    const updated = [newEstimation, ...savedEstimations];
    saveToStorage(updated);
    
    setLoadedEstimationId(newEstimationId);
    setLoadedEstimationName(newEstimation.name);

    setIsSavePromptOpen(false);
    setEstimationSaveName('');
    setIsEstimationsExpanded(true);
  };

  const handleUpdateEstimation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!loadedEstimationId) return;

    const updated = savedEstimations.map(est => {
      if (est.id === loadedEstimationId) {
        return {
          ...est,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          propertyName: customName,
          propertyId: selectedPropertyId,
          basePrice,
          sqft: customSqft,
          stampDutyPercent,
          stampDutyCost,
          registrationPercent,
          registrationCost,
          brokeragePercent,
          brokerageCost,
          infrastructureFees,
          totalAcquisitionCost,
          financingNeeded,
          downPaymentPercent,
          downPaymentAmount,
          interestRate,
          loanTenureYears,
          emiAmount,
          totalRepayment,
          totalInterestPayable,
          aggregateOutlayWithInterest,
          appreciationRate
        };
      }
      return est;
    });

    saveToStorage(updated);
    setUpdatedId(loadedEstimationId);
    setTimeout(() => setUpdatedId(null), 3000);
    setIsEstimationsExpanded(true);
  };

  const handleCloneEstimation = (est: SavedEstimation, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedEstimation: SavedEstimation = {
      ...est,
      id: `est_${Date.now()}_clone`,
      name: `${est.name} (Copy)`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    const updated = [clonedEstimation, ...savedEstimations];
    saveToStorage(updated);
    setIsEstimationsExpanded(true);
  };

  const handleLoadEstimation = (est: SavedEstimation) => {
    setSelectedPropertyId(est.propertyId);
    setCustomName(est.propertyName);
    setCustomPrice(est.basePrice);
    setCustomSqft(est.sqft);
    setStampDutyPercent(est.stampDutyPercent);
    setRegistrationPercent(est.registrationPercent);
    setBrokeragePercent(est.brokeragePercent);
    setInfrastructureFees(est.infrastructureFees);
    setFinancingNeeded(est.financingNeeded);
    setDownPaymentPercent(est.downPaymentPercent);
    setInterestRate(est.interestRate);
    setLoanTenureYears(est.loanTenureYears);
    setAppreciationRate(est.appreciationRate);

    setLoadedEstimationId(est.id);
    setLoadedEstimationName(est.name);

    // Smooth scroll to top of calculator
    const element = document.getElementById('calculator-module-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteEstimation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedEstimations.filter(est => est.id !== id);
    saveToStorage(updated);
    if (loadedEstimationId === id) {
      setLoadedEstimationId(null);
      setLoadedEstimationName('');
    }
  };

  const generateShareMarkdown = (est: SavedEstimation, lang: 'en' | 'te' | 'hi' | 'ta' | 'kn') => {
    const t = LANGUAGES_TEXT[lang];
    const formattedDear = lang === 'te' 
      ? `${t.dear} ${capitalizeName(est.name)} గారికి,`
      : lang === 'ta'
      ? `${t.dear} ${capitalizeName(est.name)} அவர்களுக்கு,`
      : lang === 'kn'
      ? `${t.dear} ${capitalizeName(est.name)} ಅವರಿಗೆ,`
      : `${t.dear} ${capitalizeName(est.name)},`;

    const formattedDate = formatShareDate(est.date);

    // Compute future values dynamically
    const val3 = Math.round(est.basePrice * Math.pow(1 + est.appreciationRate / 100, 3));
    const val5 = Math.round(est.basePrice * Math.pow(1 + est.appreciationRate / 100, 5));
    const val10 = Math.round(est.basePrice * Math.pow(1 + est.appreciationRate / 100, 10));

    // Determine Stamp Duty and Registration labels
    const stampDutyLabel = `📝 ${t.stampDuty} (${est.stampDutyPercent}%)`;
    const registrationLabel = `📄 ${t.registration} (${est.registrationPercent}%)`;
    const brokerageLabel = `🤝 ${t.brokerage} (${est.brokeragePercent}%)`;
    const infrastructureLabel = `🚧 ${t.infrastructure}`;

    // Future appreciation text
    const appreciationText = lang === 'te'
      ? `*సంవత్సరానికి సగటున **${est.appreciationRate}%** భూమి విలువ పెరుగుదల ఆధారంగా అంచనా వేయబడింది.*`
      : lang === 'ta'
      ? `*ஆண்டுக்கு **${est.appreciationRate}%** மதிப்பீட்டு உயர்வின் அடிப்படையில் கணக்கிடப்பட்டுள்ளது.*`
      : lang === 'hi'
      ? `*वार्षिक **${est.appreciationRate}%** मूल्य वृद्धि के अनुमान पर आधारित।*`
      : lang === 'kn'
      ? `*ವಾರ್ಷಿಕ ಶೇಕಡಾ **${est.appreciationRate}%** ಮೌಲ್ಯ ಹೆಚ್ಚಳದ ಅಂದಾಜಿನ ಆಧಾರದ ಮೇಲೆ.*`
      : `*Based on an assumed annual appreciation of **${est.appreciationRate}%**.*`;

    // Spacing helper for aligned amount strings (pad amount in table)
    const alignAmount = (num: number) => {
      return `**${formatINR(num)}**`;
    };

    return `# ${t.title}

**${formattedDear}**

${t.thankYou}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ${t.propertyDetails}

**${t.proposal}:** ${est.propertyName}

**${t.plotSize}:** **${est.sqft.toLocaleString('en-IN')} Sq.ft**

**${t.estimationDate}:** **${formattedDate}**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ${t.costBreakdown}

| ${t.colDescription.padEnd(25)} | ${t.colAmount.padStart(13)} |
| ------------------------- | -------------: |
| ${t.basePrice.padEnd(25)} | ${alignAmount(est.basePrice).padStart(13)} |
| ${stampDutyLabel.padEnd(25)} | ${alignAmount(est.stampDutyCost).padStart(13)} |
| ${registrationLabel.padEnd(25)} | ${alignAmount(est.registrationCost).padStart(13)} |
| ${brokerageLabel.padEnd(25)} | ${alignAmount(est.brokerageCost).padStart(13)} |
| ${infrastructureLabel.padEnd(25)} | ${alignAmount(est.infrastructureFees).padStart(13)} |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ${t.totalCost}

## **${formatINR(est.totalAcquisitionCost)}**

${t.inclusiveCharges}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ${t.futureValueTitle}

${appreciationText}

| ${t.colPeriod.padEnd(17)} | ${t.colFutureValue.padStart(24)} |
| ----------------- | -----------------------: |
| ${t.after3Years.padEnd(17)} | ${alignAmount(val3).padStart(24)} |
| ${t.after5Years.padEnd(17)} | ${alignAmount(val5).padStart(24)} |
| ${t.after10Years.padEnd(17)} | ${alignAmount(val10).padStart(24)} |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ${t.moreInfo}

**${t.consultant}:** Mr. Rajesh Kumar

**${t.mobile}:** +91 98765 43210

${t.chooseDmns}

${t.assistNote}

**${t.bestRegards}**

**${t.companyName}**`;
  };

  const handleShareEstimation = (est: SavedEstimation, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareEstimation(est);
    setShareLanguage('en');
    setShareCopied(false);
    setShareModalOpen(true);
  };

  // Calculations
  const basePrice = customPrice;
  const stampDutyCost = Math.round((basePrice * stampDutyPercent) / 100);
  const registrationCost = Math.round((basePrice * registrationPercent) / 100);
  const brokerageCost = Math.round((basePrice * brokeragePercent) / 100);
  
  const totalAcquisitionCost = basePrice + stampDutyCost + registrationCost + brokerageCost + infrastructureFees;
  
  const downPaymentAmount = financingNeeded 
    ? Math.round((totalAcquisitionCost * downPaymentPercent) / 100) 
    : totalAcquisitionCost;
  const principalLoanAmount = financingNeeded 
    ? totalAcquisitionCost - downPaymentAmount 
    : 0;

  // Monthly Interest Rate (r) and Number of Months (n)
  const monthlyInterestRate = (interestRate / 12) / 100;
  const totalMonths = loanTenureYears * 12;

  // EMI formula: [P * r * (1+r)^n] / [(1+r)^n - 1]
  const calculateEMI = () => {
    if (!financingNeeded || principalLoanAmount <= 0) return 0;
    if (monthlyInterestRate === 0) return Math.round(principalLoanAmount / totalMonths);
    const emi = (principalLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const emiAmount = calculateEMI();
  const totalRepayment = financingNeeded ? emiAmount * totalMonths : 0;
  const totalInterestPayable = financingNeeded ? Math.max(0, totalRepayment - principalLoanAmount) : 0;
  const aggregateOutlayWithInterest = totalAcquisitionCost + totalInterestPayable;

  // Compound appreciation: Future Value = P * (1 + r/100)^t
  const getAppreciationValuation = (years: number) => {
    return Math.round(basePrice * Math.pow(1 + appreciationRate / 100, years));
  };

  const val3Years = getAppreciationValuation(3);
  const val5Years = getAppreciationValuation(5);
  const val10Years = getAppreciationValuation(10);

  const profit3Years = val3Years - basePrice;
  const profit5Years = val5Years - basePrice;
  const profit10Years = val10Years - basePrice;

  // Helper formatting INR
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" id="calculator-module-container">
      {/* HEADER SECTION */}
      <div className="mb-8 text-center md:text-left">
        <span className="text-xs font-bold text-[#2563EB] uppercase tracking-widest bg-[#2563EB]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Plot Acquisition &amp; Financing Planner
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1D1D1F] tracking-tight">
          Property Buying Decision Engine
        </h1>
        <p className="text-sm text-[#6E6E73] mt-2 max-w-2xl">
          Evaluate precise acquisition outlays, loan schedules, registration fees, and future asset compounding values before initiating your property transaction.
        </p>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTROL inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PROPERTY PICKER PANEL */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-panel-selection">
            <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#2563EB]" />
              Select Plot &amp; Valuation
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">
                  Choose Active Registry Plot
                </label>
                
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full text-left bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition duration-150 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  id="custom-property-dropdown-trigger"
                >
                  <div className="flex flex-col text-left min-w-0 pr-2">
                    {!selectedPropertyId ? (
                      <>
                        <span className="text-xs font-bold text-neutral-500">
                          -- Choose a Plot or Custom Proposal --
                        </span>
                        <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                          Select a property from the registry to begin
                        </span>
                      </>
                    ) : selectedPropertyId === 'custom' ? (
                      <>
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF]">
                          Custom Calculation Proposal
                        </span>
                        <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                          Specify manual dimensions and price valuation
                        </span>
                      </>
                    ) : (() => {
                      const selectedProp = landProperties.find(p => p.id === selectedPropertyId);
                      return (
                        <>
                          <span className="text-xs font-bold text-[#1D1D1F] dark:text-[#FFFFFF] truncate">
                            {selectedProp?.name} ({selectedProp?.sqft?.toLocaleString()} Sq.Ft)
                          </span>
                          <span className="text-[10px] text-[#2563EB] dark:text-blue-400 font-mono mt-0.5 font-bold">
                            Value: {selectedProp?.price}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options overlay */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 animate-fade-in custom-scrollbar">
                      
                      {/* Custom calculations */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId('custom');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between transition hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer ${
                          selectedPropertyId === 'custom' ? 'bg-[#2563EB]/5 text-[#2563EB]' : 'text-[#1D1D1F] dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold">Custom Calculation Proposal</span>
                          <span className="text-[10px] text-neutral-400 font-normal mt-0.5">Manual property value and dimension modeling</span>
                        </div>
                        {selectedPropertyId === 'custom' && (
                          <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                        )}
                      </button>

                      {/* Filtered Active plots */}
                      {landProperties.map((l) => {
                        const isSelected = selectedPropertyId === l.id;
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => {
                              setSelectedPropertyId(l.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between transition hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer ${
                              isSelected ? 'bg-[#2563EB]/5 text-[#2563EB]' : 'text-[#1D1D1F] dark:text-neutral-300'
                            }`}
                          >
                            <div className="flex flex-col text-left min-w-0 pr-4">
                              <span className="text-xs font-bold truncate">
                                {l.name} ({l.sqft.toLocaleString()} Sq.Ft)
                              </span>
                              <span className="text-[10px] text-neutral-400 font-normal mt-0.5">
                                Price: <strong className="font-mono text-[#1D1D1F] dark:text-white">{l.price}</strong>
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {selectedPropertyId === 'custom' && (
                <div className="space-y-4 pt-2 border-t border-neutral-100 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">
                      Custom Plot Title
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Greenwood Farms Proposal"
                      className="input-luxury text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">
                        Property Value (₹)
                      </label>
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="input-luxury text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2">
                        Plot Size (Sq.Ft)
                      </label>
                      <input
                        type="number"
                        value={customSqft}
                        onChange={(e) => setCustomSqft(Number(e.target.value))}
                        className="input-luxury text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPropertyId !== 'custom' && (() => {
                const prop = landProperties.find(l => l.id === selectedPropertyId);
                if (!prop) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-neutral-100 space-y-4" id="calculator-selected-plot-details">
                    <div className="text-left bg-neutral-50 border border-neutral-200/50 rounded-2xl p-4 space-y-3.5">
                      {/* Title & Tag */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/10 px-2 py-0.5 rounded-md mb-1.5">
                            {prop.type || 'Registered Plot'}
                          </span>
                          <h4 className="text-sm font-bold text-[#1D1D1F] leading-snug truncate">{prop.name}</h4>
                          <p className="text-xs text-[#6E6E73] mt-1 line-clamp-2">{prop.description}</p>
                        </div>
                        {prop.status && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                            prop.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {prop.status}
                          </span>
                        )}
                      </div>

                      {/* Cover Image if available */}
                      {prop.images && prop.images.length > 0 && (
                        <div className="relative h-28 w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200/40">
                          <img
                            src={prop.images[0]}
                            alt={prop.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Quick details grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        {prop.plotNumber && (
                          <div className="bg-white border border-neutral-200/40 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider block">Plot No.</span>
                            <span className="font-mono font-bold text-[#1D1D1F] mt-0.5 block">{prop.plotNumber}</span>
                          </div>
                        )}
                        {prop.surveyNumber && (
                          <div className="bg-white border border-neutral-200/40 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider block">Survey No.</span>
                            <span className="font-mono font-bold text-[#1D1D1F] mt-0.5 block">{prop.surveyNumber}</span>
                          </div>
                        )}
                        {prop.zoned && (
                          <div className="bg-white border border-neutral-200/40 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider block">Zoned Status</span>
                            <span className="font-semibold text-neutral-800 mt-0.5 block">{prop.zoned}</span>
                          </div>
                        )}
                        {prop.roadAccess && (
                          <div className="bg-white border border-neutral-200/40 rounded-xl p-2.5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#6E6E73] uppercase tracking-wider block">Road Access</span>
                            <span className="font-semibold text-neutral-800 mt-0.5 block truncate">{prop.roadAccess}</span>
                          </div>
                        )}
                      </div>

                      {/* Primary Registrar / Owner details */}
                      {prop.customerName && (
                        <div className="bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-2xl p-3.5 space-y-2 text-left">
                          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <User className="w-3.5 h-3.5" />
                            Primary Registrant
                          </span>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#6E6E73]">Registrar Name:</span>
                              <span className="font-bold text-[#1D1D1F]">{prop.customerName}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Location Coordinates & Map Link */}
                      <div className="flex items-center justify-between gap-3 text-xs bg-white border border-neutral-200/50 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 text-neutral-600 font-mono text-[10px]">
                          <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{prop.lat.toFixed(5)}, {prop.lng.toFixed(5)}</span>
                        </div>
                        {onSelectProperty && (
                          <button
                            onClick={() => onSelectProperty(prop)}
                            className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#1D4ED8] transition duration-200 flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Locate on Map</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {selectedPropertyId && (
            <>
              {/* FINANCING CONFIGURATION TOGGLE */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-financing-toggle">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" />
                      Funding Mode
                    </h4>
                    <p className="text-sm font-bold text-[#1D1D1F]">Do you need bank financing?</p>
                    <p className="text-xs text-[#6E6E73] mt-0.5">Toggle to calculate bank loans, interest, and monthly EMI outlays.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFinancingNeeded(!financingNeeded)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 ${financingNeeded ? 'bg-[#2563EB]' : 'bg-neutral-200'}`}
                    id="financing-toggle-btn"
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${financingNeeded ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

              {/* ACQUISITION SLIDERS (STAMP DUTY, LEGAL, FEES) */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-panel-taxes">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  Stamp Duty, Brokerage &amp; Setup Charges
                </h3>

                <div className="space-y-5">
                  {/* Stamp Duty slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                      <span className="text-[#6E6E73]">Stamp Duty Tax</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={stampDutyPercent === 0 ? '' : stampDutyPercent}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            setStampDutyPercent(val === '' ? 0 : parseFloat(val) || 0);
                          }}
                          className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-[#2563EB] bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                        <span className="text-[10px] text-neutral-400 font-semibold">%</span>
                        <span className="font-mono text-xs text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded ml-1">({formatINR(stampDutyCost)})</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={stampDutyPercent}
                      onChange={(e) => setStampDutyPercent(parseFloat(e.target.value) || 0)}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                  </div>

                  {/* Registration slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                      <span className="text-[#6E6E73]">Registration Fee</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={registrationPercent === 0 ? '' : registrationPercent}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            setRegistrationPercent(val === '' ? 0 : parseFloat(val) || 0);
                          }}
                          className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-[#2563EB] bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                        <span className="text-[10px] text-neutral-400 font-semibold">%</span>
                        <span className="font-mono text-xs text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded ml-1">({formatINR(registrationCost)})</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="0.5"
                      value={registrationPercent}
                      onChange={(e) => setRegistrationPercent(parseFloat(e.target.value) || 0)}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                  </div>

                  {/* Brokerage slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                      <span className="text-[#6E6E73]">Agency Brokerage / Commission</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          step="1"
                          value={brokeragePercent === 0 ? '' : brokeragePercent}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            let parsed = val === '' ? 0 : parseFloat(val) || 0;
                            if (parsed > 30) parsed = 30;
                            if (parsed < 0) parsed = 0;
                            setBrokeragePercent(parsed);
                          }}
                          className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-[#2563EB] bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                        />
                        <span className="text-[10px] text-neutral-400 font-semibold">%</span>
                        <span className="font-mono text-xs text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded ml-1">({formatINR(brokerageCost)})</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={brokeragePercent}
                      onChange={(e) => setBrokeragePercent(parseFloat(e.target.value) || 0)}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-100">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider mb-2">
                        Infrastructure &amp; Survey Setup (₹)
                      </label>
                      <input
                        type="number"
                        value={infrastructureFees}
                        onChange={(e) => setInfrastructureFees(Number(e.target.value))}
                        className="input-luxury text-sm font-mono w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* LOAN & FINANCING CONFIGURATION */}
              {financingNeeded && (
                <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-panel-financing">
                  <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#2563EB]" />
                    Financing &amp; Borrowing Options
                  </h3>

                  <div className="space-y-5">
                    {/* Downpayment Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                        <span className="text-[#6E6E73]">Self Down Payment Contribution</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={downPaymentPercent === 0 ? '' : downPaymentPercent}
                            placeholder="0"
                            onChange={(e) => {
                              const val = e.target.value;
                              setDownPaymentPercent(val === '' ? 0 : parseInt(val) || 0);
                            }}
                            className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-[#2563EB] bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                          />
                          <span className="text-[10px] text-neutral-400 font-semibold">%</span>
                          <span className="font-mono text-xs text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded ml-1">({formatINR(downPaymentAmount)})</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Remaining {100 - downPaymentPercent}% ({formatINR(principalLoanAmount)}) to be financed.</p>
                    </div>

                    {/* Interest Rate Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                        <span className="text-[#6E6E73]">Annual Bank Interest Rate</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={interestRate === 0 ? '' : interestRate}
                            placeholder="0"
                            onChange={(e) => {
                              const val = e.target.value;
                              setInterestRate(val === '' ? 0 : parseFloat(val) || 0);
                            }}
                            className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-amber-600 bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-neutral-400 font-semibold">APR</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Tenure Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                        <span className="text-[#6E6E73]">Amortization Period (Tenure)</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value={loanTenureYears === 0 ? '' : loanTenureYears}
                            placeholder="0"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLoanTenureYears(val === '' ? 0 : parseInt(val) || 0);
                            }}
                            className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-amber-600 bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-neutral-400 font-semibold">Yrs</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={loanTenureYears}
                        onChange={(e) => setLoanTenureYears(parseInt(e.target.value) || 0)}
                        className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CAPITAL COMPREHENSIVE GROWTH APPRECIATION RATE */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-panel-appreciation">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  Projected Annual Appreciation
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#1D1D1F] mb-1.5 gap-2">
                      <span className="text-[#6E6E73]">Compounding Annual Rate</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={appreciationRate === 0 ? '' : appreciationRate}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAppreciationRate(val === '' ? 0 : parseFloat(val) || 0);
                          }}
                          className="w-16 px-1.5 py-0.5 border border-neutral-200 rounded text-center text-xs font-mono font-bold text-emerald-600 bg-neutral-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-[10px] text-neutral-400 font-semibold">% / yr</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="0.5"
                      value={appreciationRate}
                      onChange={(e) => setAppreciationRate(parseFloat(e.target.value) || 0)}
                      className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Land in high-demand zones around peripheral highways often shows compounding appreciation between 8% to 18% annually.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: DETAILED OUTLAYS, CHARTS, BREAKDOWNS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedPropertyId ? (
            <div className="bg-neutral-50/50 border border-neutral-200/80 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[500px] shadow-sm animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] mb-4 shadow-sm border border-blue-100">
                <Calculator className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-[#1D1D1F] font-sans">Financial &amp; Growth Analysis Ready</h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mt-2 leading-relaxed">
                Choose an existing plot from the estate map, or select the "Custom Calculation Proposal" option to customize pricing, and unlock full project cost outlays, bank financing/EMI simulations, and 10-year compounding return timelines.
              </p>
            </div>
          ) : (
            <>
              {/* PRIMARY TOTAL OUTLAY HERO BANNER */}
              <div className="bg-neutral-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl" id="calc-result-hero">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Calculator className="w-48 h-48 text-white stroke-[0.5]" />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest bg-[#2563EB]/25 border border-[#2563EB]/40 px-3 py-1 rounded-full inline-block">
                    Total Project Outlay Breakdown
                  </span>
                  {loadedEstimationId && (
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Loaded: {loadedEstimationName}
                      <button 
                        type="button" 
                        onClick={() => {
                          setLoadedEstimationId(null);
                          setLoadedEstimationName('');
                        }}
                        className="hover:text-white transition ml-1 text-emerald-300 font-bold text-xs"
                        title="Unload/Clear"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-neutral-400 block font-sans">Plot Name / Reference</span>
                    <h2 className="text-xl font-serif font-bold text-white leading-tight">
                      {customName}
                    </h2>
                  </div>
                  
                  {!isSavePromptOpen ? (
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                      {loadedEstimationId && (
                        <button
                          type="button"
                          onClick={handleUpdateEstimation}
                          className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          title={`Update existing estimation: ${loadedEstimationName}`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Update "{loadedEstimationName}"</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSavePromptOpen(true);
                          setEstimationSaveName(loadedEstimationId ? `${loadedEstimationName} Copy` : `${customName} Estimate`);
                        }}
                        className={`py-2 px-4 active:scale-95 text-xs font-bold rounded-full transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                          loadedEstimationId 
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' 
                            : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{loadedEstimationId ? "Save as Copy" : "Save Estimation"}</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveEstimation} className="flex items-center gap-2 bg-white/15 p-1 rounded-full border border-white/20 w-full sm:max-w-xs animate-fade-in shrink-0">
                      <input
                        type="text"
                        required
                        value={estimationSaveName}
                        onChange={(e) => setEstimationSaveName(e.target.value)}
                        placeholder="Estimation name..."
                        className="flex-grow bg-transparent border-none text-white text-xs font-semibold px-3 outline-none placeholder-white/40 min-w-0"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsSavePromptOpen(false)}
                          className="px-2 py-1 text-[10px] text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-full transition shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="mt-4 flex flex-col md:flex-row items-baseline gap-2 md:gap-4 border-b border-white/10 pb-5">
                  <span className="text-3xl md:text-5xl font-serif font-extrabold text-white tracking-tight">
                    {formatINR(totalAcquisitionCost)}
                  </span>
                  <span className="text-xs text-neutral-400 font-sans">
                    including all regulatory duties &amp; setup fees
                  </span>
                </div>

                {/* Micro Breakdown Inside Hero */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 text-left">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Base Land cost</span>
                    <span className="text-sm font-bold font-mono text-white">{formatINR(basePrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Taxes &amp; Stamp Duty</span>
                    <span className="text-sm font-bold font-mono text-neutral-300">{formatINR(stampDutyCost + registrationCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Intermediary Brokerage</span>
                    <span className="text-sm font-bold font-mono text-neutral-300">{formatINR(brokerageCost)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Infrastructure Setup</span>
                    <span className="text-sm font-bold font-mono text-neutral-300">{formatINR(infrastructureFees)}</span>
                  </div>
                </div>
              </div>

              {/* ACQUISITION BREAKDOWN BAR */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-outlay-bento">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 font-sans">
                  Proportional Cost Allocation
                </h3>
                
                {/* Visual stacked percentage bar */}
                <div className="w-full h-5 rounded-full overflow-hidden flex mb-4 shadow-inner">
                  <div 
                    style={{ width: `${(basePrice / totalAcquisitionCost) * 100}%` }} 
                    className="bg-blue-600 h-full hover:opacity-90 transition-opacity"
                    title={`Base Price: ${Math.round((basePrice / totalAcquisitionCost) * 100)}%`}
                  />
                  <div 
                    style={{ width: `${((stampDutyCost + registrationCost) / totalAcquisitionCost) * 100}%` }} 
                    className="bg-indigo-400 h-full hover:opacity-90 transition-opacity"
                    title={`Government Duties: ${Math.round(((stampDutyCost + registrationCost) / totalAcquisitionCost) * 100)}%`}
                  />
                  <div 
                    style={{ width: `${(brokerageCost / totalAcquisitionCost) * 100}%` }} 
                    className="bg-purple-400 h-full hover:opacity-90 transition-opacity"
                    title={`Brokerage: ${Math.round((brokerageCost / totalAcquisitionCost) * 100)}%`}
                  />
                  <div 
                    style={{ width: `${(infrastructureFees / totalAcquisitionCost) * 100}%` }} 
                    className="bg-emerald-400 h-full hover:opacity-90 transition-opacity"
                    title={`Infrastructure Setup: ${Math.round((infrastructureFees / totalAcquisitionCost) * 100)}%`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0"></div>
                    <div className="text-left">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Base Property Cost</span>
                      <span className="text-xs font-bold text-[#1D1D1F]">{formatINR(basePrice)} <span className="font-normal text-neutral-500">({Math.round((basePrice / totalAcquisitionCost) * 100)}%)</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 shrink-0"></div>
                    <div className="text-left">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Government Taxes &amp; Stamp Duty</span>
                      <span className="text-xs font-bold text-[#1D1D1F]">{formatINR(stampDutyCost + registrationCost)} <span className="font-normal text-neutral-500">({Math.round(((stampDutyCost + registrationCost) / totalAcquisitionCost) * 100)}%)</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-purple-400 shrink-0"></div>
                    <div className="text-left">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Intermediary Brokerage / Commission</span>
                      <span className="text-xs font-bold text-[#1D1D1F]">{formatINR(brokerageCost)} <span className="font-normal text-neutral-500">({Math.round((brokerageCost / totalAcquisitionCost) * 100)}%)</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shrink-0"></div>
                    <div className="text-left">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Infrastructure Setup &amp; Survey</span>
                      <span className="text-xs font-bold text-[#1D1D1F]">{formatINR(infrastructureFees)} <span className="font-normal text-neutral-500">({Math.round((infrastructureFees / totalAcquisitionCost) * 100)}%)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UNIT RATE METRICS ANALYSIS */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-metrics-panel">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#2563EB]" />
                  Detailed Land Area Unit Metric Breakdown
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 overflow-hidden">
                    <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider block font-semibold">Cost Per Square Foot</span>
                    <span className="text-base md:text-sm lg:text-base xl:text-lg font-bold font-mono text-[#2563EB] mt-1.5 block leading-tight break-all">
                      {formatINR(Math.round(basePrice / customSqft))}
                      <span className="text-[10px] font-sans font-medium text-neutral-500 block lg:inline lg:ml-1 mt-0.5 lg:mt-0">/ sqft</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Base land area equivalent</span>
                  </div>

                  <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-5 overflow-hidden">
                    <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider block font-semibold">Cost Per Cent (435.6 sqft)</span>
                    <span className="text-base md:text-sm lg:text-base xl:text-lg font-bold font-mono text-purple-700 mt-1.5 block leading-tight break-all">
                      {formatINR(Math.round((basePrice / customSqft) * 435.6))}
                      <span className="text-[10px] font-sans font-medium text-neutral-500 block lg:inline lg:ml-1 mt-0.5 lg:mt-0">/ cent</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Standard South India unit</span>
                  </div>

                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 overflow-hidden">
                    <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider block font-semibold">Cost Per Acre (43,560 sqft)</span>
                    <span className="text-base md:text-sm lg:text-base xl:text-lg font-bold font-mono text-emerald-700 mt-1.5 block leading-tight break-all">
                      {formatINR(Math.round((basePrice / customSqft) * 43560))}
                      <span className="text-[10px] font-sans font-medium text-neutral-500 block lg:inline lg:ml-1 mt-0.5 lg:mt-0">/ acre</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Substantial land unit rate</span>
                  </div>
                </div>
              </div>

              {/* LOAN OUTCOME & MONTHLY EMI PANEL */}
              {financingNeeded ? (
                <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-emi-breakdown">
                  <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    EMI Breakdown &amp; Debt Amortization
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/40 flex flex-col justify-center">
                      <span className="text-[10px] text-[#6E6E73] uppercase tracking-widest block font-bold">Estimated Monthly EMI</span>
                      <span className="text-3xl font-extrabold font-mono text-[#1D1D1F] mt-2 block">
                        {formatINR(emiAmount)}
                      </span>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        For {totalMonths} compounding monthly payments at {interestRate}% APR.
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="text-xs text-[#6E6E73]">Total Borrowed Principal</span>
                        <span className="text-xs font-bold font-mono text-[#1D1D1F]">{formatINR(principalLoanAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="text-xs text-[#6E6E73]">Total Interest Payable</span>
                        <span className="text-xs font-bold font-mono text-amber-600">{formatINR(totalInterestPayable)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                        <span className="text-xs text-[#6E6E73]">Aggregate Principal + Interest</span>
                        <span className="text-xs font-bold font-mono text-neutral-950">{formatINR(totalRepayment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-neutral-800">Total Project + Finance Outlay</span>
                        <span className="text-xs font-extrabold font-mono text-indigo-700">{formatINR(aggregateOutlayWithInterest)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Debt to Equity split gauge */}
                  <div>
                    <span className="text-[11px] font-bold text-[#6E6E73] uppercase tracking-wider block mb-2">Repayment Leverage Breakdown</span>
                    <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-100">
                      <div 
                        style={{ width: `${(principalLoanAmount / totalRepayment) * 100}%` }} 
                        className="bg-[#2563EB] h-full"
                        title="Loan Principal"
                      />
                      <div 
                        style={{ width: `${(totalInterestPayable / totalRepayment) * 100}%` }} 
                        className="bg-amber-400 h-full"
                        title="Total Interest Cost"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6E6E73] mt-2">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Loan Principal ({Math.round((principalLoanAmount / totalRepayment) * 100)}%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Interest Cost ({Math.round((totalInterestPayable / totalRepayment) * 100)}%)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 text-emerald-800 flex items-start gap-4 shadow-sm" id="calc-cash-buy">
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Full Cash Capital Acquisition</h4>
                    <p className="text-xs text-emerald-700/90 mt-1">
                      You have configured the calculation for a Full Cash Capital purchase. No bank leverage or interest payments will occur. Your total out-of-pocket investment remains strictly limited to the absolute purchase outlay of <strong className="font-mono">{formatINR(totalAcquisitionCost)}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* CAPITAL COMPOUNDING APPRECIATION TIMELINE PROJECTIONS */}
              <div className="bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm" id="calc-roi-timeline">
                <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider mb-5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Asset Growth &amp; Compounding Return Projections
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Year 3 Card */}
                  <div className="border border-neutral-100 rounded-2xl p-5 bg-[#F5F5F7]/30 text-left relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">3 Years</div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-1.5">Projected Valuation</span>
                    <span className="text-lg font-bold font-mono text-[#1D1D1F] block mt-1">{formatINR(val3Years)}</span>
                    <div className="mt-3 pt-3 border-t border-neutral-100/60 flex items-center justify-between">
                      <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider font-semibold">Net Appreciated</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono">+{formatINR(profit3Years)}</span>
                    </div>
                  </div>

                  {/* Year 5 Card */}
                  <div className="border border-neutral-100 rounded-2xl p-5 bg-[#F5F5F7]/50 text-left relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">5 Years</div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block mt-1.5">Projected Valuation</span>
                    <span className="text-lg font-bold font-mono text-[#1D1D1F] block mt-1">{formatINR(val5Years)}</span>
                    <div className="mt-3 pt-3 border-t border-neutral-100/60 flex items-center justify-between">
                      <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider font-semibold">Net Appreciated</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono">+{formatINR(profit5Years)}</span>
                    </div>
                  </div>

                  {/* Year 10 Card */}
                  <div className="border border-[#2563EB]/10 rounded-2xl p-5 bg-blue-50/10 text-left relative overflow-hidden">
                    <div className="absolute top-2 right-2 text-xs font-bold font-mono text-white bg-blue-600 px-2 py-0.5 rounded-md">10 Years</div>
                    <span className="text-[10px] text-[#2563EB] uppercase tracking-wider block mt-1.5 font-semibold">Projected Valuation</span>
                    <span className="text-lg font-bold font-mono text-blue-800 block mt-1">{formatINR(val10Years)}</span>
                    <div className="mt-3 pt-3 border-t border-[#2563EB]/10 flex items-center justify-between">
                      <span className="text-[9px] text-blue-700 uppercase tracking-wider font-semibold">Investment Multiplier</span>
                      <span className="text-xs font-bold text-blue-700 font-mono">{(val10Years / basePrice).toFixed(1)}x Profit</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3.5 mt-5 text-left">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950">
                    <strong className="font-bold">Calculators Assumption:</strong> Compounded Growth calculations are calculated directly on the original land value base of <span className="font-mono font-bold">{formatINR(basePrice)}</span> compounding at <span className="font-bold">+{appreciationRate}%</span> annually. Actual regional growth varies over market cycles.
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

      </div>

      {/* ESTIMATED DETAILS SECTION */}
      <div className="mt-12 pt-10 border-t border-neutral-200" id="estimated-details-section">
        {/* Dropdown-style Collapsible Header Bar */}
        <button
          type="button"
          onClick={() => setIsEstimationsExpanded(!isEstimationsExpanded)}
          className="w-full flex items-center justify-between p-4 sm:p-5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 rounded-3xl transition duration-150 text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl transition duration-300 ${isEstimationsExpanded ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-neutral-200/60 text-neutral-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1D1D1F] flex items-center gap-2">
                Estimated Details
                {savedEstimations.length > 0 && (
                  <span className="text-[11px] font-sans font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-0.5 rounded-full">
                    {savedEstimations.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5 font-sans font-normal">
                {isEstimationsExpanded ? 'Click to collapse saved estimations' : 'Click to expand and view saved estimations & charges'}
              </p>
            </div>
          </div>
          <div className="p-2 rounded-full border border-neutral-300/60 group-hover:border-neutral-400 bg-white transition duration-150 shrink-0">
            {isEstimationsExpanded ? (
              <ChevronUp className="w-4 h-4 text-neutral-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-600" />
            )}
          </div>
        </button>

        {/* Saved Estimations List, visible only when expanded */}
        {isEstimationsExpanded && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {savedEstimations.length === 0 ? (
              <div className="bg-neutral-50/50 border border-neutral-200/30 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[180px]">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">No saved estimates yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mt-1">
                  Adjust the sliders or select a plot above, then click the <strong className="text-[#2563EB] font-bold">"Save Estimation"</strong> button inside the outlay card to keep track of your calculations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedEstimations.map((est) => {
                  return (
                    <div 
                      key={est.id} 
                      className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between relative group text-left animate-fade-in ${
                        est.id === loadedEstimationId 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        {/* Header: Title, Date & Delete */}
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-bold text-base text-[#1D1D1F] truncate" title={est.name}>{est.name}</h4>
                              {est.id === loadedEstimationId && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wide">
                                  Loaded
                                </span>
                              )}
                              {updatedId === est.id && (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md shrink-0 animate-bounce">
                                  Updated!
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-neutral-300" />
                              {est.date}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteEstimation(est.id, e)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition duration-150 shrink-0 cursor-pointer"
                            title="Delete estimation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Property info */}
                        <div className="bg-[#F5F5F7]/50 rounded-2xl p-3.5 mb-4 border border-neutral-100/60">
                          <div className="flex justify-between text-xs font-semibold text-neutral-500 mb-1">
                            <span>Plot / Proposal</span>
                            <span>Size</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-neutral-800">
                            <span className="truncate max-w-[180px]">{est.propertyName}</span>
                            <span className="font-mono">{est.sqft.toLocaleString()} sqft</span>
                          </div>
                        </div>

                        {/* Financial details grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Base Land Price</span>
                            <span className="text-sm font-bold font-mono text-neutral-700">{formatINR(est.basePrice)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Acquisition</span>
                            <span className="text-sm font-extrabold font-mono text-[#2563EB]">{formatINR(est.totalAcquisitionCost)}</span>
                          </div>
                        </div>

                        {/* Collapsible/Mini-breakdown details */}
                        <div className="border-t border-neutral-100 pt-3.5 mt-3 space-y-2 text-xs">
                          <div className="flex justify-between text-neutral-500">
                            <span>Stamp Duty ({est.stampDutyPercent}%)</span>
                            <span className="font-mono font-medium text-neutral-700">{formatINR(est.stampDutyCost)}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Registration Fee ({est.registrationPercent}%)</span>
                            <span className="font-mono font-medium text-neutral-700">{formatINR(est.registrationCost)}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Brokerage ({est.brokeragePercent}%)</span>
                            <span className="font-mono font-medium text-neutral-700">{formatINR(est.brokerageCost)}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Infrastructure Fees</span>
                            <span className="font-mono font-medium text-neutral-700">{formatINR(est.infrastructureFees)}</span>
                          </div>

                          {/* Financing label if applicable */}
                          <div className="pt-2.5 border-t border-neutral-100/60 flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-neutral-500">Payment Strategy:</span>
                            {est.financingNeeded ? (
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Landmark className="w-3 h-3 shrink-0" />
                                Financed (EMI: {formatINR(est.emiAmount)}/mo)
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Coins className="w-3 h-3 shrink-0" />
                                Full Cash Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleShareEstimation(est, e)}
                            className={`py-1.5 px-3 border text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1 cursor-pointer ${
                              copiedId === est.id
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {copiedId === est.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCloneEstimation(est, e)}
                            className="py-1.5 px-3 border border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                            title="Clone/Duplicate this estimation"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Clone</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLoadEstimation(est)}
                          className={`py-1.5 px-3.5 border text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                            est.id === loadedEstimationId
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-bold'
                              : 'border-[#2563EB]/20 hover:border-[#2563EB] text-[#2563EB] hover:bg-blue-50/40'
                          }`}
                        >
                          {est.id === loadedEstimationId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Load Parameters</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LANGUAGE SHARE PREVIEW MODAL */}
      {shareModalOpen && shareEstimation && (
        <div className="fixed inset-0 bg-[#1D1D1F]/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4 select-text">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-neutral-100 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">
                  Share Estimation Details
                </h3>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Select your preferred language and copy the formatted estimation.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShareModalOpen(false);
                  setShareEstimation(null);
                }} 
                className="p-2 rounded-full hover:bg-neutral-100 text-[#6E6E73] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-5 text-left">
              
              {/* Language Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#6E6E73] uppercase tracking-wider mb-2.5">
                  Choose Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'en', label: 'English', native: 'English' },
                    { id: 'te', label: 'Telugu', native: 'తెలుగు' },
                    { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
                    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
                    { id: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
                  ].map((langOpt) => (
                    <button
                      key={langOpt.id}
                      type="button"
                      onClick={() => {
                        setShareLanguage(langOpt.id as any);
                        setShareCopied(false);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition duration-150 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        shareLanguage === langOpt.id
                          ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB]'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="font-sans font-bold">{langOpt.label}</span>
                      <span className="text-[10px] opacity-75 font-normal">{langOpt.native}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wider">
                    Estimate Preview (Markdown Format)
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Ready to paste in WhatsApp/Telegram/Email
                  </span>
                </div>
                
                <div className="relative">
                  <pre className="font-mono text-[11px] leading-relaxed text-neutral-700 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 overflow-auto max-h-[350px] whitespace-pre-wrap select-text">
                    {generateShareMarkdown(shareEstimation, shareLanguage)}
                  </pre>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-neutral-500 font-medium">
                The formatted table will copy with proper spacing intact.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShareModalOpen(false);
                    setShareEstimation(null);
                  }}
                  className="w-full sm:w-auto py-2.5 px-5 border border-neutral-300 hover:border-neutral-400 text-neutral-700 text-xs font-bold rounded-xl transition duration-150 bg-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = generateShareMarkdown(shareEstimation, shareLanguage);
                    navigator.clipboard.writeText(text)
                      .then(() => {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 3000);
                      })
                      .catch((err) => {
                        console.error('Failed to copy: ', err);
                      });
                  }}
                  className={`w-full sm:w-auto py-2.5 px-6 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    shareCopied
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Copied Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-white" />
                      <span>Copy Formatted Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

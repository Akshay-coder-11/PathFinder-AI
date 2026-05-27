/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  BookOpen, 
  Users, 
  Briefcase,
  CheckCircle2,
  Brain,
  Rocket,
  ArrowRight,
  Loader2,
  ExternalLink,
  Map,
  Lightbulb,
  Bot,
  X,
  Lock,
  History,
  ShieldCheck,
  User,
  LogOut,
  Bell,
  Mail,
  Check,
  Sun,
  Moon,
  Palette,
  Server,
  Database,
  Cpu,
  Layout,
  Code
} from 'lucide-react';
import { UserProfile, CareerRecommendation, AssessmentStep } from './types';
import { getCareerRecommendation } from './services/gemini';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';
import AIChatAssistant from './components/AIChatAssistant';
import SystemBlueprintModal from './components/SystemBlueprintModal';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl shadow-xl space-y-1 text-xs text-white">
        <p className="font-bold text-slate-300">{data.fullName}</p>
        <div className="flex items-center justify-between gap-6 font-semibold">
          <span className="text-slate-400">Tasks Completed:</span>
          <span className="text-emerald-400">{data.Completed} / {data["Total Milestones"]}</span>
        </div>
        <div className="flex items-center justify-between gap-6 font-semibold">
          <span className="text-slate-400">Phase Progress:</span>
          <span className="text-blue-400">{data["Progress (%)"]}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const EDUCATION_LEVEL_OPTIONS = [
  { value: "Intermediate (High School / 11th & 12th)", label: "Intermediate / High School (11th & 12th)" },
  { value: "B.Tech / Engineering Course", label: "B.Tech / Engineering (Tech Degree)" },
  { value: "Graduation (General/Non-Tech Degree)", label: "Graduation (General / Non-Tech)" },
  { value: "Post-Graduation (Master's Degree)", label: "Post-Graduation / Master's" },
  { value: "Government Exam Preparation", label: "Government Exam Preparation" }
];

const COURSE_SUGGESTIONS: Record<string, string[]> = {
  "Intermediate (High School / 11th & 12th)": [
    "Intermediate - Science (PCM: Physics, Chemistry, Maths)",
    "Intermediate - Science (PCB: Physics, Chemistry, Biology)",
    "Intermediate - Commerce (Accountancy, Economics, Business Studies)",
    "Intermediate - Arts & Humanities (History, Political Science, Economics)",
    "Intermediate - Vocational General Studies"
  ],
  "B.Tech / Engineering Course": [
    "Computer Science & Engineering (B.Tech CSE)",
    "Information Technology (B.Tech IT)",
    "Electronics & Communication Engineering (B.Tech ECE)",
    "Electrical & Electronics Engineering (B.Tech EEE)",
    "Mechanical Engineering (B.Tech ME)",
    "Civil Engineering (B.Tech CE)",
    "Chemical Engineering (B.Tech CHE)",
    "Biotechnology Engineering (B.Tech Biotech)",
    "Aerospace & Aeronautical Engineering",
    "Artificial Intelligence & Machine Learning (B.Tech AI/ML)",
    "Data Science & Analytics Engineering"
  ],
  "Graduation (General/Non-Tech Degree)": [
    "Bachelor of Computer Applications (BCA)",
    "Bachelor of Science (B.Sc) in Computer Science / IT",
    "Bachelor of Science (B.Sc) in Physics, Chemistry & Maths",
    "Bachelor of Commerce (B.Com) - Finance & Accounting",
    "Bachelor of Commerce (B.Com) - General/Hons",
    "Bachelor of Arts (B.A) - History & Economics",
    "Bachelor of Arts (B.A) - English Literature & Communication",
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Design / Creative Arts (B.Des)",
    "Bachelor of Education (B.Ed)"
  ],
  "Post-Graduation (Master's Degree)": [
    "Master of Computer Applications (MCA)",
    "Master of Business Administration (MBA) - Systems/Operations/Finance",
    "Master of Science (M.Sc) in Computer Science / IT",
    "Master of Science (M.Sc) in Physics / Mathematics",
    "Master of Commerce (M.Com)",
    "Master of Arts (M.A) - Public Policy / Economics / Lit",
    "Master of Technology (M.Tech) - Technical Specialization"
  ],
  "Government Exam Preparation": [
    "UPSC Civil Services Exam (IAS / IPS / IFS Preparation)",
    "SSC CGL / CHSL (Staff Selection Commission Exams)",
    "Bank PO / Specialist Officer / Clerk (IBPS, SBI & RBI)",
    "Railway Recruitment Board Competitive Exams (RRB NTPC, JE, SSE)",
    "State Public Service Commission Examinations (State PSC / PCS)",
    "Defence Forces Competitive Entry (NDA, CDS, AFCAT, CAPF)",
    "GATE Exam & Public Sector Undertaking (PSU) Technical Services",
    "UGC NET / JRF Teaching & Assistant Professorship"
  ]
};

const SKILLS_BY_EDUCATION: Record<string, string[]> = {
  "Intermediate (High School / 11th & 12th)": [
    "Mathematics (Algebra, Trig)",
    "Physics (Mechanics, Wave)",
    "Chemistry (Organic, Inorganic)",
    "Biology & Life Sciences",
    "English communication & grammar",
    "Computer Science Basics (Python, C++)",
    "Logical reasoning & puzzle solving",
    "Creative writing",
    "Speed mathematics",
    "Art, Design & Painting",
    "Economics & Social Studies",
    "Data analysis with spreadsheets",
    "Public speaking & debates"
  ],
  "B.Tech / Engineering Course": [
    "Java Programming",
    "Python Programming",
    "Go / Golang",
    "Rust",
    "C++ Programming",
    "JavaScript & TypeScript",
    "React / Front-end development",
    "Vue.js / Angular",
    "Next.js / SSR frameworks",
    "Node.js / Express backend",
    "Django & Python web dev",
    "FastAPI & Microservices",
    "Spring Boot & Java Enterprise",
    "SQL (PostgreSQL, MySQL)",
    "NoSQL (MongoDB, Redis)",
    "Docker & Containers",
    "Kubernetes orchestration",
    "AWS / Cloud design",
    "GCP / Google Cloud services",
    "Terraform & Infrastructure-as-code",
    "CI/CD Pipelines (GitHub Actions)",
    "Data Analytics (Pandas, SQL)",
    "Machine Learning & AI",
    "Deep Learning & Neural Networks",
    "PyTorch & TensorFlow",
    "UI/UX Design & Prototyping",
    "Figma designing layout",
    "Product Management",
    "Cybersecurity / Pentesting",
    "Flutter / Mobile development",
    "React Native cross-platform",
    "Data Structures & Algorithms"
  ],
  "Graduation (General/Non-Tech Degree)": [
    "Python Basics",
    "Excel & Advanced Spreadsheets",
    "Data Analytics & Reports",
    "SQL Queries",
    "Financial Accounting",
    "Business Communication",
    "Project Management basics",
    "Digital Marketing & SEO",
    "Content Writing & Copywriting",
    "Figma designing layout",
    "Statistics & Probability",
    "Presentation & Pitching skills",
    "Sales & Client Relationship",
    "Customer Support Ops",
    "Human Resource Management",
    "E-commerce Store Management"
  ],
  "Post-Graduation (Master's Degree)": [
    "Advanced Research Methods",
    "Academic Research & Writing",
    "Python for Analytics",
    "Statistical Modeling (R Studio)",
    "Project Management (Agile/Scrum)",
    "Deep Learning & AI models",
    "SQL Databases & Data Warehouse",
    "Corporate Strategic Planning",
    "Financial Modeling & Valuation",
    "Team Management & Leadership",
    "Advanced Economics / econometrics",
    "Business Analysis",
    "Technical Writing",
    "Quantitative research"
  ],
  "Government Exam Preparation": [
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability & English Comprehension",
    "General Knowledge & Current Affairs",
    "History (Ancient, Medieval, Modern)",
    "Indian Polity, Constitution & Governance",
    "General Economics & Budget",
    "Public Administration",
    "Geography & Environment Ecology",
    "Data Interpretation",
    "General Science & Tech updates",
    "Essay Writing & Comprehension Skills",
    "Ethics, Integrity & Aptitude",
    "Defense Entry General Knowledge"
  ]
};

const INTERESTS_BY_EDUCATION: Record<string, string[]> = {
  "Intermediate (High School / 11th & 12th)": [
    "Engineering Entrance (JEE Mains/Adv)",
    "Medical Entrance (NEET/AIIMS)",
    "Higher Studies Abroad (SAT/IELTS)",
    "Pure Sciences Research & IISERs",
    "Commerce, CA Foundation & CS",
    "Business Administration (IPM/BBA Entrance)",
    "Creative Arts, Animation & Design",
    "Law & Legal Studies Competitions (CLAT)",
    "Olympiads & Talent Search Exams",
    "Performing Arts (Music, Theatre, Dance)",
    "Content Creation (Blogging, YouTube)"
  ],
  "B.Tech / Engineering Course": [
    "Software Engineering Roles",
    "Web Development / Full-stack",
    "Mobile App Development",
    "Artificial Intelligence & ML Tools",
    "DevOps, SRE & Cloud Systems",
    "Web3, Cryptography & Blockchain",
    "Open Source Contribution (GSoC)",
    "Competetive Programming (LeetCode)",
    "Fintech & Quantitative Trading",
    "EdTech & Tech education",
    "High-Performance System Design",
    "Building Micro-SaaS Startups",
    "Freelancing on Upwork/Fiverr",
    "GCP / AWS Cloud Consultancy",
    "Autonomous Vehicles & Robotics"
  ],
  "Graduation (General/Non-Tech Degree)": [
    "Freelancing & Remote Work",
    "E-commerce Business Setup",
    "Management Consulting Careers",
    "Product & Project Management",
    "Data Analyst / Business Intelligence",
    "Corporate Operations & Admin",
    "Digital Content Writing & Media",
    "Entrepreneurship & Startups",
    "Investment Banking & Private Equity",
    "Human Resource Personnel Roles",
    "Digital Marketing Agency Setup",
    "Sales & High-Ticket Closing",
    "Supply Chain & Logistics Management"
  ],
  "Post-Graduation (Master's Degree)": [
    "Research & Development (R&D Lab)",
    "Teaching, Lectureship & UGC NET Prep",
    "Corporate Executive Careers",
    "Product Management roles",
    "GATE & PSU Technical Services",
    "PhD Programs & Academic Research",
    "Market Research Analyst roles",
    "Policy Analysis & Advisory",
    "Strategic Business Consulting",
    "Advanced Data Science & NLP"
  ],
  "Government Exam Preparation": [
    "Civil Services & Indian Admin (IAS/IPS)",
    "Staff Selection Commission (SSC CGL)",
    "Banking Career (IBPS PO, SBI, RBI)",
    "Railway Recruitment Services (RRB)",
    "State Public Service Commissions (PSC)",
    "Military Entry (NDA, CDS, AFCAT, Navy)",
    "Public Sector Undertakings (Oil, Power)",
    "Junior Research Fellowship & Education Support",
    "Paramilitary & Police Forces Careers",
    "Judiciary & Government Legal Officers"
  ]
};

const SPECIALIZED_SKILLS: Record<string, string[]> = {
  // Electronics/Electrical (ECE/EEE)
  "ECE_EEE": [
    "Embedded Systems & IoT",
    "VLSI Design (Verilog / VHDL)",
    "Analog & Digital Circuit Design",
    "MATLAB & Simulink",
    "Microcontrollers (Arduino, STM32, 8051)",
    "PCB Design & Circuit Simulation",
    "Power Electronics & Grid Systems",
    "PLC & SCADA Programming",
    "Robotics & Control Systems",
    "Digital Signal Processing (DSP)",
    "C/C++ for Hardware Coding",
    "Python Programming",
    "Data Structures & Algorithms",
    "FPGA Prototyping",
    "Sensor Integration"
  ],
  // Mechanical Engineering
  "Mechanical": [
    "CAD Design (AutoCAD, SolidWorks, CATIA)",
    "Finite Element Analysis (FEA)",
    "Computational Fluid Dynamics (CFD)",
    "Thermodynamics & Heat Transfer",
    "CNC Machining & G-code",
    "Robotics & Kinematics",
    "3D Printing & Rapid Prototyping",
    "MATLAB & Python programming",
    "Automotive Engineering Systems",
    "Mechatronics",
    "Quality Control & Six Sigma"
  ],
  // Civil Engineering
  "Civil": [
    "AutoCAD Civil 3D",
    "STAAD Pro (Structural Analysis)",
    "GIS & GPS Mapping (ArcGIS)",
    "Project Estimation & Costing",
    "Concrete Technology & Soil Mechanics",
    "Surveying & Levelling",
    "Construction Management (MSP/Primavera)",
    "Hydraulics & Water Resource",
    "Environmental Engineering"
  ],
  // Biotech
  "Biotech": [
    "Molecular Biology techniques",
    "Bioinformatics (BLAST, ClustalW)",
    "Genetic Engineering",
    "Bioprocess Engineering",
    "Cell Culture & Fermentation",
    "Python for Biocomputing (Biopython)",
    "Data Analysis with R Statistics",
    "Clinical Research & Trial protocols",
    "Microbiology methods"
  ],
  // Aerospace
  "Aerospace": [
    "Aerodynamics analysis",
    "Flight Mechanics & Dynamics",
    "Propulsion Systems & Engines",
    "ANSYS & CATIA modeling",
    "Avionics & Control Systems",
    "Computational Fluid Dynamics (CFD)",
    "Structural Analysis of Aircraft"
  ],
  // AI/ML - Data Science
  "AIML_DS": [
    "Python Programming",
    "R Programming",
    "Machine Learning (Scikit-Learn)",
    "Deep Learning (PyTorch / TensorFlow)",
    "Data Visualization (Tableau, PowerBI)",
    "SQL & Database querying",
    "Data Wrangling & Pandas/NumPy",
    "Natural Language Processing (NLP)",
    "Computer Vision (OpenCV)",
    "Big Data (Spark, Hadoop)",
    "Probability & Statistical Analytics",
    "Data Structures & Algorithms"
  ],
  // Computer Science & IT
  "CSE_IT": [
    "Java Programming",
    "Python Programming",
    "C++ Programming",
    "JavaScript & TypeScript",
    "React & Next.js frontend",
    "Node.js & Express backend",
    "Django / Spring Boot backends",
    "SQL Rules & Relational Databases",
    "NoSQL (MongoDB, Redis)",
    "Docker & Cloud Deployment",
    "Data Structures & Algorithms",
    "System Design & Microservices",
    "Git & GitHub Actions (CI/CD)",
    "Cybersecurity Basics & OWASP"
  ]
};

const SPECIALIZED_INTERESTS: Record<string, string[]> = {
  "ECE_EEE": [
    "Semiconductor & VLSI Industry",
    "Electric Vehicles (EV) & Battery Tech",
    "Internet of Things (IoT) Startups",
    "Robotics & Hardware-Software Co-design",
    "Industrial Automation & SCADA",
    "Core Placement (Qualcomm, TI, Intel)",
    "GATE & PSU Core Jobs (ISRO, DRDO, NTPC)",
    "Smart Grid & Renewable Energy",
    "Defense Technologies development",
    "Embedded Engineering research"
  ],
  "Mechanical": [
    "Automobile & Electric Vehicles (EV)",
    "Aerodynamic Design & Fluidics",
    "Biomedical Implants & Prosthetics",
    "Industrial Manufacturing & Robotics",
    "Heavy Machinery & Material Science",
    "Energy Auditing & HVAC",
    "Aerospace Structures Construction",
    "Mechatronics Startup ideas"
  ],
  "Civil": [
    "Smart City planning & Infra",
    "Sustainable Green Buildings",
    "Transportation & Elevated Highways",
    "Hydraulic & Dam Projects",
    "Real Estate Development & PMC",
    "Geotechnical consultancies",
    "GIS Analyst opportunities"
  ],
  "Biotech": [
    "Vaccine & Drug Discovery (Pharma)",
    "Agricultural Bio-innovations",
    "Genetic Therapy & CRISPR",
    "Bio-plastics & Circular Economy",
    "Clinical Lab Operations management",
    "Bioinformatics data science"
  ],
  "Aerospace": [
    "Space Exploration & Satellites (ISRO)",
    "Drone Design & UAV Startups",
    "Commercial Aircraft Maintenance",
    "Defense Missile development",
    "Supersonic Flight aerodynamics"
  ],
  "AIML_DS": [
    "Generative AI & LLMs",
    "Predictive Analytics & FinTech",
    "Computer Vision for Autonomous Cars",
    "Healthcare AI diagnostics",
    "Business Intelligence Specialist",
    "Big Data Platform Engineering"
  ],
  "CSE_IT": [
    "Software Engineer Roles",
    "Web3 & Blockchain Platforms",
    "DevOps & Scalable Cloud Infrastructure",
    "Open Source Contributions (GSoC)",
    "Competitive Coding contests",
    "Fintech Systems & Coding",
    "Micro-SaaS Software creation",
    "Cybersecurity Assessment & Audits"
  ]
};

function getSpecializedKey(fieldOfStudy: string): string | null {
  const normalized = (fieldOfStudy || "").toLowerCase();
  
  if (
    normalized.includes("electronics") || 
    normalized.includes("electrical") || 
    normalized.includes("ece") || 
    normalized.includes("eee")
  ) {
    return "ECE_EEE";
  }
  
  if (
    normalized.includes("ai & machine learning") || 
    normalized.includes("artificial intelligence") || 
    normalized.includes("data science") || 
    normalized.includes("analytics") || 
    normalized.includes("ai/ml")
  ) {
    return "AIML_DS";
  }
  
  if (
    normalized.includes("computer science") || 
    normalized.includes("information technology") || 
    normalized.includes("cse") || 
    normalized.includes("it")
  ) {
    return "CSE_IT";
  }
  
  if (normalized.includes("mechanical") || normalized.includes("me")) {
    return "Mechanical";
  }
  
  if (normalized.includes("civil") || normalized.includes("ce")) {
    return "Civil";
  }
  
  if (
    normalized.includes("biotech") || 
    normalized.includes("biology") || 
    normalized.includes("genetic")
  ) {
    return "Biotech";
  }
  
  if (
    normalized.includes("aerospace") || 
    normalized.includes("aeronaut")
  ) {
    return "Aerospace";
  }
  
  return null;
}

export default function App() {
  const [step, setStep] = useState<AssessmentStep>('intro');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    education: '',
    collegeTier: 'tier3',
    skills: [],
    interests: [],
    fieldOfStudy: '',
    preferredWorkType: 'any',
    studyReminderEnabled: localStorage.getItem("pathfinder_study_reminder_enabled") === "true",
    studyReminderEmail: localStorage.getItem("pathfinder_study_reminder_email") || ""
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedMilestone, setCelebratedMilestone] = useState("");

  // Daily Study Reminder States
  const [reminderEmail, setReminderEmail] = useState<string>(() => {
    return localStorage.getItem("pathfinder_study_reminder_email") || "";
  });
  const [savingReminders, setSavingReminders] = useState<boolean>(false);
  const [reminderSaveSuccess, setReminderSaveSuccess] = useState<boolean>(false);
  const [testNudgeLoading, setTestNudgeLoading] = useState<boolean>(false);
  const [testNudgeResult, setTestNudgeResult] = useState<string | null>(null);

  // Dark Mode State and Theme Adjustment Options
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("pathfinder_dark_mode") === "true");
  const [themeContrast, setThemeContrast] = useState<'slate' | 'midnight' | 'charcoal'>(() => {
    return (localStorage.getItem("pathfinder_theme_contrast") as 'slate' | 'midnight' | 'charcoal') || 'slate';
  });
  const [themeAccent, setThemeAccent] = useState<'blue' | 'emerald' | 'gold' | 'purple'>(() => {
    return (localStorage.getItem("pathfinder_theme_accent") as 'blue' | 'emerald' | 'gold' | 'purple') || 'blue';
  });
  const [showThemeCustomizer, setShowThemeCustomizer] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("pathfinder_dark_mode", "true");
      
      // Select contrast classes
      if (themeContrast === 'midnight') {
        root.classList.add("contrast-midnight");
        root.classList.remove("contrast-charcoal");
      } else if (themeContrast === 'charcoal') {
        root.classList.add("contrast-charcoal");
        root.classList.remove("contrast-midnight");
      } else {
        root.classList.remove("contrast-midnight", "contrast-charcoal");
      }
    } else {
      root.classList.remove("dark", "contrast-midnight", "contrast-charcoal");
      localStorage.setItem("pathfinder_dark_mode", "false");
    }
    
    localStorage.setItem("pathfinder_theme_contrast", themeContrast);
  }, [darkMode, themeContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("accent-emerald", "accent-gold", "accent-purple");
    
    if (themeAccent !== 'blue') {
      root.classList.add(`accent-${themeAccent}`);
    }
    localStorage.setItem("pathfinder_theme_accent", themeAccent);
  }, [themeAccent]);

  // Developer Hub & Architecture map state
  const [showDevHub, setShowDevHub] = useState<boolean>(false);
  const [devHubData, setDevHubData] = useState<any>(null);
  const [devHubLoading, setDevHubLoading] = useState<boolean>(false);

  const fetchDevHubData = async () => {
    try {
      setDevHubLoading(true);
      const res = await fetch("/api/admin/system-data");
      if (res.ok) {
        const data = await res.json();
        setDevHubData(data);
      }
    } catch (e) {
      console.error("Failed to load dev statistics", e);
    } finally {
      setDevHubLoading(false);
    }
  };

  useEffect(() => {
    if (showDevHub) {
      fetchDevHubData();
    }
  }, [showDevHub]);

  // Full Stack MERN States
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("pathfinder_auth_token"));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_request' | 'forgot_reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotPin, setForgotPin] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<{ isMongoConnected: boolean; storageType: string } | null>(null);

  // Fetch MERN system status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/system-status");
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data);
        }
      } catch (e) {
        console.error("Failed to fetch system database status", e);
      }
    };
    fetchStatus();
  }, []);

  // Fetch current user and saved recommendations
  useEffect(() => {
    const fetchUserAndRecs = async () => {
      if (!token) {
        setUser(null);
        setSavedRecommendations([]);
        return;
      }
      try {
        // Fetch current user info
        const meRes = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem("pathfinder_auth_token");
          setToken(null);
          setUser(null);
          return;
        }

        // Fetch their saved roadmaps
        const recsRes = await fetch("/api/recommendations", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (recsRes.ok) {
          const recsData = await recsRes.json();
          setSavedRecommendations(recsData);
        }
      } catch (e) {
        console.error("Failed to fetch user profiles or saved career data", e);
      }
    };
    fetchUserAndRecs();
  }, [token]);

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotSuccessMessage(null);
    setAuthLoading(true);

    if (authMode === 'forgot_request') {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Failed to search for account.');
        } else {
          setForgotSuccessMessage(data.message);
          // Transition to password reset step
          setAuthMode('forgot_reset');
        }
      } catch (err) {
        setAuthError('Server communication lost during action.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    if (authMode === 'forgot_reset') {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, pin: forgotPin, newPassword: forgotNewPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          setAuthError(data.error || 'Failed to reset password.');
        } else {
          setForgotSuccessMessage(data.message);
          // Transition back to login mode on success
          setTimeout(() => {
            setAuthMode('login');
            setForgotPin('');
            setForgotNewPassword('');
            setForgotSuccessMessage(null);
          }, 4000);
        }
      } catch (err) {
        setAuthError('Server communication lost during action.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const bodyObj = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, name: authName };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
      } else {
        localStorage.setItem("pathfinder_auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setShowAuthModal(false);
        // Reset fields
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }
    } catch (err) {
      setAuthError('Failed to communicate with MERN backend');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pathfinder_auth_token");
    setToken(null);
    setUser(null);
    setSavedRecommendations([]);
    setStep('intro');
    setRecommendation(null);
  };

  const initialSkills = [
    'Java', 'Python', 'Go', 'Rust', 'C++', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Next.js', 'Node.js', 'Django', 'FastAPI', 'Spring Boot', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Terraform', 'CI/CD', 'Data Analytics', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'UI/UX Design', 'Figma', 'Product Management', 'Cybersecurity', 'Web Development', 'Mobile App Development', 'Flutter', 'React Native',
    'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability & English', 'General Knowledge & Current Affairs', 'History & Social Sciences', 'Indian Polity & Constitution', 'General Economics & Finance', 'Physics (Core)', 'Mathematics (Advanced)', 'Accountancy & Audit', 'Public Administration', 'Business Management'
  ];
  const initialInterests = [
    'Fintech', 'EdTech', 'HealthTech', 'AgriTech', 'Climate Tech', 'AI & Machine Learning', 'Web3 & Blockchain', 'Gaming & Metaverse', 'DevOps & Infrastructure', 'E-commerce', 'SaaS', 'High-Frequency Trading', 'Open Source Contribution', 'Competitive Programming', 'Building Micro-SaaS', 'Freelancing', 'Government Tech',
    'Civil Services & Governance', 'Public Administration', 'Central Govt Jobs (SSC CGL)', 'Banking Career (IBPS/SBI)', 'Railway Services (RRB)', 'State Public Services', 'Teaching & Academia (B.Ed)', 'Defence Forces (NDA/CDS)', 'GATE & PSU Research', 'Corporate Operations', 'Management Consulting', 'Chartered Accountancy'
  ];

  const availableSkills = useMemo(() => {
    if (!profile.education) return initialSkills;
    
    // Check for specialized branch/course override
    const specKey = getSpecializedKey(profile.fieldOfStudy);
    if (specKey && SPECIALIZED_SKILLS[specKey]) {
      return SPECIALIZED_SKILLS[specKey];
    }
    
    return SKILLS_BY_EDUCATION[profile.education] || initialSkills;
  }, [profile.education, profile.fieldOfStudy]);

  const availableInterests = useMemo(() => {
    if (!profile.education) return initialInterests;
    
    // Check for specialized branch/course override
    const specKey = getSpecializedKey(profile.fieldOfStudy);
    if (specKey && SPECIALIZED_INTERESTS[specKey]) {
      return SPECIALIZED_INTERESTS[specKey];
    }
    
    return INTERESTS_BY_EDUCATION[profile.education] || initialInterests;
  }, [profile.education, profile.fieldOfStudy]);

  // Reset selected skills and interests if education or field of study changes, keeping things perfectly clean.
  const [prevEducation, setPrevEducation] = useState(profile.education);
  const [prevFieldOfStudy, setPrevFieldOfStudy] = useState(profile.fieldOfStudy);

  useEffect(() => {
    if (
      (prevEducation && profile.education !== prevEducation) ||
      (prevFieldOfStudy && profile.fieldOfStudy !== prevFieldOfStudy)
    ) {
      setProfile(prev => ({
        ...prev,
        skills: [],
        interests: []
      }));
    }
    setPrevEducation(profile.education);
    setPrevFieldOfStudy(profile.fieldOfStudy);
  }, [profile.education, profile.fieldOfStudy]);

  const progress = useMemo(() => {
    switch (step) {
      case 'intro': return 0;
      case 'profile': return 33;
      case 'skills': return 66;
      case 'interests': return 90;
      case 'results': return 100;
      default: return 0;
    }
  }, [step]);

  const handleNext = () => {
    if (step === 'intro') {
      // Pre-fill profile name if user is logged in
      if (user && !profile.name) {
        setProfile(prev => ({ ...prev, name: user.name }));
      }
      setStep('profile');
    }
    else if (step === 'profile') setStep('skills');
    else if (step === 'skills') setStep('interests');
    else if (step === 'interests') getRecommendation();
  };

  const handleBack = () => {
    if (step === 'profile') setStep('intro');
    else if (step === 'skills') setStep('profile');
    else if (step === 'interests') setStep('skills');
    else if (step === 'results') setStep('interests');
  };

  const toggleSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const totalMilestonesCount = useMemo(() => {
    if (!recommendation) return 0;
    return recommendation.roadmap.reduce((acc, p) => acc + p.milestones.length, 0);
  }, [recommendation]);

  const completedCount = useMemo(() => {
    return Object.values(completedMilestones).filter(Boolean).length;
  }, [completedMilestones]);

  const chartData = useMemo(() => {
    if (!recommendation) return [];
    return recommendation.roadmap.map((item, index) => {
      const total = item.milestones.length;
      const completed = item.milestones.filter((_, mIdx) => completedMilestones[`${index}-${mIdx}`]).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: item.phase.includes(':') ? item.phase.split(':')[0] : `Phase ${index + 1}`,
        fullName: item.phase,
        "Completed": completed,
        "Total Milestones": total,
        "Progress (%)": percentage,
      };
    });
  }, [recommendation, completedMilestones]);

  const nextPendingMilestone = useMemo(() => {
    if (!recommendation) return null;
    for (let phaseIdx = 0; phaseIdx < recommendation.roadmap.length; phaseIdx++) {
      const phase = recommendation.roadmap[phaseIdx];
      for (let mIdx = 0; mIdx < phase.milestones.length; mIdx++) {
        const milestone = phase.milestones[mIdx];
        if (!completedMilestones[`${phaseIdx}-${mIdx}`]) {
          return {
            milestone,
            phase: phase.phase,
            index: mIdx + 1
          };
        }
      }
    }
    return null;
  }, [recommendation, completedMilestones]);

  // Sync email address with logged-in user or profile loaded
  useEffect(() => {
    if (user && !reminderEmail) {
      setReminderEmail(user.email);
    }
  }, [user, reminderEmail]);

  useEffect(() => {
    if (profile.studyReminderEmail) {
      setReminderEmail(profile.studyReminderEmail);
    }
  }, [profile.studyReminderEmail]);

  const getRecommendation = async () => {
    setLoading(true);
    setError(null);
    setCompletedMilestones({}); // Reset progress on new recommendation
    try {
      const rec = await getCareerRecommendation(profile);
      setRecommendation(rec);
      setStep('results');
      
      // Update saved list from MERN if logged in
      if (token) {
        const recsRes = await fetch("/api/recommendations", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (recsRes.ok) {
          const recsData = await recsRes.json();
          setSavedRecommendations(recsData);
        }
      }
      
      // Scroll to top when results are shown
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("PathFinder Error:", err);
      setError(err?.message || "AI failed to generate a roadmap. This usually happens due to network issues. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = async (phaseIndex: number, milestoneIndex: number) => {
    const key = `${phaseIndex}-${milestoneIndex}`;
    const wasCompleted = completedMilestones[key];
    const newCompleted = {
      ...completedMilestones,
      [key]: !wasCompleted
    };
    setCompletedMilestones(newCompleted);

    // Trigger celebration animation on completed check
    if (!wasCompleted) {
      const text = recommendation?.roadmap[phaseIndex]?.milestones[milestoneIndex] || "Roadmap objective checked off!";
      setCelebratedMilestone(text);
      setShowCelebration(true);
      // Automatically clear celebration after some delay
      setTimeout(() => {
        setShowCelebration(false);
      }, 3500);
    }

    // Sync to MERN backend DB if it's a saved cloud recommendation
    const recommendationId = (recommendation as any)._id || (recommendation as any).id;
    if (recommendationId && !recommendationId.startsWith("local_rec_")) {
      try {
        await fetch(`/api/recommendation/${recommendationId}/milestones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ completedMilestones: newCompleted })
        });
      } catch (e) {
        console.error("Failed to sync milestone tracking to fullstack MERN database", e);
      }
    }
  };

  const handleSaveReminders = async (enabled: boolean, emailAddress: string) => {
    setSavingReminders(true);
    setReminderSaveSuccess(false);
    try {
      setProfile(prev => ({
        ...prev,
        studyReminderEnabled: enabled,
        studyReminderEmail: emailAddress
      }));

      localStorage.setItem("pathfinder_study_reminder_enabled", enabled ? "true" : "false");
      localStorage.setItem("pathfinder_study_reminder_email", emailAddress);

      if (token) {
        await fetch("/api/profile/reminders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            studyReminderEnabled: enabled,
            studyReminderEmail: emailAddress
          })
        });
      }
      
      setReminderSaveSuccess(true);
      setTimeout(() => setReminderSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save Reminders Error:", err);
    } finally {
      setSavingReminders(false);
    }
  };

  const handleTriggerTestNudge = async () => {
    if (!reminderEmail) return;
    setTestNudgeLoading(true);
    setTestNudgeResult(null);
    try {
      const currentMilestoneText = nextPendingMilestone 
        ? `${nextPendingMilestone.phase} - ${nextPendingMilestone.milestone}`
        : "Complete initial career assessment & define primary tech target";

      const res = await fetch("/api/profile/reminders/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          studyReminderEmail: reminderEmail,
          role: recommendation?.role || "PathFinder Career Role",
          pendingMilestone: currentMilestoneText
        })
      });

      if (!res.ok) {
        throw new Error("Failed to trigger simulated reminder nudge");
      }

      const data = await res.json();
      setTestNudgeResult(data.preview);
    } catch (err: any) {
      console.error("Test reminder error:", err);
    } finally {
      setTestNudgeLoading(false);
    }
  };

  const getPhaseProgress = (phaseIndex: number, milestones: string[]) => {
    const completedCount = milestones.filter((_, i) => completedMilestones[`${phaseIndex}-${i}`]).length;
    return (completedCount / milestones.length) * 100;
  };

  const isPhaseCompleted = (phaseIndex: number, milestones: string[]) => {
    return milestones.every((_, i) => completedMilestones[`${phaseIndex}-${i}`]);
  };

  const isPhaseAccessible = (phaseIndex: number) => {
    if (phaseIndex === 0) return true;
    return isPhaseCompleted(phaseIndex - 1, recommendation?.roadmap[phaseIndex - 1].milestones || []);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 selection:bg-blue-100">
      {/* Dynamic Interactive Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          className="absolute top-[15%] left-[5%] w-72 h-72 rounded-full bg-blue-400/15 blur-[90px]"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 90, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-[25%] right-[10%] w-96 h-96 rounded-full bg-indigo-400/15 blur-[110px]"
          animate={{
            x: [0, -90, 60, 0],
            y: [0, 80, -70, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-[50%] left-[40%] w-80 h-80 rounded-full bg-emerald-400/10 blur-[100px]"
          animate={{
            x: [0, 50, -60, 0],
            y: [0, 70, -50, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">PathFinder<span className="text-blue-600">AI</span></span>
            </div>
            {dbStatus && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border transition-all",
                dbStatus.isMongoConnected 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dbStatus.isMongoConnected ? "bg-emerald-500" : "bg-amber-500")} />
                <span>{dbStatus.isMongoConnected ? "MongoDB Active" : "Local DB"}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {step !== 'intro' && (
              <div className="hidden md:block w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-blue-600 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Theme Customizer Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowThemeCustomizer(!showThemeCustomizer)}
                className="p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer flex items-center justify-center shrink-0"
                title="Adjust Theme & Accent"
              >
                <Palette className="w-4 h-4 text-emerald-500 hover:scale-105 transition-transform" />
              </button>
              
              <AnimatePresence>
                {showThemeCustomizer && (
                  <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowThemeCustomizer(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 z-50 text-slate-900 dark:text-slate-100 space-y-4"
                    >
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          🎨 Theme Customizer
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full font-sans">
                          AI Mentor
                        </span>
                      </div>
                      
                      {/* Dark Mode Toggle */}
                      <div className="flex items-center justify-between py-1">
                        <span className="text-xs font-bold">Dark Mode Activation</span>
                        <button
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none ${darkMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Display Settings, active only if Dark Mode is active */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Dark Contrast Style
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            disabled={!darkMode}
                            onClick={() => setThemeContrast('slate')}
                            className={`px-2 py-1.5 text-[10px] font-black rounded-lg border transition-all text-center flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 ${
                              darkMode && themeContrast === 'slate'
                                ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-black font-sans' 
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
                            Slate
                          </button>
                          
                          <button
                            disabled={!darkMode}
                            onClick={() => setThemeContrast('midnight')}
                            className={`px-2 py-1.5 text-[10px] font-black rounded-lg border transition-all text-center flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 ${
                              darkMode && themeContrast === 'midnight'
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-black font-sans' 
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800" />
                            Midnight
                          </button>
                          
                          <button
                            disabled={!darkMode}
                            onClick={() => setThemeContrast('charcoal')}
                            className={`px-2 py-1.5 text-[10px] font-black rounded-lg border transition-all text-center flex flex-col items-center gap-1 cursor-pointer disabled:opacity-40 ${
                              darkMode && themeContrast === 'charcoal'
                                ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-black font-sans' 
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-[#1e1e1e] border border-slate-700" />
                            Charcoal
                          </button>
                        </div>
                      </div>

                      {/* Accent Palette Customizer */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Brand Accent Palette
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setThemeAccent('blue')}
                            className={`p-1.5 rounded-lg border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              themeAccent === 'blue' 
                                ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400' 
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                            title="Blue Theme"
                          >
                            <div className="w-4 h-4 rounded-full bg-blue-500 shrink-0" />
                            <span className="text-[9px] font-black">Blue</span>
                          </button>
                          
                          <button
                            onClick={() => setThemeAccent('emerald')}
                            className={`p-1.5 rounded-lg border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              themeAccent === 'emerald' 
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                            title="Emerald Theme"
                          >
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[9px] font-black">Forest</span>
                          </button>
                          
                          <button
                            onClick={() => setThemeAccent('gold')}
                            className={`p-1.5 rounded-lg border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              themeAccent === 'gold' 
                                ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                            title="Gold Theme"
                          >
                            <div className="w-4 h-4 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-[9px] font-black">Bronze</span>
                          </button>
                          
                          <button
                            onClick={() => setThemeAccent('purple')}
                            className={`p-1.5 rounded-lg border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                              themeAccent === 'purple' 
                                ? 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-400' 
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                            title="Purple Theme"
                          >
                            <div className="w-4 h-4 rounded-full bg-purple-500 shrink-0" />
                            <span className="text-[9px] font-black">Cyber</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Dark Mode Switch */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer flex items-center justify-center shrink-0"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {/* System Blueprint & Admin Dashboard Map trigger */}
            <button
              onClick={() => setShowDevHub(true)}
              className="px-3 py-2 rounded-xl transition-all border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-xs font-bold font-sans cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-[1.03]"
              title="See what is Frontend, Backend & Database (Admin Console)"
            >
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="hidden md:inline">⚙️ System Blueprint & Admin Panel</span>
              <span className="inline md:hidden">⚙️ System Map</span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 pl-3 pr-2 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600 border border-slate-200 rounded-full" />
                  <span className="text-sm font-bold text-slate-800 hidden sm:inline">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Logout" 
                  className="p-1 px-2.5 text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="px-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center space-y-12 py-12"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100"
                >
                  <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500" />
                  Elevate Your Career Path
                </motion.div>
                <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none">
                  Find Your <br />
                  <span className="gradient-text">North Star</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                  The personalized career recommendation engine for the next generation of engineers, specifically optimized for Tier 2/3 college students.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={handleNext}
                  className="group px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 cursor-pointer"
                >
                  Start My Journey
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/${i + 100}/100/100`}
                      className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                      alt="User"
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                    +5k
                  </div>
                </div>
              </div>

              {/* Cloud Saved Career Plans (Full Stack MERN feature) */}
              {user && savedRecommendations.length > 0 && (
                <div className="max-w-2xl mx-auto space-y-4 text-left pt-8 border-t border-slate-200/60 mt-12 animate-fade-in">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <History className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Your Saved Career Paths</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedRecommendations.map((rec) => (
                      <button
                        key={rec._id || rec.id}
                        onClick={() => {
                          setRecommendation(rec);
                          setCompletedMilestones(rec.completedMilestones || {});
                          setStep('results');
                        }}
                        className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-left transition-all hover:border-blue-400 group flex justify-between items-center shadow-xs cursor-pointer"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{rec.role}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Created: {new Date(rec.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold shrink-0">
                          {rec.suitabilityScore}% Match
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
                {[
                  { icon: Target, title: "Custom Roadmaps", desc: "Actionable month-by-month steps tailored to your goals." },
                  { icon: Brain, title: "AI Intelligence", desc: "Powered by Gemini for deep career context and expertise." },
                  { icon: Rocket, title: "Off-campus Focus", desc: "Specialized strategies to win from Tier 2/3 colleges." }
                ].map((feature, i) => (
                  <div key={i} className="p-8 bg-white rounded-3xl border border-slate-200 text-left space-y-4 hover:shadow-xl hover:shadow-slate-200 transition-all group">
                    <div className="p-3 bg-slate-50 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div 
              key="profile"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight">The Basics</h2>
                <p className="text-lg text-slate-500">Tell us a bit about your current background.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-lg font-medium"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">Education Level / Stage</label>
                    <select 
                      value={profile.education}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfile(prev => ({
                          ...prev, 
                          education: val,
                          fieldOfStudy: COURSE_SUGGESTIONS[val]?.[0] || "" // Pre-select first course of that level
                        }));
                      }}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all bg-white text-lg font-medium"
                    >
                      <option value="">-- Choose Education Level --</option>
                      {EDUCATION_LEVEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-widest">College / School Profile</label>
                    <select 
                      value={profile.collegeTier}
                      onChange={(e) => setProfile(prev => ({...prev, collegeTier: e.target.value as any}))}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all bg-white text-lg font-medium"
                    >
                      <option value="tier1">Tier 1 (IIT/NIT/BITS/Top Pvt/Top Board)</option>
                      <option value="tier2">Tier 2 (Good Regional/Reputed/KV/Distinguished)</option>
                      <option value="tier3">Tier 3 (Local/Average Colleges/Govt Schools)</option>
                    </select>
                  </div>
                </div>

                {/* Course/Major Selection Component (Dynamic content) */}
                {profile.education && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-widest block">
                      {profile.education === "Government Exam Preparation" 
                        ? "Specific Government Exam Focus" 
                        : "Course / Specialized Stream"}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Suggestion Chips */}
                      <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                        {(COURSE_SUGGESTIONS[profile.education] || []).map((courseOption) => {
                          const isSelected = profile.fieldOfStudy === courseOption;
                          return (
                            <button
                              id={`course-chip-${courseOption.replace(/\s+/g, '-').toLowerCase()}`}
                              key={courseOption}
                              onClick={() => setProfile(prev => ({ ...prev, fieldOfStudy: courseOption }))}
                              className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 text-left cursor-pointer",
                                isSelected 
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10" 
                                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              {courseOption}
                            </button>
                          );
                        })}
                        <button
                          id="course-chip-custom"
                          onClick={() => setProfile(prev => ({ ...prev, fieldOfStudy: "custom_input_needed" }))}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 text-left cursor-pointer",
                            profile.fieldOfStudy === "custom_input_needed" || !((COURSE_SUGGESTIONS[profile.education] || []).includes(profile.fieldOfStudy))
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          ✏️ Other / Custom Option...
                        </button>
                      </div>

                      {/* Right feedback and custom text input */}
                      <div className="space-y-4 bg-white p-5 border border-slate-100 rounded-2xl flex flex-col justify-center shadow-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Selected Target for Recommendation</span>
                          <span className="text-base text-slate-800 font-bold block bg-blue-50/50 px-3.5 py-2.5 rounded-xl border border-blue-100/50">
                            {profile.fieldOfStudy === "custom_input_needed" ? "✍️ Custom Input Required Below" : (profile.fieldOfStudy || "None selected")}
                          </span>
                        </div>
                        
                        {(profile.fieldOfStudy === "custom_input_needed" || !((COURSE_SUGGESTIONS[profile.education] || []).includes(profile.fieldOfStudy))) && (
                          <div className="space-y-1.5 animate-slide-up pt-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Type Custom Course / Exam Target</label>
                            <input 
                              type="text" 
                              value={profile.fieldOfStudy === "custom_input_needed" ? "" : profile.fieldOfStudy}
                              onChange={(e) => setProfile(prev => ({...prev, fieldOfStudy: e.target.value}))}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-sm font-semibold"
                              placeholder={
                                profile.education === "Government Exam Preparation" 
                                  ? "e.g. UPSC CSE Mains / Forest Officer Exam" 
                                  : "e.g. Dual Degree Mechanical & CS"
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
 
              <div className="flex items-center justify-between pt-10">
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors uppercase tracking-widest text-xs">
                  <ChevronLeft className="w-5 h-5" /> Back to start
                </button>
                <button 
                  disabled={!profile.name || !profile.education || !profile.fieldOfStudy || profile.fieldOfStudy === "custom_input_needed"}
                  onClick={handleNext} 
                  className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'skills' && (
            <motion.div 
              key="skills"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Your Toolkit</h2>
                <p className="text-slate-500">Select the skills you already possess or are learning.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium",
                      profile.skills.includes(skill)
                        ? "bg-blue-600 border-blue-600 text-white scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:border-blue-400"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6">
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  disabled={profile.skills.length < 2}
                  onClick={handleNext} 
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'interests' && (
            <motion.div 
              key="interests"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">What Excites You?</h2>
                <p className="text-slate-500">Career happiness depends on passion. Select your interests.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium",
                      profile.interests.includes(interest)
                        ? "bg-emerald-600 border-emerald-600 text-white scale-105"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-2">
                  <X className="w-5 h-5" /> {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-6">
                <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  disabled={profile.interests.length < 1 || loading}
                  onClick={handleNext} 
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : "Generate Roadmap"}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'results' && recommendation && (
            <motion.div 
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-12"
            >
              {/* Header result */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  <Rocket className="w-4 h-4" /> Recommended Career Path
                </div>
                <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight underline decoration-blue-500/30 underline-offset-8">{recommendation.role}</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                        <motion.circle 
                          cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 40) * (1 - recommendation.suitabilityScore / 100) }}
                          className="text-emerald-500"
                        />
                      </svg>
                      <span className="absolute text-xl font-black text-slate-900">{recommendation.suitabilityScore}%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">Overall Match</span>
                  </div>
                  <div className="text-left max-w-lg">
                    <p className="text-slate-600 text-lg leading-relaxed font-medium">"{recommendation.description}"</p>
                  </div>
                </div>
              </div>

              {/* Suitability Breakdown - UNIQUE FEATURE 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold">Skill Suitability Radar</h3>
                  </div>
                  <div className="space-y-4">
                    {recommendation.suitabilityBreakdown.map((item, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-slate-500">
                          <span>{item.skill}</span>
                          <span>{item.matchLevel}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.matchLevel}%` }}
                            className="h-full bg-blue-600 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-600 text-white p-8 rounded-3xl space-y-6 shadow-xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold italic">Career Insight</h3>
                  </div>
                  <p className="text-blue-50 font-medium leading-relaxed">
                    Based on your Tier {profile.collegeTier.replace('tier', '')} background, we've identified that your strongest leverage is in **{recommendation.suitabilityBreakdown[0]?.skill}**. 
                    Our roadmap focuses on converting this academic knowledge into high-value industry projects.
                  </p>
                  <button 
                    onClick={() => {
                      const btn = document.querySelector('[data-assistant-toggle]') as HTMLButtonElement;
                      if (btn) btn.click();
                    }}
                    className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                  >
                    Discuss This Insight
                  </button>
                </div>
              </div>

              {/* The Bridge Analysis - UNIQUE FEATURE 2 */}
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">The Bridge: College vs. Industry</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {recommendation.gapAnalysis.map((item, i) => (
                    <div key={i} className="group grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-blue-500 transition-all">
                      <div className="p-6 bg-slate-50 border-r border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">In College</span>
                        <p className="text-sm font-bold text-slate-700">{item.collegeCurriculum}</p>
                      </div>
                      <div className="p-6 bg-white">
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">Industry Wants</span>
                        <p className="text-sm font-bold text-slate-900">{item.industryRequirement}</p>
                      </div>
                      <div className="p-6 bg-blue-50 flex items-center gap-3">
                        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block mb-1">Your Action</span>
                          <p className="text-xs font-bold text-blue-900">{item.actionToBridge}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Progress Trends & Motivation Dashboard */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Career Milestone Trends</h3>
                    </div>
                    <p className="text-sm text-slate-500">Visualize your monthly learning progress and trajectory.</p>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 self-start sm:self-auto shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Checked Off</span>
                      <span className="text-lg font-black text-emerald-600">{completedCount} <span className="text-xs text-slate-400 font-bold">/ {totalMilestonesCount}</span></span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Completion</span>
                      <span className="text-lg font-black text-blue-600">
                        {totalMilestonesCount > 0 ? Math.round((completedCount / totalMilestonesCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-64 sm:h-80 w-full mt-4 min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 'auto']}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, fontWeight: 600, color: '#475569' }} 
                      />
                      <Bar 
                        name="Total Milestones" 
                        dataKey="Total Milestones" 
                        fill="#cbd5e1" 
                        opacity={0.3}
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      />
                      <Area 
                        type="monotone" 
                        name="Completed" 
                        dataKey="Completed" 
                        fill="url(#colorProgress)" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#2563eb', stroke: '#fff', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, strokeWidth: 0 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                    {completedCount === 0 ? (
                      <span>Start checking off items in the <strong>Guided Roadmap</strong> below to watch your progress trend line move! Visualizing achievements increases drive and retentiveness.</span>
                    ) : completedCount === totalMilestonesCount ? (
                      <span>🔥 Incredible! You have traversed 100% of your career trajectory. You are set up for phenomenal placement success!</span>
                    ) : (
                      <span>You've conquered <strong>{completedCount} milestones</strong> so far! Keep completing tasks in order to lift your learning curve of high-performance knowledge.</span>
                    )}
                  </p>
                </div>
              </motion.div>

              {/* Daily Study Reminder Settings Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900" id="study-reminder-title">Daily Study Reminders</h3>
                    </div>
                    <p className="text-sm text-slate-500">Opt-in to receive daily email-based nudges on your pending roadmap milestones.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Reminder</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="reminder-toggle"
                        className="sr-only peer" 
                        checked={profile.studyReminderEnabled || false}
                        onChange={(e) => {
                          const val = e.target.checked;
                          handleSaveReminders(val, reminderEmail);
                        }} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {profile.studyReminderEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-slate-100 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block" id="reminder-email-label">Notification Email</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            id="reminder-email-input"
                            value={reminderEmail || ""}
                            onChange={(e) => setReminderEmail(e.target.value)}
                            onBlur={() => handleSaveReminders(true, reminderEmail)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-hidden transition-all text-sm font-semibold text-slate-800"
                            placeholder="your.email@example.com"
                          />
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          id="save-newsletter-btn"
                          onClick={() => handleSaveReminders(true, reminderEmail)}
                          disabled={savingReminders}
                          className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {savingReminders ? (
                            <>Saving...</>
                          ) : reminderSaveSuccess ? (
                            <><Check className="w-4 h-4 text-emerald-300" /> Settings Saved!</>
                          ) : (
                            <>Save Email Settings</>
                          )}
                        </button>

                        <button
                          id="test-nudge-btn"
                          onClick={handleTriggerTestNudge}
                          disabled={testNudgeLoading || !reminderEmail}
                          className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                        >
                          {testNudgeLoading ? (
                            <>Triggering...</>
                          ) : (
                            <>🚀 Send Test Nudge</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Next Pending Milestone Indicator */}
                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3" id="milestone-nudge-indicator">
                      <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Estimated Nudge Target</p>
                        <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                          {nextPendingMilestone ? (
                            <span>Your next email nudge will keep you focused on: <strong className="text-indigo-800">"{nextPendingMilestone.milestone}"</strong> in phase <strong className="text-indigo-800">{nextPendingMilestone.phase}</strong>.</span>
                          ) : (
                            <span>You have completed all active milestones! Fantastic job. Keep checking this space for future learning paths.</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Test Nudge Result Simulation Modal/Drawer inside boundaries */}
                    {testNudgeResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl"
                        id="nudge-simulation-box"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Simulated Sent Email Inbox</span>
                          </div>
                          <button 
                            onClick={() => setTestNudgeResult(null)}
                            className="text-slate-400 hover:text-white text-xs font-bold font-mono px-2 py-1 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer"
                          >
                            Close Preview
                          </button>
                        </div>
                        <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800 p-3 bg-slate-950 rounded-xl">
                          {testNudgeResult}
                        </pre>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-right">
                          💡 Real email simulated with backend triggers. No real spam sent.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {!profile.studyReminderEnabled && (
                  <p className="text-xs text-slate-400 font-medium">To stay hyper-focused and increase motivation, toggle this on and we'll send personalized daily task reminders directly to your inbox so you never miss a training milestone. 📈</p>
                )}
              </motion.div>

              {/* Roadmap Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Map className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold">Guided Roadmap</h3>
                  </div>
                  {recommendation && (
                    <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Progress</p>
                        <p className="text-sm font-bold text-slate-900">
                          {Math.round(
                            (Object.values(completedMilestones).filter(Boolean).length / 
                            recommendation.roadmap.reduce((acc, p) => acc + p.milestones.length, 0)) * 100
                          )}% Complete
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
                        <svg className="w-full h-full transform -rotate-90 absolute">
                          <circle 
                            cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 * (1 - (Object.values(completedMilestones).filter(Boolean).length / recommendation.roadmap.reduce((acc, p) => acc + p.milestones.length, 0)))}
                            className="text-emerald-500 transition-all duration-500" 
                          />
                        </svg>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                  {recommendation.roadmap.map((item, i) => {
                    const accessible = isPhaseAccessible(i);
                    const completed = isPhaseCompleted(i, item.milestones);
                    const progress = getPhaseProgress(i, item.milestones);

                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "relative pl-14 transition-all duration-500",
                          !accessible && "opacity-50 grayscale pointer-events-none"
                        )}
                      >
                        {/* Phase Indicator */}
                        <div className={cn(
                          "absolute left-0 top-1 w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-md border-4 transition-colors duration-500",
                          completed ? "bg-emerald-500 border-emerald-100 text-white" :
                          accessible ? "bg-white border-blue-100 text-blue-600" :
                          "bg-slate-100 border-slate-50 text-slate-400"
                        )}>
                          {completed ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{i + 1}</span>}
                        </div>

                        {/* Phase Card */}
                        <div className={cn(
                          "bg-white p-6 rounded-3xl border transition-all duration-300 space-y-4",
                          completed ? "border-emerald-200 shadow-emerald-500/5 shadow-xl" :
                          accessible ? "border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/20" :
                          "border-slate-200"
                        )}>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                {item.phase}
                                {completed && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Verified</span>}
                              </h4>
                              <p className="text-slate-500 text-xs">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phase Progress</span>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className={cn("h-full rounded-full", completed ? "bg-emerald-500" : "bg-blue-600")}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {item.milestones.map((m, j) => {
                              const isDone = completedMilestones[`${i}-${j}`];
                              return (
                                <button 
                                  key={j} 
                                  onClick={() => toggleMilestone(i, j)}
                                  className={cn(
                                    "flex items-start gap-3 p-3 rounded-2xl border text-left transition-all group",
                                    isDone 
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                      : "bg-white border-slate-100 text-slate-600 hover:border-blue-400 hover:shadow-sm"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5",
                                    isDone ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300 group-hover:border-blue-500"
                                  )}>
                                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className={cn("text-xs font-medium leading-tight", isDone && "line-through opacity-70")}>
                                    {m}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Assistant Call to action */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative pl-14 pt-4"
                  >
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Need a detailed daily schedule?</p>
                          <p className="text-slate-500 text-xs mt-1 leading-relaxed">I can break down Phase 1 into a granular weekly study plan for you.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          // We'll trust the user will see the assistant open
                          const assistantBtn = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
                          if (assistantBtn) assistantBtn.click();
                        }}
                        className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all whitespace-nowrap"
                      >
                        Generate Detailed Plan
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Strategy Card */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="flex items-center gap-2 relative z-10">
                  <Target className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold">Off-Campus Strategy</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none relative z-10">
                  <ReactMarkdown>{recommendation.offCampusStrategy}</ReactMarkdown>
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-2xl font-bold">Curated Resources</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendation.resources.map((resource, i) => (
                    <a 
                      key={i}
                      href={resource.link || "#"}
                      target="_blank"
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-emerald-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {resource.type === 'course' ? <BookOpen className="w-5 h-5" /> : 
                           resource.type === 'article' ? <Briefcase className="w-5 h-5" /> :
                           resource.type === 'project' ? <Target className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">{resource.title}</h5>
                          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400 pt-0.5">
                            <span>{resource.type}</span>
                            <span>•</span>
                            <span className={resource.isFree ? "text-emerald-500" : "text-amber-500"}>{resource.isFree ? "FREE" : "PAID"}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setStep('intro')}
                  className="px-8 py-3 rounded-full border border-slate-200 font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Retake Assessment
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-200 mt-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
            <Compass className="w-5 h-5" />
            <span className="text-lg font-bold tracking-tight">PathFinder AI</span>
          </div>
          <p className="text-sm text-slate-500">Helping students from all backgrounds find their true potential.</p>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Persistent AI Assistant */}
      <AIChatAssistant profile={profile} recommendation={recommendation} />

      {/* MERN Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 relative space-y-6 text-slate-900 dark:text-white"
          >
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5 bg-transparent" />
            </button>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {authMode === 'login' && 'Welcome Back'}
                {authMode === 'register' && 'Create Account'}
                {authMode === 'forgot_request' && 'Recover Help'}
                {authMode === 'forgot_reset' && 'Reset Password'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {authMode === 'login' && 'Sign in to sync your personalized roadmaps'}
                {authMode === 'register' && 'Save your AI mentor history to the cloud database'}
                {authMode === 'forgot_request' && 'Enter your registered email to simulate dynamic PIN reset'}
                {authMode === 'forgot_reset' && 'Enter the simulated PIN "123456" paired with your new password'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-900/40 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold leading-normal">
                  {authError}
                </div>
              )}

              {forgotSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold leading-normal animate-pulse">
                  {forgotSuccessMessage}
                </div>
              )}

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-950 dark:text-slate-300 uppercase tracking-widest block font-sans">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-xs font-semibold dark:bg-slate-950 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-950 dark:text-slate-300 uppercase tracking-widest block font-sans">Email Address</label>
                <input 
                  type="email" 
                  required
                  disabled={authMode === 'forgot_reset'}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-xs font-semibold dark:bg-slate-955 dark:text-white disabled:opacity-60"
                  placeholder="student@college.edu"
                />
              </div>

              {authMode === 'forgot_reset' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-950 dark:text-slate-300 uppercase tracking-widest block font-sans">Verification OTP PIN</label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      value={forgotPin}
                      onChange={(e) => setForgotPin(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-xs font-bold dark:bg-slate-950 dark:text-white placeholder:font-normal"
                      placeholder="Enter 123456"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-950 dark:text-slate-300 uppercase tracking-widest block font-sans">New Password</label>
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-xs font-semibold dark:bg-slate-950 dark:text-white"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </>
              )}

              {(authMode === 'login' || authMode === 'register') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-950 dark:text-slate-300 uppercase tracking-widest block font-sans">Password</label>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot_request');
                          setAuthError(null);
                          setForgotSuccessMessage(null);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-500 hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-hidden transition-all text-xs font-semibold dark:bg-slate-950 dark:text-white"
                    placeholder="Password"
                  />
                </div>
              )}

              <button 
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {authMode === 'login' && 'Sign In Securely'}
                {authMode === 'register' && 'Register Account'}
                {authMode === 'forgot_request' && 'Request Reset PIN'}
                {authMode === 'forgot_reset' && 'Update Password'}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-semibold pt-2">
              {authMode === 'login' && (
                <p>Don't have an account? <button onClick={() => { setAuthMode('register'); setAuthError(null); }} className="text-blue-600 hover:underline cursor-pointer border-0 bg-transparent font-bold">Register here</button></p>
              )}
              {authMode === 'register' && (
                <p>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError(null); }} className="text-blue-600 hover:underline cursor-pointer border-0 bg-transparent font-bold">Sign in here</button></p>
              )}
              {(authMode === 'forgot_request' || authMode === 'forgot_reset') && (
                <p>Remembered your password? <button onClick={() => { setAuthMode('login'); setAuthError(null); setForgotSuccessMessage(null); }} className="text-blue-600 hover:underline cursor-pointer border-0 bg-transparent font-bold">Back to Sign In</button></p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Dynamic Celebration Success Popup */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 p-5 rounded-2xl bg-white border border-emerald-100 shadow-2xl flex items-center gap-4 max-w-sm overflow-hidden"
          >
            {/* Ambient gold star animation background */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 select-none animate-bounce text-xl">
              🎉
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Objective Unlocked!</span>
              <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                {celebratedMilestone}
              </p>
            </div>
            <button 
              onClick={() => setShowCelebration(false)}
              className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 text-xs hover:text-slate-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Architecture Blueprint & Admin Panel Modal */}
      <SystemBlueprintModal
        showDevHub={showDevHub}
        setShowDevHub={setShowDevHub}
        devHubData={devHubData}
        devHubLoading={devHubLoading}
        fetchDevHubData={fetchDevHubData}
      />
      {/* Legacy Internal Blueprint Modal - Deactivated and Wrapped */}
      {false && (
        <>
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative space-y-6 text-slate-900 dark:text-white my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowDevHub(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-amber-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Close Panel"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">System Blueprint & Database Panel</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Understand exactly which files and directories play the role of the <strong>Frontend (MERN interface)</strong>, the <strong>Backend (Express API Server)</strong>, and the <strong>Database/Admin storage environment</strong>.
                </p>
              </div>

              {/* Architecture Map Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. FRONTEND BLOCK */}
                <div className="p-5 rounded-2xl border border-blue-100 dark:border-blue-950/40 bg-blue-50/30 dark:bg-blue-950/5 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Layout className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">1. FRONTEND (Client UI)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                    This is what you see in the browser. It compiles React code, maintains immediate page states, handles styling via Tailwind CSS, and uses Lucide for beautiful icons.
                  </p>
                  
                  <div className="text-[11px] font-mono space-y-2 pt-1">
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-emerald-500 font-bold font-sans">📄 /src/App.tsx</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Hosts the user assessment workflows, custom dark theme setups, roadmap milestones, and visual components.</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-emerald-500 font-bold font-sans">📄 /src/index.css</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Compiles active Tailwind utility properties and implements custom brand themes.</p>
                    </div>
                  </div>
                  <span className="inline-block text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider">
                    Runs in: User's Browser
                  </span>
                </div>

                {/* 2. BACKEND BLOCK */}
                <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/30 dark:bg-indigo-950/5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Server className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">2. BACKEND (Express Server)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                    A secure Node.js process. It runs on the server, exposes REST APIs, validates authentication requests, and safely proxies calls to Gemini AI without leaking API keys.
                  </p>
                  
                  <div className="text-[11px] font-mono space-y-2 pt-1">
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-indigo-500 font-bold font-sans">📄 /server.ts</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Begins Express server at port 3000. Houses authentication controller, chat systems, and profiles.</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-indigo-500 font-bold font-sans">📄 /server/auth.ts</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Generates JWT security credentials and implements user session middleware.</p>
                    </div>
                  </div>
                  <span className="inline-block text-[10px] bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider">
                    Runs on: Cloud Run (NodeJS)
                  </span>
                </div>

                {/* 3. DATABASE / ADMIN BLOCK */}
                <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/30 dark:bg-emerald-950/5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Database className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-widest">3. STORAGE / DB (State)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-sans font-medium">
                    Ensures records generated by students (e.g., profiles, roadmaps, goals) are persisted securely across server reboots.
                  </p>
                  
                  <div className="text-[11px] font-mono space-y-2 pt-1">
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-emerald-600 font-bold font-sans">📄 /server/db.ts</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Handles schema modeling. Automatically fails over to beautiful local file backup system databases if MongoDB link is absent.</p>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-955 rounded-lg border border-slate-100 dark:border-slate-800/60">
                      <span className="text-emerald-600 font-bold font-sans">📁 /data/</span>
                      <p className="text-[10px] text-slate-400 pt-0.5 font-sans leading-tight">Local folder holding physical JSON document structure backups.</p>
                    </div>
                  </div>
                  <span className="inline-block text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black px-2 mt-2 py-1 rounded-md uppercase tracking-wider">
                    Data Mode: JSON file storage / Mongo
                  </span>
                </div>

              </div>

              {/* LIVE ADMIN PANEL / DATA VIEWER */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-105 flex items-center gap-1.5 uppercase tracking-wide">
                      🛡️ Real-Time Admin Console Statistics
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Live query analytics aggregated straight from the backend database models.</p>
                  </div>
                  
                  <button
                    onClick={fetchDevHubData}
                    disabled={devHubLoading}
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    {devHubLoading ? <Loader2 className="w-3 px-1 animate-spin" /> : "Refresh Analytics"}
                  </button>
                </div>

                {devHubLoading ? (
                  <div className="p-12 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-wider">Fetching live database stats...</p>
                  </div>
                ) : devHubData ? (
                  <div className="space-y-4">
                    {/* Database metadata badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Storage System</span>
                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">{devHubData.storageType}</span>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Registered Students</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{devHubData.users?.length || 0} Accounts</span>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Roadmaps Saved</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{devHubData.totalRecommendations || 0} Generated</span>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/25 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block">Server Health</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">Active - {devHubData.serverUptimeHours || "0.00"} Hrs</span>
                      </div>
                    </div>

                    {/* Active Registered Users Table inside DB */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/10">
                      <div className="px-5 py-3 bg-slate-150 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          👤 Registered Students in Database
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold">
                          Total database entries: {devHubData.users?.length || 0}
                        </span>
                      </div>
                      
                      <div className="p-2 max-h-[180px] overflow-y-auto space-y-1.5 font-sans">
                        {devHubData.users && devHubData.users.length > 0 ? (
                          devHubData.users.map((u: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-755 transition-all text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">{u.name}</span>
                                  <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">({u.email})</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-1 sm:mt-0 italic font-mono uppercase bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-800/50">
                                DB_ENTRY_VERIFIED
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No registered accounts inside the database storage yet. Sign up using the register button in the navigation bar!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Unable to retrieve system diagnostic data.</p>
                )}
              </div>

              {/* Close Button at bottom */}
              <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
                <button
                  onClick={() => setShowDevHub(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors shadow-lg shadow-blue-500/15"
                >
                  Awesome, I Understand!
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

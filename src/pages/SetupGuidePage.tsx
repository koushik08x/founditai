import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { isFirebaseConfigured, FIREBASE_CONFIG_HELP } from '../config/firebase';
import {
  isGeminiConfigured,
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey
} from '../services/geminiService';
import { reportsService } from '../services/reportsService';
import { useToast } from '../context/ToastContext';
import {
  Database,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Sparkles,
  Server,
  Cloud,
  Bot,
  Trash2
} from 'lucide-react';

export const SetupGuidePage: React.FC = () => {
  const { showToast } = useToast();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [geminiInput, setGeminiInput] = useState(getGeminiApiKey());
  const [hasGemini, setHasGemini] = useState(isGeminiConfigured());

  const isLive = isFirebaseConfigured();

  const envSample = `# ========================================================
# FoundIt AI — 100% Google Stack Environment Configuration
# ========================================================

# 1. Google Firebase Configuration (Firebase Console -> Project Settings)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-google-cloud-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# 2. Google Gemini API Key (Google AI Studio: https://aistudio.google.com)
VITE_GEMINI_API_KEY=your-gemini-api-key
`;

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /item_reports/{reportId} {
      allow read: if resource.data.status == 'active' 
                  || (request.auth != null && resource.data.reporter_id == request.auth.uid);
      allow create: if request.resource.data.item_name is string
                    && request.resource.data.report_type in ['lost', 'found'];
      allow update, delete: if request.auth != null 
                            && resource.data.reporter_id == request.auth.uid;
    }
  }
}`;

  const copyToClipboard = (text: string, type: 'env' | 'rules') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    }
    showToast('Copied to clipboard!', 'success');
  };

  const handleRunSeeder = async () => {
    try {
      setIsSeeding(true);
      await reportsService.seedDemoData();
      showToast('Loaded standard 6 hackathon reports successfully!', 'success');
    } catch (err: any) {
      showToast(`Seeder error: ${err.message}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Cloud className="w-3.5 h-3.5" />
          <span>100% Google Cloud & Google AI Tools Stack</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Google Cloud & Firebase Setup Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your Google Cloud Firestore, Firebase Storage, and Google Gemini 2.5 Flash configurations.
        </p>
      </div>

      {/* Live Status Card */}
      <Card className="p-6 border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isLive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google Firestore Status</h3>
                <Badge variant={isLive ? 'success' : 'primary'} size="md">
                  {isLive ? 'Connected (Live Google Firestore)' : 'Interactive Demo Mode (In-Memory)'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLive
                  ? `Active connection to project: ${FIREBASE_CONFIG_HELP.projectId}`
                  : 'Running with local reactive data cache + official campus test reports'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunSeeder}
            isLoading={isSeeding}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
          >
            Load 6 Hackathon Seed Items
          </Button>
        </div>

        {/* Diagnostics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="font-semibold text-slate-700 block mb-1">Google Project ID</span>
            <code className="text-slate-600 text-[11px]">{FIREBASE_CONFIG_HELP.projectId}</code>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">Google Gemini API</span>
              <span className="text-[11px] text-slate-500">
                {hasGemini ? 'Configured (Gemini 2.5 Flash active)' : 'Unset (Using rule-based deterministic matching)'}
              </span>
            </div>
            <Badge variant={hasGemini ? 'success' : 'default'} size="sm">
              {hasGemini ? 'AI Active' : 'Rule-Based'}
            </Badge>
          </div>
        </div>

        {/* Live Gemini Key Quick-Setup */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>Interactive Google Gemini 2.5 Flash Key Switcher</span>
          </div>
          <p className="text-slate-500 text-[11px] mb-3 leading-relaxed">
            For hackathon evaluation or testing, you can dynamically configure your Gemini API key right here in the browser session without restarting the server:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="Paste Google AI Studio API key (AIzaSy...)"
              value={geminiInput}
              onChange={(e) => setGeminiInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (geminiInput.trim()) {
                  setGeminiApiKey(geminiInput.trim());
                  setHasGemini(true);
                  showToast('Google Gemini API Key activated for this browser session!', 'success');
                }
              }}
              disabled={!geminiInput.trim()}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Activate Gemini Key
            </Button>
            {hasGemini && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  clearGeminiApiKey();
                  setGeminiInput('');
                  setHasGemini(false);
                  showToast('Gemini API Key removed. Fallback rule-based matching active.', 'info');
                }}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              >
                Clear Key
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Step 1: Environment Variables */}
      <Card className="p-6 border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Step 1: Environment Variables</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(envSample, 'env')}
            leftIcon={copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedEnv ? 'Copied!' : 'Copy .env'}
          </Button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Create a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">.env</code> file in the project root with your Google Firebase configuration and Google Gemini API key:
        </p>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs overflow-x-auto font-mono">
          {envSample}
        </pre>
      </Card>

      {/* Step 2: Firestore Rules */}
      <Card className="p-6 border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Step 2: Google Cloud Firestore Security Rules</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(firestoreRulesSample, 'rules')}
            leftIcon={copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedRules ? 'Copied' : 'Copy Rules'}
          </Button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Deploy <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold">firestore.rules</code> to enforce document ownership:
        </p>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs overflow-x-auto font-mono">
          {firestoreRulesSample}
        </pre>
      </Card>

      {/* Architecture */}
      <Card className="p-6 border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Google Tools Stack Overview</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Google Cloud Firestore</h4>
            <p className="text-slate-600">
              NoSQL real-time document database with queries, indexing, and declarative security rules.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Google Cloud Storage</h4>
            <p className="text-slate-600">
              Stores item photos up to 5MB with automated mime-type validation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Google Gemini API</h4>
            <p className="text-slate-600">
              Powers semantic comparison for complex item descriptions with transparent fallback.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

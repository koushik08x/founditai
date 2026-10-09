import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ItemMatch } from '../../types';
import { Card } from '../common/Card';
import { MatchScorePill } from '../common/MatchScorePill';
import { Badge } from '../common/Badge';
import {
  analyzeMatchWithGemini,
  isGeminiConfigured,
  setGeminiApiKey,
  GeminiSemanticResult
} from '../../services/geminiService';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Bot,
  Key,
  Info
} from 'lucide-react';

export const MatchExplanationCard: React.FC<{ match: ItemMatch }> = ({ match }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiSemanticResult | null>(null);
  const [isAnalyzingGemini, setIsAnalyzingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');

  const { lost_report: lost, found_report: found, score, explanation } = match;

  const handleRunGemini = async (overrideKey?: string) => {
    if (!lost || !found) return;
    const keyToUse = overrideKey || inputApiKey;
    if (keyToUse) {
      setGeminiApiKey(keyToUse);
    }

    if (!isGeminiConfigured() && !keyToUse) {
      setShowKeyInput(true);
      return;
    }

    setIsAnalyzingGemini(true);
    setGeminiError(null);
    try {
      const res = await analyzeMatchWithGemini(lost, found, keyToUse || undefined);
      if (res) {
        setGeminiResult(res);
        setShowKeyInput(false);
      } else {
        setGeminiError('Gemini API returned no result. Please verify your API key or network.');
      }
    } catch (err: any) {
      setGeminiError(err.message || 'Gemini inference failed.');
    } finally {
      setIsAnalyzingGemini(false);
    }
  };

  if (!lost || !found) return null;

  return (
    <Card className="overflow-hidden border-slate-200/90 shadow-xs hover:shadow-md transition-shadow mb-4">
      {/* Top Header Banner with Score & Disclaimer Warning */}
      <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MatchScorePill score={score} size="md" />
          <span className="text-xs font-medium text-slate-500">
            Method: <strong className="text-slate-700">{match.matching_method === 'rule-based' ? 'Rule-based heuristic' : 'AI semantic matching'}</strong>
          </span>
        </div>

        {/* Warning Callout as required by Section 1 & 4E */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Possible match — verify the item before claiming it.</span>
        </div>
      </div>

      <div className="p-5">
        {/* Comparison grid: Lost Report on Left vs Found Report on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
          {/* Lost Item Card */}
          <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="lost" size="sm">
                  LOST REPORT
                </Badge>
                <span className="text-[11px] text-slate-500">{lost.event_date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{lost.item_name}</h4>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{lost.description}</p>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{lost.campus_location}</span>
                </div>
                {lost.color && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-600">Color:</span> {lost.color}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-amber-200/50 flex justify-end">
              <Link
                to={`/reports/${lost.id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View Full Lost Report</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Found Item Card */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="found" size="sm">
                  FOUND REPORT
                </Badge>
                <span className="text-[11px] text-slate-500">{found.event_date}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{found.item_name}</h4>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{found.description}</p>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{found.campus_location}</span>
                </div>
                {found.color && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-600">Color:</span> {found.color}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-blue-200/50 flex justify-end">
              <Link
                to={`/reports/${found.id}`}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                <span>View Full Found Report</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Attribute Overlap Section */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Shared attributes (Green) */}
            {explanation.sharedAttributes.map((attr, idx) => (
              <span
                key={`shared-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{attr}</span>
              </span>
            ))}

            {/* Conflicting attributes (Rose) */}
            {explanation.conflictingAttributes.map((attr, idx) => (
              <span
                key={`conflict-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{attr}</span>
              </span>
            ))}

            {/* Uncertain attributes (Amber/slate) */}
            {explanation.uncertainAttributes.map((attr, idx) => (
              <span
                key={`uncertain-${idx}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{attr}</span>
              </span>
            ))}
          </div>

          {/* Explanation Summary */}
          <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{explanation.summary}"
          </p>

          {/* Expandable Transparent Weight Breakdown Button */}
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 pt-1 cursor-pointer"
          >
            <span>{showBreakdown ? 'Hide scoring breakdown' : 'Show mathematical scoring breakdown'}</span>
            {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expanded Scoring Breakdown Bars */}
          {showBreakdown && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
              <p className="font-semibold text-slate-800">
                Transparent Weights Breakdown (0 – 100 points):
              </p>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Name & Category Match (Max 30 pts)</span>
                  <span className="font-bold text-slate-900">{explanation.breakdown.nameAndCategoryScore} / 30</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(explanation.breakdown.nameAndCategoryScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Description & Details Similarity (Max 25 pts)</span>
                  <span className="font-bold text-slate-900">{explanation.breakdown.descriptionScore} / 25</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(explanation.breakdown.descriptionScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Color Consistency (Max 15 pts)</span>
                  <span className="font-bold text-slate-900">{explanation.breakdown.colorScore} / 15</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(explanation.breakdown.colorScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Campus Location Proximity (Max 20 pts)</span>
                  <span className="font-bold text-slate-900">{explanation.breakdown.locationScore} / 20</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(explanation.breakdown.locationScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Date Timeline Proximity (Max 10 pts)</span>
                  <span className="font-bold text-slate-900">{explanation.breakdown.dateScore} / 10</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(explanation.breakdown.dateScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Google Gemini 2.5 Flash Semantic Verification Section */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {!geminiResult && !isAnalyzingGemini && !showKeyInput && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Google Gemini 2.5 Flash Semantic Analysis
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Verify subtle descriptions, synonyms, and distinctive marks using Google's frontier LLM.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunGemini()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Run Gemini Analysis</span>
                </button>
              </div>
            )}

            {/* Prompt for Gemini API Key if not configured */}
            {showKeyInput && !isAnalyzingGemini && (
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <Key className="w-4 h-4 text-blue-700" />
                  <span>Configure Google Gemini API Key</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  To run live Gemini 2.5 Flash inference directly in your browser, enter your free Gemini API key from{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    Google AI Studio
                  </a>
                  . This key is stored securely in your browser's local session.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunGemini(inputApiKey)}
                    disabled={!inputApiKey.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Save & Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(false)}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isAnalyzingGemini && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-center gap-2.5 text-xs text-blue-800">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="font-medium">
                  Querying Google Gemini 2.5 Flash for semantic comparison...
                </span>
              </div>
            )}

            {/* Error display */}
            {geminiError && (
              <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
                <span>{geminiError}</span>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(true)}
                  className="underline font-semibold shrink-0 cursor-pointer"
                >
                  Change Key
                </button>
              </div>
            )}

            {/* Gemini Result Card */}
            {geminiResult && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white border border-indigo-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Google Gemini 2.5 Flash Semantic Assessment
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      {geminiResult.semanticScore}% Semantic Probability
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRunGemini()}
                      className="text-[11px] text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                    >
                      Re-run
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic bg-white/80 p-2.5 rounded-lg border border-indigo-100/80">
                  "{geminiResult.aiExplanation}"
                </p>

                {geminiResult.identifiedSimilarities.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                      Gemini Identified Similarities:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {geminiResult.identifiedSimilarities.map((item, idx) => (
                        <li key={idx} className="text-emerald-900">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {geminiResult.identifiedDifferences.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 block mb-1">
                      Gemini Identified Nuances / Discrepancies:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {geminiResult.identifiedDifferences.map((item, idx) => (
                        <li key={idx} className="text-amber-900">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-indigo-100/60 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Info className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>
                    Model: <strong>gemini-2.5-flash</strong> via official @google/genai SDK. Rule-based heuristic score above remains the primary transparent baseline.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

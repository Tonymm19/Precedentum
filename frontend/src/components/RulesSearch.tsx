import React, { useMemo, useState } from 'react';
import { Search, Book, ExternalLink, Star, AlertCircle } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Rule } from '../types';

interface RuleSearchResult {
  id: string;
  citation: string;
  jurisdiction: string;
  summary: string;
  sourceType: Rule['source_type'];
  version: string;
  url: string;
  effectiveDate: string | null;
}

const SOURCE_LABEL: Record<Rule['source_type'], string> = {
  FRCP: 'Federal Rule',
  LocalRule: 'Local Rule',
  JudgeProcedure: 'Judge-Specific Procedure',
  ECFManual: 'ECF Manual',
  StandingOrder: 'Standing Order',
};

const RulesSearch: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { rules, isLoading, error } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<'all' | Rule['source_type']>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  const availableSources = useMemo(() => {
    const unique = Array.from(new Set(rules.map((rule) => rule.source_type)));
    return ['all', ...unique] as Array<'all' | Rule['source_type']>;
  }, [rules]);

  const availableJurisdictions = useMemo(() => {
    const unique = Array.from(new Set(rules.map((rule) => rule.jurisdiction).filter(Boolean)));
    return ['all', ...unique];
  }, [rules]);

  const filteredResults: RuleSearchResult[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return rules
      .filter((rule) => (selectedSource === 'all' ? true : rule.source_type === selectedSource))
      .filter((rule) => (selectedJurisdiction === 'all' ? true : rule.jurisdiction === selectedJurisdiction))
      .filter((rule) => {
        if (!query) return true;
        return (
          rule.citation.toLowerCase().includes(query) ||
          rule.text.toLowerCase().includes(query) ||
          (rule.version ?? '').toLowerCase().includes(query)
        );
      })
      .map((rule) => ({
        id: rule.id,
        citation: rule.citation || 'Untitled Rule',
        jurisdiction: rule.jurisdiction,
        summary: rule.text.slice(0, 240),
        sourceType: rule.source_type,
        version: rule.version,
        url: rule.url,
        effectiveDate: rule.effective_date,
      }));
  }, [rules, selectedSource, selectedJurisdiction, searchQuery]);

  const getSourceBadgeColor = (source: Rule['source_type']) => {
    switch (source) {
      case 'FRCP':
        return 'bg-blue-100 text-blue-800';
      case 'LocalRule':
        return 'bg-purple-100 text-purple-800';
      case 'JudgeProcedure':
        return 'bg-indigo-100 text-indigo-800';
      case 'ECFManual':
        return 'bg-amber-100 text-amber-800';
      case 'StandingOrder':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rules & Research</h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Search federal rules, local rules, and judge-specific requirements
        </p>
        {error && (
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        )}
      </div>

      <div className={`rounded-xl shadow-sm border p-6 mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="space-y-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search rules, procedures, requirements..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(event) => setSelectedSource(event.target.value as typeof selectedSource)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableSources.map((source) => (
                  <option key={source} value={source}>
                    {source === 'all' ? 'All sources' : SOURCE_LABEL[source] ?? source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Jurisdiction
              </label>
              <select
                value={selectedJurisdiction}
                onChange={(event) => setSelectedJurisdiction(event.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {availableJurisdictions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All jurisdictions' : option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <div className={`w-full px-3 py-2 text-sm rounded-lg border ${
                isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                {filteredResults.length} matches
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-xl shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Search Results</h2>
            {isLoading && <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Syncing rules…</span>}
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center">
            <Book className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No rules found
            </p>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Try broadening your search or adjusting filters.
            </p>
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {filteredResults.map((result) => (
              <div key={result.id} className={`p-6 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {result.citation}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeColor(
                          result.sourceType,
                        )}`}
                      >
                        {SOURCE_LABEL[result.sourceType]}
                      </span>
                      {result.effectiveDate && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Effective {new Date(result.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {result.summary}
                      {result.summary.length >= 240 && '…'}
                    </p>
                    <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {result.jurisdiction && <span>Jurisdiction: {result.jurisdiction}</span>}
                      {result.version && <span>Version: {result.version}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Source</span>
                    </a>
                    <button
                      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-500'}`} />
                      <span>Save to Case</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`rounded-xl p-6 mt-8 border ${
        isDarkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
            <AlertCircle className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              AI-Powered Legal Assistant
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
              Natural language question answering, multi-rule comparisons, and citation summarization are in development. Today you can browse the structured rule database above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesSearch;

import React, { useState } from 'react';
import { Search, Filter, Book, ExternalLink, Star, AlertCircle } from 'lucide-react';
import { rules, judges } from '../data/mockData';
import { SearchResult, Rule } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const RulesSearch: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJudge, setSelectedJudge] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['all', 'Federal', 'District', 'Judge-Specific'];

  const performSearch = async () => {
    setIsSearching(true);
    
    // Simulate API search with loading delay
    setTimeout(() => {
      let filteredRules = rules;

      if (searchQuery) {
        filteredRules = filteredRules.filter(rule =>
          rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rule.number.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedCategory !== 'all') {
        filteredRules = filteredRules.filter(rule => rule.category === selectedCategory);
      }

      if (selectedJudge !== 'all') {
        filteredRules = filteredRules.filter(rule => rule.judgeId === selectedJudge);
      }

      // Convert to search results with mock relevance scores
      const results: SearchResult[] = filteredRules.map(rule => ({
        id: rule.id,
        title: rule.title,
        content: rule.content,
        relevanceScore: Math.random() * 100,
        confidence: Math.random() > 0.3 ? 'High' : Math.random() > 0.6 ? 'Medium' : 'Low',
        source: rule.category,
        category: rule.category,
        url: rule.url
      }));

      // Sort by relevance
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Federal': return 'bg-blue-100 text-blue-800';
      case 'District': return 'bg-purple-100 text-purple-800';
      case 'Judge-Specific': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Rules & Research
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Search federal rules, local rules, and judge-specific requirements
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className={`rounded-xl shadow-sm border p-6 mb-8 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-6">
          {/* Main Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search rules, procedures, requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Rule Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Judge
              </label>
              <select
                value={selectedJudge}
                onChange={(e) => setSelectedJudge(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Judges</option>
                {judges.map(judge => (
                  <option key={judge.id} value={judge.id}>
                    {judge.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Rules'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* AI Assistant Preview */}
      <div className={`rounded-xl p-6 mb-8 border ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-lg ${
            isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
          }`}>
            <AlertCircle className={`h-6 w-6 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              AI-Powered Legal Assistant
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Try natural language queries like "What are Judge Williams' motion filing requirements?" 
              or "Discovery deadline rules for IP cases"
            </p>
            <div className="flex flex-wrap gap-2">
              <button className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-blue-400 border-blue-600 hover:bg-gray-700' 
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}>
                Motion practice rules
              </button>
              <button className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-blue-400 border-blue-600 hover:bg-gray-700' 
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}>
                Discovery deadlines
              </button>
              <button className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-blue-400 border-blue-600 hover:bg-gray-700' 
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}>
                Judge preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Search Results ({searchResults.length})
            </h2>
            <div className="flex items-center space-x-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className={`text-sm rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}>
                <option>Sort by Relevance</option>
                <option>Sort by Date</option>
                <option>Sort by Source</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {searchResults.map((result) => (
              <div key={result.id} className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {result.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getConfidenceColor(result.confidence)
                      }`}>
                        {result.confidence} Confidence
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getCategoryColor(result.category)
                      }`}>
                        {result.category}
                      </span>
                    </div>
                    <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {result.content}
                    </p>
                  </div>
                  <button className="ml-4 p-2 text-gray-400 hover:text-gray-600">
                    <Star className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className={`flex items-center space-x-4 text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <Book className="h-4 w-4" />
                      <span>{result.source}</span>
                    </div>
                    <span>•</span>
                    <span>Relevance: {result.relevanceScore.toFixed(0)}%</span>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-2 ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    <span className="text-sm font-medium">View Source</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Rules */}
      {searchResults.length === 0 && (
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.slice(0, 6).map((rule) => (
              <div key={rule.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {rule.number}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getCategoryColor(rule.category)
                  }`}>
                    {rule.category}
                  </span>
                </div>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {rule.title}
                </h3>
                <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {rule.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesSearch;
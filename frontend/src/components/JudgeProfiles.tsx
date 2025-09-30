import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Scale, ExternalLink, AlertCircle } from 'lucide-react';
import { judges } from '../data/mockData';
import { Judge } from '../types';

export default function JudgeProfiles() {
  const { isDarkMode } = useTheme();
  const [judgeList, setJudgeList] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load judges from mock data
    setTimeout(() => {
      setJudgeList(judges);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="text-center py-12">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading judges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Judge Profiles
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          View judge preferences, standing orders, and procedural requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {judgeList.map((judge) => (
          <div
            key={judge.id}
            className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <h3 className={`text-xl font-semibold mb-1 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {judge.name}
            </h3>
            
            <p className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {judge.chamber}
            </p>

            <div className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>{judge.district}</p>
              <p className="mt-2">
                Motion Deadline: {judge.preferences.motionDeadline} days
              </p>
              <p>Page Limit: {judge.preferences.pageLimit} pages</p>
            </div>

            <div className="space-y-2">
              <p className={`text-xs font-semibold uppercase ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Standing Orders:
              </p>
              {judge.standingOrders.slice(0, 2).map((order, idx) => (
                <p key={idx} className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  • {order}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {judgeList.length === 0 && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No judges found. Add judges through the Django admin panel.
          </p>
        </div>
      )}
    </div>
  );
}
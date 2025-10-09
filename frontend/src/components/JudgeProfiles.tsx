import { Scale, Mail, Phone, MapPin, AlertCircle } from '../lucide-stub';

import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

export default function JudgeProfiles() {
  const { isDarkMode } = useTheme();
  const { judges, isLoading, error } = useData();

  return (
    <div className={`p-6 max-w-7xl mx-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Judge Profiles</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          View judge contact details, court assignments, and holiday calendars
        </p>
        {error && (
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading judges…</p>
        </div>
      )}

      {!isLoading && judges.length === 0 && (
        <div className={`rounded-xl shadow-sm border p-8 text-center ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            No judges found. Add judge records in the Django admin to populate this list.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {judges.map((judge) => (
          <div
            key={judge.id}
            className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Scale className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <h3 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {judge.full_name}
            </h3>

            <p className={`flex items-center text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <MapPin className="h-4 w-4 mr-2" />
              {judge.court_name ?? 'Unassigned court'}
            </p>

            <dl className="space-y-2 text-sm">
              {judge.courtroom && (
                <div>
                  <dt className={`text-xs uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Courtroom</dt>
                  <dd className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{judge.courtroom}</dd>
                </div>
              )}
              {judge.holiday_calendar_name && (
                <div>
                  <dt className={`text-xs uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Holiday Calendar
                  </dt>
                  <dd className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{judge.holiday_calendar_name}</dd>
                </div>
              )}
              {judge.contact_email && (
                <div className="flex items-center space-x-2">
                  <Mail className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <a
                    href={`mailto:${judge.contact_email}`}
                    className={isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}
                  >
                    {judge.contact_email}
                  </a>
                </div>
              )}
              {judge.contact_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{judge.contact_phone}</span>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

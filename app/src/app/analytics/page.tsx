'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { FiArrowUp, FiArrowDown, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

export default function AnalyticsPage() {
  // Mock data for analytics page
  const metrics = [
    { name: 'Page Views', current: 12045, previous: 10532, change: 14.4, up: true },
    { name: 'Unique Visitors', current: 3728, previous: 3215, change: 16.0, up: true },
    { name: 'Session Duration', current: '2:45', previous: '3:12', change: -14.1, up: false },
    { name: 'Bounce Rate', current: '42%', previous: '45%', change: 6.7, up: true },
  ]

  const topPages = [
    { path: '/home', views: 3245, unique: 2456 },
    { path: '/features', views: 2145, unique: 1654 },
    { path: '/pricing', views: 1856, unique: 1456 },
    { path: '/blog/getting-started', views: 1432, unique: 1023 },
    { path: '/contact', views: 1245, unique: 987 },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track and analyze your application usage metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.name}
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.current}
            </p>
            <div className="mt-2 flex items-center">
              <span className={`mr-2 ${metric.up ? 'text-green-500' : 'text-red-500'}`}>
                {metric.up ? <FiArrowUp /> : <FiArrowDown />}
              </span>
              <span className={`text-sm font-medium ${metric.up ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs. previous period
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Usage Over Time
          </h2>
          {/* This would be a chart in a real app */}
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">
              Chart visualization would be here
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Top Pages
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Unique
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topPages.map((page, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {page.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {page.unique.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              System Status
            </h2>
            <div className="space-y-4">
              {[
                { name: 'API Status', status: 'Healthy', isOk: true },
                { name: 'Database', status: 'Healthy', isOk: true },
                { name: 'Authentication', status: 'Healthy', isOk: true },
                { name: 'Storage', status: 'Degraded', isOk: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  <div className="flex items-center">
                    {item.isOk ? (
                      <FiCheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <FiAlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={`ml-2 text-sm font-medium ${
                      item.isOk ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
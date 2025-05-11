'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { FiUsers, FiActivity, FiBarChart, FiCalendar } from 'react-icons/fi'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  const stats = [
    { name: 'Total Visitors', value: '12,345', icon: FiUsers, change: '+12%', up: true },
    { name: 'Active Users', value: '9,876', icon: FiActivity, change: '+7.5%', up: true },
    { name: 'Conversion Rate', value: '5.23%', icon: FiBarChart, change: '-0.5%', up: false },
    { name: 'Avg. Session', value: '3m 45s', icon: FiCalendar, change: '+1.2%', up: true },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className={`mt-4 text-sm ${
              stat.up 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
              }`}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FiActivity className="text-primary h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Event #{i}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {i} {i === 1 ? 'hour' : 'hours'} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {['Create Project', 'Add Member', 'View Reports', 'Settings'].map((action, i) => (
              <button
                key={i}
                className="flex items-center justify-center p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
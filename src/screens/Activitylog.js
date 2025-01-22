import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/ActivityLog.css';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_reports')
        .select('id, report, date')
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="activity-container">
      <Sidebar />
      <main className="activity-content">
        <div className="activity-header">
          <h1>Activity Log</h1>
        </div>

        {isLoading ? (
          <div className="loading">Loading activity logs...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="activity-table-container">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity Report</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{formatDate(activity.date)}</td>
                    <td>{activity.report}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ActivityLog;
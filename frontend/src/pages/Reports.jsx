import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { reportService } from '../services/reportService';
import {
  pageContainer,
  pageContent,
  pageHeader,
  pageHeaderHeading,
  colors,
  shadows,
  radii,
  primaryBtn,
  secondaryBtn,
  dangerBtn,
  emptyState,
} from '../styles/tokens';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await reportService.generateReport();
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await reportService.exportCSV();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportService.deleteReport(reportId);
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  return (
    <div style={pageContainer}>
      <Navbar />

      <div style={pageContent}>
        <div style={pageHeader}>
          <h1 style={pageHeaderHeading}>Reports</h1>
          <div style={styles.actions}>
            <button onClick={handleGenerateReport} disabled={generating} style={primaryBtn}>
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
            <button onClick={handleExportCSV} style={secondaryBtn}>
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading reports..." />
        ) : reports.length === 0 ? (
          <div style={emptyState}>
            <p>No reports generated yet</p>
            <button onClick={handleGenerateReport} style={{ ...primaryBtn, marginTop: '1rem' }}>
              Generate First Report
            </button>
          </div>
        ) : (
          <div style={styles.reportList}>
            {reports.map((report) => (
              <div key={report.reportId} style={styles.reportCard}>
                <div style={styles.reportHeader}>
                  <h3 style={styles.reportId}>{report.reportId}</h3>
                  <span style={styles.reportType}>{report.reportType}</span>
                </div>

                <div style={styles.reportStats}>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Total Candidates:</span>
                    <span style={styles.statValue}>{report.totalCandidates}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statLabel}>Shortlisted:</span>
                    <span style={styles.statValue}>{report.shortlistedCount}</span>
                  </div>
                </div>

                <div style={styles.reportFooter}>
                  <span style={styles.date}>
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDeleteReport(report.reportId)}
                    style={dangerBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  reportList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  reportCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '1.5rem',
    boxShadow: shadows.card,
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  reportId: {
    margin: 0,
    fontSize: '1.125rem',
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reportType: {
    padding: '0.25rem 0.75rem',
    background: colors.blueLight,
    color: colors.blueDark,
    borderRadius: radii.pill,
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  reportStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    background: colors.pageBg,
    borderRadius: radii.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: '0.875rem',
  },
  statValue: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  reportFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${colors.border}`,
  },
  date: {
    fontSize: '0.75rem',
    color: colors.textMuted,
  },
};

export default Reports;

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CandidateCard from '../components/CandidateCard';
import Loader from '../components/Loader';
import { resumeService } from '../services/resumeService';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  pageContainer,
  pageContent,
  pageHeader,
  pageHeaderHeading,
  colors,
  shadows,
  radii,
  emptyState,
} from '../styles/tokens';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await resumeService.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDecision = async (candidateId, hrDecision) => {
    try {
      await resumeService.updateHRDecision(candidateId, hrDecision);
      loadCandidates();
    } catch (error) {
      console.error('Error updating decision:', error);
      alert('Failed to update decision');
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    if (filter === 'All') return true;
    return candidate.decision === filter;
  });

  return (
    <div style={pageContainer}>
      <Navbar />

      <div style={pageContent}>
        <div style={pageHeader}>
          <h1 style={pageHeaderHeading}>Candidate List</h1>
          <div style={styles.filters}>
            {['All', 'Shortlist', 'Hold', 'Reject'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.activeFilter : {}),
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader message="Loading candidates..." />
        ) : filteredCandidates.length === 0 ? (
          <div style={emptyState}>
            <p>No candidates found</p>
          </div>
        ) : (
          <>
            <div style={styles.chartContainer}>
              <h2 style={styles.chartTitle}>Candidate Final Scores</h2>
              <BarChart
                height={400}
                dataset={filteredCandidates
                  .sort((a, b) => a.scores.finalScore - b.scores.finalScore)
                  .map(c => ({
                    candidate: c.candidateName,
                    score: c.scores.finalScore
                  }))}
                series={[
                  {
                    dataKey: 'score',
                    valueFormatter: (value) => `${value}%`,
                  },
                ]}
                layout="horizontal"
                xAxis={[
                  {
                    min: 0,
                    max: 100,
                    colorMap: {
                      type: 'piecewise',
                      thresholds: [40, 70],
                      colors: [colors.red, colors.amber, colors.green],
                    },
                    valueFormatter: (value) => `${value}%`,
                  },
                ]}
                yAxis={[
                  {
                    scaleType: 'band',
                    dataKey: 'candidate',
                  },
                ]}
                margin={{ left: 150, right: 10, top: 20, bottom: 30 }}
              />
            </div>
            <div style={styles.list}>
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.candidateId}
                  candidate={candidate}
                  onUpdateDecision={handleUpdateDecision}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  filters: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: colors.cardBg,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: radii.md,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilter: {
    background: colors.blue,
    color: 'white',
    borderColor: colors.blue,
  },
  chartContainer: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: shadows.card,
  },
  chartTitle: {
    fontSize: '1.25rem',
    color: colors.textPrimary,
    marginBottom: '1rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
};

export default CandidateList;

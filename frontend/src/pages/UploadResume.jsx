import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { resumeService } from '../services/resumeService';
import { jobService } from '../services/jobService';
import {
  pageContainer,
  pageContent,
  colors,
  shadows,
  radii,
  label,
  textarea,
  primaryBtn,
  errorBox,
  badge,
} from '../styles/tokens';
import { useEffect } from 'react';

const UploadResume = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobs, setJobs] = useState([]);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    jobService.getJobs()
      .then(setJobs)
      .catch(() => {}); // non-fatal — jobs list is optional
  }, []);

  const handleFileChange = (e) => {
    setResumeFiles(Array.from(e.target.files));
  };

  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);
    // Auto-fill the job description when a saved job is selected
    if (jobId) {
      const job = jobs.find(j => j.jobId === jobId);
      if (job) setJobDescription(job.jobDescription);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setLoading(true);

    const formData = new FormData();
    resumeFiles.forEach(file => {
      formData.append('resumes', file);
    });
    formData.append('jobDescription', jobDescription);
    // Pass the selected job ID so evaluations are linked to the correct job
    if (selectedJobId) {
      formData.append('jobId', selectedJobId);
    }

    try {
      const data = await resumeService.evaluateBulkResumes(formData);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error evaluating resumes');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionColor = (decision) => {
    if (decision === 'Shortlist') return colors.green;
    if (decision === 'Hold') return colors.amber;
    return colors.red;
  };

  return (
    <div style={pageContainer}>
      <Navbar />

      <div style={pageContent}>
        <h1 style={styles.heading}>Bulk Resume Upload</h1>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={errorBox}>{error}</div>}

            {/* Job selector — links evaluation to a saved job (fixes DEFAULT_JOB issue) */}
            {jobs.length > 0 && (
              <div style={styles.formGroup}>
                <label style={label}>Select Saved Job (optional)</label>
                <select
                  value={selectedJobId}
                  onChange={handleJobSelect}
                  style={styles.select}
                >
                  <option value="">— Enter job description manually below —</option>
                  {jobs.map(job => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.jobTitle} ({job.jobId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={label}>Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                required
                rows="8"
                style={textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={label}>Resume Files (PDF/DOCX) — Multiple Selection</label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                multiple
                required
                style={styles.fileInput}
              />
              {resumeFiles.length > 0 && (
                <div style={styles.fileList}>
                  <strong>{resumeFiles.length} file(s) selected:</strong>
                  <ul style={styles.fileItems}>
                    {resumeFiles.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{ ...primaryBtn, padding: '1rem', fontSize: '1rem', width: '100%' }}>
              {loading ? 'Evaluating...' : `Evaluate ${resumeFiles.length || 0} Resume(s)`}
            </button>
          </form>
        </div>

        {loading && <Loader message="Evaluating resumes with AI..." />}

        {results && (
          <div style={styles.resultCard}>
            <h2 style={styles.resultHeading}>Bulk Evaluation Results</h2>

            <div style={styles.summary}>
              <div style={styles.summaryItem}>
                <span>Total Processed:</span>
                <strong>{results.totalProcessed}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Success:</span>
                <strong style={{ color: colors.green }}>{results.successCount}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Failed:</span>
                <strong style={{ color: colors.red }}>{results.failureCount}</strong>
              </div>
            </div>

            {results.results.length > 0 && (
              <div style={styles.resultsTable}>
                <h3 style={styles.subHeading}>Evaluation Results</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Candidate</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Decision</th>
                      <th style={styles.th}>Skills</th>
                      <th style={styles.th}>Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results
                      .sort((a, b) => b.scores.finalScore - a.scores.finalScore)
                      .map((result, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{result.candidateName}</td>
                        <td style={styles.td}>
                          <strong>{result.scores.finalScore}%</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...badge, background: getDecisionColor(result.decision) }}>
                            {result.decision}
                          </span>
                        </td>
                        <td style={styles.td}>{result.scores.skillMatch}%</td>
                        <td style={styles.td}>{result.scores.experience}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {results.errors.length > 0 && (
              <div style={styles.errorsSection}>
                <h3 style={styles.subHeading}>Failed Files</h3>
                <ul style={styles.errorList}>
                  {results.errors.map((err, idx) => (
                    <li key={idx}>
                      <strong>{err.filename}:</strong> {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => navigate('/candidates')} style={styles.viewBtn}>
              View All Candidates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  heading: {
    fontSize: '2rem',
    color: colors.textPrimary,
    marginBottom: '2rem',
  },
  formCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '2rem',
    boxShadow: shadows.card,
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  select: {
    padding: '0.75rem',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: radii.lg,
    fontSize: '1rem',
    background: 'white',
  },
  fileInput: {
    padding: '0.5rem',
    border: `1px solid ${colors.borderLight}`,
    borderRadius: radii.md,
  },
  fileList: {
    marginTop: '0.5rem',
    padding: '1rem',
    background: colors.pageBg,
    borderRadius: radii.md,
    fontSize: '0.875rem',
  },
  fileItems: {
    marginTop: '0.5rem',
    marginLeft: '1.5rem',
  },
  resultCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '2rem',
    boxShadow: shadows.card,
  },
  resultHeading: {
    fontSize: '1.5rem',
    color: colors.textPrimary,
    marginBottom: '1.5rem',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    background: colors.pageBg,
    borderRadius: radii.lg,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: '1.25rem',
    color: colors.textPrimary,
    marginBottom: '1rem',
  },
  resultsTable: {
    marginBottom: '2rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem',
    background: colors.pageBg,
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: colors.textLabel,
    borderBottom: `2px solid ${colors.border}`,
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`,
  },
  td: {
    padding: '0.75rem',
    fontSize: '0.875rem',
  },
  errorsSection: {
    padding: '1rem',
    background: colors.redBg,
    borderRadius: radii.lg,
    marginBottom: '1rem',
  },
  errorList: {
    marginLeft: '1.5rem',
    fontSize: '0.875rem',
    color: colors.redText,
  },
  viewBtn: {
    width: '100%',
    padding: '1rem',
    background: colors.green,
    color: 'white',
    border: 'none',
    borderRadius: radii.lg,
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

export default UploadResume;

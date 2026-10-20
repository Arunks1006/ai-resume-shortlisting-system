import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { jobService } from '../services/jobService';
import {
  pageContainer,
  pageContent,
  pageHeader,
  pageHeaderHeading,
  colors,
  shadows,
  radii,
  primaryBtn,
  dangerBtn,
  formGroup,
  label,
  input,
  textarea,
  emptyState,
} from '../styles/tokens';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    requiredSkills: '',
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await jobService.createJob({
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
      });
      setShowForm(false);
      setFormData({ jobTitle: '', jobDescription: '', requiredSkills: '' });
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobService.deleteJob(jobId);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  return (
    <div style={pageContainer}>
      <Navbar />

      <div style={pageContent}>
        <div style={pageHeader}>
          <h1 style={pageHeaderHeading}>Job Postings</h1>
          <button onClick={() => setShowForm(!showForm)} style={primaryBtn}>
            {showForm ? 'Cancel' : 'Create New Job'}
          </button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Create Job Posting</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={formGroup}>
                <label style={label}>Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  placeholder="e.g., Senior Software Engineer"
                  required
                  style={input}
                />
              </div>

              <div style={formGroup}>
                <label style={label}>Job Description</label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                  placeholder="Enter job description..."
                  required
                  rows="6"
                  style={textarea}
                />
              </div>

              <div style={formGroup}>
                <label style={label}>Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                  placeholder="e.g., Python, React, MongoDB"
                  required
                  style={input}
                />
              </div>

              <button type="submit" style={styles.submitBtn}>
                Create Job
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <Loader message="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div style={emptyState}>
            <p>No job postings yet. Create your first job!</p>
          </div>
        ) : (
          <div style={styles.jobList}>
            {jobs.map((job) => (
              <div key={job.jobId} style={styles.jobCard}>
                <div style={styles.jobHeader}>
                  <h3 style={styles.jobTitle}>{job.jobTitle}</h3>
                  <span style={styles.jobId}>{job.jobId}</span>
                </div>
                <p style={styles.jobDescription}>{job.jobDescription}</p>
                <div style={styles.skills}>
                  {job.requiredSkills.map((skill, idx) => (
                    <span key={idx} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
                <div style={styles.jobFooter}>
                  <span style={styles.date}>
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <button onClick={() => handleDelete(job.jobId)} style={dangerBtn}>
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
  formCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: shadows.card,
  },
  formTitle: {
    fontSize: '1.25rem',
    color: colors.textPrimary,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  submitBtn: {
    padding: '1rem',
    background: colors.green,
    color: 'white',
    border: 'none',
    borderRadius: radii.lg,
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  jobList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  jobCard: {
    background: colors.cardBg,
    borderRadius: radii.xl,
    padding: '1.5rem',
    boxShadow: shadows.card,
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  jobTitle: {
    margin: 0,
    fontSize: '1.125rem',
    color: colors.textPrimary,
    fontWeight: '600',
  },
  jobId: {
    fontSize: '0.75rem',
    color: colors.textSecondary,
    background: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: radii.sm,
  },
  jobDescription: {
    color: colors.textSecondary,
    fontSize: '0.875rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  skills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  skillTag: {
    padding: '0.25rem 0.75rem',
    background: colors.blueLight,
    color: colors.blueDark,
    borderRadius: radii.pill,
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  jobFooter: {
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

export default Jobs;

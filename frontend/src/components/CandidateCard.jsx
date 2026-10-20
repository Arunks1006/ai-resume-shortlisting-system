import React from 'react';
import { colors, shadows, radii, badge, dangerBtn } from '../styles/tokens';

const CandidateCard = ({ candidate, onUpdateDecision }) => {
  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'Shortlist': return colors.green;
      case 'Hold':      return colors.amber;
      case 'Reject':    return colors.red;
      default:          return colors.textSecondary;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{candidate.candidateName}</h3>
        <span
          style={{
            ...badge,
            background: getDecisionColor(candidate.decision),
          }}
        >
          {candidate.decision}
        </span>
      </div>

      <p style={styles.fileName}>{candidate.resumeFileName}</p>

      <div style={styles.scores}>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Skills:</span>
          <span style={styles.scoreValue}>{candidate.scores.skillMatch}%</span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Experience:</span>
          <span style={styles.scoreValue}>{candidate.scores.experience}%</span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Tools:</span>
          <span style={styles.scoreValue}>{candidate.scores.tools}%</span>
        </div>
        <div style={styles.scoreItem}>
          <span style={styles.scoreLabel}>Education:</span>
          <span style={styles.scoreValue}>{candidate.scores.education}%</span>
        </div>
      </div>

      <div style={styles.finalScore}>
        Final Score: <strong>{candidate.scores.finalScore}%</strong>
      </div>

      {candidate.missingSkills && candidate.missingSkills.length > 0 && (
        <div style={styles.missingSkills}>
          <strong>Missing Skills:</strong> {candidate.missingSkills.join(', ')}
        </div>
      )}

      <div style={styles.actions}>
        <span style={styles.hrDecision}>HR Decision: {candidate.hrDecision}</span>
        <div style={styles.buttons}>
          <button
            onClick={() => onUpdateDecision(candidate.candidateId, 'Approved')}
            style={styles.approveBtn}
          >
            Approve
          </button>
          <button
            onClick={() => onUpdateDecision(candidate.candidateId, 'Rejected')}
            style={dangerBtn}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: colors.cardBg,
    borderRadius: radii.lg,
    padding: '1.5rem',
    boxShadow: shadows.card,
    marginBottom: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  name: {
    margin: 0,
    fontSize: '1.25rem',
    color: colors.textPrimary,
  },
  fileName: {
    color: colors.textSecondary,
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  scores: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  scoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem',
    background: colors.pageBg,
    borderRadius: radii.sm,
  },
  scoreLabel: {
    color: colors.textSecondary,
    fontSize: '0.875rem',
  },
  scoreValue: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  finalScore: {
    padding: '0.75rem',
    background: colors.blueLight,
    borderRadius: radii.md,
    textAlign: 'center',
    marginBottom: '1rem',
    color: colors.blueDark,
  },
  missingSkills: {
    padding: '0.75rem',
    background: colors.redBg,
    borderRadius: radii.md,
    fontSize: '0.875rem',
    color: colors.redText,
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${colors.border}`,
  },
  hrDecision: {
    fontSize: '0.875rem',
    color: colors.textSecondary,
  },
  buttons: {
    display: 'flex',
    gap: '0.5rem',
  },
  approveBtn: {
    padding: '0.5rem 1rem',
    background: colors.green,
    color: 'white',
    border: 'none',
    borderRadius: radii.md,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
};

export default CandidateCard;

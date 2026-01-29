import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import './VerifiedBadge.css';

function VerifiedBadge({ size = 'medium', showText = false }) {
  return (
    <span className={`verified-badge ${size}`} title="حساب موثق">
      <FaCheckCircle className="verified-icon" />
      {showText && <span className="verified-text">موثق</span>}
    </span>
  );
}

export default VerifiedBadge;

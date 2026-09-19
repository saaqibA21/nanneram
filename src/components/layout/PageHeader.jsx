import React from 'react';
import ContextBar from './ContextBar';

export default function PageHeader({ title, description, withContext = false }) {
  return (
    <>
      <div className="page-header">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {withContext && <ContextBar />}
    </>
  );
}

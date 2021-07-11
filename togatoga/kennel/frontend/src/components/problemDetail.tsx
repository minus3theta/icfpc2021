import React, { useEffect } from 'react';
import ProblemCanvas from './problemCanvas';
import SolutionTable from './solutionTable';
import ProblemProperties from './problemProperties';

export default function ProblemDetail() {
  return (
    <React.Fragment>
      <ProblemProperties />
      <div style={{ display: 'flex' }}>
        <ProblemCanvas />
        <SolutionTable />
      </div>
    </React.Fragment>
  );
}

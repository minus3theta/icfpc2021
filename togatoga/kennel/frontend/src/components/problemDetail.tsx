import React from 'react';
import ProblemCanvas from './problemCanvas';
import SolutionTable from './solutionTable';

export default function ProblemDetail() {
  return (
    <React.Fragment>
      <div style={{display: "flex"}}>
        <ProblemCanvas />
        <SolutionTable />
      </div>
    </React.Fragment>
  );
}

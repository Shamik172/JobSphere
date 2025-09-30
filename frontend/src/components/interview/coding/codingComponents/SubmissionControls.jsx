import React from "react";

const SubmissionControls = ({ onRun, onSubmit }) => {
  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={onRun}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Run
      </button>
      <button
        onClick={onSubmit}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  );
};

export default SubmissionControls;

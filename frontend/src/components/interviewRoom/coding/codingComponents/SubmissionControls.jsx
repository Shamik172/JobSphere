import React from "react";

const SubmissionControls = ({ onRun, onSubmit }) => {
  return (
    <div className="flex gap-3 justify-end p-2 bg-white/30 backdrop-blur-sm border-t border-white/30 rounded-b-xl">
      <button
        onClick={onRun}
        className="px-5 py-2 rounded-lg font-semibold text-white shadow-md bg-gradient-to-r from-yellow-500 to-yellow-400 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Run
      </button>
      <button
        onClick={onSubmit}
        className="px-5 py-2 rounded-lg font-semibold text-white shadow-md bg-gradient-to-r from-green-500 to-green-400 hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Submit
      </button>
    </div>
  );
};

export default SubmissionControls;

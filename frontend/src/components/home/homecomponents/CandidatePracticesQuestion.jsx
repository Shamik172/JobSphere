import React from "react";
import { useParams } from "react-router-dom";
import CodingPanel from "../../interviewRoom/coding/CodingPanel";
import { useAuth } from "../../../context/AuthContext";

const CandidatePracticesQuestion = () => {
  const { questionId } = useParams();
  const { user } = useAuth();

  if (!questionId) return <div>Invalid question.</div>;

  return (
    <div className="p-6">
      <CodingPanel
        questionId={questionId}
        isPracticeSession={true}
        userId={user.id}
      />
    </div>
  );
};

export default CandidatePracticesQuestion;

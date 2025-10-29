import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyAssessment() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // Correct template literal usage
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/candidate/my_assessment`,
          { withCredentials: true }
        );
        setAssessments(res.data.assessments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (assessments.length === 0)
    return (
      <div className="text-center mt-10">
        No upcoming assessments.{" "}
        <a
          href="/browse_questions"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Explore questions to practice!
        </a>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Upcoming Assessments</h1>
      <ul className="space-y-4">
        {assessments.map((assessment) => (
          <li
            key={assessment._id}
            className="p-4 border rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{assessment.title}</h2>
            <p className="text-sm text-gray-600">
              Date: {new Date(assessment.date).toLocaleString()}
            </p>
            <p className="mt-2">{assessment.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

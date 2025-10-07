const { v4: uuidv4 } = require('uuid');
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const AssessmentParticipant = require('../models/AssessmentParticipant');
const { Interviewer, Candidate } = require('../models/User');

// --- 1. Create a New Assessment ---
// This is triggered when the user is on `/create_assessment` and clicks "Save and Continue".
exports.createAssessment = async (req, res) => {
    try {
        const { name, description } = req.body;

        // In a real app, you would get the logged-in user's ID from an authentication token (e.g., req.user.id)
        // For this example, we'll find or create a default host interviewer.
        const hostInterviewer = await Interviewer.findOneAndUpdate(
            { email: 'host@jobsphere.com' },
            { 
                name: 'Host Interviewer', 
                email: 'host@jobsphere.com', 
                password: 'defaultPassword123', // This will be hashed automatically by the pre-save hook
                role: 'interviewer',
                company: 'JobSphere'
            },
            { upsert: true, new: true }
        );

        // Create the new assessment document
        const newAssessment = new Assessment({
            name,
            description,
            room_id: `room-${uuidv4()}`,
            created_by: hostInterviewer._id,
        });
        await newAssessment.save();

        // Automatically add the creator as the first 'Accepted' participant
        const participant = new AssessmentParticipant({
            assessment: newAssessment._id,
            user: hostInterviewer._id,
            role: 'interviewer',
            status: 'Accepted',
        });
        await participant.save();

        // Respond with the newly created assessment object. The frontend will use its _id to navigate.
        res.status(201).json(newAssessment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating assessment', error: error.message });
    }
};

// --- 2. Invite a Participant (Interviewer or Candidate) ---
// This is triggered on the `/assessment/:id` page when the invite buttons are clicked.
exports.inviteParticipant = async (req, res) => {
    try {
        const { id: assessmentId } = req.params;
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required.' });
        }

        let user;
        // Find or create the user based on their intended role, using the correct discriminator model
        if (role === 'interviewer') {
            user = await Interviewer.findOneAndUpdate(
                { email },
                { name: email.split('@')[0], email, password: 'defaultPassword123', role: 'interviewer' },
                { upsert: true, new: true }
            );
        } else { // role === 'candidate'
            user = await Candidate.findOneAndUpdate(
                { email },
                { name: email.split('@')[0], email, password: 'defaultPassword123', role: 'candidate' },
                { upsert: true, new: true }
            );
        }

        // Check if this user is already part of this assessment
        const existingParticipant = await AssessmentParticipant.findOne({ assessment: assessmentId, user: user._id });
        if (existingParticipant) {
            return res.status(409).json({ message: 'This user has already been invited.' });
        }
        
        // Create the link between the user and the assessment
        const newParticipant = new AssessmentParticipant({
            assessment: assessmentId,
            user: user._id,
            role,
        });
        await newParticipant.save();
        
        // In a real application, you would trigger an email sending service here.
        console.log(`(Simulation) Sending invite to ${email} for role ${role} for assessment ${assessmentId}`);

        res.status(200).json({ message: `Successfully invited ${email}` });
    } catch (error) {
        res.status(500).json({ message: 'Error inviting participant', error: error.message });
    }
};

// --- 3. Add a Question to an Assessment ---
// Triggered on the `/assessment/:id` page when the 'Add Question' button is clicked.
exports.addQuestion = async (req, res) => {
    try {
        const { id: assessmentId } = req.params;
        const { url } = req.body; // Assuming you pass the URL from the frontend

        // For this example, we'll assume the host is the one adding the question
        const hostInterviewer = await Interviewer.findOne({ email: 'host@jobsphere.com' });
        
        // Create a new standalone question document
        const newQuestion = new Question({
            assessment: assessmentId,
            added_by: hostInterviewer._id,
            title: `Question from ${new URL(url).hostname}`, // Example title generation
            url,
            description: "A full description can be fetched or added later.",
            difficulty: "Medium",
        });
        const savedQuestion = await newQuestion.save();

        // Add the new question's ID to the assessment's 'questions' array
        await Assessment.findByIdAndUpdate(
            assessmentId,
            { $push: { questions: savedQuestion._id } }
        );

        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question', error: error.message });
    }
};

// --- 4. Get Full Details for an Existing Assessment ---
// This is called when the frontend component loads on a `/assessment/:id` route.
exports.getAssessmentDetails = async (req, res) => {
    try {
        const { id: assessmentId } = req.params;
        
        // 1. Fetch the main assessment document and populate its `questions` array with the full question documents
        const assessment = await Assessment.findById(assessmentId)
            .populate('questions');

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // 2. Fetch all participants for this assessment and populate their user details
        const participants = await AssessmentParticipant.find({ assessment: assessmentId })
            .populate('user', 'name email'); // Select only the name and email fields from the user document

        // 3. Structure the final response to be easily used by the React component's state
        const response = {
            _id: assessment._id,
            name: assessment.name,
            description: assessment.description,
            questions: assessment.questions,
            // Separate participants into two arrays for easy rendering in the UI
            interviewers: participants.filter(p => p.role === 'interviewer').map(p => ({ name: p.user.name, status: p.status })),
            candidates: participants.filter(p => p.role === 'candidate').map(p => ({ name: p.user.name, status: p.status })),
        };
        
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assessment details', error: error.message });
    }
};


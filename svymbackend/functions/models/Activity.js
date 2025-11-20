const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g., 'student_signup', 'course_added', 'trainer_signup', etc.
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    userId: { type: String }, // optional, for user-specific activities
    details: { type: Object } // optional additional data
});

module.exports = mongoose.model('Activity', activitySchema);

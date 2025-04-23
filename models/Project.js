import mongoose from 'mongoose';
import { Schema  }  from 'mongoose';

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

}, {timestamps: true})

export default mongoose.model('project', projectSchema)
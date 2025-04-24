import Project from '../models/Project.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';


// Create new project
export const createProject = asyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const createdBy = req.user.id;

        const project = new Project({
            name,
            description,
            createdBy,
            members: [createdBy], // creator is a member
        });

        await project.save();
        return res.status(201)
            .json(
                new ApiResponse(
                    true,
                    "Project created successfully",
                    project
                )
            )
    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to create project")
    }
});

// Get all projects for logged-in user
export const getAllProjects = asyncHandler(async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user.id });
        return res.status(200)
            .json(
                new ApiResponse(
                    true, 
                    "Projects fetched successfully",
                    projects
                )
            )
    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to fetch projects")
    }
});

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('members', 'username email');
        if (!project) {
            throw new ApiError(404, "Project not found")
        }
        return res.status(200).json(
            new ApiResponse(
                true,
                "Project fetched successfully",
                project
            )
        );
    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to fetch project")
    }
});

// Add member to project
export const addMemberToProject = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            throw new ApiError(404, "Project not found");
        }
        if (project.members.includes(user._id)) {
            return res.status(200).json(
                new ApiResponse(true, "User is already a member", null)
            );
        }

        if (!project.members.includes(user._id)) {
            project.members.push(user._id);
            await project.save();
        }

        return res.status(200).json(
            new ApiResponse(
                true,
                "Member added successfully",
                project
            )
        )
    } catch (err) {
        throw new ApiError(500, err?.message ||
            "Failed to add member to project"
        )
    }
});



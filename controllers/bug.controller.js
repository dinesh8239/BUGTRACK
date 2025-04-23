import Bug from '../models/Bug.js';
import Project from '../models/Project.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';


// Create new bug/task
export const createBug = asyncHandler(async (req, res) => {
    try {
        const { title, description, priority, projectId, assignedTo } = req.body;
        if (!title || !description || !priority || !projectId) {
            throw new ApiError(400, "All fields are required")
        }

        const bug = new Bug({
            title,
            description,
            priority,
            projectId,
            createdBy: req.user.id,
            assignedTo,
        });
        // Check if the project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await bug.save();

        return res.status(201)
            .json(
                new ApiResponse(
                    "Bug created successfully",
                    bug
                )
            )
    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to create bug")
    }
});

// Get  bugs for a project
export const getBugsByProject = asyncHandler(async (req, res) => {
    try {
        const { projectId } = req.params;
        const bugs = await Bug.find({ projectId })
            .populate('assignedTo', 'username')
            .populate('createdBy', 'username');

        if (!bugs) {
            throw new ApiError(404, "No bugs found for this project")
        }

        return res.status(200)
            .json(
                new ApiResponse(
                    "Bugs fetched successfully",
                    bugs
                )
            )

    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to fetch bugs")
    }
});

// Update bug status
export const updateBugStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body;
        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            throw new ApiError(404, "Bug not found")
        }
        bug.status = status;
        await bug.save();
        return res.status(200)
            .json(
                new ApiResponse(
                    "Bug status updated successfully",
                    bug
                )
            )
    } catch (err) {
        throw new ApiError(500, err?.message || " Failed to update bug status ")
    }
});

// Add comment to bug
export const addCommentToBug = asyncHandler(async (req, res) => {
    try {
        const { text } = req.body;

        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            throw new ApiError(404, "Bug not found")
        }

        const comment = {
            user: req.user.id,
            text,
            createdAt: new Date(),
        };

        bug.comments.push(comment);
        await bug.save();

        return res.status(200)
            .json(
                new ApiResponse(
                    "Comment added successfully",
                    bug
                )
            )

    } catch (err) {
        throw new ApiError(500, err?.message || "Failed to add comment")
    }
});

export const updateBug = asyncHandler(async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const bug = await Bug.findById(req.params.id);

        if (!bug) {
            throw new ApiError(404, "Bug not found")
        }

        console.log("User Info:", req.user);
        console.log("Bug assignedTo:", bug.assignedTo?.toString());
        console.log("User ID:", req.user._id);


        // Allow only admin or the assigned user to update
        if (
            req.user.role !== 'admin' &&
            (!bug.assignedTo || bug.assignedTo.toString() !== req.user._id.toString())
        ) {
            throw new ApiError(403, "You are not authorized to update this bug")
        }


        if (status) bug.status = status;
        if (assignedTo) bug.assignedTo = assignedTo;

        const updatedBug = await bug.save();

        return res.status(200)
            .json(
                new ApiResponse(
                    "Bug updated successfully",
                    updatedBug
                )
            )

    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to update bug")
    }
});


export const deleteBug = asyncHandler(async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);
        if (!bug) {
            throw new ApiError(404, "BUg not found")
        }

        await bug.remove();

        return res.status(200)
            .json(
                new ApiResponse(
                    "Bug deleted successfully",
                    bug
                )
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to delete bug")
    }
})


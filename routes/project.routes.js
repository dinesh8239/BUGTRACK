import express from 'express';
import {
    createProject,
    getAllProjects,
    getProjectById,
    addMemberToProject,
} from '../controllers/project.controller.js';
import  verifyJWT from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createProject);
router.get('/', verifyJWT, getAllProjects);
router.get('/:id', verifyJWT, getProjectById);
router.post('/:id/members', verifyJWT, addMemberToProject);

export default router;

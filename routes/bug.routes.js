import express from 'express';
import {
    createBug,
    getBugsByProject,
    updateBugStatus,
    addCommentToBug,
    updateBug,
    deleteBug
} from '../controllers/bug.controller.js';

import verifyJWT from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', verifyJWT, createBug);
router.get('/project/:projectId', verifyJWT, getBugsByProject);
router.patch('/:id/status', verifyJWT, updateBugStatus);
router.post('/:id/comments', verifyJWT, addCommentToBug);
router.put('/:id', verifyJWT, updateBug);
router.delete('/:id', verifyJWT, deleteBug);



export default router;

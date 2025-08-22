import express, { Request, Response } from "express";
const router = express.Router();
import { BaseResponse } from '../src/response/base-response';
import { loginController, signupController, refreshTokenController, logoutController } from "../src/authentication/controllers/authentication-controller";
import { validateToken } from "../src/authentication/middlewares/token-validator";
import { getUserDetailsController, deleteAccount, updateAccount, getAnotherUserDetailsController, searchAllUsers } from "../src/user/controllers/user-controller";
import { addReviewController, getAllUserReviews, updateReview, deleteReview, getAllReviews } from "../src/review/controllers/review-controller";

router.get('/health-check', (req: Request, res: Response) => {
const response: BaseResponse = {
        status: true,
        statusCode: 200,
        message: 'Working Server 🥳'
    };
    return res.status(200).json(response);
});

router.post('/login', loginController);

router.post('/signup', signupController);

router.get('/who-am-i', validateToken, getUserDetailsController);

router.delete('/delete-account', validateToken, deleteAccount);

router.patch('/update-account', validateToken, updateAccount);

router.post('/refresh-token', refreshTokenController);

router.post('/logout', logoutController);

router.post('/add-review', validateToken, addReviewController);

router.get('/get-user-reviews', validateToken, getAllUserReviews);

router.patch('/update-review', validateToken, updateReview);

router.delete('/delete-review', validateToken, deleteReview);

router.get('/who-is/:user_id', validateToken, getAnotherUserDetailsController);

router.get('/search-all-users', validateToken, searchAllUsers);

router.get('/get-all-reviews', validateToken, getAllReviews);

export default router;
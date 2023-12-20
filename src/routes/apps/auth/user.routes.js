import { Router } from "express";
import { UserRolesEnum } from "../../../constants.js";
import {
    loginUser,
    registerUser
} from '../../../controllers/apps/auth/user.controller.js'
import {
    verifyJWT,
    verifyPermission
} from '../../../middlewares/auth.middleware.js'
import { validate } from "../../../validators/validate.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);


export default router;
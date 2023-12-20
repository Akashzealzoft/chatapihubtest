import { Router } from "express";
import { UserRolesEnum } from "../../../constants.js";
import {
    loginUser,
    registerUser
} from '../../../controllers/apps/auth/user.controller.js'
import {
    verifyJwt,
    verifyPermission
} from '../../../middlewares/auth.middleware.js'
import { validate } from "../../../validators/validate.js";
import { userRegisterValidator,userLoginValidator } from "../../../validators/apps/auth/user.validators.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);


export default router;
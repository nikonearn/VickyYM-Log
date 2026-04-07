import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import walletRouter from "./wallet";
import depositsRouter from "./deposits";
import supportRouter from "./support";
import settingsRouter from "./settings";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(walletRouter);
router.use(depositsRouter);
router.use(supportRouter);
router.use(settingsRouter);
router.use(adminRouter);

export default router;

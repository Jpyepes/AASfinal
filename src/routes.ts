import { Router } from "express";
import {AuthMiddleware} from "./middleware/auth.middleware";
import { Register, UpdatePassword, UpdateInfo, Ambassadors } from "./controller/user.controller";

export const routes = (router: Router) => {
  // Admin
  router.post("/api/admin/register", Register);
  router.put("/api/admin/users/info", AuthMiddleware, UpdateInfo); // it should be checked with out service
  router.put("/api/admin/users/password", AuthMiddleware, UpdatePassword); // it should be checked with out service
  router.get("/api/admin/ambassadors", AuthMiddleware,  Ambassadors); 

  // Ambassador
  router.post("/api/ambassador/register", Register);
  router.put("/api/ambassador/users/info", AuthMiddleware, UpdateInfo); // it should be checked with out service
  router.put("/api/ambassador/users/password", AuthMiddleware, UpdatePassword); ; // it should be checked with out service
};

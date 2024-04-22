import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/jwtToken.js"; // Import the generateToken function

// patientRegister and other controller functions remain unchanged

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
      return next(
        new ErrorHandler("Dashboard User is not authenticated!", 400)
      );
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(decoded.id);
      if (!req.user || req.user.role !== "Admin") {
        return next(
          new ErrorHandler("Invalid token or unauthorized access", 401)
        );
      }
      next();
    } catch (error) {
      return next(
        new ErrorHandler("Invalid token or expired token", 401)
      );
    }
  }
);

// Middleware to authenticate frontend users
export const isPatientAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token) {
      return next(new ErrorHandler("User is not authenticated!", 400));
    }
    try {
      const decoded = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);
      req.user = await User.findById(decoded.id);
      if (req.user.role !== "Patient") {
        return next(
          new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
        );
      }
      next();
    } catch (error) {
      return next(
        new ErrorHandler("Invalid token or expired token", 401)
      );
    }
  }
);
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource!`
        )
      );
    }
    next();
  };
};

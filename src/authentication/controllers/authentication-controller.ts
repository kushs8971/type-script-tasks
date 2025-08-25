import { Request, Response } from "express";
import db from "../../../db";
import bcrypt from "bcrypt";
import { BaseResponse } from "../../response/base-response";
import { LoginModel, SignupModel } from "../models/authentication-model";
import { RowDataPacket } from "mysql2";
const jwt = require("jsonwebtoken");

const getRefreshExpiry = (): Date => {
  const expiryDays = parseInt(
    process.env.JWT_REFRESH_EXPIRATION_DAYS || "7",
    10
  );
  return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
};

export const loginController = (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.email || !req.body.password) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: "Email or password is missing!",
      };
      return res.status(400).json(response);
    }

    const loginData = new LoginModel(req.body);

    const query: string = "SELECT * FROM users WHERE email = ?";

    db.query(query, [loginData.email], async (error, results) => {
      const rows = results as RowDataPacket[];

      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message,
        };
        return res.status(500).json(response);
      }
      if (rows.length === 0) {
        const response: BaseResponse = {
          status: false,
          statusCode: 401,
          message: "Invalid Email Or Password!",
        };
        return res.status(401).json(response);
      }

      const user = rows[0];

      const passwordMatched: boolean = await bcrypt.compare(
        loginData.password,
        user.password
      );

      if (!passwordMatched) {
        const response: BaseResponse = {
          status: false,
          statusCode: 401,
          message: "Invalid Email Or Password!",
        };
        return res.status(401).json(response);
      }

      const accessToken: string = jwt.sign(
        {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRATION as string }
      );

      const refreshToken: string = jwt.sign(
        {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION as string }
      );

      const insertRefreshQuery: string =
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";

      const expiresAt = getRefreshExpiry();

      db.query(
        insertRefreshQuery,
        [user.user_id, refreshToken, expiresAt],
        (insertError) => {
          if (insertError) {
            const response: BaseResponse = {
              status: false,
              statusCode: 500,
              message: "Error saving refresh token",
            };
            return res.status(500).json(response);
          }

          const response: BaseResponse = {
            status: true,
            statusCode: 200,
            message: "You're in!",
            data: {
              token: accessToken,
              refreshToken: refreshToken,
            },
          };
          return res.status(200).json(response);
        }
      );
    });
  } catch (err: any) {
    console.error("Login error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: message
    };
    return res.status(500).json(response);
  }
};

export const signupController = async (req: Request, res: Response) => {
  try {
    if (
      !req.body ||
      !req.body.fullName ||
      !req.body.email ||
      !req.body.password
    ) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: "Missing Required Fields",
      };
      return res.status(400).json(response);
    }

    const signupData: SignupModel = new SignupModel(req.body);

    const existingQuery: string = "SELECT * FROM users WHERE email = ?";

    db.query(existingQuery, [signupData.email], async (error, results) => {
      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message,
        };
        return res.status(500).json(response);
      }

      if (Array.isArray(results) && results.length > 0) {
        const response: BaseResponse = {
          status: false,
          statusCode: 409,
          message: "Email Already Registered",
        };
        return res.status(409).json(response);
      }

      const insertQuery: string =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      const hashedPassword: string = await bcrypt.hash(signupData.password, 10);

      db.query(
        insertQuery,
        [signupData.fullName, signupData.email, hashedPassword],
        async (error, results) => {
          if (error) {
            const response: BaseResponse = {
              status: false,
              statusCode: 500,
              message: error.message,
            };
            return res.status(500).json(response);
          }

          const response: BaseResponse = {
            status: true,
            statusCode: 200,
            message: "You're Officially In!",
          };

          return res.status(200).json(response);
        }
      );
    });
  } catch (err) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: err.message,
    };
    return res.status(500).json(response);
  }
};

export const refreshTokenController = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: BaseResponse = {
        status: false,
        statusCode: 401,
        message: "Refresh token missing!",
      };
      return res.status(401).json(response);
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { user_id: string };

    const newAccessToken = jwt.sign(
      { user_id: decoded.user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    const response: BaseResponse = {
      status: true,
      statusCode: 200,
      message: "Token refreshed!",
      data: { token: newAccessToken },
    };
    return res.status(200).json(response);

  } catch (error) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message,
    };
    return res.status(500).json(response);
  }
};

export const logoutController = (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: "Refresh token is required.",
      };
      return res.status(400).json(response);
    }

    const deleteQuery = "DELETE FROM refresh_tokens WHERE token = ?";

    db.query(deleteQuery, [refreshToken], (error, result) => {
      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message
        };
        return res.status(500).json(response);
      }

      const response: BaseResponse = {
        status: true,
        statusCode: 200,
        message: "Successfully logged out."
      };
      return res.status(200).json(response);
    });
  } catch (error) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message
    };
    return res.status(500).json(response);
  }
};
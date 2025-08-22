import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../../db";
import { BaseResponse } from "../../response/base-response";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

export const getUserDetailsController = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;

    const { iat, exp, ...userDetails } = decoded;

    return res.status(200).json({
      status: true,
      statusCode: 200,
      message: `Here's what we know about you!`,
      data: userDetails,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: err.message,
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const userId: number = decoded.user_id;
    const { password } = req.body;

    if (!password) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: `Password Missing!`,
      };
      return res.status(400).json(response);
    }

    const getUserQuery = "SELECT password FROM users WHERE user_id = ?";
    db.query(getUserQuery, [userId], async (err, results) => {
      if (err) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: err.message,
        };
        return res.status(500).json(response);
      }

      const rows = results as RowDataPacket[];

      if (rows.length === 0) {
        const response: BaseResponse = {
          status: false,
          statusCode: 404,
          message: `User not found!`,
        };
        return res.status(404).json(response);
      }

      const hashedPassword = results[0].password;
      const isPasswordCorrect: boolean = await bcrypt.compare(
        password,
        hashedPassword
      );

      if (!isPasswordCorrect) {
        const response: BaseResponse = {
          status: false,
          statusCode: 401,
          message: `Incorrect Password!`,
        };
        return res.status(401).json(response);
      }

      const query = "DELETE FROM users WHERE user_id = ?";
      db.query(query, [userId], (error, results) => {
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
          message: `Poof! You're gone`,
        };
        return res.status(200).json(response);
      });
    });
  } catch (err: any) {
    console.log("Error", err, err.message);
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: err.message,
    };
    return res.status(500).json(response);
  }
};

export const updateAccount = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const userId: number = decoded.user_id;

    const { name } = req.body;

    if (!name) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: `Name Is Required!`,
      };
      return res.status(400).json(response);
    }

    const query: string = "UPDATE users SET name = ? WHERE user_id = ?";
    db.query(query, [name, userId], async (error, results) => {
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
        message: `All Set!`,
      };
      return res.status(200).json(response);
    });
  } catch (error: any) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message,
    };
    return res.status(500).json(response);
  }
};

export const getAnotherUserDetailsController = (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.user_id;

    if (!userId) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: `Id is required!`,
      };
      return res.status(400).json(response);
    }

    const query: string =
      "SELECT user_id, name, email FROM users WHERE user_id = ?";

    db.query(query, [userId], (error, results) => {
      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message,
        };
        return res.status(500).json(response);
      }

      const data = results[0];

      if (data == null) {
        const response: BaseResponse = {
          status: false,
          statusCode: 404,
          message: `No User Found!`,
        };
        return res.status(404).json(response);
      }

      const response: BaseResponse = {
        status: true,
        statusCode: 200,
        message: `User Details Fetched Successfully!`,
        data: data,
      };

      return res.status(200).json(response);
    });
  } catch (error: any) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message,
    };
    return res.status(500).json(response);
  }
};

export const searchAllUsers = (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.search_query as string;
    if (!searchQuery || searchQuery.trim() === "") {
      const response: BaseResponse = {
        status: true,
        statusCode: 200,
        message: "No users found. Please provide a search query.",
        data: []
      };
      return res.status(200).json(response);
    }

    const query: string =
      "SELECT user_id, name, email FROM users WHERE name LIKE ?";

    db.query(query, [`%${searchQuery}%`], (error, results) => {
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
        message: "Users fetched successfully.",
        data: results,
      };

      return res.status(200).json(response);
    });
  } catch (error: any) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message,
    };
    return res.status(500).json(response);
  }
};
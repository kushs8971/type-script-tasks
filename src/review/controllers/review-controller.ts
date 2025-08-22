import { Request, Response } from "express";
import { BaseResponse } from "../../response/base-response";
import jwt from "jsonwebtoken";
import db from "../../../db";
import { RowDataPacket } from "mysql2";

export const addReviewController = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const userId: number = decoded.user_id;

    const { rating, title, description } = req.body;

    if (!rating || !title || !description) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: `Required Fields Missing!`,
      };
      return res.status(400).json(response);
    }

    const query: string =
      "INSERT INTO reviews (user_id, rating, title, description) VALUES (?, ?, ?, ?)";

    db.query(query, [userId, rating, title, description], (error, result) => {
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
        message: `Review Added Successfully! 🥳`,
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

export const getAllUserReviews = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const userId: number = decoded.user_id;

    const query: string = "SELECT * FROM reviews WHERE user_id = ?";

    db.query(query, [userId], (error, result) => {
      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message,
        };
        return res.status(500).json(response);
      }

      const rows = result as RowDataPacket[];

      const cleanedResult = rows.map((review: any) => {
        const { user_id, ...rest } = review;
        return rest;
      });

      const response: BaseResponse = {
        status: true,
        statusCode: 200,
        message: `Reviews Fetched Successfully! 🥳`,
        data: cleanedResult,
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

export const updateReview = (req: Request, res: Response) => {
  try {
    const { id, rating, title, description } = req.body;

    if (!id) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: "Review id is required!",
      };
      return res.status(400).json(response);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (rating !== undefined) {
      fields.push("rating = ?");
      values.push(rating);
    }
    if (title !== undefined) {
      fields.push("title = ?");
      values.push(title);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }

    if (fields.length === 0) {
      const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message:
          "At least one field (rating, title, description) must be provided to update.",
      };
      return res.status(400).json(response);
    }

    values.push(id);

    const query = `UPDATE reviews SET ${fields.join(", ")} WHERE id = ?`;

    db.query(query, values, (error, results) => {
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
        message: `Review Updated Successfully! 🥳`,
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

export const deleteReview = (req: Request, res: Response) => {
  try {

    const id = req.query.id;

    if (!id) {
     const response: BaseResponse = {
        status: false,
        statusCode: 400,
        message: "Review id is required!",
      };
      return res.status(400).json(response); 
    }

    const query: string = 'DELETE FROM reviews WHERE id = ?';

    db.query(query, [id], (error, results) => {
      
      if (error) {
        const response: BaseResponse = {
          status: false,
          statusCode: 500,
          message: error.message,
        };
        return res.status(500).json(response);
      }
    });

    const response: BaseResponse = {
      status: true,
      statusCode: 200,
      message: `Review Deleted Successfully! 🥳`
    };

    return res.status(200).json(response);

  } catch (error: any) {
    const response: BaseResponse = {
      status: false,
      statusCode: 500,
      message: error.message,
    };
    return res.status(500).json(response);
  }
};

export const getAllReviews = (req: Request, res: Response) => {
  try {

    const query: string = 'SELECT * FROM reviews';

    db.query(query, (error, results) => {

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
        message: `Reviews Fetched Successfully! 🥳`,
        data: results
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
}
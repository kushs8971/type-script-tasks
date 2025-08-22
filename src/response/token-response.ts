import { BaseResponse } from "./base-response";

export const MissingTokenResponse: BaseResponse = {
  status: false,
  statusCode: 401,
  message: "Token Missing!"
};

export const InvalidTokenResponse: BaseResponse = {
  status: false,
  statusCode: 401,
  message: "Invalid Token!"
};

export const ExpiredTokenResponse: BaseResponse = {
  status: false,
  statusCode: 401,
  message: "Token Expired!"
};
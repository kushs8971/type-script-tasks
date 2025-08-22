export interface BaseResponse {
    status: boolean;
    statusCode: number;
    message: string;
    data?: any;
}
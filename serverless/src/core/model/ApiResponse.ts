import {IResult} from "../model/interfaces"

export class ApiResponse {
    constructor() {}

    public getApiStatusResponse(state: any, statusCode: string, cors: string, type: string): IResult {
        return {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Origin": cors, 
                "Content-Type": type
            },
            body: JSON.stringify(state)
        };
    }

    public getApiErrorResponse(state: string, statusCode: string, cors: string, type: string): IResult {
        return {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Origin": cors, 
                "Content-Type": type
            },
            body: JSON.stringify({ error: state })
        };
    }
}
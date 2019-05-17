import AWS from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";
import {ApiResponse} from "../../core/model/ApiResponse";

import {IDatastore, IEntity, IService, IUser, ITransaction, ITransactionStatus, IResult} from "../../core/model/interfaces";

export class DataStore implements IDatastore {
    //const timestamp = new Date().getTime();
    private dynamoDb: AWS.DynamoDB.DocumentClient;
    private apiResponse: ApiResponse;
    private tableName: string;

    constructor(table: string) {
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
        this.apiResponse = new ApiResponse();
        this.tableName = table;
    }

    public create(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.PutItemInput): Promise<IResult> {

        return new Promise((resolve, rejects) => {
            this.dynamoDb.put(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Results", result);
                resolve(this.apiResponse.getApiStatusResponse(params.Item, "200", "*", "application/json"));
                return;
            });
        });
    }

    public get(id: string): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            const params = {
                TableName: this.tableName,
                Key: {
                  id: id,
                },
              };

            this.dynamoDb.get(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(AWS.DynamoDB.Converter.unmarshall(result.Item), "200", "*", "application/json"));
                return;
            });
        });
    }

    public update(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.UpdateItemInput): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            this.dynamoDb.update(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(AWS.DynamoDB.Converter.unmarshall(result.Attributes), "200", "*", "application/json"));
                return;
            });
        });
    }

    public list(): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            const params = {
                TableName: this.tableName,
              };

            this.dynamoDb.scan(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(this.buildResults(result.Items), "200", "*", "application/json"));
                return;
            });
        });
    }

    public listById(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            this.dynamoDb.query(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(this.buildResults(result.Items), "200", "*", "application/json"));
                return;
            });
        });
    }

    private buildResults(source: any[]): any[] {
        let unMarshallData = [];
        for(let i = 0; i < source.length; i++) {
            unMarshallData[unMarshallData.length] = AWS.DynamoDB.Converter.unmarshall(source[i]);
        }
        return unMarshallData;
    }
}
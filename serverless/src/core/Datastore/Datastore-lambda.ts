import { DynamoDB} from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";
import {ApiResponse} from "../../core/model/ApiResponse";

import {IDatastore, IEntity, IService, IUser, ITransaction, ITransactionStatus, IResult} from "../../core/model/interfaces";

export class DataStore implements IDatastore {
    //const timestamp = new Date().getTime();
    private dynamoDb: DynamoDB;
    private apiResponse: ApiResponse;
    private tableName: string;

    constructor(table: string, db: DynamoDB) {
        this.dynamoDb = db;
        this.apiResponse = new ApiResponse();
        this.tableName = table;
    }

    public create(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.PutItemInput): Promise<IResult> {

        return new Promise((resolve, rejects) => {
            this.dynamoDb.putItem(params, (err, result) => {
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
            const params: DynamoDB.GetItemInput = {
                TableName: this.tableName,
                Key: {
                  
                },
              };

            this.dynamoDb.getItem(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(DynamoDB.Converter.unmarshall(result.Item), "200", "*", "application/json"));
                return;
            });
        });
    }

    public update(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.UpdateItemInput): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            this.dynamoDb.updateItem(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(DynamoDB.Converter.unmarshall(result.Attributes), "200", "*", "application/json"));
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
            unMarshallData[unMarshallData.length] = DynamoDB.Converter.unmarshall(source[i]);
        }
        return unMarshallData;
    }
}
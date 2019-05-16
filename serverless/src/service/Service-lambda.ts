import AWS from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";
import {ApiResponse} from "../core/model/ApiResponse";

import {IDatastore, IService, IResult} from "../core/model/interfaces";

export class services implements IDatastore {
    //const timestamp = new Date().getTime();
    private dynamoDb: AWS.DynamoDB.DocumentClient;
    private apiResponse: ApiResponse;
    private tableName: string = ""; //process.env.tableName || "serverless-stp-eu-api-dev";


    constructor() {
        this.dynamoDb = new AWS.DynamoDB.DocumentClient();
        this.apiResponse = new ApiResponse();
    }

    public create(record: IService): Promise<IResult> {

        return new Promise((resolve, rejects) => {
            const params = {
                TableName: this.tableName,
                Item: AWS.DynamoDB.Converter.marshall(record)
              };

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
                resolve(this.apiResponse.getApiStatusResponse(result.Item, "200", "*", "application/json"));
                return;
            });
        });
    }

    public update(record: IService): Promise<IResult> {
        return new Promise((resolve, rejects) => {
            const params = {
                TableName: this.tableName,
                Key: {
                  id: record.id,
                },
                ExpressionAttributeValues: {
                  ':entityId': record.entityId,
                  ':serviceName': record.serviceName,
                  ':price': record.price
                },
                UpdateExpression: 'SET entityId = :entityId, serviceName = :serviceName, price :price',
                ReturnValues: 'ALL_NEW',
              };

            this.dynamoDb.update(params, (err, result) => {
                if (err) {
                    console.log("Erros", err);
                    rejects(this.apiResponse.getApiErrorResponse(err.message, err.code, "*", "application/json"));
                    return;
                }
                console.log("Result", result);
                resolve(this.apiResponse.getApiStatusResponse(result.Attributes, "200", "*", "application/json"));
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
                resolve(this.apiResponse.getApiStatusResponse(result.Items, "200", "*", "application/json"));
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
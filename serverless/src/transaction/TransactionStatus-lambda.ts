import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";

import {ApiResponse} from "../core/model/ApiResponse";
import {UuidGenerator} from "../core/uuid/UuidGenerator";
import {ITransactionStatus} from "../core/model/interfaces";
import { DataStore } from "../core/Datastore/Datastore-lambda";

export class TransactionsStatusApi {

    private apiResponse: ApiResponse;
    private uuiD: UuidGenerator;
    private tableName: string = "sls-stp-rns-dev-transactionStatus";
    private record: ITransactionStatus;
    private params: DynamoDB.DocumentClient.PutItemInput;
    private updateParams: DynamoDB.DocumentClient.UpdateItemInput;
    private lambdaApi: DataStore;
    private dynamoDb: DynamoDB;

    constructor() {
        this.uuiD = new UuidGenerator();
        this.apiResponse = new ApiResponse();
        this.lambdaApi = new DataStore(this.tableName, this.dynamoDb);
    }

    public onHttpPost(event: APIGatewayProxyEvent, context: Context, callback: Callback) : void {
        //Check the http request method 
        if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.body || event.body.length === 0) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        const data = JSON.parse(event.body);
        this.record = { id: this.uuiD.generateUUID(), status: data.status };
        this.params = { TableName: this.tableName, Item: DynamoDB.Converter.marshall(this.record) };

        this.lambdaApi.create(this.record, this.params)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpGet(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "GET") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.pathParameters || !event.pathParameters.id) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        this.lambdaApi.get(event.pathParameters.id)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpPut(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "PUT") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.pathParameters || !event.pathParameters.id) {
            callback(undefined, this.apiResponse.getApiErrorResponse("parameter {id} not specified", "400", "*", "application/json"));
            return;
        }

        //check if any parameter was passed
        if (!event.body || event.body.length === 0) {
            callback(undefined, this.apiResponse.getApiErrorResponse("body not specified", "400", "*", "application/json"));
            return;
        }

        const data = JSON.parse(event.body);
        this.record = { id: event.pathParameters.id, status: data.status };

        this.updateParams = {
            TableName: this.tableName,
            Key: {
              id: this.record.id,
            },
            ExpressionAttributeValues: {
              ':status': this.record.status
            },
            UpdateExpression: 'SET status = :status',
            ReturnValues: 'ALL_NEW',
          };

        this.lambdaApi.update(this.record, this.updateParams)
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

    public onHttpList(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        //Check the http request method 
        if (event.httpMethod !== "GET") {
            callback(undefined, this.apiResponse.getApiErrorResponse(`${event.httpMethod} is an invalid http request method`, "400", "*", "application/json"));
            return;
        }

        this.lambdaApi.list()
            .then(response => {
                callback(undefined, response);
            })
            .catch(err => {
                callback(undefined, err);
            });
    }

}

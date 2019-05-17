export interface IEntity {
    id: string,
    entityName: string
}

export interface IService {
    id: string,
    entityId: string,
    serviceName: string,
    price: number
}

export interface IUser {
    id: string,
    fName: string,
    lName: string,
    userName: string,
    password: string,
    token: string,
    phone: string,
    email: string,
    createdDate: string
}

export interface ITransaction {
    id: string,
    userId: string,
    transactionDate: string,
    transactionValue: number,
    serviceId: string,
    transactionStatus: string
}

export interface ITransactionStatus {
    id: string,
    status: string
}

export interface IResult {
    statusCode: string,
    headers: IResponseHeader,
    body: string,
}

export interface IResponseHeader {
    "Access-Control-Allow-Origin": string,
    "Content-Type": string
}

export interface IDatastore {
    create(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.PutItemInput): Promise<IResult>,
    get(id: string): Promise<IResult>,
    update(record: IEntity | IService | IUser | ITransaction | ITransactionStatus, params: AWS.DynamoDB.DocumentClient.UpdateItemInput): Promise<IResult>,
    list(): Promise<IResult>,
    listById(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<IResult>

}

export interface ITransactions {
    userId: string,
    transactions: ITransaction[]
}


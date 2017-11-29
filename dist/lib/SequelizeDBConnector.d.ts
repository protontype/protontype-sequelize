import { DBConnector } from 'protontype';
import * as Sequelize from 'sequelize';
import { Dictionary } from 'typescript-collections';
import { BaseModel } from './BaseModel';
export declare class SequelizeDBConnector implements DBConnector<DatabaseConfig, SequelizeDBConnector> {
    private sequelize;
    private models;
    createConnection(config?: DatabaseConfig): Promise<SequelizeDBConnector>;
    loadModels(modelsList?: BaseModel<any>[]): this;
    getInstance(): Sequelize.Sequelize;
    getModels(): Dictionary<string, BaseModel<any>>;
    getModel(model: string | {
        new (...args: any[]);
    }): BaseModel<any>;
    addModel(name: string, model: BaseModel<any>): void;
}
export interface DatabaseConfig {
    name: string;
    username: string;
    password: string;
    options: Sequelize.Options;
}
export declare class SequelizeDB {
    static getBD(): SequelizeDBConnector;
}
export declare const DEFAULT_CONFIG: DatabaseConfig;

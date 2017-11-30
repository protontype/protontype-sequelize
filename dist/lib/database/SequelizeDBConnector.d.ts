import { DBConnector } from 'protontype';
import * as Sequelize from 'sequelize';
import { Dictionary } from 'typescript-collections';
import { SequelizeBaseModel } from './SequelizeBaseModel';
export declare class SequelizeDBConnector implements DBConnector<DatabaseConfig, SequelizeDBConnector> {
    private sequelize;
    private models;
    createConnection(config?: DatabaseConfig): Promise<SequelizeDBConnector>;
    loadModels(modelsList?: SequelizeBaseModel<any>[]): this;
    getInstance(): Sequelize.Sequelize;
    getModels(): Dictionary<string, SequelizeBaseModel<any>>;
    getModel(model: string | {
        new (...args: any[]);
    }): SequelizeBaseModel<any>;
    addModel(name: string, model: SequelizeBaseModel<any>): void;
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

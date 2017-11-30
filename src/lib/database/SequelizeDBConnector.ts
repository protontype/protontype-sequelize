import { DBConnector, ProtonDB } from 'protontype'
import * as Sequelize from 'sequelize';
import { Dictionary } from 'typescript-collections';
import { SequelizeBaseModel } from './SequelizeBaseModel';
import { SequelizeModelConfig } from './SequelizeModelConfig';

export class SequelizeDBConnector implements DBConnector<DatabaseConfig, SequelizeDBConnector> {
    private sequelize: Sequelize.Sequelize = null;
    private models: Dictionary<string, SequelizeBaseModel<any>> = new Dictionary<string, SequelizeBaseModel<any>>();

    async createConnection(config?: DatabaseConfig): Promise<SequelizeDBConnector> {
        if (!config) {
            config = DEFAULT_CONFIG;
        }
        this.sequelize = new Sequelize(config.name, config.username,
            config.password, config.options
        );
        this.loadModels();
        console.log("Models loaded: ", this.models.size());
        return new Promise<SequelizeDBConnector>((resolve, reject) => {
            this.sequelize.sync().then(() => {
                resolve(this);
            }).catch(error => reject(error));
        });
    }
    

    public loadModels(modelsList?: SequelizeBaseModel<any>[]): this {
        if (!modelsList) {
            modelsList = SequelizeModelConfig.modelsList;
        }

        if (modelsList && this.sequelize) {
            modelsList.forEach((model: SequelizeBaseModel<any>) => {
                if (!this.getModel(model.getModelName())) {
                    this.addModel(model.getModelName(), model.defineModel(this.sequelize));
                    model.setProtonDB(this);
                    console.log(`Model loaded: ${model.getModelName()}`);
                }
            });

            modelsList.forEach((model: SequelizeBaseModel<any>) => {
                model.configureAssociations();
                model.configure();
            });
        }

        return this;
    }

    public getInstance(): Sequelize.Sequelize {
        return this.sequelize;
    }

    public getModels(): Dictionary<string, SequelizeBaseModel<any>> {
        return this.models;
    }

    public getModel<T extends SequelizeBaseModel<any>>(model: string | { new(...args: any[]) }): T {
        if (typeof (model) == typeof (" ")) {
            return <T>this.models.getValue(<string>model);
        } else {
            let modelClass = new (<{ new(...args: any[]) }>model)();
            return <T>this.models.getValue(modelClass.getModelName());
        }
    }


    public addModel(name: string, model: SequelizeBaseModel<any>): void {
        this.models.setValue(name, model);
    }
}

export interface DatabaseConfig {
    name: string;
    username: string;
    password: string;
    options: Sequelize.Options;
}

export class SequelizeDB {
    public static getBD(): SequelizeDBConnector {
        return <SequelizeDBConnector>ProtonDB.dbConnection;
    }
}

export const DEFAULT_CONFIG: DatabaseConfig = {
    "name": "proton-example",
    "username": "",
    "password": "",
    "options": {
        "dialect": "sqlite",
        "storage": "proton.sqlite",
        "define": {
            "underscored": true
        }
    }
}
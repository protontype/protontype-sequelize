"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const protontype_1 = require("protontype");
const sequelize_1 = __importDefault(require("sequelize"));
const typescript_collections_1 = require("typescript-collections");
const SequelizeModelConfig_1 = require("./SequelizeModelConfig");
class SequelizeDBConnector {
    constructor() {
        this.sequelize = null;
        this.models = new typescript_collections_1.Dictionary();
    }
    createConnection(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config) {
                config = exports.DEFAULT_CONFIG;
            }
            this.sequelize = new sequelize_1.default(config.name, config.username, config.password, config.options);
            this.loadModels();
            console.log("Models loaded: ", this.models.size());
            return new Promise((resolve, reject) => {
                this.sequelize.sync().then(() => {
                    resolve(this);
                }).catch(error => reject(error));
            });
        });
    }
    loadModels(modelsList) {
        if (!modelsList) {
            modelsList = SequelizeModelConfig_1.SequelizeModelConfig.modelsList;
        }
        if (modelsList && this.sequelize) {
            modelsList.forEach((model) => {
                if (!this.getModel(model.getModelName())) {
                    this.addModel(model.getModelName(), model.defineModel(this.sequelize));
                    model.setProtonDB(this);
                    console.log(`Model loaded: ${model.getModelName()}`);
                }
            });
            modelsList.forEach((model) => {
                model.configureAssociations();
                model.configure();
            });
        }
        return this;
    }
    getInstance() {
        return this.sequelize;
    }
    getModels() {
        return this.models;
    }
    getModel(model) {
        if (typeof (model) == typeof (" ")) {
            return this.models.getValue(model);
        }
        else {
            let modelClass = new model();
            return this.models.getValue(modelClass.getModelName());
        }
    }
    addModel(name, model) {
        this.models.setValue(name, model);
    }
}
exports.SequelizeDBConnector = SequelizeDBConnector;
class SequelizeDB {
    static getBD() {
        return protontype_1.ProtonDB.dbConnection;
    }
}
exports.SequelizeDB = SequelizeDB;
exports.DEFAULT_CONFIG = {
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
};
//# sourceMappingURL=SequelizeDBConnector.js.map
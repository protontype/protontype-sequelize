import { SequelizeBaseModel } from '../database/SequelizeBaseModel';
import { RouterFunctionParams, ExpressRouter, ProtonApplication, Method } from 'protontype';
import * as express from 'express';
import { SequelizeDB } from '../database/SequelizeDBConnector';
/**
 * Created by Humberto Machado on 14/08/2016.
 */
export abstract class SequelizeCrudRouter extends ExpressRouter {
    private useAuth: UseAuthOptions;
    private crudModel: {
        new(...args: any[]);
    };

    public init(protonApplication: ProtonApplication): void {
        super.init(protonApplication);
        this.addRoute('/', Method.GET, this.findAll, this.useAuth ? this.useAuth.read : false);
        this.addRoute('/', Method.POST, this.create, this.useAuth ? this.useAuth.create : false);
        this.addRoute('/:id', Method.GET, this.findOne, this.useAuth ? this.useAuth.read : false);
        this.addRoute('/:id', Method.PUT, this.update, this.useAuth ? this.useAuth.update : false);
        this.addRoute('/:id', Method.DELETE, this.destroy, this.useAuth ? this.useAuth.delete : false);
    }

    private addRoute(endpoint: string, method: Method, routeFunction: Function, useAuth: boolean) {
        this.addRouteConfig(
            {
                endpoint: endpoint,
                method: method,
                routeFunction: routeFunction,
                useAuth: useAuth
            });
    }

    public findAll(params: RouterFunctionParams) {
        let model = SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.findAll({})
            .then(result => params.res.send(result))
            .catch(error => super.sendErrorMessage(params.res, error));
    }

    public create(params: RouterFunctionParams) {
        let model = SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.create(params.req.body)
            .then(result => params.res.send(result))
            .catch(error => this.sendErrorMessage(params.res, error));
    }

    public findOne(params: RouterFunctionParams) {
        let model = SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.findOne({ where: params.req.params })
            .then(result => {
                if (result) {
                    params.res.send(result);
                } else {
                    params.res.sendStatus(404);
                }
            })
            .catch(error => this.sendErrorMessage(params.res, error));
    }

    public update(params: RouterFunctionParams) {
        let model = SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.update(params.req.body, { where: params.req.params })
            .then(result => params.res.sendStatus(204))
            .catch(error => this.sendErrorMessage(params.res, error));
    }

    public destroy(params: RouterFunctionParams) {
        let ids: string[] = (params.req.params.id as string).split(',');
        let model = SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.destroy({
            where: {
                id: {
                    $in: ids
                }
            }
        })
            .then(result => params.res.sendStatus(204))
            .catch(error => this.sendErrorMessage(params.res, error));
    }
}

/**
 * Decorator @UseAuth()
 * 
 * Indicates that a BaseCrudRouter uses the authentication middleware
 */
export function UseAuth(options?: UseAuthOptions) {
    return function (constructor: Function) {
        if (options) {
            constructor.prototype.useAuth = options;
        } else {
            constructor.prototype.useAuth = { create: true, update: true, read: true, delete: true }
        }
    }
}

export interface UseAuthOptions {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protontype_1 = require("protontype");
const SequelizeDBConnector_1 = require("../database/SequelizeDBConnector");
/**
 * Created by Humberto Machado on 14/08/2016.
 */
class SequelizeCrudRouter extends protontype_1.ExpressRouter {
    init(protonApplication) {
        super.init(protonApplication);
        this.addRoute('/', protontype_1.Method.GET, this.findAll, this.useAuth ? this.useAuth.read : false);
        this.addRoute('/', protontype_1.Method.POST, this.create, this.useAuth ? this.useAuth.create : false);
        this.addRoute('/:id', protontype_1.Method.GET, this.findOne, this.useAuth ? this.useAuth.read : false);
        this.addRoute('/:id', protontype_1.Method.PUT, this.update, this.useAuth ? this.useAuth.update : false);
        this.addRoute('/:id', protontype_1.Method.DELETE, this.destroy, this.useAuth ? this.useAuth.delete : false);
    }
    addRoute(endpoint, method, routeFunction, useAuth) {
        this.addRouteConfig({
            endpoint: endpoint,
            method: method,
            routeFunction: routeFunction,
            useAuth: useAuth
        });
    }
    findAll(params) {
        let model = SequelizeDBConnector_1.SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.findAll({})
            .then(result => params.res.send(result))
            .catch(error => super.sendErrorMessage(params.res, error));
    }
    create(params) {
        let model = SequelizeDBConnector_1.SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.create(params.req.body)
            .then(result => params.res.send(result))
            .catch(error => this.sendErrorMessage(params.res, error));
    }
    findOne(params) {
        let model = SequelizeDBConnector_1.SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.findOne({ where: params.req.params })
            .then(result => {
            if (result) {
                params.res.send(result);
            }
            else {
                params.res.sendStatus(404);
            }
        })
            .catch(error => this.sendErrorMessage(params.res, error));
    }
    update(params) {
        let model = SequelizeDBConnector_1.SequelizeDB.getBD().getModel(this.crudModel).getInstance();
        model.update(params.req.body, { where: params.req.params })
            .then(result => params.res.sendStatus(204))
            .catch(error => this.sendErrorMessage(params.res, error));
    }
    destroy(params) {
        let ids = params.req.params.id.split(',');
        let model = SequelizeDBConnector_1.SequelizeDB.getBD().getModel(this.crudModel).getInstance();
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
exports.SequelizeCrudRouter = SequelizeCrudRouter;
/**
 * Decorator @UseAuth()
 *
 * Indicates that a BaseCrudRouter uses the authentication middleware
 */
function UseAuth(options) {
    return function (constructor) {
        if (options) {
            constructor.prototype.useAuth = options;
        }
        else {
            constructor.prototype.useAuth = { create: true, update: true, read: true, delete: true };
        }
    };
}
exports.UseAuth = UseAuth;
//# sourceMappingURL=SequelizeCrudRouter.js.map
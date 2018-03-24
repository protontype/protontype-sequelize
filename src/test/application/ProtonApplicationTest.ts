import { JsonContentMiddleware, ProtonApplication, GlobalConfig } from 'protontype';
import { Mock, Mock2 } from './../utils/ModelMock';
import {
    GLOBAL_MIDDLEWARE_MSG,
    GLOBAL_ROUTER_MIDDLEWARE_MSG,
    GlobalMiddlewareMock,
    ROUTER_MIDDLEWARE_MSG
} from './../utils/MiddlewareMock';
import { RouterMock } from './../utils/RouterMock';
import { assert } from 'chai';
import express from 'express';
import { JsonLoader } from 'jsontyped';
import { suite, test, timeout } from 'mocha-typescript';
import request from 'supertest';
import { SequelizeDB, SequelizeDBConnector } from '../../lib/database/SequelizeDBConnector';

@suite('ProtonApplicationTest')
class ProtonApplicationTest {
    private config: GlobalConfig;
    private app: ProtonApplication;

    after(done: Function) {
        SequelizeDB.getBD().getInstance().drop()
            .then(() => done())
            .catch((err) => {
                done(err);
            });
    }

    @test('basicTest')
    basicTest(done: Function) {
        this.config = JsonLoader.loadFile<GlobalConfig>("./src/test/utils/config.json");
        this.app = new ProtonApplication(this.config)
            .withDBConnectorAs(SequelizeDBConnector)
            .addMiddlewareAs(GlobalMiddlewareMock)
            .addMiddlewareAs(JsonContentMiddleware)
            .addRouterAs(RouterMock);
        this.testApplication(done);
    }

    private async testApplication(done: Function) {
        try {
            await this.app.start()
            assert.equal(this.app.getRouters().length, 1);
            assert.equal(this.app.getRoutesList().length, 15);

            await this.assertRouteGet("/mocks/blah", this.app.getExpress())
                .then(() => assert.fail())
                .catch((err) => { assert.isNotNull(err) });

            await this.assertRouteGet("/mocks/test/msg", this.app.getExpress(), (err, res) => {
                assert.equal(res.body.msg, "hello!");
                assert.equal(res.body.routerMidMsg, ROUTER_MIDDLEWARE_MSG);
                assert.equal(res.body.globalMidMsg, GLOBAL_MIDDLEWARE_MSG);
                assert.equal(res.body.globalRouterMidMsg, GLOBAL_ROUTER_MIDDLEWARE_MSG);
            });

            await this.populateMocks();
            await this.updateMocks();
            await this.assertModelMockRoutes();
            done();
        } catch (err) {
            done(err);
        }
    }

    private async populateMocks(): Promise<any> {
        return new Promise<ProtonApplication>((resolve, reject) => {
            request(this.app.getExpress()).post('/mocks/').send({ id: 1, mockCol1: "mockCol1", mockCol2: 1 }).expect(200).end((err, res) => {
                request(this.app.getExpress()).post('/mocks/').send({ id: 2, mockCol1: "mock2Col1", mockCol2: 2 }).expect(200).end((err, res) => {
                    request(this.app.getExpress()).post('/mocks/').send({ id: 3, mockCol1: "mock2Col1", mockCol2: 2 }).expect(200).end((err, res) => {
                        resolve();
                    });
                });
            });
        });
    }

    private async updateMocks(): Promise<any> {
        return new Promise<ProtonApplication>((resolve, reject) => {
            request(this.app.getExpress()).put('/mocks/1').send({ mockCol1: "mockCol1Updated" }).expect(200).end((err, res) => {
                request(this.app.getExpress()).delete('/mocks/2').expect(200).end((err, res) => {
                    resolve();
                });
            });
        });
    }

    private async assertModelMockRoutes() {
        await this.assertRouteGet("/mocks/", this.app.getExpress(), (err, res) => { assert.isNull(err); });
        await this.assertRouteGet("/mocks/1", this.app.getExpress(), (err, res) => {
            assert.isNull(err);
            assert.equal(res.body.mockCol1, 'mockCol1Updated');
        });
    }

    private assertRouteGet(route: string, expressApp: express.Application, assertFunction?: Function): Promise<any> {
        return new Promise<ProtonApplication>((resolve, reject) => {
            request(expressApp).get(route)
                .expect(200)
                .end((err, res) => {
                    if (assertFunction) {
                        assertFunction.call(this, err, res);
                    }
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
        });
    }

}
import { SequelizeDBConnector } from '../../lib/SequelizeDBConnector';
import { ModelMock3, ModelMock4, ModelMock1, ModelMock2, Mock } from './../utils/ModelMock';
import { assert } from 'chai';
import { JsonLoader } from 'jsontyped';
import { suite, test, timeout } from 'mocha-typescript';
import { GlobalConfig } from 'protontype';
import { ModelInstance } from '../../lib/BaseModel';

@suite('Testes para ProtonDB')
class ProtonDBtest {
    private config: GlobalConfig;
    private db: SequelizeDBConnector;

    before(done: Function) {
        this.setup(done);
    }

    after(done: Function) {
        this.db.getInstance().drop().then(() => done()).catch((err) => {
            done();
        });
    }

    private async setup(done: Function) {
        try {
            this.config = JsonLoader.loadFile<GlobalConfig>("./src/test/utils/config.json");
            assert.notEqual(this.config, null);
            assert.notEqual(this.config.database, null);
            new ModelMock1();
            new ModelMock2();
            new ModelMock3();
            new ModelMock4();
            this.db = await new SequelizeDBConnector().createConnection(this.config.database);
            assert.equal(this.db.getModels().size(), 4);
            done();
        } catch (err) {
            done(err);
        }
    }

    @timeout(30000)
    @test('createAndFindTest')
    createAndFindTest(done: Function) {
        this.createAndAssertModels(done);
    }

    private async createAndAssertModels(done: Function) {
        try {
            let modelMock1: ModelMock1 = this.db.getModel("ModelMock1");
            let modelMock1Instance = modelMock1.getInstance();
            await modelMock1Instance.build({ mockCol1: "record1", mockCol2: 1 }).save();
            await modelMock1Instance.build({ mockCol1: "record2", mockCol2: 2 }).save();
            await modelMock1Instance.build({ mockCol1: "record3", mockCol2: 3 }).save();
            let records: ModelInstance<Mock>[] = await modelMock1Instance.findAll({ order: [ ['mockCol2', 'ASC']] });
            assert.equal(records.length, 3);
            assert.equal(records[0].toJSON().mockCol2, 1);
            assert.equal(records[1].toJSON().mockCol2, 2);
            assert.equal(records[2].toJSON().mockCol2, 3);
            done();
        } catch (err) {
            done(err);
        }
    }
}

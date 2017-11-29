import { SequelizeDBConnector } from './SequelizeDBConnector';
import { AssociationsConfig, AssociationType } from './ProtonModelConfig';
import * as Sequelize from 'sequelize';

/**
 * @author Humberto Machado
 */

export abstract class BaseModel<ModelAttrinutes extends SequelizeBaseModelAttr> {
    //Sequelize Model native instance. @see http://docs.sequelizejs.com/en/latest/docs/models-usage/
    protected model: Sequelize.Model<ModelInstance<ModelAttrinutes>, ModelAttrinutes>;
    protected name: string;
    protected definition: Sequelize.DefineAttributes;
    protected dbConnector: SequelizeDBConnector;
    protected associations: AssociationsConfig[];

    public getModelName(): string {
        return this.name;
    }

    public defineModel(sequelize: Sequelize.Sequelize): BaseModel<ModelAttrinutes> {
        this.model = sequelize.define<ModelInstance<ModelAttrinutes>, ModelAttrinutes>(this.getModelName(), this.definition, {});
        return this;
    }

    public configure() {
        //Hook Method
    }

    public configureAssociations() {
        if (this.associations) {
            this.associations.forEach(assoc => {
                switch (assoc.type) {
                    case AssociationType.HAS_MANY:
                        this.hasMany(assoc.modelName, <Sequelize.AssociationOptionsHasMany> assoc.options);
                        break;
                    case AssociationType.BELONGS_TO:
                        this.belongsTo(assoc.modelName, <Sequelize.AssociationOptionsBelongsTo> assoc.options);
                        break;
                    case AssociationType.HAS_ONE:
                        this.hasOne(assoc.modelName, <Sequelize.AssociationOptionsHasOne> assoc.options);
                        break;
                    case AssociationType.BELONGS_TO_MANY:
                        this.belongsToMany(assoc.modelName, <Sequelize.AssociationOptionsBelongsToMany> assoc.options);
                        break;
                }
            })

        }
    }

    public belongsTo(modelName: string, options?: Sequelize.AssociationOptionsBelongsTo) {
        this.model.belongsTo(this.dbConnector.getModel(modelName).getInstance(), options);
    }

    public hasMany(modelName: string, options?: Sequelize.AssociationOptionsHasMany) {
        this.model.hasMany(this.dbConnector.getModel(modelName).getInstance(), options);
    }

    public hasOne(modelName: string, options?: Sequelize.AssociationOptionsHasOne) {
        this.model.hasOne(this.dbConnector.getModel(modelName).getInstance(), options);
    }

    public belongsToMany(modelName: string, options: Sequelize.AssociationOptionsBelongsToMany) {
        this.model.belongsToMany(this.dbConnector.getModel(modelName).getInstance(), options);
    }

    public getInstance(): Sequelize.Model<ModelInstance<ModelAttrinutes>, ModelAttrinutes> {
        return this.model;
    }

    public setProtonDB(ProtonDB: SequelizeDBConnector) {
        this.dbConnector = ProtonDB;
    }
}

export var DataTypes: Sequelize.DataTypes = Sequelize;

export interface SequelizeBaseModelAttr {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ModelInstance<T extends SequelizeBaseModelAttr> extends Sequelize.Instance<T> {

}
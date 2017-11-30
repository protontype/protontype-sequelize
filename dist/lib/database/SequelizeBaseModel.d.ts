import { SequelizeDBConnector } from './SequelizeDBConnector';
import { AssociationsConfig } from './SequelizeModelConfig';
import * as Sequelize from 'sequelize';
/**
 * @author Humberto Machado
 */
export declare abstract class SequelizeBaseModel<ModelAttrinutes extends SequelizeSequelizeBaseModelAttr> {
    protected model: Sequelize.Model<ModelInstance<ModelAttrinutes>, ModelAttrinutes>;
    protected name: string;
    protected definition: Sequelize.DefineAttributes;
    protected dbConnector: SequelizeDBConnector;
    protected associations: AssociationsConfig[];
    getModelName(): string;
    defineModel(sequelize: Sequelize.Sequelize): SequelizeBaseModel<ModelAttrinutes>;
    configure(): void;
    configureAssociations(): void;
    belongsTo(modelName: string, options?: Sequelize.AssociationOptionsBelongsTo): void;
    hasMany(modelName: string, options?: Sequelize.AssociationOptionsHasMany): void;
    hasOne(modelName: string, options?: Sequelize.AssociationOptionsHasOne): void;
    belongsToMany(modelName: string, options: Sequelize.AssociationOptionsBelongsToMany): void;
    getInstance(): Sequelize.Model<ModelInstance<ModelAttrinutes>, ModelAttrinutes>;
    setProtonDB(ProtonDB: SequelizeDBConnector): void;
}
export declare var DataTypes: Sequelize.DataTypes;
export interface SequelizeSequelizeBaseModelAttr {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
}
export interface ModelInstance<T extends SequelizeSequelizeBaseModelAttr> extends Sequelize.Instance<T> {
}

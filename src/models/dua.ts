import { Model } from 'objection';
import { User } from 'models';

export class Dua extends Model {
  readonly id!: number;
  textArabic?: string;
  textInbetween?: string;
  textEnglish?: string;
  textFrench?: string;

  static get tableName() {
    return 'duas';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'duas.id',
          through: {
            from: 'favorites_duas.duaId',
            to: 'favorites_duas.userId',
          },
          to: 'users.id',
        },
      },
    };
  }
}

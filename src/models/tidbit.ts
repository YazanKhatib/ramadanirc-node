import { Model } from 'objection';
import { User } from 'models';

export class Tidbit extends Model {
  readonly id!: number;
  textEnglish?: string;
  textFrench?: string;
  deedOfTheDayDate?: string;

  static get tableName() {
    return 'tidbits';
  }

  static get relationMappings() {
    return {
      owner: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'tidbits.id',
          through: {
            from: 'favorites_tidbits.tidbitId',
            to: 'favorites_tidbits.userId',
          },
          to: 'users.id',
        },
      },
    };
  }
}

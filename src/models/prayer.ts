import { Model } from 'objection';
import { User } from './user';

export class Prayer extends Model {
  readonly id!: number;
  name!: string;
  type?: string;

  static get tableName() {
    return 'prayers';
  }
  static relationMappings() {
    return {
      prayedBy: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'prayers.id',
          through: {
            from: 'users_prayers.prayerId',
            to: 'users_prayers.userId',
            extra: ['value', 'selected', 'prayedAt'],
          },
          to: 'users.id',
        },
      },
    };
  }
}

import { Model } from 'objection';
import { User } from 'models';

export class Notified extends Model {
  readonly id!: number;
  isNotified: boolean;
  date: string;
  static get tableName() {
    return 'notified';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'notified.userId',
          to: 'users.id',
        },
      },
    };
  }
}

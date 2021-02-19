import { Model } from 'objection';
import { User } from 'models';

export class DailyQuran extends Model {
  readonly id!: number;
  value?: boolean;
  createAt?: string;

  static get tableName() {
    return 'daily_quran';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'daily_quran.userId',
          to: 'users.id',
        },
      },
    };
  }
}

import { Model } from 'objection';
import { User } from 'models';

export class Activity extends Model {
  readonly id!: number;
  lastActivity: string;
  quranActivity: string;
  trackerScore: number;

  static get tableName() {
    return 'activities';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'activities.userId',
          to: 'users.id',
        },
      },
    };
  }
}

import { Model } from 'objection';
import { User } from './user';

export class Reflection extends Model {
  readonly id!: number;
  date!: Date;
  preview?: string;
  title?: string;
  text?: string;

  static get tableName() {
    return 'reflections';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reflections.userId',
          to: 'users.id',
        },
      },
    };
  }
}

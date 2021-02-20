import { Model } from 'objection';
import { User } from 'models';

export class Task extends Model {
  readonly id!: number;
  name!: string;
  fixed?: boolean;
  endDate?: string;
  selectedIcon?: string;
  notSelectedIcon?: string;

  static get tableName() {
    return 'tasks';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        name: { type: 'string' },
        fixed: { type: 'boolean' },
      },
      required: ['name'],
    };
  }
  static relationMappings = {
    owners: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'tasks.id',
        through: {
          from: 'users_tasks.taskId',
          to: 'users_tasks.userId',
          extra: ['value', 'createdAt'],
        },
        to: 'users.id',
      },
    },
  };
}

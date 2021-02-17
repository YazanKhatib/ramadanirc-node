import { Model } from 'objection';
import { Task } from 'models';
import { Prayer } from './prayer';
import { QuranTracker } from './quran';
import { DailyQuran } from './dailyQuran';

export class User extends Model {
  readonly id!: number;
  username!: string;
  email!: string;
  password!: string;
  admin?: boolean;
  location?: string;
  age?: number;
  gender?: string;
  refreshToken!: string;
  expirationDate!: string;

  static get tableName() {
    return 'users';
  }
  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        admin: { type: 'boolean' },
        location: { type: 'string' },
        age: { type: 'number' },
        gender: { type: 'string' },
        refreshToken: { type: 'string' },
        expirationDate: { type: 'string' },
      },
      reqiured: [
        'username',
        'email',
        'password',
        'refrechToken',
        'expirationDate',
      ],
    };
  }
  static get relationMappings() {
    return {
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'users.id',
          through: {
            from: 'users_tasks.userId',
            to: 'users_tasks.taskId',
            extra: ['value', 'createdAt'],
          },
          to: 'tasks.id',
        },
      },
      prayers: {
        relation: Model.ManyToManyRelation,
        modelClass: Prayer,
        join: {
          from: 'users.id',
          through: {
            from: 'users_prayers.userId',
            to: 'users_prayers.prayerId',
            extra: ['rakats', 'prayedAt'],
          },
          to: 'prayers.id',
        },
      },
      quranTracker: {
        relation: Model.HasOneRelation,
        modelClass: QuranTracker,
        join: {
          from: 'users.id',
          to: 'quran_tracker.userId',
        },
      },
      dailyQuran: {
        relation: Model.HasManyRelation,
        modelClass: DailyQuran,
        join: {
          from: 'users.id',
          to: 'daily_quran.userId',
        },
      },
    };
  }
}

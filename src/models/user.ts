import { Model } from 'objection';
import {
  Dua,
  Reflection,
  Activity,
  Task,
  Prayer,
  QuranTracker,
  DailyQuran,
  Tidbit,
  Notified,
} from 'models';

export class User extends Model {
  readonly id!: number;
  username!: string;
  email!: string;
  password!: string;
  admin?: boolean;
  location?: string;
  language?: string;
  age?: number;
  gender?: string;
  refreshToken!: string;
  expirationDate!: string;
  registrationToken?: string;
  notify?: boolean;
  timezone?: string;

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
        location: { type: ['string', 'null'] },
        age: { type: ['number', 'null'] },
        gender: { type: ['string', 'null'] },
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
            extra: ['value', 'selected', 'prayedAt'],
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
      tidbits: {
        relation: Model.ManyToManyRelation,
        modelClass: Tidbit,
        join: {
          from: 'users.id',
          through: {
            from: 'favorites_tidbits.userId',
            to: 'favorites_tidbits.tidbitId',
          },
          to: 'tidbits.id',
        },
      },
      duas: {
        relation: Model.ManyToManyRelation,
        modelClass: Dua,
        join: {
          from: 'users.id',
          through: {
            from: 'favorites_duas.userId',
            to: 'favorites_duas.duaId',
          },
          to: 'duas.id',
        },
      },
      reflections: {
        relation: Model.HasManyRelation,
        modelClass: Reflection,
        join: {
          from: 'users.id',
          to: 'reflections.userId',
        },
      },
      activity: {
        relation: Model.HasOneRelation,
        modelClass: Activity,
        join: {
          from: 'users.id',
          to: 'activities.userId',
        },
        notified: {
          relation: Model.HasManyRelation,
          modelClass: Notified,
          join: {
            from: 'users.id',
            to: 'notified.userId',
          },
        },
      },
      notified: {
        relation: Model.HasManyRelation,
        modelClass: Notified,
        join: {
          from: 'users.id',
          to: 'notified.userId',
        },
      },
    };
  }
}

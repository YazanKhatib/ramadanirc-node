import { Model } from 'objection';

export class User extends Model {
  readonly id!: number;
  username!: string;
  email!: string;
  password!: string;
  location?: object;
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
        location: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            state: { type: 'string' },
            country: { type: 'string' },
          },
        },
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
  // TODO: user relation mappings
  //   static get relationMappings() {
  //     return {};
  //   }
}

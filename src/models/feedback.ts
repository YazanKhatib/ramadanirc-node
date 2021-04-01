import { Model } from 'objection';

export class Feedback extends Model {
  readonly id!: number;
  username!: string;
  version!: string;
  body!: string;
  date!: string;

  static get tableName() {
    return 'feedbacks';
  }
}

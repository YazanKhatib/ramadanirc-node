import { Model } from 'objection';

export class Notification extends Model {
  readonly id!: number;
  titleEnglish?: string;
  titleFrench?: string;
  bodyEnglish?: string;
  bodyFrench?: string;
  date!: string;

  static get tableName() {
    return 'notifications';
  }
}

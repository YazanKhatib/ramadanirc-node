import { Model } from 'objection';

export class Title extends Model {
  readonly id!: number;
  textEnglish?: string;
  textFrench?: string;
  date?: string;

  static get tableName() {
    return 'titles';
  }
}

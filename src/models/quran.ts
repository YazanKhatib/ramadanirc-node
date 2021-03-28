import { Model } from 'objection';
import { User } from './user';

export class QuranTracker extends Model {
  readonly id!: number;
  juz: number;
  surah: number;
  ayah: number;

  static get tableName() {
    return 'quran_tracker';
  }
  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'quran_tracker.userId',
          to: 'users.id',
        },
      },
    };
  }
}

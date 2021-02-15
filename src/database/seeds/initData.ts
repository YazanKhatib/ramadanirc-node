import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('prayers').del();
  await knex('tasks').del();
  // Inserts seed entries
  await knex('prayers').insert([
    { name: 'FAJR' },
    { name: 'DHUHR' },
    { name: 'ASR' },
    { name: 'MAGHRIB' },
    { name: 'ISHA' },
    { name: 'FAJR SUNNAH' },
    { name: 'DHUHR SUNNAH' },
    { name: 'ASR SUNNAH' },
    { name: 'MAGHRIB SUNNAH' },
    { name: 'ISHA SUNNAH' },
    { name: 'TARAWEEH' },
    { name: 'QIYAM' },
  ]);

  await knex('tasks').insert([
    { name: 'Smiled at someone', fixed: true },
    { name: 'Gave charity', fixed: true },
    { name: 'Learned something new', fixed: true },
    { name: 'Fed a hungry person', fixed: true },
    { name: 'Prayed in congregation', fixed: true },
    { name: 'Read my daily adhkaar', fixed: true },
    { name: 'Helped someone out', fixed: true },
    { name: 'Asked for forgiveness', fixed: true },
  ]);
}

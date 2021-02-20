import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('prayers').del();
  await knex('tasks').del();
  // Inserts seed entries
  await knex('prayers').insert([
    { name: 'FAJR', type: 'FARD' },
    { name: 'DHUHR', type: 'FARD' },
    { name: 'ASR', type: 'FARD' },
    { name: 'MAGHRIB', type: 'FARD' },
    { name: 'ISHA', type: 'FARD' },
    { name: 'SUNNAH', type: 'SUNNAH' },
    { name: 'SUNNAH', type: 'SUNNAH' },
    { name: 'SUNNAH', type: 'SUNNAH' },
    { name: 'SUNNAH', type: 'SUNNAH' },
    { name: 'SUNNAH', type: 'SUNNAH' },
    { name: 'TARAWEEH', type: 'TARAWEEH' },
    { name: 'QIYAM', type: 'QIYAM' },
  ]);

  await knex('tasks').insert([
    {
      name: 'Smiled at someone',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Gave charity',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Learned something new',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Fed a hungry person',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Prayed in congregation',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Read my daily adhkaar',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Helped someone out',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
    {
      name: 'Asked for forgiveness',
      fixed: true,
      selectedIcon: 'http://157.230.215.132/public/images/selected.svg',
      notSelectedIcon: 'http://157.230.215.132/public/images/notSelected.svg',
    },
  ]);

  await knex('tidbits').insert([
    {
      text:
        'one Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      text:
        'two Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      text:
        'three Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      text:
        'four Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      text:
        'five Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
  ]);
}

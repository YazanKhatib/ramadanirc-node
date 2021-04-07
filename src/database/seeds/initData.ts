import * as Knex from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('prayers').del();
  await knex('tasks').del();
  await knex('tidbits').del();
  await knex('duas').del();
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
      selectedIcon:
        'https://www.ircanada.info/public/images/smiled_at_someone_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/smiled_at_someone_not_selected.svg',
    },
    {
      name: 'Gave \n charity',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/give_charity_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/give_charity_not_selected.svg',
    },
    {
      name: 'Learned something new',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/learn_something_new_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/learn_something_new_not_selected.svg',
    },
    {
      name: 'Fed a\n hungry person',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/feed_person_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/feed_person_not_selected.svg',
    },
    {
      name: 'Prayed in congregation',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/prayed_in_congregation_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/prayed_in_congregation_not_selected.svg',
    },
    {
      name: 'Read my \ndaily adhkaar',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/read_daily_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/read_daily_not_selected.svg',
    },
    {
      name: 'Helped someone out',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/help_someone_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/help_someone_not_selected.svg',
    },
    {
      name: 'Asked for forgiveness',
      fixed: true,
      selectedIcon:
        'https://www.ircanada.info/public/images/asked_for_forgivness_selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/asked_for_forgivness_not_selected.svg',
    },
  ]);

  await knex('duas').insert([
    {
      textArabic:
        'أشْهَدُ أن لا إلهَ إلا الله نَسْتَغْفِرُ الله نسأَلُكَ الجنَّةَ ونَعُوذُ بِكَ مِنْ النَّار',
      textInbetween: '',
      textEnglish:
        'I testify that there is nothing worthy of worship other than Allah and we seek the forgiveness of Allah. We ask You for Paradise and take refuge in You from the Fire.',
    },
  ]);
}

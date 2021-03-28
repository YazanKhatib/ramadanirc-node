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
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Gave charity',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Learned something new',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Fed a hungry person',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Prayed in congregation',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Read my daily adhkaar',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Helped someone out',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
    {
      name: 'Asked for forgiveness',
      fixed: true,
      selectedIcon: 'https://www.ircanada.info/public/images/selected.svg',
      notSelectedIcon:
        'https://www.ircanada.info/public/images/notSelected.svg',
    },
  ]);

  await knex('tidbits').insert([
    {
      textEnglish:
        'one Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      textEnglish:
        'two Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      textEnglish:
        'three Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      textEnglish:
        'four Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
    },
    {
      textEnglish:
        'five Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.',
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
    {
      textArabic:
        'أشْهَدُ أن لا إلهَ إلا الله نَسْتَغْفِرُ الله نسأَلُكَ الجنَّةَ ونَعُوذُ بِكَ مِنْ النَّار',
      textInbetween: '',
      textEnglish:
        'I testify that there is nothing worthy of worship other than Allah and we seek the forgiveness of Allah. We ask You for Paradise and take refuge in You from the Fire.',
    },
    {
      textArabic:
        'أشْهَدُ أن لا إلهَ إلا الله نَسْتَغْفِرُ الله نسأَلُكَ الجنَّةَ ونَعُوذُ بِكَ مِنْ النَّار',
      textInbetween: '',
      textEnglish:
        'I testify that there is nothing worthy of worship other than Allah and we seek the forgiveness of Allah. We ask You for Paradise and take refuge in You from the Fire.',
    },
    {
      textArabic:
        'أشْهَدُ أن لا إلهَ إلا الله نَسْتَغْفِرُ الله نسأَلُكَ الجنَّةَ ونَعُوذُ بِكَ مِنْ النَّار',
      textInbetween: '',
      textEnglish:
        'I testify that there is nothing worthy of worship other than Allah and we seek the forgiveness of Allah. We ask You for Paradise and take refuge in You from the Fire.',
    },
    {
      textArabic:
        'أشْهَدُ أن لا إلهَ إلا الله نَسْتَغْفِرُ الله نسأَلُكَ الجنَّةَ ونَعُوذُ بِكَ مِنْ النَّار',
      textInbetween: '',
      textEnglish:
        'I testify that there is nothing worthy of worship other than Allah and we seek the forgiveness of Allah. We ask You for Paradise and take refuge in You from the Fire.',
    },
  ]);
}

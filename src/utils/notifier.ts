import schedule from 'node-schedule';
import { logger, sendMessage } from 'utils';
import { Notification, User } from 'models';
import moment from 'moment';

//TODO: messages text
const twoDaysInactivity = async () => {
  try {
    const date = new Date(Date.now());
    date.setDate(date.getDate() - 2);
    const data: any = await User.relatedQuery('activity')
      .where('notify', 'true')
      .andWhere('lastActivity', '<=', date.toISOString())
      .select(['registrationToken', 'language']);
    let title, body;
    await Promise.all(
      data.map(async (userData) => {
        if (userData.language === 'English') {
          title = '😢 We miss you.';
          body =
            '👋  Got a few minutes? Remember to track your progress to achieve your goals this month!';
        } else {
          title = '2 days inactivity title in French';
          body = '2 days inactivity body in French';
        }
        await sendMessage(userData.registrationToken, title, body);
      }),
    );
  } catch (error) {
    logger.error(error);
  }
};
const oneWeekQuranInactivity = async () => {
  try {
    const date = new Date(Date.now());
    date.setDate(date.getDate() - 7);
    const data: any = await User.relatedQuery('activity')
      .where('notify', 'true')
      .andWhere('quranActivity', '<=', date.toISOString())
      .select(['language', 'registrationToken']);
    let title, body;
    await Promise.all(
      data.map(async (userData) => {
        if (userData.language === 'English') {
          title = 'one week quran inactivity title in English';
          body = 'one week quran inactivity body in English';
        } else {
          title = 'one week quran inactivity title in French';
          body = 'one week quran inactivity body in French';
        }
        await sendMessage(userData.registrationToken, title, body);
      }),
    );
  } catch (error) {
    logger.error(error);
  }
};
const fiveTaskStreak = async () => {
  try {
    const date = moment();
    const users = await User.query();
    await Promise.all(
      users.map(async (user) => {
        const tasks = await user
          .$relatedQuery('tasks')
          .where('value', 'true')
          .andWhereRaw(`"createdAt"::Date = '${date.format('YYYY MM DD')}'`)
          .first();
        const prayers = await user
          .$relatedQuery('prayers')
          .where('selected', 'true')
          .andWhereRaw(`"prayedAt"::Date = '${date.format('YYYY MM DD')}'`)
          .first();
        const quran = await user
          .$relatedQuery('dailyQuran')
          .where('value', 'true')
          .andWhereRaw(`"readAt"::Date = '${date.format('YYYY MM DD')}'`)
          .first();
        if (tasks || prayers || quran) {
          const score: any = await user
            .$relatedQuery('activity')
            .select('trackerScore');
          const input: any = { trackerScore: score.trackerScore + 1 };
          await user.$relatedQuery('activity').patch(input);
          const newScore: any = await user
            .$relatedQuery('activity')
            .select('trackerScore');
          if (newScore.trackerScore === 5) {
            const newInput: any = { trackerScore: 0 };
            await user.$relatedQuery('activity').patch(newInput);
            let title, body;
            if (user.language === 'English') {
              title = '5 streak title in English';
              body = '5 streak body in English';
            } else {
              title = '5 streak title in French';
              body = '5 streak body in French';
            }
            if (user.notify === true)
              await sendMessage(user.registrationToken, title, body);
          }
        }
      }),
    );
  } catch (error) {
    logger.error(error.message);
  }
};
const scheduledNotification = async () => {
  const users = await User.query().where('notify', true);
  const today = moment();
  const notifications = await Notification.query().whereRaw(
    `"date"::Date = '${today.format('YYYY MM DD')}'`,
  );
  await Notification.query()
    .whereRaw(`"date"::Date = '${today.format('YYYY MM DD')}'`)
    .patch({ status: 'Sent' });
  let title, body;
  await Promise.all(
    notifications.map(async (notification) => {
      users.map(async (user) => {
        if (user.language === 'English') {
          title = notification.titleEnglish;
          body = notification.bodyEnglish;
        } else {
          title = notification.titleFrench;
          body = notification.bodyFrench;
        }
        await sendMessage(user.registrationToken, title, body);
      });
    }),
  );
};
export const notificationStarter = async () => {
  try {
    schedule.scheduleJob('0 */4 * * *', scheduledNotification);
    schedule.scheduleJob('0 */4 * * *', twoDaysInactivity);
    schedule.scheduleJob('0 */4 * * *', oneWeekQuranInactivity);
    schedule.scheduleJob('0 */4 * * *', fiveTaskStreak);
  } catch (error) {
    logger.error(error.message);
    logger.error("notifcation cron jobs could'nt be started");
  }
};

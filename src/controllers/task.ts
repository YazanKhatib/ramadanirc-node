import { Task, User } from 'models';
import { Response, Request, NextFunction } from 'express';
import { checkToken, logger } from 'utils';
import objection from 'objection';
import moment from 'moment';
import { SQLWhereClause } from 'utils';
//ADMIN
//=======
export const getTask = async (req: Request, res: Response) => {
  const id = req.params.id;
  let tasks;

  if (id) {
    tasks = await Task.query().findById(id);
    if (!tasks) return res.status(400).send({ message: "Task don't exist" });
  } else
    tasks = await Task.query()
      .where('endDate', '>', moment().toISOString())
      .orWhere('endDate', null)
      .orderBy('id');

  if (tasks.length != 0) return res.send({ tasks: tasks });
  else return res.send({ message: 'no tasks exists' });
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const { name, nameFrench, fixed, selectedIcon, notSelectedIcon } = req.body;
    let task = await Task.query().findOne('name', name);
    if (task) {
      await Task.query().findById(task.id).patch({
        endDate: null,
      });
    } else {
      await Task.query().insert({
        name: name,
        nameFrench,
        fixed: fixed,
        selectedIcon: selectedIcon,
        notSelectedIcon: notSelectedIcon,
      });
    }
    task = await Task.query().findOne('name', name);
    return res.status(201).send({ success: 'Task had been added', task: task });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.ValidationError)
      res.status(400).send({ message: 'Task name is required' });
    else if (error instanceof objection.UniqueViolationError)
      res.status(400).send({ message: 'Task name must be unique' });
    else if (error instanceof objection.NotNullViolationError)
      res.status(400).send({ message: `${error.column} is required` });
    else res.status(400).send({ message: error.name });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const task = await Task.query().findById(+id);
    if (!task) return res.status(400).send({ message: "task don't exist" });
    await Task.query().findById(id).patch({
      endDate: moment().toISOString(),
    });
    res.send({ success: 'Task has been removed.', task: task });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id, name, nameFrench, fixed, selectedIcon, notSelectedIcon } =
      req.body;
    await Task.query().findById(id).patch({
      name: name,
      nameFrench,
      fixed: fixed,
      selectedIcon,
      notSelectedIcon,
    });
    const task = await Task.query().findById(id);
    return res.send({ success: 'Task has been modified.', task: task });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      res.status(400).send({ message: 'Task name must be unique' });
    if (error instanceof objection.NotNullViolationError)
      res.status(400).send({ message: `${error.column} is required` });
    else res.status(400).send({ message: error.name });
  }
};

//USER FUNC
export const fillTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.header('accessToken');
  const data = await checkToken(accessToken);
  const user = await User.query().findById(data.id);
  const { value } = req.body;
  const date = moment(value).utcOffset(value);
  const tasks = await user
    .$relatedQuery('tasks')
    .whereRaw(
      SQLWhereClause('createdAt', user.timezone, date.format('YYYY MM DD')),
    );
  const allTasks = await Task.query();
  if (allTasks.length !== tasks.length) {
    await Promise.all(
      allTasks.map(async (task: Task) => {
        const tempTask = await user
          .$relatedQuery('tasks')
          .findById(task.id)
          .whereRaw(
            SQLWhereClause(
              'createdAt',
              user.timezone,
              date.format('YYYY MM DD'),
            ),
          );
        if (!tempTask) {
          const input: any = {
            id: task.id,
            createdAt: date.toISOString(),
          };
          await user.$relatedQuery('tasks').relate(input);
        }
      }),
    );
  }
  next();
};
export const userTasks = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { value } = req.body;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const date = moment(value).utcOffset(value);

    const tasks = await user
      .$relatedQuery('tasks')
      .whereRaw(
        SQLWhereClause('createdAt', user.timezone, date.format('YYYY MM DD')),
      )
      .orderBy('id');
    res.send({ tasks: tasks });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const checkTasks = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { tasks, date } = req.body;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    await Promise.all(
      tasks.map(async (task) => {
        await checkTask(task, user, date);
      }),
    );
    res.send({ success: 'Tasks had been updated', tasks: tasks });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
const checkTask = async (singleTask, user, date) => {
  const { id, value } = singleTask;
  const today = moment(date).utcOffset(date);
  let task = await user
    .$relatedQuery('tasks')
    .findById(id)
    .whereRaw(
      SQLWhereClause('createdAt', user.timezone, today.format('YYYY MM DD')),
    );
  let input: any;
  if (!task) {
    input = {
      id: id,
      value: value,
      createdAt: today.toISOString(),
    };
    await user.$relatedQuery('tasks').relate(input);
  } else {
    input = { value: value };
    const knex = User.knex();
    await knex.raw(
      `update users_tasks SET value =${value} where ${SQLWhereClause(
        'createdAt',
        user.timezone,
        today.format('YYYY MM DD'),
      )} and "taskId" = ${id} and "userId" = ${user.id}`,
    );
  }
  task = await user
    .$relatedQuery('tasks')
    .findById(id)
    .whereRaw(
      SQLWhereClause('createdAt', user.timezone, today.format('YYYY MM DD')),
    );
};

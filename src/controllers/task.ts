import { Task, User } from 'models';
import { Response, Request } from 'express';
import { checkToken, logger } from 'utils';
import objection from 'objection';

export const getTask = async (req: Request, res: Response) => {
  const id = req.params.id;
  let tasks;

  if (id) {
    tasks = await Task.query().findById(id);
    if (!tasks) return res.status(400).send({ message: "Task don't exist" });
  } else
    tasks = await Task.query()
      .where('endDate', '>', new Date(Date.now()).toISOString())
      .orWhere('endDate', null);

  if (tasks.length != 0) return res.send({ tasks: tasks });
  else return res.send({ message: 'no tasks exists' });
};

export const addTask = async (req: Request, res: Response) => {
  try {
    const { name, fixed } = req.body;
    const task = await Task.query().findOne('name', name);
    if (task) {
      await Task.query().findById(task.id).patch({
        endDate: null,
      });
    } else {
      await Task.query().insert({
        name: name,
        fixed: fixed,
      });
    }
    return res.status(201).send({ success: 'task had been added' });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.ValidationError)
      res.status(400).send({ message: 'task name is required' });
    else if (error instanceof objection.UniqueViolationError)
      res.status(400).send({ message: 'task name must be unique' });
    else if (error instanceof objection.NotNullViolationError)
      res.status(400).send({ message: `${error.column} is required` });
    else res.status(400).send({ message: error.name });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const task = Task.query().findById(+id);
    if (!task) return res.status(400).send({ message: "task don't exist" });
    await Task.query()
      .findById(id)
      .patch({
        endDate: new Date(Date.now()).toISOString(),
      });
    res.send({ success: 'task has been removed.' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id, name, fixed } = req.body;
    await Task.query().findById(id).patch({
      name: name,
      fixed: fixed,
    });
    return res.send({ success: 'task has been modified.' });
  } catch (error) {
    logger.error(error);
    if (error instanceof objection.UniqueViolationError)
      res.status(400).send({ message: 'task name must be unique' });
    if (error instanceof objection.NotNullViolationError)
      res.status(400).send({ message: `${error.column} is required` });
    else res.status(400).send({ message: error.name });
  }
};

export const userTasks = async (req: Request, res: Response) => {
  const accessToken = req.header('accessToken');
  const { type, value } = req.body;
  const data = await checkToken(accessToken);
  const user = User.query().findById(data.id);
  let tasks;
  const date = new Date(value);
  if (type === 'day')
    tasks = await (await user)
      .$relatedQuery('tasks')
      .whereRaw(`EXTRACT(DAY FROM "createdAt") = ${date.getUTCDate()}`)
      .andWhereRaw(
        `EXTRACT(MONTH FROM "createdAt") = ${date.getUTCMonth() + 1}`,
      )
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`);

  if (type === 'month')
    tasks = await (await user)
      .$relatedQuery('tasks')
      .whereRaw(`EXTRACT(MONTH FROM "createdAt") = ${date.getUTCMonth() + 1}`)
      .andWhereRaw(`EXTRACT(YEAR FROM "createdAt") = ${date.getUTCFullYear()}`);
  res.send({ tasks: tasks });
};
export const checkTask = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'id is required' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const input: any = {
      id: id,
      value: true,
      createdAt: new Date(Date.now()).toISOString(),
    };
    await user.$relatedQuery('tasks').relate(input);
    return res.send({ success: 'task has been checked.' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

import { Request, Response } from 'express';
import { Tidbit, User } from 'models';
import Objection from 'objection';
import { checkToken, logger } from 'utils';

//ADMIN CRUD
//===========
export const getTidbits = async (req: Request, res: Response) => {
  try {
    const tidbits = await Tidbit.query();
    return res.send({ tidbits: tidbits });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
export const deleteTidbit = async (req: Request, res: Response) => {
  try {
    const tidbitId = req.params.id;
    if (!tidbitId || tidbitId === '')
      return res.status(400).send({ message: 'id must be provided' });
    const tidbit = await Tidbit.query().findById(tidbitId);
    await Tidbit.query().deleteById(tidbitId);

    return res.send({ success: 'Tidbit has been deleted', tidbit: tidbit });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const addTidbit = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || text === '')
      return res.status(400).send({ message: 'Tidbit text must be provided' });
    const tidbit = await Tidbit.query().insertAndFetch({ text });
    return res.send({ success: 'Tidbit has been added', tidbit: tidbit });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.mesage });
  }
};

export const updateTidbit = async (req: Request, res: Response) => {
  try {
    const { id, text } = req.body;
    if (!id || id === '' || !text || text === '')
      return res.status(400).send({ message: 'id and text must be provided' });
    const tidbit = await Tidbit.query().patchAndFetchById(id, { text });
    return res.send({ success: 'Tidbit has been updated', tidbit: tidbit });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

//USER FUNC
//==========

export const getUserTidbits = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const tidbits: any = await Tidbit.query();
    await Promise.all(
      tidbits.map(async (tidbit) => {
        const tempTidbit = await user
          .$relatedQuery('tidbits')
          .findById(tidbit.id);
        if (tempTidbit) tidbit.isFavorite = true;
        else tidbit.isFavorite = false;
      }),
    );
    return res.send({ tidbits: tidbits });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};
//GET FAVORAITE TIDBIT
export const getFavoriteTidbit = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const favoriteTidbits = await user.$relatedQuery('tidbits');
    return res.send({ favorites: favoriteTidbits });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

//ADD TO FAVORITE TIDBITS
export const addFavoriteTidbit = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'tidbit Id must be provided' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    let tidbit = await user.$relatedQuery('tidbits').findById(id);
    if (!tidbit) await user.$relatedQuery('tidbits').relate(id);
    tidbit = await user.$relatedQuery('tidbits').findById(id);
    return res.send({
      success: 'tidbit has been added to favorites',
      tidbit: tidbit,
    });
  } catch (error) {
    logger.error(error);
    if (error instanceof Objection.ForeignKeyViolationError)
      return res.status(400).send({ message: "id doesn't exist " });
    return res.status(400).send({ message: error.message });
  }
};

//REMOVE FROM FAVORITE TIDBITS
export const removeFavoriteTidbit = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const tidbitId = req.params.id;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const tidbit = await user
      .$relatedQuery('tidbits')
      .where('id', tidbitId)
      .first();
    await user.$relatedQuery('tidbits').unrelate().where('id', tidbitId);
    return res.send({
      success: 'Tidbit removed from favorites',
      tidbit: tidbit,
    });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

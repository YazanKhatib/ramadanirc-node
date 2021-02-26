import { Request, Response } from 'express';
import { Dua, User } from 'models';
import { checkToken, logger } from 'utils';
import Objection from 'objection';

//ADMIN CRUD

export const getDuas = async (req: Request, res: Response) => {
  try {
    const duas = await Dua.query();
    return res.send({ duas: duas });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const deleteDua = async (req: Request, res: Response) => {
  try {
    const duaId = req.params.id;
    if (!duaId || duaId === '')
      return res.status(400).send({ message: 'id must be provided' });
    await Dua.query().deleteById(duaId);
    return res.send({ success: 'Dua has been deleted' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const addDua = async (req: Request, res: Response) => {
  try {
    const { textArabic, textInbetween, textEnglish } = req.body;
    if (textArabic === '' || textInbetween === '' || textEnglish === '')
      return res
        .status(400)
        .send({ message: "all Dua' text must be provided" });
    await Dua.query().insert({ textArabic, textInbetween, textEnglish });
    return res.send({ success: 'Dua has been added' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.mesage });
  }
};

export const updateDua = async (req: Request, res: Response) => {
  try {
    const { id, textArabic, textInbetween, textEnglish } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'id must be provided' });
    await Dua.query()
      .findById(id)
      .patch({ textArabic, textInbetween, textEnglish });
    return res.send({ success: 'Dua has been updated' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

//USER FUNC
//=========
//GET USER DUA WITH FAVORIATE
export const getUserDuas = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const duas: any = await Dua.query();
    await Promise.all(
      duas.map(async (dua) => {
        const tempDua = await user.$relatedQuery('duas').findById(dua.id);
        if (tempDua) dua.isFavorite = true;
        else dua.isFavorite = false;
      }),
    );
    return res.send({ duas: duas });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

//GET FAVORAITE DUA
export const getFavoriteDua = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const favoriateDuas = await user.$relatedQuery('duas');
    if (favoriateDuas.length === 0)
      return res.send({ message: 'no favorite Dua yet.' });
    return res.send({ favorites: favoriateDuas });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

//ADD FAVRAITE DUA
export const addFavoriteDua = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const { id } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'Dua Id must be provided' });
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    const Dua = await user.$relatedQuery('duas').findById(id);
    if (!Dua) await user.$relatedQuery('duas').relate(id);
    return res.send({ success: 'dua has been added to favorites' });
  } catch (error) {
    logger.error(error);
    if (error instanceof Objection.ForeignKeyViolationError)
      return res.status(400).send({ message: "id doesn't exist " });
    return res.status(400).send({ message: error.message });
  }
};

//REMOVE FROM FAVORITE TIDBITS
export const removeFavoriteDua = async (req: Request, res: Response) => {
  try {
    const accessToken = req.header('accessToken');
    const duaId = req.params.id;
    const data = await checkToken(accessToken);
    const user = await User.query().findById(data.id);
    await user.$relatedQuery('duas').unrelate().where('id', duaId);
    return res.send({ success: 'Dua is removed from favorites' });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

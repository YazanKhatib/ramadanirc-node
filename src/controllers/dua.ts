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
      return res.status(400).send({ message: 'Id must be provided' });
    const dua = await Dua.query().findById(duaId);
    await Dua.query().deleteById(duaId);
    return res.send({ success: 'Dua has been deleted', dua: dua });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

export const addDua = async (req: Request, res: Response) => {
  try {
    const { textArabic, textInbetween, textEnglish, textFrench } = req.body;
    if (
      textArabic === '' ||
      textInbetween === '' ||
      textEnglish === '' ||
      textFrench === ''
    )
      return res.status(400).send({ message: "Dua's text must be provided" });
    const dua = await Dua.query().insertAndFetch({
      textArabic,
      textInbetween,
      textEnglish,
      textFrench,
    });
    return res.send({ success: 'Dua has been added', dua: dua });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.mesage });
  }
};

export const updateDua = async (req: Request, res: Response) => {
  try {
    const { id, textArabic, textInbetween, textEnglish, textFrench } = req.body;
    if (!id || id === '')
      return res.status(400).send({ message: 'Id must be provided' });
    const dua = await Dua.query().patchAndFetchById(id, {
      textArabic,
      textInbetween,
      textEnglish,
      textFrench,
    });
    return res.send({ success: 'Dua has been updated', dua: dua });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    let Dua = await user.$relatedQuery('duas').findById(id);
    if (!Dua) await user.$relatedQuery('duas').relate(id);
    Dua = await user.$relatedQuery('duas').findById(id);
    return res.send({ success: 'Dua has been added to favorites', dua: Dua });
  } catch (error) {
    logger.error(error);
    if (error instanceof Objection.ForeignKeyViolationError)
      return res.status(400).send({ message: "Id doesn't exist " });
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
    const dua = await user.$relatedQuery('duas').where('id', duaId).first();
    await user.$relatedQuery('duas').unrelate().where('id', duaId);
    return res.send({ success: 'Dua is removed from favorites', dua: dua });
  } catch (error) {
    logger.error(error);
    return res.status(400).send({ message: error.message });
  }
};

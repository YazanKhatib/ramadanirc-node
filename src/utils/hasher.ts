import bcrypt from 'bcrypt';

export const hashedPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const checkPassword = async (password: string, hash: string) => {
  const valid = await bcrypt.compare(password, hash);
  return valid;
};

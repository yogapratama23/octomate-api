import * as bcrypt from 'bcrypt';

export const hashPassword = async (passwordString: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(passwordString, salt);
};

export const checkPassword = async (
  passwordString: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(passwordString, passwordHash);
};

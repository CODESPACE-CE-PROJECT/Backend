export enum ValidateType {
  NOTEXIST = 'NOTEXIST',
  EXIST = 'EXIST',
  DUPLICATE = 'DUPLICATE',
}

export interface IFileFormat {
  studentId: string;
  firstname: string;
  lastname: string;
  gender: string;
  username: string;
  password: string;
  email: string | undefined;
  role: string;
  validType: ValidateType;
}

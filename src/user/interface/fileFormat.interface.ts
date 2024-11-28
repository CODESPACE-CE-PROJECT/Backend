interface IFileFormat {
  studentId: string;
  firstname: string;
  lastname: string;
  gender: 'male' | 'female' | 'other';
  username: string;
  password: string;
  emil: string | undefined;
  role: 'teacher' | 'student';
}

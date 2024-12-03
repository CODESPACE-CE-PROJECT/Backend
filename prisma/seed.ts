import { Gender, PackageType, PrismaClient, Role } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.create({
    data: {
      schoolName: 'ADMIN',
      package: PackageType.PREMIUM,
      address: '1 ซอย ฉลองกรุง 1',
      subDistrict: 'ลาดกระบัง',
      district: 'ลาดกระบัง',
      province: 'กรุงเทพมหานคร',
      postCode: '10520',
    },
  });
  const salt = await bcrypt.genSalt();
  const password = await bcrypt.hash(process.env.ADMIN_PASS as string, salt);

  await prisma.users.create({
    data: {
      username: process.env.ADMIN_USERNAME as string,
      hashedPassword: password,
      firstName: 'ADMIN',
      lastName: 'ADMIN',
      gender: Gender.MALE,
      role: Role.ADMIN,
      schoolId: school.schoolId,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IRequest } from 'src/auth/interface/request.interface';
import generator from 'generate-password-ts';

@Injectable()
export class UtilsService {
  async checkPermissionRole(req: IRequest, expectRole: Role[]) {
    try {
      const isPermit = expectRole.map((role) =>
        req.user.role !== role ? role : null,
      );
      if (!isPermit.includes(null)) {
        return `Do Not Have Permission (${isPermit.concat()})`;
      }
    } catch (error) {
      throw new Error('Error Check Permission Role');
    }
  }

  async generatePassword() {
    try {
      const password = generator.generate({
        length: 12,
        numbers: true,
        uppercase: true,
      });
      return password;
    } catch (error) {
      throw new Error('Error Generate Password');
    }
  }
}

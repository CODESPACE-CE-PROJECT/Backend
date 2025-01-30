import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadFileDTO } from './dto/uploadFile.dto';

@ApiBearerAuth()
@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiOperation({ summary: 'uploadPDFFile (Student, Teacher, Admin)' })
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: uploadFileDTO })
  @UseInterceptors(FileInterceptor('file'))
  @Post('pdf')
  async uploadPDFFile(@UploadedFile() file: Express.Multer.File) {
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = ['application/pdf'];

      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds the 10MB limit');
      }

      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only PDF are allowed',
        );
      }
    }
    const pdf = await this.fileService.uploadFile(file, 'pdf');

    return {
      message: 'Successfully Upload FDF File',
      fileUrl: pdf.fileUrl,
    };
  }

  @ApiOperation({ summary: 'uploadLexicalFile (Student, Teacher, Admin)' })
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: uploadFileDTO })
  @UseInterceptors(FileInterceptor('file'))
  @Post('image')
  async uploadImageFile(@UploadedFile() file: Express.Multer.File) {
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (file.size > maxSize) {
        throw new BadRequestException('File size exceeds the 10MB limit');
      }

      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG PNG are allowed',
        );
      }
    }
    const image = await this.fileService.uploadFile(file, 'lexical-picture');

    return {
      message: 'Successfully Upload Image Lexical File',
      imageUrl: image.fileUrl,
    };
  }
}

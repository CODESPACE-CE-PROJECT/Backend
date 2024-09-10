import { ApiProperty } from "@nestjs/swagger";

export class CreateSchoolDTO {
  @ApiProperty()
  schoolName: string;
}

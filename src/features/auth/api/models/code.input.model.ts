import { IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CodeInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  code: string;
}

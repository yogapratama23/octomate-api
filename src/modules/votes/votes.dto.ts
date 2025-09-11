import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVoteDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  description: string;

  options: string[];
}

export class CastVoteDto {
  @IsNotEmpty()
  name: string;
}

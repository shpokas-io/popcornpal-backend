import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  release_date?: Date;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}

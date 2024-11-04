import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
export class CreateMovieDto {
  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsDateString()
  release_date?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  genre?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}

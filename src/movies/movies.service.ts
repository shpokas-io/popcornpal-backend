import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllMovies() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('movies').select('*');

    if (error) {
      throw new HttpException(
        'Failed to fetch movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const supabase = this.supabaseService.getClient();
    if (createMovieDto.release_date) {
      createMovieDto.release_date = new Date(
        createMovieDto.release_date,
      ).toISOString();
    }

    const { data, error } = await supabase
      .from('movies')
      .insert([createMovieDto])
      .single();

    if (error) {
      throw new HttpException(
        'Failed to create movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  async updateMovie(id: string, updateMovieDto: UpdateMovieDto) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('movies')
      .update(updateMovieDto)
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException(
        'Failed to update movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  async deleteMovie(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException(
        'Failed to delete movie',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }
}

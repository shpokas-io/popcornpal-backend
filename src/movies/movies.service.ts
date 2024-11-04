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

  async addFavorite(userId: string, movieId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();

    if (existingFavorite) {
      throw new HttpException(
        'Movie is already in favorites',
        HttpStatus.CONFLICT,
      );
    }
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, movie_id: movieId })
      .single();

    if (error) {
      throw new HttpException(
        'Failed to add favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Movie added to favorites', data };
  }

  async getFavorites(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('favorites')
      .select('movie_id, movies(*)')
      .eq('user_id', userId);

    if (error) {
      throw new HttpException(
        'Failed to retrieve favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data.map((favorites) => favorites.movies);
  }
}

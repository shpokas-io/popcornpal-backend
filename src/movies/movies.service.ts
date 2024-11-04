import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

interface Movie {
  id: string;
  title: string;
  description: string;
  release_date: string;
  genre: string;
  rating: number;
}

interface Favorite {
  user_id: string;
  movie_id: string;
}

@Injectable()
export class MoviesService {
  private readonly supabase = this.supabaseService.getClient();

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllMovies(): Promise<Movie[]> {
    const { data, error } = await this.supabase.from('movies').select('*');

    if (error) {
      throw new HttpException(
        'Failed to fetch movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data;
  }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
      .from('movies')
      .update(updateMovieDto)
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException('Failed to update movie', HttpStatus.NOT_FOUND);
    }
    return data;
  }

  async deleteMovie(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .single();

    if (error) {
      throw new HttpException('Failed to delete movie', HttpStatus.NOT_FOUND);
    }
    return { message: 'Movie deleted successfully' };
  }

  async addFavorite(
    userId: string,
    movieId: string,
  ): Promise<{ message: string }> {
    const { data: existingFavorite } = await this.supabase
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
    const { error } = await this.supabase
      .from('favorites')
      .insert({ user_id: userId, movie_id: movieId })
      .single();

    if (error) {
      throw new HttpException(
        'Failed to add favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Movie added to favorites' };
  }

  async getFavorites(userId: string): Promise<Movie[]> {
    const { data, error } = await this.supabase
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

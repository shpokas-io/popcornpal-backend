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
  poster_url: string;
}

@Injectable()
export class MoviesService {
  private readonly supabase = this.supabaseService.getClient();
  favoriteRepository: any;

  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllMovies(): Promise<Movie[]> {
    const { data, error } = await this.supabase.from('movies').select('*');

    if (error) {
      throw new HttpException(
        'Failed to fetch movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data as Movie[];
  }

  async searchMovies({
    title,
    genre,
    release_year,
    description,
  }: {
    title?: string;
    genre?: string;
    release_year?: string;
    description?: string;
  }): Promise<Movie[]> {
    let query = this.supabase.from('movies').select('*');

    if (title) {
      query = query.ilike('title', `%${title}%`);
    }
    if (genre) {
      query = query.ilike('genre', `%${genre}%`);
    }
    if (release_year) {
      query = query.ilike('release_date', `${release_year}-%`);
    }
    if (description) {
      query = query.ilike('description', `%${description}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw new HttpException(
        'Failed to perform search',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data as Movie[];
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
    return data as Movie;
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
    return data as Movie;
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

  async removeFavorite(userId: string, movieId: string): Promise<void> {
    const { data: favorite, error } = await this.supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();

    if (!favorite || error) {
      throw new HttpException('Favorite not found', HttpStatus.NOT_FOUND);
    }

    const { error: deleteError } = await this.supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (deleteError) {
      throw new HttpException(
        'Failed to delete favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      .select('movies(*)')
      .eq('user_id', userId);

    if (error) {
      throw new HttpException(
        'Failed to retrieve favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return data.map((favorite) => favorite.movies as unknown as Movie);
  }
}

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

  constructor(private readonly supabaseService: SupabaseService) {}

  async populateMovies() {
    const omdbApiKey = process.env.OMDB_API_KEY;
    const movieTitles = [
      'Inception',
      'Interstellar',
      'The Dark Knight',
      'Pulp Fiction',
      'The Matrix',
      'Fight Club',
      'Forrest Gump',
      'The Shawshank Redemption',
      'The Godfather',
      'The Lord of the Rings',
      'The Social Network',
      'Gladiator',
      'Joker',
      'Toy Story',
      'Shrek',
      'Titanic',
      'Star Wars',
      'The Lion King',
      'Back to the Future',
      'The Silence of the Lambs',
    ];

    for (const title of movieTitles) {
      try {
        const response = await fetch(
          `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbApiKey}`,
        );
        const movieData = await response.json();

        if (movieData.Response === 'False') {
          console.warn(`Movie not found: ${title}`);
          continue;
        }

        const movie = {
          title: movieData.Title,
          description: movieData.Plot,
          release_date: movieData.Released,
          genre: movieData.Genre,
          rating: parseFloat(movieData.imdbRating) || 0,
          poster_url: movieData.Poster,
        };

        const { error } = await this.supabase.from('movies').insert([movie]);
        if (error) {
          console.error(`Failed to insert movie ${title}:`, error);
        }
      } catch (error) {
        console.error(`Error fetching movie ${title}:`, error);
      }
    }
  }

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

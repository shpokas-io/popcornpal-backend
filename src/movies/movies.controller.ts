import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getAllMovies(): Promise<any> {
    const movies = await this.moviesService.getAllMovies();
    return { message: 'Movies retrieved successfully', data: movies };
  }

  @Get('search')
  async searchMovies(
    @Query('title') title?: string,
    @Query('genre') genre?: string,
    @Query('release_year') release_year?: string,
    @Query('description') description?: string,
  ): Promise<any> {
    const movies = await this.moviesService.searchMovies({
      title,
      genre,
      release_year,
      description,
    });
    return { message: 'Search results', data: movies };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createMovie(@Body() createMovieDto: CreateMovieDto): Promise<any> {
    try {
      const movie = await this.moviesService.createMovie(createMovieDto);
      return { message: 'Movie created successfully', data: movie };
    } catch {
      throw new HttpException('Failed to create movie', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMovie(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<any> {
    try {
      const updatedMovie = await this.moviesService.updateMovie(
        id,
        updateMovieDto,
      );
      return { message: 'Movie updated successfully', data: updatedMovie };
    } catch {
      throw new HttpException('Failed to update movie', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMovie(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.moviesService.deleteMovie(id);
      return { message: 'Movie deleted successfully' };
    } catch {
      throw new HttpException('Failed to delete movie', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@Param('id', ParseUUIDPipe) movieId: string, @Req() req) {
    try {
      const userId = req.user.userId;
      await this.moviesService.addFavorite(userId, movieId);
      return { message: 'Movie added to favorites' };
    } catch {
      throw new HttpException(
        'Failed to add to favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(
    @Param('id', ParseUUIDPipe) movieId: string,
    @Req() req,
  ) {
    try {
      const userId = req.user.userId;
      await this.moviesService.removeFavorite(userId, movieId);
      return { message: 'Movie removed from favorites' };
    } catch {
      throw new HttpException(
        'Failed to remove from favorites',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/favorites')
  async getFavorites(@Req() req): Promise<any> {
    try {
      const userId = req.user.userId;
      const favorites = await this.moviesService.getFavorites(userId);
      return { message: 'Favorites retrieved successfully', data: favorites };
    } catch {
      throw new HttpException(
        'Failed to retrieve favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

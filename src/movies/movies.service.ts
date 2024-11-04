import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MoviesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMovies() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('movies').select('*');

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}

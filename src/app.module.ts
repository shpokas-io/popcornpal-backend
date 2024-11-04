import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MoviesModule, SupabaseModule, AuthModule],
})
export class AppModule {}

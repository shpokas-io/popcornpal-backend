import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { MoviesModule } from './movies/movies.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
  imports: [MoviesModule, SupabaseModule, AuthModule],
})
export class AppModule {}

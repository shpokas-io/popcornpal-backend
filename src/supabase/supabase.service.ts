import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseService.name);

  constructor() {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      this.logger.error(
        'Supabase URL or Key is missing in environment variables',
      );
      throw new Error('Supabase configuration error: URL or Key missing');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}

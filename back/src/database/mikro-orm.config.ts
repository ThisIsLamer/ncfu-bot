import { defineConfig } from '@mikro-orm/mariadb';
import { GLOBAL_CONFIG } from '#src/config.js';

import { Migrator } from '@mikro-orm/migrations';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { Event } from '#src/modules/v1/event/event.entity.js';
import { EventType } from '#src/modules/v1/event/event-type.entity.js';
import { EventRegistration } from '#src/modules/v1/event/event-registration.entity.js';
import { User } from '#src/modules/v1/user/user.entity.js';
import { Institute } from '#src/modules/v1/institute/institute.entity.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  clientUrl: GLOBAL_CONFIG.DATABASE.SQL.URL,
  entities: [Event, EventType, EventRegistration, User, Institute],
  debug: GLOBAL_CONFIG.DATABASE.LOGGING,
  extensions: [Migrator],
  migrations: {
    path: path.join(__dirname, 'migrations'),
  },
});

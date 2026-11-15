import * as migration_20261115_202647_initial_schema from './20261115_202647_initial_schema';
import * as migration_20261115_203959_school_address_defaults from './20261115_203959_school_address_defaults';

export const migrations = [
  {
    up: migration_20261115_202647_initial_schema.up,
    down: migration_20261115_202647_initial_schema.down,
    name: '20261115_202647_initial_schema',
  },
  {
    up: migration_20261115_203959_school_address_defaults.up,
    down: migration_20261115_203959_school_address_defaults.down,
    name: '20261115_203959_school_address_defaults'
  },
];

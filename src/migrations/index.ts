import * as migration_20261115_202647_initial_schema from './20261115_202647_initial_schema';
import * as migration_20261115_203959_school_address_defaults from './20261115_203959_school_address_defaults';
import * as migration_20261115_204405_teaching_and_quotes from './20261115_204405_teaching_and_quotes';
import * as migration_20261115_210838_payments from './20261115_210838_payments';

export const migrations = [
  {
    up: migration_20261115_202647_initial_schema.up,
    down: migration_20261115_202647_initial_schema.down,
    name: '20261115_202647_initial_schema',
  },
  {
    up: migration_20261115_203959_school_address_defaults.up,
    down: migration_20261115_203959_school_address_defaults.down,
    name: '20261115_203959_school_address_defaults',
  },
  {
    up: migration_20261115_204405_teaching_and_quotes.up,
    down: migration_20261115_204405_teaching_and_quotes.down,
    name: '20261115_204405_teaching_and_quotes',
  },
  {
    up: migration_20261115_210838_payments.up,
    down: migration_20261115_210838_payments.down,
    name: '20261115_210838_payments'
  },
];

import * as migration_20261115_202647_initial_schema from './20261115_202647_initial_schema';
import * as migration_20261115_203959_school_address_defaults from './20261115_203959_school_address_defaults';
import * as migration_20261115_204405_teaching_and_quotes from './20261115_204405_teaching_and_quotes';
import * as migration_20261115_210838_payments from './20261115_210838_payments';
import * as migration_20261115_211930_videos from './20261115_211930_videos';
import * as migration_20261115_213221_remove_cost_text from './20261115_213221_remove_cost_text';
import * as migration_20261115_213224_fees from './20261115_213224_fees';
import * as migration_20261115_214136_travel_and_social from './20261115_214136_travel_and_social';
import * as migration_20261115_215556_documents from './20261115_215556_documents';
import * as migration_20261115_221112_page_wording from './20261115_221112_page_wording';
import * as migration_20261115_221818_event_photos from './20261115_221818_event_photos';

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
    name: '20261115_210838_payments',
  },
  {
    up: migration_20261115_211930_videos.up,
    down: migration_20261115_211930_videos.down,
    name: '20261115_211930_videos',
  },
  {
    up: migration_20261115_213221_remove_cost_text.up,
    down: migration_20261115_213221_remove_cost_text.down,
    name: '20261115_213221_remove_cost_text',
  },
  {
    up: migration_20261115_213224_fees.up,
    down: migration_20261115_213224_fees.down,
    name: '20261115_213224_fees',
  },
  {
    up: migration_20261115_214136_travel_and_social.up,
    down: migration_20261115_214136_travel_and_social.down,
    name: '20261115_214136_travel_and_social',
  },
  {
    up: migration_20261115_215556_documents.up,
    down: migration_20261115_215556_documents.down,
    name: '20261115_215556_documents',
  },
  {
    up: migration_20261115_221112_page_wording.up,
    down: migration_20261115_221112_page_wording.down,
    name: '20261115_221112_page_wording',
  },
  {
    up: migration_20261115_221818_event_photos.up,
    down: migration_20261115_221818_event_photos.down,
    name: '20261115_221818_event_photos'
  },
];

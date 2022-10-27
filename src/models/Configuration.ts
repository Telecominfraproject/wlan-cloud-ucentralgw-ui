import { Note } from './Note';

export interface Configuration {
  name: string;
  description: string;
  id: string;
  inUse: string[];
  notes: Note[];
  entity: string;
  venue: string;
}

interface ConfigurationNestedForm {
  isDirty: boolean;
  isValid: boolean;
}

export interface ConfigurationNestedProps {
  __form: ConfigurationNestedForm;
  data: Configuration[];
}

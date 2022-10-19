/* eslint-disable import/prefer-default-export */
import { testJson } from 'helpers/formTests';
import * as Yup from 'yup';

export const DefaultConfigurationSchema = (t: (str: string) => string) =>
  Yup.object()
    .shape({
      name: Yup.string().required(t('form.required')),
      description: Yup.string(),
      modelIds: Yup.array().of(Yup.string()).required(t('form.required')).min(1, t('form.required')),
      configuration: Yup.string()
        .required(t('form.required'))
        .test('configuration', t('form.invalid_json'), (v) => testJson(v ?? '')),
    })
    .default({
      name: '',
      description: '',
      modelIds: [],
      configuration: '',
    });

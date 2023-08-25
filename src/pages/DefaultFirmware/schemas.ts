import * as Yup from 'yup';

export const DefaultFirmwareSchema = (t: (str: string) => string) =>
  Yup.object()
    .shape({
      deviceType: Yup.string().required(t('form.required')),
      description: Yup.string(),
      uri: Yup.string().required(t('form.required')),
      revision: Yup.string().required(t('form.required')),
      imageCreationDate: Yup.date().required(t('form.required')),
    })
    .default({
      deviceType: '',
      description: '',
      uri: '',
      revision: '',
      imageCreationDate: '',
    });

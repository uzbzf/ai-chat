/** Номер автомастерской для перенаправления (синхронизируйте с WORKSHOP_PHONE в .env backend) */
export const workshopPhone =
  import.meta.env.VITE_WORKSHOP_PHONE?.trim() || '+7 (999) 123-45-67'

import { format } from 'winston';

export const productionFormat = format.combine(
    format.timestamp(),
    format.json()
);
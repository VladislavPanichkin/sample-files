export const FILTER_DISPLAY_NAME: { [key: string]: string } = {
  country: 'Country',
  status: 'Status',
  client: 'Client',
  price: 'Price',
};

export interface IFilterEntry {
  [key: string]: string;
}

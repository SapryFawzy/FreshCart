export interface IcatgoryRes {
  results: number;
  metadata: Metadata;
  data: Datum[];
}

interface Datum {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Metadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
}

export interface IspecificCatgoryRes {
  data: Data;
}

interface Data {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

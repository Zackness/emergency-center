export type SearchResultType =
  | "help_center"
  | "hospital"
  | "shelter"
  | "agency"
  | "missing_person"
  | "external_source"
  | "external_link"
  | "news"
  | "page"
  | "emergency_number"
  | "resource";

export interface SearchIndexItem {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  meta?: string;
  external?: boolean;
  searchText: string;
}

export interface SearchGroup {
  type: SearchResultType;
  label: string;
  items: SearchIndexItem[];
}

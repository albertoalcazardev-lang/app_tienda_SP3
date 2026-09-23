export interface Connectivity {
  isOnline(): Promise<boolean>;
}

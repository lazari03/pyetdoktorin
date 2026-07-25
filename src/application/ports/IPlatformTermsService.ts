export interface PlatformTerms {
  version: string;
  title: string;
  paragraphs: string[];
}

export interface IPlatformTermsService {
  getTerms(): Promise<PlatformTerms>;
}

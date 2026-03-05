import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBannersliderProps {
  context: WebPartContext;
  description: string;
  title: string;
  selectedLibrary: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

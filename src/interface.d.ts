export interface File {
    menuAction: (callback: (value: string[]) => void) => void;
    sendTextForNewFile: (value: string) => Promise<void>;
    sendTextForChanges: (filePath: string, fileContent: string) => Promise<void>;
  }
  
  export interface Change {
    inputColor: (callback: (value: string) => void) => void;
  }
  
  export interface Title {
    displayChangeIndicator: (title: string) => Promise<void>;
  }
  
  declare global {
    interface Window {
      file: File;
      change: Change;
      title: Title;
    }
  }
  
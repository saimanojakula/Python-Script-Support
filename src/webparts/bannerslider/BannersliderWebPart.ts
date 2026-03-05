import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BannersliderWebPartStrings';
import Bannerslider from './components/Bannerslider';
import { IBannersliderProps } from './components/IBannersliderProps';
import { getLists } from './services/SPServices';
import { listProperties } from './common/DataObject';

export interface IBannersliderWebPartProps {
  description: string;
  title: string;
  selectedLibrary: string;
}

const LOG_SOURCE: string = 'BannersliderWebPart';
export default class BannersliderWebPart extends BaseClientSideWebPart<IBannersliderWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _lists: IPropertyPaneDropdownOption[] = [];

  public render(): void {
    const element: React.ReactElement<IBannersliderProps> = React.createElement(
      Bannerslider,
      {
        context:this.context,
        description: this.properties.description,
        title: this.properties.title,
        selectedLibrary:this.properties.selectedLibrary,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    }).then(async () => {
      await this.fetchLists();
    }).catch((error) => console.error(`${LOG_SOURCE}-fetchLists`, error?.message ? error.message : error));
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private async fetchLists(): Promise<void> {
    try {
      const lists = await getLists(this.context, listProperties);
      if (lists) {
        this._lists = lists.map((list) => ({ key: list.Id, text: list.Title }));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Title',
                  placeholder: 'Enter title here...',
                  value: this.properties.title
                }),
                PropertyPaneDropdown('selectedLibrary', {
                  label: 'Select a BannerImages Library',
                  options: this._lists,
                  selectedKey: this.properties.selectedLibrary
                })
              ]
            }
          ]
        }
      ]
    };
  }
}

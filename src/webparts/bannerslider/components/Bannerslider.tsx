import * as React from 'react';
import type { IBannersliderProps } from './IBannersliderProps';
import '../styles/tailwind.css';

import ImageCarousel from './ImageCarousel/ImageCarousel';
import 'remixicon/fonts/remixicon.css';
export default class Bannerslider extends React.Component<IBannersliderProps, {}> {
  public render(): React.ReactElement<IBannersliderProps> {



    const {context,title,selectedLibrary} = this.props;
    return (
      <section id='bannerslider-wp'>
        <ImageCarousel context={context} title={ title} selectedLibrary={selectedLibrary} />
      </section>
    );
  }
}
